---
title: LangChain 与 LangGraph 核心概念及教程
icon: robot
category:
  - AI
  - LangChain
  - LangGraph
tag:
  - LangChain
  - LangGraph
  - Agent
  - LLM
  - Python
---

# LangChain 与 LangGraph 核心概念及教程

> Python 生态下构建 LLM 应用的两大核心框架。LangChain 负责**组件编排**（模型/提示/检索/工具的拼装），LangGraph 负责**有状态、可循环的 Agent 流程编排**（图、状态机、人机协作）。LangChain 选型见 [LangChain 技术选择](./langchain-selection.md)，大模型基础见 [大模型基础知识](./llm.md)，Agent 思想见 [AI Agent 专题](./ai-agent.md)。

---

## 零、全景与演进

```
LangChain (2022)         -> 组件库 + 简单 Chain（链式调用）
   + LCEL (2023)         -> LangChain Expression Language，用 | 声明式拼装
   + LangServe           -> 一行把 Chain 发布成 API
   + LangSmith           -> 链路追踪、调试、评估、监控
LangGraph (2024)         -> 图式编排，支持循环/状态/人机协作，做 Agent 的主力
```

**一句话区分**：

- **LangChain**：提供「积木」（Models / Prompts / Retrievers / Tools / Output Parsers）和「胶水」（LCEL `|` 管道），适合**线性、无状态或少状态**的 RAG / 链。
- **LangGraph**：把流程建模为**状态图**（节点 = 函数，边 = 路由），支持**循环、分支、断点、持久化**，适合**Agent、多步推理、人机协作**等复杂流程。

**选型建议**：单轮 RAG / 简单链用 LangChain LCEL 即可；一旦涉及「循环调用工具直到完成」「多 Agent 协作」「需要中断等人审核」，就该上 LangGraph。

> 安装：`pip install langchain langchain-core langgraph`。模型集成按需装，如 `langchain-openai`、`langchain-community`。

---

## 第一部分：LangChain 核心概念

### 1.1 整体架构

LangChain 拆成多个包，理清边界很重要：

| 包 | 作用 |
|------|------|
| `langchain-core` | 抽象基类与 LCEL：`Runnable`、`BaseMessage`、`PromptTemplate`、输出解析器接口。无第三方重依赖 |
| `langchain` | 高层链、Agent 执行器（部分已迁移到 LangGraph）、文档加载器等 |
| `langchain-community` | 第三方集成（向量库、文档加载器等） |
| `langchain-openai` / `langchain-anthropic` / ... | 各模型厂商的官方集成包 |
| `langgraph` | 图式状态编排（独立但协同） |
| `langsmith` | 可观测性 SDK（追踪/评估） |

> 新版尽量只装 `langchain-core` + 具体集成包，避免装整个 `langchain` 拖入冗余依赖。

### 1.2 Runnable：一切的抽象基础

LangChain 里几乎所有组件都实现了 `Runnable` 接口，统一了调用方式与组合方式：

| 方法 | 含义 |
|------|------|
| `.invoke(input)` | 同步单次调用 |
| `.batch([input1, input2])` | 批量并行 |
| `.stream(input)` | 流式输出（逐 token / 逐 chunk） |
| `.ainvoke / .abatch / .astream` | 异步版本 |

每个 `Runnable` 都自带 `.with_structured_output()`、`.with_fallbacks()`、`.assign()`、`.bind_tools()` 等组合方法，这是 LCEL 能用 `|` 拼装的前提。

### 1.3 LCEL（LangChain Expression Language）

LCEL 用 Python 的位运算符 `|` 把多个 `Runnable` 串成管道，数据从左到右流动。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一位简洁的技术助手。"),
    ("user", "{question}"),
])
model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
parser = StrOutputParser()

# 三者用 | 拼成一条链
chain = prompt | model | parser

print(chain.invoke({"question": "用一句话解释 KV Cache"}))
# -> 缓存自回归生成中已算的 Key/Value，避免每步重复计算以加速推理。
```

**为什么用 LCEL**：

- 自动获得 `.invoke/.batch/.stream`，无需手写循环。
- 流式天然贯通：`chain.stream()` 会把 model 的 token 流逐个 yield 到最后。
- 异步、重试、并发、可观测性（LangSmith 追踪）开箱即用。

### 1.4 Models（模型 I/O）

两类模型抽象：

```python
from langchain_openai import ChatOpenAI

# 1. ChatModel：对话模型，输入输出都是 Message 列表（主流）
chat = ChatOpenAI(model="gpt-4o-mini")

# 2. LLM：纯文本输入输出（补全模型，已少用）
# from langchain_openai import OpenAI
# llm = OpenAI(model="gpt-3.5-turbo-instruct")
```

**Message 类型**：

| 类型 | 含义 |
|------|------|
| `SystemMessage` | 系统设定（角色、规则） |
| `HumanMessage` | 用户输入 |
| `AIMessage` | 模型回复（可含 `tool_calls`） |
| `ToolMessage` | 工具执行结果回传 |

```python
from langchain_core.messages import SystemMessage, HumanMessage

resp = chat.invoke([
    SystemMessage(content="你是 Python 专家"),
    HumanMessage(content="list 和 tuple 区别？"),
])
print(resp.content)
```

### 1.5 Prompts（提示模板）

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 模板自带变量 {topic}
prompt = ChatPromptTemplate.from_template("用一句话解释 {topic}。")

# 多轮对话用 MessagesPlaceholder 注入历史消息
chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是翻译助手，把用户输入翻译成英文。"),
    MessagesPlaceholder(variable_name="history"),  # 动态历史
    ("user", "{input}"),
])
```

`partial()` 可预先填入部分变量；`from_messages` 支持 tuple / Message / Placeholder 混用。

### 1.6 Output Parsers（输出解析）

把模型文本解析成结构化数据。现代做法更推荐 **结构化输出**（见 1.7），但解析器仍常用。

```python
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from pydantic import BaseModel

# 纯文本
StrOutputParser()

# JSON 解析（带 Pydantic schema 校验）
class Person(BaseModel):
    name: str
    age: int

json_parser = JsonOutputParser(pydantic_object=Person)
# 通常配合 prompt 里注入格式说明：json_parser.get_format_instructions()
```

### 1.7 结构化输出（推荐）

直接让模型返回符合 schema 的对象，比文本解析稳得多。底层走 Function Calling / JSON mode。

```python
from pydantic import BaseModel, Field

class CityInfo(BaseModel):
    """城市信息"""
    name: str = Field(description="城市名")
    country: str = Field(description="所在国家")
    population: int = Field(description="人口")

structured_model = ChatOpenAI(model="gpt-4o-mini").with_structured_output(CityInfo)

result = structured_model.invoke("给出上海的城市信息")
print(result.name, result.country, result.population)  # 上海 中国 24870000
```

### 1.8 Retrievers / RAG

RAG 的核心见 [大模型基础 - RAG](./llm.md#六-rag-检索增强生成)。LangChain 把它拆成可拼装组件：

```
Document Loader -> Text Splitter -> Embedding -> Vector Store
                                                    |
User Query -> Embedding -> Retriever(检索 Top-K) ---+
                                                    |
                          Prompt + 上下文 -> Model -> Answer
```

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. 切分
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

# 2. 嵌入 + 入库
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())

# 3. 检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 4. 拼成 RAG 链
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template(
    "根据以下上下文回答问题。\n上下文：{context}\n问题：{question}"
)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
)

print(rag_chain.invoke("文档里说了什么？"))
```

关键点：

- `retriever | format_docs`：检索器输出文档列表，再格式化成字符串。
- `RunnablePassthrough()`：把原始输入原样透传作为 `question`。
- `RunnableParallel`（dict 形式）让多条支路并行计算，结果合并成 dict 喂给 prompt。

### 1.9 Tools / Tool Calling

工具是 Agent 的手脚。定义工具有三种方式：

```python
from langchain_core.tools import tool

# 方式一：装饰器（最简）
@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气。"""  # docstring 会作为工具说明给模型
    # 实际调用天气 API
    return f"{city} 晴 25℃"

# 方式二：Pydantic schema + 函数
from langchain_core.tools import StructuredTool
from pydantic import BaseModel

class SearchInput(BaseModel):
    query: str
    limit: int = 5

def search(query: str, limit: int = 5) -> str:
    return f"搜索 {query}，返回 {limit} 条"

search_tool = StructuredTool.from_function(search, name="search", args_schema=SearchInput)

# 方式三：@tool + pydantic args_schema（参数校验更严）
```

绑定到模型并让模型决定调用：

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini")
model_with_tools = model.bind_tools([get_weather, search_tool])

resp = model_with_tools.invoke("北京天气怎么样？")
# resp.tool_calls -> [{'name': 'get_weather', 'args': {'city': '北京'}, 'id': '...'}]
```

> **工具调用 ≠ Agent**。`bind_tools` 只让模型「输出想调用的工具」，真正「执行工具 + 把结果回传 + 循环到结束」需要 Agent 循环——这正是 LangGraph 的主场（见第二部分）。

### 1.10 Memory（记忆）

老版 LangChain 的 `ConversationBufferMemory` 等已被**消息列表直接管理**取代。多轮对话的推荐做法：

```python
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables import RunnableWithMessageHistory

chain = chat_prompt | ChatOpenAI() | StrOutputParser()

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: InMemoryChatMessageHistory(),  # 实际用数据库存
    input_messages_key="input",
    history_messages_key="history",
)

# 调用时传 session_id
chain_with_history.invoke(
    {"input": "我叫小明"},
    config={"configurable": {"session_id": "user-1"}},
)
chain_with_history.invoke(
    {"input": "我叫什么？"},  # 模型能答出"小明"
    config={"configurable": {"session_id": "user-1"}},
)
```

> 生产环境把 `InMemoryChatMessageHistory` 换成 Redis/数据库实现。更复杂的长程记忆（跨会话、摘要、向量记忆）交给 LangGraph 的 Checkpointer（见 2.7）。

### 1.11 Callbacks / Streaming / LangSmith

- **流式**：`chain.stream(input)` 逐 chunk yield，前端可做打字机效果。
- **Callbacks**：`BaseCallbackHandler` 可钩入 `on_llm_start`、`on_tool_end` 等事件，做日志/审计。
- **LangSmith**：设环境变量 `LANGCHAIN_TRACING_V2=true` + API key，所有链路自动可视化追踪（每步输入输出、token、耗时、错误），是调试 LLM 应用的关键工具。

```python
# 流式
for chunk in chain.stream({"question": "解释 RAG"}):
    print(chunk, end="", flush=True)
```

### 1.12 LangServe（可选）

把一条 chain 一行发布成 REST API：

```python
from fastapi import FastAPI
from langserve import add_routes

app = FastAPI()
add_routes(app, rag_chain, path="/rag")
# POST /rag/invoke  /rag/stream  /rag/batch 自动可用
```

---

## 第二部分：LangGraph 核心概念

### 2.1 为什么需要 LangGraph

LangChain 的 `AgentExecutor` 能跑 ReAct 循环，但：

- 流程是「黑盒循环」，难以精细控制每一步。
- 难以表达**条件分支、多 Agent 协作、人在回路（审核/确认）、断点续跑**。
- 状态管理弱，跨步骤共享数据靠手动拼接。

LangGraph 把 Agent 抽象为**状态图**：

- **State**：一个贯穿全流程的共享数据结构（通常是 `TypedDict`）。
- **Node**：节点，一个接收 State、返回 State 更新的函数。
- **Edge**：边，决定从当前节点跳到哪个节点（固定边 or 条件边）。
- **Graph**：把节点和边组装成有向图，编译后可 `invoke/stream`。

**循环是一等公民**——这是它和普通 DAG 工具的根本区别，也是 Agent「反复调用工具直到完成」所必需的。

### 2.2 第一个图：Hello World

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

# 1. 定义状态
class State(TypedDict):
    count: int

# 2. 定义节点（接收 state，返回部分更新）
def increment(state: State) -> dict:
    return {"count": state["count"] + 1}

# 3. 组装图
graph_builder = StateGraph(State)
graph_builder.add_node("increment", increment)
graph_builder.add_edge(START, "increment")     # 起点 -> increment
graph_builder.add_edge("increment", END)        # increment -> 终点

# 4. 编译并运行
graph = graph_builder.compile()
result = graph.invoke({"count": 0})
print(result)  # {'count': 1}
```

四步固定套路：**定义 State → 写节点函数 → 连边 → compile()**。

### 2.3 状态与 Reducer（关键）

节点返回的 dict 默认**覆盖**对应字段。但像「消息列表」这种需要**累加**的字段，要用 `Annotated` + `add_messages` reducer：

```python
from typing import TypedDict, Annotated
from langgraph.graph import MessagesState, add_messages

# 方式一：自定义带 reducer 的 state
class State(TypedDict):
    messages: Annotated[list, add_messages]  # 追加而非覆盖
    user_id: str

# 方式二：直接用内置 MessagesState（已含 messages + add_messages）
# from langgraph.graph import MessagesState
```

`add_messages` 还会按 `id` 去重/更新，非常适合管理对话历史。

### 2.4 条件边（路由）

条件边让图根据当前状态动态选下一个节点——这是分支和循环的核心。

```python
def should_continue(state: State) -> str:
    # 返回字符串：下一个节点的名字（或 END）
    if state["count"] < 3:
        return "increment"
    return END

graph_builder.add_conditional_edges(
    "increment",        # 从哪个节点出发
    should_continue,    # 路由函数
    # 可选：显式映射，便于可视化
    {"increment": "increment", END: END},
)
```

把 `increment -> should_continue -> increment` 串起来，就构成了**循环**：每加一次判断是否到 3，没到就继续加。

### 2.5 完整 ReAct Agent（工具循环）

把「模型决策 → 执行工具 → 结果回传 → 再决策」写成图：

```python
from typing import Annotated
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition

@tool
def add(a: int, b: int) -> int:
    """两数相加。"""
    return a + b

@tool
def multiply(a: int, b: int) -> int:
    """两数相乘。"""
    return a * b

tools = [add, multiply]
model = ChatOpenAI(model="gpt-4o-mini").bind_tools(tools)

# 节点1：调用模型
def call_model(state: MessagesState):
    resp = model.invoke(state["messages"])
    return {"messages": [resp]}

# 组装
builder = StateGraph(MessagesState)
builder.add_node("agent", call_model)
builder.add_node("tools", ToolNode(tools))   # 内置节点：执行工具并回传 ToolMessage

builder.add_edge(START, "agent")
builder.add_conditional_edges(
    "agent",
    tools_condition,   # 内置路由：有 tool_calls -> "tools"，否则 -> END
)
builder.add_edge("tools", "agent")  # 工具执行完回到 agent 继续判断

graph = builder.compile()

# 运行：模型会自己决定调 add 再调 multiply 直到给出答案
result = graph.invoke({"messages": [("user", "3 加 5 再乘 2 等于多少？")]})
print(result["messages"][-1].content)  # 16
```

流程：

```
START -> agent --(有tool_calls)--> tools -> agent --(无tool_calls)--> END
                  ^__________________|
                       （循环）
```

`langgraph.prebuilt` 还提供 `create_react_agent` 一行生成上面的图，适合标准场景：

```python
from langgraph.prebuilt import create_react_agent
agent = create_react_agent(model, tools)
```

### 2.6 Human-in-the-Loop（人机协作）

LangGraph 支持在节点前后**中断**，等人审核/确认后再继续。两种方式：

**方式一：编译时指定中断点**

```python
graph = builder.compile(
    interrupt_before=["tools"]   # 执行工具前暂停
)

# 第一次 invoke 会在调 tools 前停下
state = graph.invoke({"messages": [("user", "删除 id=5 的记录")]})
# 此时可以审查 state["messages"][-1].tool_calls，确认是否放行

# 审核通过后，再次 invoke(None) 从断点继续
state = graph.invoke(None, config)
```

**方式二：工具内动态中断 `interrupt()`**

```python
from langgraph.types import interrupt, Command

@tool
def delete_record(record_id: int) -> str:
    """删除记录，需人工确认。"""
    approval = interrupt({"record_id": record_id, "ask": "确认删除？"})  # 暂停，等外部输入
    if approval == "yes":
        return f"已删除 {record_id}"
    return "已取消"
```

恢复时传入人审核结果：

```python
graph.invoke(Command(resume="yes"), config)
```

适用场景：高风险操作确认、人工校对模型输出、人在循环中纠偏。

### 2.7 持久化与记忆（Checkpointer）

给图加 `Checkpointer`，每一步状态自动持久化，从而获得：

- **断点续跑**：长流程中断后从上次状态继续。
- **对话记忆**：用 `thread_id` 隔离不同会话，每轮追加消息。
- **时间旅行**：回放/分支历史某一步。

```python
from langgraph.checkpoint.memory import InMemorySaver
# 生产用：from langgraph.checkpoint.postgres import PostgresSaver

graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "thread-1"}}

# 第一轮
graph.invoke({"messages": [("user", "我叫小明")]}, config)
# 第二轮（同 thread_id，模型记得上轮）
graph.invoke({"messages": [("user", "我叫什么？")]}, config)
# -> 模型答"小明"
```

查看历史：

```python
for snap in graph.get_state_history(config):
    print(snap.values, snap.next)
```

### 2.8 流式输出

LangGraph 支持多种流式粒度：

```python
# 1. 流式状态更新（每个节点完成时 yield）
for chunk in graph.stream(input, config, stream_mode="updates"):
    print(chunk)

# 2. 流式模型 token（打字机效果，最常用）
for msg, metadata in graph.stream(input, config, stream_mode="messages"):
    print(msg.content, end="", flush=True)

# 3. 自定义事件（节点内用 get_stream_writer 抛事件）
for ev in graph.stream(input, config, stream_mode="custom"):
    print(ev)
```

### 2.9 多 Agent / 子图

复杂系统拆成多个 Agent（各管一摊），用图编排它们的协作。两种常见拓扑：

- **Supervisor（主管）**：一个中心 Agent 路由任务给各子 Agent，汇总结果。
- **Network（网络）**：Agent 之间互相调用。

每个 Agent 本身可以是一个子图（`StateGraph` 可作为节点嵌入更大图）。`langgraph-supervisor` 包提供了 supervisor 模式的快捷实现。

```text
              ┌──────────┐
       ┌─────▶│ Research │─────┐
       │      └──────────┘     │
  ┌────┴───┐               ┌───┴────┐
  │Supervisor│             │ Writer │
  └────┬───┘               └───┬────┘
       │      ┌──────────┐     │
       └─────▶│  Review  │◀────┘
              └──────────┘
```

### 2.10 子图、并行与 Map-Reduce

- **并行**：一个节点连多条边到多个节点，它们并行执行，全部完成后再汇合（基于 reducer 合并）。
- **Map-Reduce**：用 `Send` API 对列表元素动态派发并行子任务，结果汇总。

```python
from langgraph.types import Send

def fan_out(state):
    # 对每个 item 派发一个 subtask 节点实例
    return [Send("subtask", {"item": x}) for x in state["items"]]
```

---

## 第三部分：实战教程

### 3.1 实战一：带记忆的 RAG 问答（纯 LangChain LCEL）

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 建库（docs 略）
vectorstore = Chroma(embedding_function=OpenAIEmbeddings())
retriever = vectorstore.as_retriever(k=4)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

prompt = ChatPromptTemplate.from_messages([
    ("system", "根据上下文回答。不知道就说不知道，不要编造。\n上下文：{context}"),
    MessagesPlaceholder("history"),
    ("user", "{question}"),
])

chain = (
    {
        "context": (lambda x: x["question"]) | retriever | format_docs,
        "history": lambda x: x["history"],
        "question": lambda x: x["question"],
    }
    | prompt
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
)

store = {}
def get_history(session_id):
    return store.setdefault(session_id, InMemoryChatMessageHistory())

qa = RunnableWithMessageHistory(
    chain, get_history,
    input_messages_key="question",
    history_messages_key="history",
)

cfg = {"configurable": {"session_id": "s1"}}
print(qa.invoke({"question": "产品支持哪些数据库？"}, cfg))
print(qa.invoke({"question": "刚才说的第一个是什么？"}, cfg))  # 能引用上轮
```

### 3.2 实战二：LangGraph 客服 Agent（工具 + 人工审核 + 记忆）

```python
from typing import Annotated, TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

@tool
def query_order(order_id: str) -> str:
    """查询订单状态。"""
    return f"订单 {order_id}：已发货，预计明天送达。"

@tool
def refund(order_id: str) -> str:
    """为订单退款，需人工审核。"""
    approval = interrupt({"order_id": order_id, "msg": "确认退款？(yes/no)"})
    return f"订单 {order_id} 退款{'成功' if approval == 'yes' else '已取消'}"

tools = [query_order, refund]
model = ChatOpenAI(model="gpt-4o-mini").bind_tools(tools)

class State(TypedDict):
    messages: Annotated[list, lambda a, b: a + b]  # 简易累加 reducer

def agent(state):
    return {"messages": [model.invoke(state["messages"])]}

builder = StateGraph(State)
builder.add_node("agent", agent)
builder.add_node("tools", ToolNode(tools))
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", tools_condition)
builder.add_edge("tools", "agent")

graph = builder.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "cust-1"}}

# 第一轮：查订单（自动完成）
r = graph.invoke({"messages": [HumanMessage("查一下订单 A100 的状态")]}, cfg)
print(r["messages"][-1].content)

# 第二轮：退款（触发 interrupt，暂停等人）
r = graph.invoke({"messages": [HumanMessage("帮我把 A100 退款")]}, cfg)
# 检测到暂停，人工确认后恢复
if graph.get_state(cfg).next:
    r = graph.invoke(Command(resume="yes"), cfg)
    print(r["messages"][-1].content)
```

### 3.3 实战三：多步研究 Agent（Map-Reduce 并行检索 + 汇总）

思路：把一个复杂问题拆成 N 个子问题 → 并行检索 → 汇总答案。用 `Send` 做 map，reducer 做 reduce。

```python
from langgraph.types import Send

# 简化示意：generate_subquestions / retrieve / synthesize 均为节点函数
def planner(state):
    subs = generate_subquestions(state["question"])   # 返回 ["子问题1", "子问题2", ...]
    return [Send("retrieve", {"subq": s, "origin": state["question"]}) for s in subs]

def retrieve(state):
    docs = retriever.invoke(state["subq"])
    return {"gathered": [{"subq": state["subq"], "docs": docs}]}  # reducer 累加

def synthesize(state):
    return {"answer": llm_synthesize(state["question"], state["gathered"])}

# gathered 字段配 list 累加 reducer；planner 用 conditional_edges + Send 并行派发
```

---

## 第四部分：调试、评估与最佳实践

### 4.1 调试三板斧

1. **LangSmith 追踪**：每一步输入/输出/token/耗时全可视化，定位「哪一步跑偏」。
2. **`graph.get_state(config)`**：查看当前状态与下一步节点，断点调试。
3. **`stream_mode="updates"`**：逐步打印节点输出，看数据流。

### 4.2 可视化图

```python
# Jupyter 中直接显示
from IPython.display import Image
Image(graph.get_graph().draw_mermaid_png())
```

也可用 `print(graph.get_graph().draw_mermaid())` 输出 Mermaid 文本，贴到 Mermaid Live 渲染。

### 4.3 评估

- **LangSmith Datasets**：构造测试集，对链/Agent 批量跑评估（准确率、相似度、自定义评判）。
- **LLM-as-a-Judge**：用强模型评判 Agent 输出质量。
- **轨迹评估**：不只看最终答案，还看中间工具调用是否合理。

### 4.4 最佳实践

| 场景 | 建议 |
|------|------|
| 单轮问答 / 简单 RAG | LCEL 链即可，别上 LangGraph |
| 需要循环调工具 | LangGraph，优先 `create_react_agent` |
| 多轮对话记忆 | `thread_id` + Checkpointer |
| 高风险操作 | `interrupt` 人工确认 |
| 流式 UI | `stream_mode="messages"` |
| 结构化结果 | `with_structured_output` > 文本解析 |
| Prompt 模板 | `ChatPromptTemplate` + 变量，别拼字符串 |
| 模型切换 | 走 `ChatModel` 抽象，别硬编码 SDK |
| 生产记忆 | Postgres/Redis Checkpointer，别用内存版 |
| 可观测性 | 必上 LangSmith，否则黑盒无法调 |

### 4.5 常见坑

- **节点返回值是「部分更新」不是全量 State**：只返回要改的字段；要累加必须配 reducer。
- **忘记 `compile()`**：组装完必须编译才能 `invoke`。
- **`bind_tools` 后不执行工具**：模型只输出 `tool_calls`，要 `ToolNode` 或自己写执行逻辑并回传 `ToolMessage`。
- **条件边返回值要匹配节点名**：路由函数返回的字符串必须是图里真实存在的节点名或 `END`。
- **大上下文爆炸**：对话历史无限增长，记得做摘要或窗口截断（LangGraph 可配摘要点）。
- **异步混用**：图里节点全用 `async def`，别 sync/async 混调。

---

## 五、速记表

| 概念 | 一句话 |
|------|--------|
| **LangChain** | LLM 应用积木库 + LCEL 胶水，做线性链/RAG |
| **LCEL** | 用 `\|` 把 Runnable 串成管道，自带 stream/batch/async |
| **Runnable** | 统一抽象，`.invoke/.stream/.batch` 通用 |
| **ChatModel** | 对话模型，输入输出 Message 列表 |
| **PromptTemplate** | 带变量的提示模板，`from_template` / `from_messages` |
| **OutputParser** | 文本→结构化；现多被 `with_structured_output` 取代 |
| **Retriever** | 向量检索器，`as_retriever()` 得到，可入链 |
| **Tool / bind_tools** | 定义工具并绑定到模型，模型输出 `tool_calls` |
| **LangGraph** | 状态图编排，支持循环/分支/中断/持久化，做 Agent |
| **State** | 贯穿图的共享数据，字段可配 reducer 累加 |
| **Node** | 节点函数，接收 State 返回部分更新 |
| **Edge / Conditional Edge** | 固定边 / 条件路由边，后者是分支与循环核心 |
| **ToolNode / tools_condition** | 内置工具执行节点 + 路由，搭 ReAct 快捷 |
| **Checkpointer** | 状态持久化，支持记忆/断点续跑/时间旅行 |
| **interrupt** | 人机协作，暂停等人确认后 `Command(resume=...)` 恢复 |
| **thread_id** | 会话隔离标识，配合 Checkpointer 实现多轮记忆 |
| **create_react_agent** | 一行生成标准 ReAct Agent 图 |
| **LangSmith** | 链路追踪/调试/评估，LLM 应用可观测性标配 |

**核心心法**：

1. 线性链用 LCEL，循环 Agent 用 LangGraph——别用错层。
2. 一切皆 `Runnable`，`|` 是组合原语，`.invoke/.stream` 是统一调用。
3. LangGraph 三要素：State + Node + Edge，加 reducer 管累加、Checkpointer 管记忆。
4. 工具调用是 Agent 的命脉：`bind_tools` 让模型决策，`ToolNode` 执行，条件边构成循环。
5. 生产化三件套：结构化输出（稳）+ LangSmith（可观测）+ 持久化 Checkpointer（有状态）。

> 相关：[LangChain 技术选择（Python vs Node）](./langchain-selection.md) · [AI Agent 专题](./ai-agent.md) · [大模型基础知识](./llm.md)
