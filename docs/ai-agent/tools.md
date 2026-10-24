---
title: 工具调用与 MCP
order: 2
category:
  - AI Agent
tag:
  - Tool Calling
  - MCP
---

# 工具调用与 MCP

模型负责选择行动，工具负责让行动在真实世界发生。工具的设计质量，往往比一小段提示词更能决定 Agent 是否可靠。

## 1. 一个好工具的契约

```ts
type ToolResult<T> =
  | { ok: true; data: T; meta?: { source?: string; observedAt?: string } }
  | {
      ok: false
      error: {
        code: 'INVALID_INPUT' | 'FORBIDDEN' | 'NOT_FOUND' | 'RATE_LIMITED' | 'INTERNAL'
        message: string
        retryable: boolean
      }
    }

type ToolContext = {
  userId: string
  tenantId: string
  runId: string
  idempotencyKey: string
  signal: AbortSignal
}
```

工具的输入、输出和错误都应结构化。不要把整段栈信息、HTML 错误页或未裁剪的数据库结果直接丢回模型。

### 工具描述要回答五个问题

1. 它能做什么？
2. 什么时候应该用？
3. 什么时候不应该用？
4. 每个参数的语义和限制是什么？
5. 返回结果是实时值、缓存值还是推测值？

工具名应体现业务意图，例如 `get_order_status` 比 `request_api` 更好。前者更容易限权、评测和审计。

## 2. 读工具与写工具必须分开

| 等级         | 例子                     | 默认策略                          |
| ------------ | ------------------------ | --------------------------------- |
| 只读         | 查订单、搜文档           | 在授权范围内可自动执行            |
| 可逆写入     | 创建草稿、添加标签       | 记录前后值，提供撤销              |
| 外部影响     | 发邮件、提交工单         | 执行前展示预览并确认              |
| 高风险不可逆 | 转账、删数据、发布到生产 | 强制人工审批或禁止 Agent 直接执行 |

“用户说过可以”不等于所有后续操作都被授权。审批对象应包含确定的工具名、参数、资源和有效期。

## 3. 幂等、超时与重试

Agent 可能因模型重复调用、网络超时或任务恢复而再次执行同一工具。

- 对每次写操作传入 `idempotencyKey`。
- 只重试明确标记为 `retryable` 的错误。
- 采用指数退避和随机抖动，避免集中重试。
- 超时后先查询操作状态，不要直接再发一次转账或发布请求。
- 将“调用失败”和“业务拒绝”分开，余额不足不是可重试的系统错误。

## 4. 参数校验与权限检查

```ts
async function executeToolCall(call: ModelDecision, context: ToolContext) {
  if (call.type !== 'tool_call') throw new Error('not_a_tool_call')

  const tool = registry.get(call.tool)
  if (!tool) return failure('NOT_FOUND', '工具不存在', false)

  const parsed = tool.inputSchema.safeParse(call.arguments)
  if (!parsed.success) return failure('INVALID_INPUT', '参数不合法', false)

  const allowed = await policy.canExecute({
    userId: context.userId,
    tenantId: context.tenantId,
    tool: call.tool,
    arguments: parsed.data,
  })
  if (!allowed) return failure('FORBIDDEN', '当前用户无权执行', false)

  return tool.execute(parsed.data, context)
}
```

这个顺序很重要：**先识别工具，再验证参数，然后基于真实身份做权限决策，最后才执行。** 绝不能相信模型在参数中声明的 `userId` 或 `isAdmin`。

## 5. 控制返回给模型的内容

工具的原始返回可能很大，也可能含有敏感字段。应用层应进行：

- 字段白名单与敏感信息脱敏；
- 分页、截断与最大字节限制；
- 返回结果的类型和 Schema 校验；
- 来源、观测时间和缓存状态标记；
- 外部文本的“不可信数据”标记。

工具结果是数据，不是更高优先级的指令。网页、邮件和文档中都可能夹带针对 Agent 的恶意提示。

## 6. MCP 解决了什么

[Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) 是连接 AI 应用与外部系统的开放协议。它的价值是统一“能力如何被发现和调用”，而不是替你解决业务权限和安全。

MCP Server 主要暴露三类原语：

| 原语      | 由谁主导     | 例子               |
| --------- | ------------ | ------------------ |
| Tools     | 模型选择调用 | 查订单、创建工单   |
| Resources | 应用选择加载 | 文件内容、Git 历史 |
| Prompts   | 用户选择使用 | 审查模板、预置命令 |

### 适合使用 MCP

- 同一个数据源或工具需要被多个 AI 客户端复用；
- 希望将能力发现、Schema 和传输层标准化；
- 需要在本地进程和远程服务之间切换。

### 不要误解 MCP

- MCP 不是 Agent 框架，不负责规划与循环。
- MCP 不等于自动安全，服务端仍需要认证、授权、校验与审计。
- MCP 不是 Agent 之间协作的唯一方式；跨 Agent 的委派契约可以参考 A2A。

## 7. 工具设计检查表

- [ ] 名称是明确的业务动词，而不是模糊的“执行”。
- [ ] 输入 Schema 有类型、范围、长度和枚举限制。
- [ ] 输出是结构化的，并附带数据来源。
- [ ] 写操作支持幂等键，可逆操作支持撤销。
- [ ] 权限基于服务端会话身份，而不是模型参数。
- [ ] 风险操作在执行前有精确预览与审批。
- [ ] 有超时、取消、重试和限流策略。
- [ ] 日志记录工具名、耗时、结果码和审批人，但不记录密钥。
