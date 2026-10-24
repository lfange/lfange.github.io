---
title: RAG 入门到精通教程
icon: robot
category:
  - AI
  - RAG
  - LangChain
tag:
  - RAG
  - 检索增强生成
  - 向量数据库
  - LLM
  - Python
---

# RAG 入门到精通教程

> 检索增强生成（Retrieval-Augmented Generation）全流程实战。从最朴素的 Naive RAG，到检索/生成优化，再到 Self-RAG / CRAG / GraphRAG / Agentic RAG 等进阶架构，最后覆盖评估与生产化。概念速通见 [大模型基础 - RAG](./llm.md#六-rag-检索增强生成)，编排框架见 [LangChain 与 LangGraph](./langchain-langgraph.md)。

---

## 零、为什么是 RAG

LLM 的三大痛点，RAG 直接对症：

| 痛点 | 表现 | RAG 如何解决 |
|------|------|--------------|
| **幻觉** | 一本正经编造事实 | 给模型真实上下文，让它"看着答" |
| **知识时效** | 训练截止后的信息不知道 | 检索最新文档注入 |
| **私有数据** | 没见过你的内部资料 | 检索私有知识库 |

RAG = **检索 + 生成**：先从知识库捞出相关片段，再把片段塞进 Prompt 让模型作答。无需重新训练，改库即更新，有出处可溯源。

> RAG vs 微调 vs Prompt 的选型见 [大模型基础](./llm.md#6-4-rag-vs-微调)。一句话：**加知识用 RAG，改行为/风格用微调，简单任务先试 Prompt**。

### RAG 的三代演进

```
Naive RAG       索引 -> 检索 -> 生成，单次向量检索，问题多（召回差、丢上下文）
Advanced RAG    加查询改写、多路检索、重排、上下文压缩，工程优化
Modular/Agentic 自判断是否检索、纠错检索、图谱检索、Agent 主动多轮检索
```

本教程按这个梯度从入门讲到精通。

---

## 一、整体流程与架构

无论多复杂的 RAG，都拆成两个阶段：

```
【离线建库 Indexing】
  原始文档 -> 加载(Load) -> 切分(Split) -> 嵌入(Embed) -> 入库(VectorStore)

【在线检索生成 Retrieval+Generation】
  用户问题 -> 查询改写(可选) -> 嵌入 -> 检索 Top-K
         -> 重排/过滤/压缩(可选) -> 拼接上下文 -> LLM 生成 -> (带引用)回答
```

**五个核心组件**：

1. **Document Loader**：加载 PDF/网页/Markdown/数据库等。
2. **Text Splitter**：切成合适大小的 chunk。
3. **Embedding Model**：文本转向量。
4. **Vector Store**：存向量 + 相似度检索。
5. **LLM + Prompt**：基于检索结果生成答案。

> 进阶组件（第四~九章）：查询改写器、多路检索、Reranker、上下文压缩器、路由器、评估器。

---

## 二、环境准备

```bash
# 核心依赖
pip install langchain langchain-core langchain-community langchain-openai
pip install langchain-text-splitters langchain-postgres langchain-chroma

# 评估
pip install ragas

# 可选：本地嵌入/重排
pip install langchain-huggingface sentence-transformers FlagEmbedding
```

```python
import os
os.environ["OPENAI_API_KEY"] = "sk-..."

# 用兼容接口（如 DeepSeek / 本地 vLLM）时设置 base_url
# os.environ["OPENAI_BASE_URL"] = "https://api.deepseek.com"
```

**模型选择建议**：

| 用途 | 推荐 |
|------|------|
| 生成 LLM | GPT-4o-mini（性价比）/ Claude / DeepSeek-V3 / 本地 Qwen |
| 嵌入（API） | OpenAI `text-embedding-3-small/large`（英文好，中文尚可） |
| 嵌入（中文/本地） | BGE-large-zh / M3E / bge-m3（支持稀疏+稠密+多向量） |
| 重排 | BGE-Reranker-v2 / Cohere Rerank |

---

## 三、入门：Naive RAG（最简完整版）

30 行代码跑通一个能用的 RAG。先建立直觉，后面再优化。

### 3.1 加载与切分

```python
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 加载（支持 PDF/Markdown/网页等几十种 Loader）
loader = DirectoryLoader("./docs", glob="**/*.md", loader_cls=TextLoader)
docs = loader.load()

# 切分
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)
print(f"切出 {len(chunks)} 个片段")
```

### 3.2 嵌入与入库

```python
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(chunks, embeddings, persist_directory="./chroma_db")

# 检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
```

### 3.3 检索 + 生成

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("""
根据以下上下文回答问题。若上下文没有相关信息，就说"我不知道"，不要编造。

上下文：
{context}

问题：{question}
""")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

print(rag_chain.invoke("公司的退款政策是什么？"))
```

这就是 Naive RAG。能跑，但效果取决于切分和检索质量--下面逐个优化。

---

## 四、切分策略详解（决定上限）

**切分质量直接决定 RAG 上限**。切得不好，检索再强也救不回来。

### 4.1 为什么切分关键

- 太大：一个 chunk 含多个主题，检索精度低，浪费 token。
- 太小：语义不完整，模型难以理解。
- 切错位置：把一句话/一段代码/一个表格切成两半，语义断裂。

### 4.2 主流切分器对比

| 切分器 | 原理 | 适用 |
|------|------|------|
| `RecursiveCharacterTextSplitter` | 按分隔符优先级递归切（段->句->字），尽量保持语义 | **通用首选** |
| `CharacterTextSplitter` | 单一分隔符切 | 简单文本 |
| `MarkdownHeaderTextSplitter` | 按 Markdown 标题层级切，保留标题元数据 | 文档/Wiki |
| `PythonCodeTextSplitter` | 按代码结构（函数/类）切 | 代码库 |
| `HTMLHeaderTextSplitter` | 按 HTML 标签切 | 网页 |
| `SemanticChunker` | 按语义相似度断句，相邻句向量差异大处切分 | 长文/质量优先 |
| `ParentDocumentSplitter` | 切小片检索，返回父文档 | Small-to-Big 策略 |

### 4.3 递归切分（最常用）

```python
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,                          # 重叠避免边界丢信息
    separators=["\n\n", "\n", "。", "！", "？", "；", ",", " ", ""],  # 中文友好
)
```

**调参经验**：

- `chunk_size`：问答类 300~500 token；长文档摘要 1000~2000。
- `chunk_overlap`：size 的 10%~20%。
- 中文务必把 `。！？；` 加进 separators，否则按英文标点切会切得很碎。

### 4.4 Markdown 结构化切分（带元数据）

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter

headers = [("#", "h1"), ("##", "h2"), ("###", "h3")]
md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers)
md_chunks = md_splitter.split_text(markdown_text)
# 每个 chunk 的 metadata 含 {"h1": "...", "h2": "..."}，检索时可过滤
```

### 4.5 语义切分（质量优先）

```python
from langchain_experimental.text_splitter import SemanticChunker

semantic_splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",  # 或 "standard_deviation"
    breakpoint_threshold_amount=95,
)
# 按语义边界切，chunk 大小不固定但语义完整，质量最高、成本最高
```

### 4.6 元数据：被低估的利器

给每个 chunk 打元数据（来源、标题、时间、章节、权限），后续可**过滤检索**、**引用溯源**、**权限控制**：

```python
from langchain_core.documents import Document

doc = Document(
    page_content="退款需在 7 天内申请...",
    metadata={"source": "refund-policy.md", "section": "退款", "version": "v2", "acl": "public"},
)
# 检索时过滤
retriever.invoke("退款", filter={"source": "refund-policy.md"})
```

---

## 五、嵌入（Embedding）深入

### 5.1 原理

嵌入模型把文本映射成高维向量（如 1536 维），**语义相近的文本向量也相近**。检索时用 cosine 相似度找最近邻。

### 5.2 模型选择

| 模型 | 维度 | 特点 |
|------|------|------|
| OpenAI `text-embedding-3-small` | 1536 | 便宜，英文强 |
| OpenAI `text-embedding-3-large` | 3072 | 更准，贵 |
| `bge-large-zh-v1.5` | 1024 | 中文强，可本地 |
| `bge-m3` | 1024 | 稠密+稀疏+多向量一体，长文本好 |
| `m3e-base` | 768 | 中文，开源 |

```python
# 本地嵌入（省钱、隐私、离线）
from langchain_huggingface import HuggingFaceEmbeddings
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-zh-v1.5")

# BGE 中文模型建议加查询前缀提升召回
# 查询: "为这个句子生成表示以用于检索相关文章：" + query
```

### 5.3 嵌入优化技巧

- **归一化**：很多模型需 L2 归一化后再算 dot product 等价 cosine。
- **维度截断**（Matryoshka）：`text-embedding-3` 支持降维（如 1536->256），省存储，轻微掉点。
- **批量化**：`embed_documents` 批量嵌入，别循环单条。
- **缓存**：嵌入只算一次，缓存结果（Chroma 持久化即天然缓存）。

---

## 六、向量数据库

### 6.1 选型对比

| 向量库 | 类型 | 适用场景 |
|------|------|------|
| **Chroma** | 嵌入式 | 开发/原型，零配置 |
| **FAISS** | 库 | 单机高性能，无服务端 |
| **Qdrant** | 服务 | 生产，过滤强，Rust 写 |
| **Milvus** | 服务 | 大规模生产，分布式 |
| **pgvector** | PG 插件 | 已有 Postgres，数据统一 |
| **Weaviate** | 服务 | 内置混合检索、模块多 |
| **Pinecone** | 云服务 | 全托管，省事 |

**经验**：开发用 Chroma/FAISS，生产中小规模用 Qdrant/pgvector，超大规模用 Milvus。

### 6.2 索引算法

- **暴力检索（Flat）**：精确，慢，小数据可用。
- **HNSW**（主流）：图索引，查询快、召回高，内存大。Chroma/Qdrant 默认。
- **IVF**：聚类倒排，可结合 PQ 压缩，省内存。
- 大多数库默认 HNSW，开箱即用，不用深究。

### 6.3 相似度度量

| 度量 | 说明 |
|------|------|
| **Cosine** | 最常用，关注方向忽略模长 |
| **Dot Product** | 等价归一化后的 cosine，更快 |
| **L2 (欧氏)** | 关注绝对距离 |

嵌入模型训练时用的度量就是最优度量，照文档选（OpenAI/BGE 默认 cosine）。

### 6.4 检索参数

```python
retriever = vectorstore.as_retriever(
    search_type="similarity",        # 或 "mmr"（去重）/ "similarity_score_threshold"
    search_kwargs={
        "k": 4,                       # 取 Top-K
        "score_threshold": 0.5,       # 分数阈值（部分库支持）
        "filter": {"source": "..."},  # 元数据过滤
    },
)
```

### 6.5 MMR：兼顾相关与多样

普通 Top-K 易返回高度重复的片段。**MMR（Maximal Marginal Relevance）** 在相关性和多样性间平衡，避免答案片面：

```python
retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 4, "fetch_k": 20, "lambda_mult": 0.5})
# fetch_k 先召回 20 个，再用 MMR 从中选 4 个多样的
```

---

## 七、检索优化（Advanced RAG 核心篇）

Naive RAG 把用户原问题直接去检索，常因问题表述差而召回不准。检索优化分**检索前 / 检索中 / 检索后**三段。

### 7.1 检索前：查询改写

用户问得随意（"那个怎么用"），直接检索效果差。用 LLM 改写查询：

| 技术 | 做法 | 适用 |
|------|------|------|
| **查询改写** | 把口语化/有歧义的问题改写成清晰检索词 | 歧义、口语 |
| **Multi-Query** | 让 LLM 生成多个角度的查询，分别检索后去重合并 | 召回率提升 |
| **HyDE** | 让 LLM 先编一个"假设答案"，用答案向量去检索（答案比问题更接近文档表述） | 问题与文档措辞差异大 |
| **Step-Back** | 把具体问题抽象成更高层概念问题再检索 | 细节问不到时 |
| **查询分解** | 复杂问题拆成子问题分别检索 | 多跳问答 |

**Multi-Query 示例**：

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
retriever = MultiQueryRetriever.from_llm(retriever=base_retriever, llm=llm)
# 内部让 LLM 生成 3 个变体查询，分别检索，union 去重
```

**HyDE 示例**：

```python
from langchain.retrievers import HypotheticalDocumentEmbedder
hyde = HypotheticalDocumentEmbedder.from_llm(llm, base_embeddings, prompt_key="web_search")
# 流程：问题 -> LLM 生成假设答案 -> 答案嵌入 -> 检索
```

### 7.2 检索中：多路检索 + 融合

向量检索擅长语义，但**关键词/精确匹配弱**（如产品型号、人名、编号）。混合检索互补：

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# 1. 关键词检索（BM25）
bm25 = BM25Retriever.from_documents(chunks); bm25.k = 4
# 2. 向量检索
vec = vectorstore.as_retriever(search_kwargs={"k": 4})

# 3. 融合（加权）
ensemble = EnsembleRetriever(retrievers=[bm25, vec], weights=[0.4, 0.6])
```

**RRF（Reciprocal Rank Fusion）** 是更稳的融合方式：不看分数只看排名，`score = Σ 1/(rank + k)`，避免不同检索器分数量纲不一致问题。部分库（Weaviate/Qdrant）内置混合检索直接用 RRF。

### 7.3 检索后：重排（Rerank，强烈推荐）

向量检索（双塔）快但粗，召回 Top-20 里掺着不相关的。**Reranker（交叉编码器）** 把 query 和每个 doc 拼一起精排，准但慢，所以先粗召再精排：

```
查询 -> 向量检索 Top-20（快但粗）-> Reranker 精排 -> 取 Top-4（准）
```

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank
# 或用 BGE-Reranker 本地版

compressor = CohereRerank(model="rerank-multilingual-v3.0", top_n=4)
rerank_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=vec
)
```

> **经验**：加一个 Reranker 是性价比最高的 RAG 提升手段，通常能让答案质量明显上一个台阶。

### 7.4 Small-to-Big（Parent-Child）

检索小片段（精准命中）但返回大片段（上下文完整）：

```python
from langchain_text_splitters import ParentDocumentSplitter

parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)  # 父：大
child_splitter = RecursiveCharacterTextSplitter(chunk_size=300)    # 子：小
# 入库的是 child，但 metadata 记录 parent_id；检索命中 child 后返回其 parent
```

变体：**Sentence-Window** 检索单句，返回前后若干句作为窗口。

### 7.5 元数据过滤

避免跨主题污染：先按元数据（来源、时间、章节、权限）过滤，再向量检索。可结合 LLM 把用户意图转成过滤条件（自查询检索 `SelfQueryRetriever`）。

---

## 八、生成优化

### 8.1 上下文压缩

检索回的 chunk 可能很长且含噪声。**压缩器**用 LLM/嵌入抽相关部分：

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

compressor = LLMChainExtractor.from_llm(llm)   # LLM 抽取相关片段
comp_retriever = ContextualCompressionRetriever(base_compressor=compressor, base_retriever=vec)
```

### 8.2 Lost in the Middle

长上下文里，**中间位置的信息容易被模型忽略**（论文 Lost in the Middle）。对策：

- 少即是多：Rerank 后只塞 Top-3~5，别贪多。
- 重要内容放头尾（首因/近因效应）。
- 长上下文模型（Claude/Gemini）缓解但不消除。

### 8.3 引用溯源

让模型标注每句话来自哪个来源，可信且可核查：

```python
prompt = ChatPromptTemplate.from_template("""
根据上下文回答，并在每条陈述后用 [编号] 标注来源。
上下文：
[1] {ctx1}
[2] {ctx2}
...
问题：{question}
""")
```

LangChain 的 `HubRunnable` 或自定义输出 parser 可结构化引用。

### 8.4 Prompt 要点

- 明确"只基于上下文回答，无关就说不知道"——降幻觉。
- 要求分点、带引用、给格式——可控输出。
- temperature=0——事实型任务要确定性。

---

## 九、进阶架构（精通篇）

把 RAG 从"固定流水线"升级为"会思考的检索"。

### 9.1 Self-RAG

模型**自判断**：这个问题要不要检索？检索结果相不相关？回答有没有依据？用反射 token 控制。实现上用 LangGraph 状态机：

```
问题 -> [判断是否需检索]
  否 -> 直接生成
  是 -> 检索 -> [判断片段相关性，过滤] -> 生成 -> [判断是否被支持] -> 输出/重试
```

### 9.2 Corrective RAG (CRAG)

检索结果不一定靠谱，CRAG 加**纠错层**：评估检索质量，分三档处理：

- **正确**（相关）：精炼后用。
- **错误**（不相关）：丢弃，转用**网页搜索**兜底。
- **模糊**：两者结合。

```
检索 -> [评估相关性] --正确--> 精炼 -> 生成
                  \--错误--> 网络搜索兜底 -> 生成
                  \--模糊--> 混合
```

### 9.3 Adaptive RAG（路由）

不同问题用不同策略：简单事实走向量检索；需精确匹配走关键词；开放性问题走网络搜索。用一个路由器（LLM 分类）分流：

```python
def route(state):
    q_type = classifier.invoke(state["question"])  # factual/keyword/open
    return {"factual": "vector", "keyword": "bm25", "open": "web_search"}[q_type]
```

### 9.4 GraphRAG（知识图谱 + RAG）

微软提出。先从文档**抽取实体和关系建知识图谱**，再按社区聚类生成摘要。检索时既可向量检索，也可沿图谱关系遍历，擅长**全局性、跨文档**问题（"总结整个领域"），而传统 RAG 擅长局部事实。

- 优点：全局视野、多跳推理强。
- 缺点：建图成本高、更新复杂。

### 9.5 Agentic RAG（用 LangGraph 做）

把 RAG 包进 Agent，让模型**主动多轮检索**：查一次不够再查，换关键词再查，调用多个工具（向量库/SQL/网页）。这是当前最灵活的形态，见 [LangGraph 教程](./langchain-langgraph.md#2-5-完整-react-agent-工具循环)。

```python
from langgraph.prebuilt import create_react_agent

def vector_search(query: str) -> str:
    """检索内部知识库。"""
    return format_docs(retriever.invoke(query))

def web_search(query: str) -> str:
    """联网搜索最新信息。"""
    ...

agent = create_react_agent(llm, [vector_search, web_search])
agent.invoke({"messages": [("user", "对比公司产品和竞品最新价格")]})
# 模型自己决定先查内部库再联网，多轮直到答全
```

### 9.6 架构选型速查

| 场景 | 推荐架构 |
|------|------|
| 简单 FAQ | Naive RAG |
| 召回不准 | + 查询改写 + Rerank |
| 精确匹配需求 | + BM25 混合检索 |
| 多跳/复杂问题 | Agentic RAG / GraphRAG |
| 全局总结类问题 | GraphRAG |
| 检索质量不稳 | CRAG（兜底网络搜索） |
| 不同问题类型混杂 | Adaptive RAG（路由） |

---

## 十、评估（精通必经）

没评估的 RAG 是"感觉不错"的黑盒。RAG 评估分**三元组**（RAGAS 框架）：

### 10.1 RAG 三元组

| 指标 | 问的问题 | 衡量 |
|------|------|------|
| **Context Relevance**（上下文相关性）| 检索的片段对问题有用吗？ | 检索质量 |
| **Faithfulness**（忠实度）| 回答是否忠于检索到的上下文（不编造）？ | 幻觉程度 |
| **Answer Relevance**（答案相关性）| 回答有没有正面回应问题？ | 生成质量 |

外加 **Answer Correctness**（与标准答案对比）。

### 10.2 用 RAGAS 评估

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from datasets import Dataset

eval_data = Dataset.from_dict({
    "question": [...],
    "answer": [...],          # RAG 实际输出
    "contexts": [[...]],      # 检索到的片段
    "ground_truth": [...],    # 人工标准答案
})

result = evaluate(eval_data, metrics=[faithfulness, answer_relevancy, context_precision, context_recall])
print(result)
# context_precision / context_recall 评检索；faithfulness / answer_relevancy 评生成
```

### 10.3 检索单独评估

不跑 LLM 也能评检索（更便宜更快）：

| 指标 | 含义 |
|------|------|
| **Recall@K** | Top-K 里覆盖了多少相关文档 |
| **MRR** | 第一个相关文档的排名倒数 |
| **NDCG** | 考虑排名位置的相关性加权分 |
| **Hit Rate** | Top-K 里至少命中一个的概率 |

需要标注集（query -> 相关 doc id）。改一个参数（chunk_size/k/重排）就用标注集跑这些指标对比。

### 10.4 评估最佳实践

- 建一个 50~200 条的黄金测试集（query + 标准答案 + 相关片段）。
- 每次改动跑 RAGAS，关注三元组分数变化。
- 用 LLM-as-Judge 自动评分，定期人工抽检校准。
- 上线后用 LangSmith 采集真实 query，持续补充测试集。

---

## 十一、生产化与工程实践

### 11.1 缓存

- **嵌入缓存**：同一文本嵌入只算一次，存库时已天然缓存。
- **语义缓存**：相似问题直接返回历史答案（如 GPTCache），但小心答非所问。
- **LLM 缓存**：LangChain `set_llm_cache`，相同 prompt 直接返回。

### 11.2 增量更新

文档会变，不能每次全量重建：

- 给每个 chunk 记 `doc_id` + `hash`，变更才重嵌入。
- 删除旧文档时同步删向量（按 metadata.source 过滤删除）。
- 大规模用"全量重建到新库 + 原子切换"避免脏读。

### 11.3 权限控制

不同用户能看不同文档：

- chunk metadata 打 `acl` 字段（用户/角色）。
- 检索时按当前用户身份过滤（`filter={"acl": {"$in": user_groups}}`）。
- 敏感数据：检索后二次校验，别只靠向量库过滤。

### 11.4 监控（LangSmith）

- 接 LangSmith，看每个 query 的检索片段、Prompt、答案、耗时、token。
- 关注：检索为空率、答案拒答率（"我不知道"过多说明检索有问题）、用户反馈。
- 上线后定期人工 review 低质案例，反哺优化。

### 11.5 流式 + 引用 UI

```python
for chunk in rag_chain.stream("退款政策"):
    print(chunk, end="", flush=True)  # 打字机效果
```

前端展示时把检索片段作为"引用来源"折叠展示，增强可信度。

### 11.6 常见坑

| 坑 | 对策 |
|----|------|
| 召回不准 | 加查询改写 + Rerank，检查切分 |
| 答案带幻觉 | Prompt 强调"只基于上下文"，加 Faithfulness 评估 |
| 关键词/编号搜不到 | 加 BM25 混合检索 |
| 长上下文丢信息 | Rerank 后只塞 Top-3~5，用 MMR 去重 |
| 中文切分太碎 | 把中文标点加进 separators，或用语义切分 |
| 多轮对话失忆 | 用 LangGraph Checkpointer + thread_id 管历史 |
| 检索慢 | 检查索引（HNSW）、缩小 fetch_k、批量嵌入 |
| 文档更新不生效 | 检查增量更新逻辑，清旧向量 |

---

## 十二、从入门到精通路线图

```
入门（能跑）
  1. Naive RAG 跑通（Loader -> Split -> Embed -> Store -> Retrieve -> LLM）
  2. 理解 chunk_size/overlap 影响

进阶（好用）
  3. 切分优化（结构化/语义切分 + 元数据）
  4. 嵌入模型选型（中文用 BGE/M3E）
  5. MMR 去重
  6. 加 Rerank（性价比之王）
  7. 查询改写（Multi-Query / HyDE）
  8. BM25 混合检索 + RRF 融合

精通（可控可演进）
  9. RAGAS 三元组评估 + 标注集
  10. Self-RAG / CRAG / Adaptive RAG
  11. GraphRAG（全局问题）
  12. Agentic RAG（LangGraph 多轮主动检索）
  13. 生产化：增量更新/权限/缓存/监控
```

---

## 十三、速记表

| 概念 | 一句话 |
|------|--------|
| **RAG** | 检索知识库片段 + LLM 生成，治幻觉/时效/私有数据 |
| **三阶段** | 离线建库 -> 在线检索 -> 生成 |
| **切分** | 决定上限，递归切通用、语义切最精、结构切带元数据 |
| **Embedding** | 文本转向量，语义相近则向量相近 |
| **向量库** | 开发 Chroma，生产 Qdrant/pgvector，超大 Milvus |
| **MMR** | 兼顾相关与多样，去重复片段 |
| **查询改写** | Multi-Query/HyDE/Step-Back，提升召回 |
| **混合检索** | 向量 + BM25，补关键词短板 |
| **Rerank** | 粗召后交叉编码器精排，性价比最高提升 |
| **Small-to-Big** | 检索小块返回大块，精准又完整 |
| **Lost in Middle** | 长上下文中段信息易丢，少塞+放头尾 |
| **Self-RAG** | 自判断是否检索/相关/有据 |
| **CRAG** | 检索纠错，差则网络搜索兜底 |
| **GraphRAG** | 知识图谱 + 社区摘要，擅长全局总结 |
| **Agentic RAG** | Agent 主动多轮检索，最灵活 |
| **RAGAS 三元组** | 上下文相关性 / 忠实度 / 答案相关性 |
| **检索指标** | Recall@K / MRR / NDCG / Hit Rate |

**核心心法**：

1. **切分是上限，检索是下限**：先打磨切分，再优化检索，最后调生成。
2. **Rerank 是最划算的优化**：粗召 + 精排，几乎必上。
3. **向量检索不擅长精确匹配**：关键词/编号/人名要靠 BM25 混合。
4. **没有评估就没有优化**：建标注集，跑 RAGAS，用数据驱动调参。
5. **从 Naive 起步，按瓶颈升级**：检索不准改检索，幻觉改 Prompt，复杂问题再上 Agentic/Graph。

> 相关：[大模型基础 - RAG](./llm.md#六-rag-检索增强生成) · [LangChain 与 LangGraph 教程](./langchain-langgraph.md) · [AI Agent 专题](./ai-agent.md)
