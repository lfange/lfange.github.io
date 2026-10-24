---
title: AI Agent 从入门到精通
icon: robot
category:
  - AI Agent
---

# AI Agent 从入门到精通

> 如果你想先建立模型、数据、训练、推理与 LLMOps 的完整认识，请从 [AI 研发与生态](../ai/README.md) 开始；本栏目聚焦 Agent 的设计与落地。

AI Agent 不是“更会聊天的模型”，而是一个能够围绕目标反复进行 **判断、行动、观察与修正** 的软件系统。

> Agent = 模型 + 指令 + 上下文 + 工具 + 运行循环 + 安全边界 + 可观测性

这套笔记的目标不是堆叠框架 API，而是建立一套可迁移的心智模型：从一个最小工具调用循环出发，逐步掌握上下文工程、RAG、工作流、多 Agent、评测、安全和生产化。

## 先分清四种系统

| 类型               | 谁决定下一步         | 适合什么                       | 主要风险             |
| ------------------ | -------------------- | ------------------------------ | -------------------- |
| 单次 LLM 调用      | 开发者               | 摘要、分类、改写               | 输出不稳定           |
| 带检索或工具的 LLM | 开发者               | 知识问答、单次查询             | 数据边界模糊         |
| Workflow 工作流    | 代码预先编排         | 步骤可预测、审批明确的任务     | 流程僵化             |
| Agent              | 模型根据环境反馈决定 | 步骤数未知、需要试错的开放任务 | 成本、延迟与错误累积 |

第一原则：**能用普通代码解决，就不要让模型决策；能用工作流解决，就不要过早引入自主 Agent。**

## 完整学习路线

| 阶段 | 学习内容                               | 阶段产出                       |
| ---- | -------------------------------------- | ------------------------------ |
| 入门 | LLM 边界、消息、结构化输出、Agent Loop | 会调用一个查询工具的 Agent     |
| 实战 | 工具设计、上下文、记忆、RAG、工作流    | 带知识库和审批节点的助手       |
| 进阶 | 状态图、持久化、多 Agent、MCP、A2A     | 可中断、恢复、委派的任务系统   |
| 精通 | 评测、安全、可观测性、成本与可靠性     | 可审计、可回归、可上线的 Agent |

### 第 1 站：建立心智模型

- [Agent 基础与最小循环](./fundamentals.md)：从状态机视角理解 Agent。
- [工具调用与 MCP](./tools.md)：学会把真实能力安全地交给模型。

### 第 2 站：管理知识与状态

- [上下文、记忆与 RAG](./context-memory-rag.md)：分清“当前看到的内容”和“长期记住的内容”。
- [Agentic Workflow](./workflows.md)：用可控的工作流解决大部分业务问题。

### 第 3 站：处理复杂任务

- [多 Agent 协作](./multi-agent.md)：掌握路由、委派、编排与 Agent 互操作。
- [评测与安全](./evaluation-security.md)：用数据集、轨迹和权限边界管住不确定性。

### 第 4 站：生产化

- [生产架构与可观测性](./production.md)：让 Agent 能够持续运行、定位问题并控制成本。
- [综合实战：可追溯的研究助手](./project.md)：从需求、架构、代码到评测的完整项目。

## 建议的学习方法

1. 每一章都先完成“最小版”，不要一开始就选大而全的框架。
2. 保留每次运行的输入、工具调用、输出和耗时，从第一天开始积累评测样本。
3. 把错误当作状态处理：重试、降级、请求人工介入，而不是只写一句“请不要出错”。
4. 每增加一层自主性，同时增加一层限制、记录和评测。

## 学完后应该能回答

- 这个问题真的需要 Agent 吗？为什么不用固定工作流？
- 哪些状态是会话级，哪些是用户级，哪些根本不应该交给模型？
- 一个工具调用失败、重复执行或越权时，系统会发生什么？
- 如何证明新版本比旧版本好，而不是“凭感觉更智能”？
- 如何回放一次任务，定位是模型、提示词、检索、工具还是权限出了问题？

## 权威延伸阅读

- [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
- [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)
- [A2A Protocol](https://a2a-protocol.org/latest/)
- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [OWASP LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
