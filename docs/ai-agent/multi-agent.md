---
title: 多 Agent 协作
order: 5
category:
  - AI Agent
tag:
  - Multi-Agent
  - A2A
---

# 多 Agent 协作

多 Agent 不是把同一个提示词复制几份。它的价值来自 **上下文隔离、工具与权限隔离、独立并行和专业能力边界**。

## 1. 先问：为什么一个 Agent 不够

只有出现下列至少一种情况，才考虑拆分：

- 不同子任务需要完全不同的指令、数据或工具；
- 多个子任务能够真正并行，缩短总时间；
- 安全要求不允许同一个 Agent 同时拥有所有权限；
- 需要将某个专业能力当作独立服务复用；
- 单个 Agent 的上下文已经被大量互不相关的信息污染。

如果只是步骤多，优先使用一个状态图。多 Agent 会增加通信成本、责任归属和调试难度。

## 2. 常见协作模式

### Supervisor / Router

主 Agent 根据请求选择一个专家，并在完成后回收控制权。适合客服、企业内部助手等可清晰分类的请求。

### Orchestrator / Workers

主 Agent 动态创建一组子任务，并行交给多个 worker，最后合并。适合研究、代码库修改和多维度分析。

### Handoff

当前 Agent 将对话的主导权交给另一个 Agent。适合从通用接待切换到专业服务，但必须明确告知用户当前由谁处理。

### Debate / Review

多个 Agent 独立生成或评审，再由确定性规则或最终裁决者合并。适合要求多视角的问题，但不能用“多数票”替代事实验证。

## 3. 委派契约

不要只把一句“请研究一下”发给子 Agent。一个可审计的委派包应包含：

```ts
type DelegatedTask = {
  taskId: string
  parentRunId: string
  objective: string
  context: Array<{ content: string; source: string }>
  constraints: string[]
  allowedTools: string[]
  deadline: string
  budget: { maxSteps: number; maxTokens: number }
  expectedOutput: {
    schema: string
    acceptanceCriteria: string[]
  }
}

type DelegatedResult = {
  taskId: string
  status: 'completed' | 'failed' | 'needs_input'
  output?: unknown
  evidence: Array<{ source: string; claim: string }>
  unresolved: string[]
  metrics: { steps: number; inputTokens: number; outputTokens: number }
}
```

子 Agent 只应收到完成任务必需的上下文和工具，而不是主 Agent 的全部历史。这同时降低成本、信息泄露和提示注入的传播范围。

## 4. MCP 与 A2A 的区别

| 问题         | MCP                             | A2A                                |
| ------------ | ------------------------------- | ---------------------------------- |
| 连接对象     | AI 应用与工具/数据              | Agent 与 Agent                     |
| 核心能力     | 发现并调用 tool/resource/prompt | 发现能力、交付任务、交换消息与产物 |
| 对方是否自主 | 工具通常是被动执行              | 远程 Agent 可自主规划任务          |
| 适合场景     | 搜文档、读数据、发起业务操作    | 跨团队、跨框架的长任务协作         |

[A2A](https://a2a-protocol.org/latest/) 将 Agent 视为一个可发现的独立服务。Agent Card 描述身份、能力、输入输出形式、端点和认证方式；任务可以经历进行中、需要输入、完成或失败等状态，并产生结构化产物。

协议解决互操作，但不代替你定义信任边界、身份映射、费用归属和任务责任。

## 5. 防止多 Agent 系统失控

### 限制扇出和深度

对单次任务设置：

- 最大子任务数；
- 最大委派深度；
- 全局 token/费用/时间预算；
- 每个 Agent 的工具白名单；
- 可以并行执行的最大数量。

### 只共享事实，不共享隐藏推理

交换目标、证据、决策、工具结果和未解问题就足够了。系统不需要依赖某个模型的隐藏思维过程，也不应将其作为业务接口。

### 为每个边界建立追踪

一次委派至少要能回答：

- 谁委派给了谁；
- 发送了哪些上下文和授权；
- 子 Agent 调用了哪些工具；
- 结果中的每个关键事实来自哪里；
- 总成本和关键路径耗时是多少。

## 6. 何时应该合并回单 Agent

出现以下信号时，多 Agent 可能是过度设计：

- 所有 Agent 使用相同模型、相同工具和几乎相同的指令；
- 大量时间花在相互复述上下文；
- 子任务强依赖，无法并行；
- 最终决策还是由同一个中心节点重做一遍；
- 无法对单个 Agent 进行独立评测和归责。
