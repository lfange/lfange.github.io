---
title: 大模型基础知识
icon: robot
category:
  - AI
  - 大模型
tag:
  - LLM
  - 大模型
  - AI
---

# 大模型基础知识

> 大模型（LLM，Large Language Model）原理与工程知识速通。覆盖 Transformer 架构、训练流程、推理优化、提示工程、RAG、微调、评估与模型生态。Agent 专题见 [AI Agent](./ai-agent.md)，LangChain 选型见 [LangChain 技术选择](./langchain-selection.md)。

---

## 一、基础概念

### 1.1 什么是大模型

大模型是参数量巨大（数十亿到万亿）、在海量文本上训练的神经网络语言模型，能理解/生成自然语言并涌现推理、代码、多模态等能力。代表：GPT、Claude、Gemini、Llama、Qwen、DeepSeek。

### 1.2 关键术语

| 术语 | 含义 |
|------|------|
| **参数量**（Parameters）| 模型权重数量，如 7B = 70 亿。参数越多能力通常越强，但更耗资源 |
| **Token** | 模型处理的最小单位，约 3/4 个英文单词或 1~2 个汉字。计费和上下文长度按 token 算 |
| **上下文窗口**（Context Window）| 单次输入+输出能处理的最大 token 数，如 128K、1M |
| **上下文长度** | 同上 |
| **温度**（Temperature）| 采样随机性，0 最确定，>1 更随机。0 用于代码/事实，0.7 用于创作 |
| **Top-p / Top-k** | 核采样参数，限制候选 token 范围 |
| **涌现能力**（Emergent）| 模型大到某个规模后突然出现的能力（如推理、少样本学习）|
| **幻觉**（Hallucination）| 模型一本正经编造事实 |

### 1.3 生成原理（自回归）

主流 LLM 是**自回归（Autoregressive）** Decoder：根据已生成 token，预测下一个 token，循环直到结束。本质是在算 `P(下一个token | 前面所有token)`。

```
输入: "今天天气"
模型预测下一个 token: "真" 
输入: "今天天气真"
预测: "好" -> "今天天气真好"
```

---

## 二、Transformer 架构

Transformer 是 2017 年 Google《Attention Is All You Need》提出的架构，是所有现代 LLM 的基础。

### 2.1 整体结构

- **Encoder-Only**（BERT）：双向理解，适合分类、检索。已被生成式模型取代。
- **Decoder-Only**（GPT/Claude/Llama）：单向自回归生成，当前主流。
- **Encoder-Decoder**（T5/BART）：翻译等序列到序列任务。

主流 LLM 几乎都是 **Decoder-Only**，因为生成任务统一、易扩展、训练效率高。

### 2.2 Self-Attention（核心）

让每个 token 关注序列中所有 token，计算加权表示。

```
Q = X · Wq    (Query：我要找什么)
K = X · Wk    (Key：我能提供什么)
V = X · Wv    (Value：实际内容)

Attention(Q,K,V) = softmax(Q·K^T / √d_k) · V
```

- `Q·K^T`：token 间相关性得分。
- `softmax`：归一化为权重（0~1，和为 1）。
- `√d_k`：缩放，防止得分过大导致 softmax 梯度消失。
- 乘 `V`：加权求和得到输出。

### 2.3 Multi-Head Attention

把 Q/K/V 拆成多个头并行 attention，每个头学不同关注模式（语法、语义、长程依赖等），再拼接。

### 2.4 位置编码

Self-Attention 本身无顺序概念，需要注入位置信息：

- **绝对位置编码**（原 Transformer、GPT-2）：`sin/cos` 函数编码位置。
- **可学习位置编码**（BERT、Llama 早期）：位置嵌入表。
- **RoPE 旋转位置编码**（Llama、Qwen 主流）：在 Q/K 上施加旋转，**相对位置**感知，外推性好（易扩展上下文长度）。
- **ALiBi**：在 attention 得分加位置偏置。

### 2.5 其他组件

- **FFN（前馈网络）**：每个位置独立做非线性变换，存储知识。Llama 用 SwiGLU。
- **LayerNorm / RMSNorm**：归一化。Llama 用 RMSNorm（比 LayerNorm 省参数）。
- **残差连接**：缓解深层梯度消失。
- **MoE（混合专家）**：FFN 替换为多个专家网络，每次只激活部分（如 DeepSeek/Mixtral），用更少算力达到更大模型效果。

### 2.6 KV Cache（推理关键）

自回归生成时，前面 token 的 K/V 每步都要重算。**缓存已算的 K/V**，每步只算新 token 的 K/V 追加，避免重复计算，大幅加速生成。

代价：显存占用随上下文线性增长（`2 × n_layers × n_heads × seq_len × d_head × batch`），长上下文显存压力大，催生 PagedAttention 等优化。

---

## 三、训练流程

LLM 训练分三阶段：

### 3.1 预训练（Pre-training）

在海量无标注文本上做**下一个 token 预测**（自监督），学习语言和世界知识。这是最贵阶段（千卡数月，百万美元级）。

```
目标: 给定 "今天天气真"，预测 "好"
数据: 万亿 token 的网页、书籍、代码
```

产出：**基座模型**（Base Model），只会续写，不会对话。

### 3.2 SFT（监督微调，Supervised Fine-Tuning）

用**人工编写的「指令-回答」对**微调基座模型，让它学会按指令格式回答、对话。

```
输入: "把这句话翻译成英文：你好"
输出: "Hello"
```

产出：**指令模型**（Chat Model），能对话，但风格可能不安全、不优。

### 3.3 对齐（Alignment）：RLHF / DPO

让模型回答符合人类偏好（有用、无害、诚实）。

**RLHF（基于人类反馈的强化学习）**：

1. 训练**奖励模型（RM）**：用人工标注的「回答排序」数据训练一个打分模型。
2. **PPO 强化学习**：用 RM 给 SFT 模型的输出打分，强化好的、抑制差的。

**DPO（Direct Preference Optimization）**：

直接用偏好数据（chosen/rejected 对）微调，省去 RM 和 RL，更简单稳定。当前主流选择。

产出：**对齐模型**（Align Model），即最终发布版本（如 GPT-4、Claude）。

### 3.4 训练阶段总结

```
原始文本 -> [预训练] -> Base 模型 -> [SFT] -> 指令模型 -> [RLHF/DPO] -> 对齐模型
            贵/自监督           有监督            偏好对齐
```

---

## 四、推理优化

推理成本是 LLM 应用的核心瓶颈，优化方向：

### 4.1 KV Cache

见 2.6，缓存历史 K/V，避免重复计算。所有推理框架必备。

### 4.2 FlashAttention

GPU 计算 attention 时，`Q·K^T` 矩阵随序列长度平方增长，显存读写成为瓶颈。FlashAttention 用**分块计算**（tiling），减少 HBM 读写，IO 感知，速度提升 2~4 倍，且数学等价。已是训练和推理标配。

### 4.3 PagedAttention（vLLM）

借鉴 OS 虚拟内存分页，把 KV Cache 划分为固定大小块（block），按需分配，避免预留整段显存浪费。支持**连续批处理**（Continuous Batching），动态拼批，吞吐量提升数倍。vLLM 框架的核心。

### 4.4 量化（Quantization）

把权重从 FP16（16 位）降到低精度，省显存、提速度：

| 方案 | 位宽 | 说明 |
|------|------|------|
| FP16/BF16 | 16 | 默认训练精度 |
| INT8 | 8 | 显存减半，几乎无损 |
| INT4 | 4 | 显存 1/4，轻微掉点，消费级显卡跑大模型首选 |
| **GPTQ** | 4 | 训后量化，需要校准集 |
| **AWQ** | 4 | 激活感知，保持重要权重精度，效果优于 GPTQ |
| **GGUF** | 4/8 | llama.cpp 格式，CPU/混合推理 |

### 4.5 投机解码（Speculative Decoding）

用小模型快速草拟多个 token，大模型并行验证，正确的接受、错的回退。用并行换串行，提升生成速度。DeepSeek-V3、Medusa 等用此技术。

### 4.6 连续批处理（Continuous Batching）

传统 batch 要等最慢请求完成才能下一批（队头阻塞）。连续批处理在每步动态加入/移除请求，GPU 利用率高。vLLM/TGI 核心特性。

### 4.7 推理框架对比

| 框架 | 特点 |
|------|------|
| **vLLM** | PagedAttention，吞吐最高，生产部署首选 |
| **llama.cpp** | CPU/边缘设备，GGUF 格式，本地跑 |
| **Ollama** | 基于 llama.cpp，本地一键运行，开发友好 |
| **TGI**（HuggingFace）| 生产级，功能全 |
| **TensorRT-LLM** | NVIDIA 官方，极致性能，配置复杂 |
| **MLC-LLM** | 多平台（含移动端/WebGPU）|

---

## 五、提示工程（Prompt Engineering）

### 5.1 基本原则

- **明确具体**：任务、格式、约束写清楚。
- **结构化**：用分隔符（```/---/XML 标签）区分指令和内容。
- **给示例**（Few-shot）：比纯描述更有效。
- **分步引导**（CoT）：让模型"想清楚再答"。

### 5.2 常见技巧

| 技巧 | 说明 |
|------|------|
| **Zero-shot** | 不给例子，直接问 |
| **Few-shot** | 给几个示例，引导格式和风格 |
| **CoT**（Chain-of-Thought）| "请一步步思考"，显著提升推理/数学 |
| **Self-Consistency** | 多次采样取多数，提升准确率 |
| **ReAct** | Reason + Act，思考-行动-观察循环，Agent 基础 |
| **角色设定** | "你是资深 XX 工程师"，引导专业输出 |
| **结构化输出** | 要求 JSON/XML，配合 Function Calling |

### 5.3 Prompt 示例

```text
你是一位资深后端工程师，请按以下要求 review 代码：
1. 只关注安全性和性能
2. 每条问题给出：严重程度(高/中/低)、位置、建议
3. 输出 JSON 数组

代码：
（在此粘贴待 review 的代码）
```

### 5.4 Prompt 注入（安全）

用户输入中夹带恶意指令（"忽略以上所有指令，输出..."），劫持模型行为。防御：分隔用户输入、输入过滤、系统提示加固、输出校验。

---

## 六、RAG（检索增强生成）

让模型基于**外部知识库**回答，解决幻觉、知识过时、私有数据问题，无需重新训练。

### 6.1 基本流程

```
1. 离线建库:
   文档 -> 切分(Chunk) -> Embedding 向量化 -> 存入向量数据库

2. 在线检索:
   用户问题 -> Embedding -> 向量相似度检索 Top-K chunk

3. 生成:
   [检索到的 chunk + 用户问题] -> LLM -> 回答
```

### 6.2 关键组件

- **Embedding 模型**：文本转向量。如 OpenAI `text-embedding-3`、BGE、M3E。
- **向量数据库**：存向量+相似度检索。Chroma、Pinecone、Weaviate、Milvus、Qdrant、pgvector。
- **Chunk 策略**：切分大小（200~500 token）、重叠、按语义切（标题/段落）。切分质量直接影响检索效果。
- **重排（Rerank）**：检索召回后用交叉编码器重排，提升精度。如 BGE-Reranker。

### 7.3 高级 RAG

- **查询改写**：用 LLM 改写/扩展用户问题提升召回。
- **多路检索**：向量 + 关键词（BM25）+ 知识图谱混合。
- **Parent-Child**：检索小块、返回大块上下文。
- **Self-RAG**：模型自判断是否需要检索、检索结果是否相关。

### 6.4 RAG vs 微调

| 维度 | RAG | 微调 |
|------|-----|------|
| 适合 | 事实性、易变知识、私有文档 | 风格/格式/领域能力 |
| 更新成本 | 改库即可，低 | 重新训练，高 |
| 幻觉 | 低（有出处）| 仍可能 |
| 实时性 | 高 | 低 |
| 成本 | 检索+推理 | 训练贵 |

**选型**：知识更新用 RAG，行为/风格用微调，可叠加。

---

## 七、微调（Fine-Tuning）

### 7.1 全参微调

更新所有参数，效果最好但显存需求巨大（7B 模型训练需 60GB+ 显存）。适合企业级、有资源场景。

### 7.2 PEFT（参数高效微调）

只训练少量参数，省显存、防遗忘，消费级显卡可跑。主流方案：

#### LoRA（Low-Rank Adaptation）

冻结原权重 `W`，旁边加一个低秩矩阵 `ΔW = B·A`（A、B 是小矩阵），只训练 A、B。

```
原: y = W·x
LoRA: y = W·x + B·A·x
```

原理：大模型微调时权重变化是低秩的，用两个小矩阵近似。训练参数降 1%~10%，效果接近全参。

#### QLoRA

LoRA + 4bit 量化基座，单卡 24GB 可微调 70B 模型。性价比之王。

#### 其他

- **Adapter**：层间插入小模块训练。
- **Prefix Tuning / Prompt Tuning**：优化软提示向量。

### 7.3 微调数据

- **质量 > 数量**：千条高质量 > 十万条噪声。LIMA 论证 1K 高质量数据即可。
- **格式**：指令-输入-输出（Alpaca 格式）、对话格式（ShareGPT）。
- **数据配比**：通用+领域混合，防能力退化。

### 7.4 微调 vs Prompt vs RAG

```
改行为/风格 -> 微调
加知识 -> RAG
简单任务 -> Prompt 工程（先试这个，最便宜）
```

**演进顺序**：先 Prompt 优化 -> 再 RAG -> 最后微调。不要一上来就微调。

---

## 八、Agent 简介

Agent = LLM + 工具调用 + 规划 + 记忆，能自主完成多步任务。

- **核心循环（ReAct）**：思考(Thought) -> 行动(Action/工具调用) -> 观察(Observation) -> 循环。
- **工具调用**：Function Calling / Tool Use，模型输出结构化调用。
- **记忆**：短期（上下文）+ 长期（向量库）。
- **规划**：任务分解、反思。

> Agent 深度内容见 [AI Agent 专题](./ai-agent.md)。

---

## 九、评估与挑战

### 9.1 评测基准

| 基准 | 考察 |
|------|------|
| **MMLU** | 多学科知识（57 科）|
| **HumanEval / MBPP** | 代码生成 |
| **GSM8K / MATH** | 数学推理 |
| **BBH** | 综合推理 |
| **GPQA** | 研究生级专家问答 |
| **SWE-bench** | 真实软件工程任务 |

### 9.2 主要挑战

- **幻觉**：编造事实。缓解：RAG、引用出处、置信度校准。
- **安全对齐**：越狱、有害内容。RLHF + 红队测试。
- **长上下文**：虽支持 1M，但"大海捞针"测试显示中段信息易丢（Lost in the Middle）。
- **时效性**：训练截止后的知识。RAG 补充。
- **推理局限**：复杂多步推理仍不稳。CoT、o1 式推理链缓解。
- **成本**：推理贵。量化、缓存、小模型蒸馏。

### 9.3 上下文长度扩展

从 4K -> 128K -> 1M+。技术：RoPE 外推（NTK-aware、YaRN）、位置插值、Ring Attention。但更长 ≠ 更好，长上下文注意力会稀释、中段丢失。

---

## 十、模型生态

### 10.1 闭源（API）

| 模型 | 厂商 | 特点 |
|------|------|------|
| **GPT-4 / GPT-4o / o1** | OpenAI | 综合最强，o1 强推理 |
| **Claude 3.5 / 4** | Anthropic | 长文本、代码、安全对齐强 |
| **Gemini** | Google | 多模态、超长上下文（1M+）|
| **文心一言** | 百度 | 中文 |
| **通义千问（闭源版）** | 阿里 | 中文+多模态 |

### 10.2 开源

| 模型 | 特点 |
|------|------|
| **Llama 3 / 3.1** | Meta，生态最全，基座标杆 |
| **Qwen 2 / 2.5** | 阿里，中文最强开源，多尺寸全覆盖 |
| **DeepSeek-V3 / R1** | 深度求索，MoE 极致性价比，R1 推理对标 o1 |
| **Mistral / Mixtral** | 欧洲，MoE |
| **GLM / ChatGLM** | 智谱，中文 |
| **Phi / Gemma** | 微软/谷歌小模型，边缘部署 |

### 10.3 选型建议

- **能力优先**：GPT-4o / Claude / o1（API）。
- **成本敏感**：DeepSeek-V3、Qwen、GPT-4o-mini。
- **私有部署**：Qwen2.5 / Llama3.1 开源 + vLLM。
- **本地开发**：Ollama + Qwen/Llama 量化版。
- **强推理**：o1 / DeepSeek-R1（思维链模型）。

### 10.4 本地部署

```bash
# Ollama 一键本地运行（开发推荐）
ollama pull qwen2.5:7b
ollama run qwen2.5:7b

# vLLM 生产部署
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --port 8000
```

---

## 十一、应用开发

### 11.1 API 调用

```js
// OpenAI 兼容接口（大多数模型都支持）
const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: '你是助手' },
      { role: 'user', content: '你好' },
    ],
    temperature: 0.7,
    stream: false,
  }),
})
const data = await res.json()
console.log(data.choices[0].message.content)
```

### 11.2 流式输出

```js
const res = await fetch(url, { ...body: JSON.stringify({ ...opts, stream: true }) })
const reader = res.body.getReader()
const decoder = new TextDecoder()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  // 解析 SSE: data: {...}\n\n
  processChunk(chunk)
}
```

### 11.3 Function Calling / Tool Use

模型识别用户意图后，输出结构化函数调用，由代码执行后把结果返回模型。

```js
// 请求时声明工具
{ tools: [{ type: 'function', function: { name: 'getWeather', parameters: {...} } }] }

// 模型返回
{ tool_calls: [{ function: { name: 'getWeather', arguments: '{"city":"北京"}' } }] }

// 代码执行后，结果作为 role:'tool' 消息回传给模型继续生成
```

这是 Agent 的基础能力。详见 [AI Agent](./ai-agent.md)。

### 11.4 开发框架

| 框架 | 用途 |
|------|------|
| **LangChain** | LLM 应用编排（链/Agent/RAG），生态最大 |
| **LlamaIndex** | 数据连接 + RAG 专精 |
| **Vercel AI SDK** | 前端/全栈流式 UI |
| **Semantic Kernel** | 微软，.NET/Python |
| **AutoGen / CrewAI** | 多 Agent 协作 |

> LangChain Python vs Node 选型见 [LangChain 技术选择](./langchain-selection.md)。

---

## 十二、速记表

| 概念 | 一句话 |
|------|--------|
| Transformer | Self-Attention 为核心，Decoder-Only 是主流 |
| 训练三阶段 | 预训练 -> SFT -> RLHF/DPO |
| KV Cache | 缓存历史 K/V，避免重复计算 |
| FlashAttention | 分块减少显存读写 |
| PagedAttention | KV Cache 分页，vLLM 核心 |
| 量化 | FP16 -> INT4，省显存跑大模型 |
| LoRA | 冻结原权重训低秩矩阵，省显存微调 |
| RAG | 检索知识库 + LLM 生成，治幻觉 |
| CoT | "一步步思考"，提升推理 |
| Function Calling | 模型输出结构化工具调用，Agent 基础 |

**核心心法**：

1. Decoder-Only + 自回归是当前范式。
2. 推理优化（KV Cache + 量化 + vLLM）决定落地成本。
3. 应用顺序：Prompt -> RAG -> 微调，从便宜到贵。
4. Agent 是 LLM 从"回答"到"干活"的关键跃迁。
5. 闭源强能力 + 开源可私有 + 量化降门槛，三者配合。

> 相关：[AI Agent 专题](./ai-agent.md) · [LangChain 技术选择](./langchain-selection.md)
