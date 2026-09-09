import{_ as l}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as d,b as e,d as n,e as a,w as s,a as i,r,o as c}from"./app-Cf5pFDp0.js";const o={},v=e("h1",{id:"agent-开发全景与路线图",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#agent-开发全景与路线图"},[e("span",null,"Agent 开发全景与路线图")])],-1),u=e("p",null,[n("这个系列回答一个问题："),e("strong",null,"怎么从零动手开发一个能上生产的 AI Agent 应用"),n("。")],-1),p=e("strong",null,"开发工程路线",-1),m=i(`<h2 id="一、先想清楚-你真的需要-agent-吗" tabindex="-1"><a class="header-anchor" href="#一、先想清楚-你真的需要-agent-吗"><span>一、先想清楚：你真的需要 Agent 吗</span></a></h2><p>Agent 不是万能锤。用错档位 = 花更多的钱、得到更不可控的结果。</p><h3 id="自主性阶梯" tabindex="-1"><a class="header-anchor" href="#自主性阶梯"><span>自主性阶梯</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>L0  单次 LLM 调用      翻译、摘要、改写 —— 一次 in、一次 out
L1  Chain（链）        固定步骤串联：翻译→校对→排版
L2  Workflow（工作流）  代码写死的分支路由：if 分类==投诉 → 走工单模板
L3  Agent（代理）       模型自己决定下一步调什么工具、何时结束
L4  Multi-Agent        多个 agent 协作/制衡/分工
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>关键原则：自主性是成本，不是功能。</strong> 能用 L2 解决的问题不要上 L3——工作流可测试、可复现、便宜；agent 灵活但不可预测。</p><h3 id="选型决策树" tabindex="-1"><a class="header-anchor" href="#选型决策树"><span>选型决策树</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>任务步骤能提前枚举完吗？
  ├─ 能，且分支确定 ──────────────→ L1/L2：代码编排（最稳最便宜）
  ├─ 能，但每步需要智能判断 ──────→ L2：固定流程 + 每步一次 LLM 调用
  └─ 不能（取决于中间结果）────────→ 需要看中间数据决定走哪
       ├─ 简单（读个文件、查个库）→ L3：单 agent + 少量工具
       └─ 复杂（子任务异构、需并行）→ L4：多 agent 编排
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>真实例子：</p><table><thead><tr><th>场景</th><th>正确档位</th><th>为什么</th></tr></thead><tbody><tr><td>周报生成</td><td>L1</td><td>输入输出固定，串联即可</td></tr><tr><td>客服意图分类 + 转接</td><td>L2</td><td>类别可枚举，路由确定</td></tr><tr><td>编程助手（读码、改码、跑测试）</td><td>L3</td><td>步骤完全取决于代码现状</td></tr><tr><td>「多视角评审一个方案」</td><td>L4</td><td>需要独立视角 + 汇总判断</td></tr></tbody></table><h2 id="二、agent-应用的技术拼图" tabindex="-1"><a class="header-anchor" href="#二、agent-应用的技术拼图"><span>二、Agent 应用的技术拼图</span></a></h2><p>开发一个完整 agent 应用，要处理的面：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌──────────────────────────────────────────────┐
│  应用层：CLI / Web UI / API 服务 / 消息机器人    │
├──────────────────────────────────────────────┤
│  编排层：agent loop / 工具路由 / 多 agent 协作   │
├──────────────────────────────────────────────┤
│  能力层：工具（function calling）、RAG 检索、    │
│         结构化输出、记忆、子代理                 │
├──────────────────────────────────────────────┤
│  模型层：LLM API（messages、流式、缓存）         │
├──────────────────────────────────────────────┤
│  基础设施：会话存储、观测 tracing、评估、限流     │
└──────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>本系列的推进顺序就是自底向上把每一层打通：</p>`,13),g=e("thead",null,[e("tr",null,[e("th",null,"篇目"),e("th",null,"覆盖")])],-1),h=e("td",null,"模型层 + 最小编排：原生 API 手写 loop",-1),b=e("td",null,"能力层核心：设计、实现、测试工具",-1),_=e("td",null,"让模型输出可直接被程序消费",-1),x=e("td",null,"会话管理、压缩、长期记忆",-1),A=e("td",null,"编排层进阶：router/supervisor/debate",-1),k=e("td",null,"基础设施：流式服务、观测、评估、成本",-1),f=e("td",null,"三个端到端项目串起全部知识",-1),L=i(`<h2 id="三、技术栈选择-原生-sdk-vs-框架-vs-低代码" tabindex="-1"><a class="header-anchor" href="#三、技术栈选择-原生-sdk-vs-框架-vs-低代码"><span>三、技术栈选择：原生 SDK vs 框架 vs 低代码</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>路线 A：原生 SDK（openai / anthropic 官方库）
  ✅ 完全掌控 loop 逻辑、零黑盒、调试直观
  ✅ 理解原理后学任何框架都很快
  ❌ 记忆/重试/观测都要自己写
  适合：学习阶段、定制化要求高的核心业务

路线 B：编排框架（LangGraph / CrewAI / AutoGen）
  ✅ 状态图、持久化、HITL 现成
  ❌ 抽象有学习成本，出问题要翻源码
  适合：复杂多 agent 流程、快速原型
  → 详见 [LangChain/LangGraph 笔记](../langchain-langgraph.md)

路线 C：Agent SDK（claude-agent-sdk / openai-agents）
  ✅ 工具集、权限、子代理、会话管理开箱即用
  适合：构建「类 Claude Code」的执行型 agent

路线 D：低代码平台（Dify / Coze）
  ✅ 拖拽搭建、分钟级上线
  ❌ 复杂逻辑受限、难做深度定制与测试
  适合：内部工具、MVP 验证
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>本系列的主线是路线 A</strong>——用原生 SDK 手写一切，理解每个零件；框架篇（06）会在关键处标注「这件事 LangGraph 里对应什么」。</p></blockquote><h2 id="四、开发环境准备" tabindex="-1"><a class="header-anchor" href="#四、开发环境准备"><span>四、开发环境准备</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># Python 路线（本系列示例以 Python 为主，附 TS 对照）</span>
pip <span class="token function">install</span> anthropic openai       <span class="token comment"># 官方 SDK 二选一或都装</span>
pip <span class="token function">install</span> pydantic               <span class="token comment"># 结构化输出校验</span>
pip <span class="token function">install</span> fastapi sse-starlette  <span class="token comment"># 07 篇：流式 API 服务</span>

<span class="token comment"># TS/Node 路线</span>
<span class="token function">npm</span> <span class="token function">install</span> @anthropic-ai/sdk zod
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code><span class="token comment"># .env —— 密钥永远不进代码</span>
<span class="token comment"># ANTHROPIC_API_KEY=sk-ant-xxx</span>
<span class="token keyword">import</span> os
<span class="token keyword">from</span> anthropic <span class="token keyword">import</span> Anthropic

client <span class="token operator">=</span> Anthropic<span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token comment"># 自动读环境变量</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>工程化清单（第一天就配，别等出事）：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>□ API key 走环境变量 / secret manager
□ 所有 LLM 调用包一层：统一的日志 + 重试 + 超时
□ token 用量与费用打点（哪怕只是 log）
□ 一次调用设置 max_tokens 与轮数上限
□ 建立 eval 集：10 个典型任务 + 期望结果（会随开发不断扩充）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="五、agent-开发的心智模型" tabindex="-1"><a class="header-anchor" href="#五、agent-开发的心智模型"><span>五、Agent 开发的心智模型</span></a></h2><p>从「调 API 的人」到「agent 开发者」的三个转变：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>1. 从「一次性调用」到「持续会话」
   你的代码不再是一次 request/response，
   而是维护一个随任务演进的 messages 状态机

2. 从「写逻辑」到「写提示 + 写工具」
   行为一半由系统提示和工具描述决定——
   它们是代码的一部分，要走版本管理、要走评审

3. 从「确定性测试」到「概率性评估」
   单测覆盖工具与编排逻辑；模型行为用 eval 集回归
   → 详见 [Harness 评估篇](../agent-harness/08-eval-safety-cost.md)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="本篇小结" tabindex="-1"><a class="header-anchor" href="#本篇小结"><span>本篇小结</span></a></h2><ul><li>先用自主性阶梯选档位：能低不高，agent 的灵活性是拿可控性换的</li><li>技术拼图五层：应用 / 编排 / 能力 / 模型 / 基础设施</li><li>技术栈四路线：本系列主线是原生 SDK 手写，框架与 SDK 在对照中学习</li><li>工程化清单第一天就配：密钥、日志、费用打点、上限、eval 集</li></ul>`,13);function y(I,D){const t=r("RouteLink");return c(),d("div",null,[v,u,e("blockquote",null,[e("p",null,[n("定位区分："),a(t,{to:"/ai/agent-harness/01-what-is-harness.html"},{default:s(()=>[n("AI Agent Harness 系列")]),_:1}),n("讲「运行时系统怎么工作」，"),a(t,{to:"/ai/langchain-langgraph.html"},{default:s(()=>[n("LangChain/LangGraph")]),_:1}),n("讲「框架怎么用」。本系列讲"),p,n("——以原生 SDK 为主线，从需求分析到部署监控。")])]),m,e("table",null,[g,e("tbody",null,[e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/02-first-agent.html"},{default:s(()=>[n("02 第一个 Agent")]),_:1})]),h]),e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/03-tools-in-depth.html"},{default:s(()=>[n("03 工具开发实战")]),_:1})]),b]),e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/04-structured-output.html"},{default:s(()=>[n("04 结构化输出")]),_:1})]),_]),e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/05-memory-and-state.html"},{default:s(()=>[n("05 记忆与状态")]),_:1})]),x]),e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/06-multi-agent-patterns.html"},{default:s(()=>[n("06 多 Agent 编排")]),_:1})]),A]),e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/07-production.html"},{default:s(()=>[n("07 生产化工程")]),_:1})]),k]),e("tr",null,[e("td",null,[a(t,{to:"/ai/agent-dev/08-projects.html"},{default:s(()=>[n("08 综合实战项目")]),_:1})]),f])])]),L,e("p",null,[n("下一篇："),a(t,{to:"/ai/agent-dev/02-first-agent.html"},{default:s(()=>[n("第一个 Agent：从零手写")]),_:1}),n("。")])])}const P=l(o,[["render",y],["__file","01-agent-dev-path.html.vue"]]),K=JSON.parse('{"path":"/ai/agent-dev/01-agent-dev-path.html","title":"Agent 开发全景与路线图","lang":"zh-CN","frontmatter":{"title":"Agent 开发全景与路线图","icon":"article","category":["AI","Guide"],"tag":["agent-dev","roadmap"],"description":"Agent 开发全景与路线图 这个系列回答一个问题：怎么从零动手开发一个能上生产的 AI Agent 应用。 定位区分：讲「运行时系统怎么工作」，讲「框架怎么用」。本系列讲开发工程路线——以原生 SDK 为主线，从需求分析到部署监控。 一、先想清楚：你真的需要 Agent 吗 Agent 不是万能锤。用错档位 = 花更多的钱、得到更不可控的结果。 自主...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/ai/agent-dev/01-agent-dev-path.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Agent 开发全景与路线图"}],["meta",{"property":"og:description","content":"Agent 开发全景与路线图 这个系列回答一个问题：怎么从零动手开发一个能上生产的 AI Agent 应用。 定位区分：讲「运行时系统怎么工作」，讲「框架怎么用」。本系列讲开发工程路线——以原生 SDK 为主线，从需求分析到部署监控。 一、先想清楚：你真的需要 Agent 吗 Agent 不是万能锤。用错档位 = 花更多的钱、得到更不可控的结果。 自主..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"agent-dev"}],["meta",{"property":"article:tag","content":"roadmap"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Agent 开发全景与路线图\\",\\"image\\":[\\"\\"],\\"dateModified\\":null,\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"一、先想清楚：你真的需要 Agent 吗","slug":"一、先想清楚-你真的需要-agent-吗","link":"#一、先想清楚-你真的需要-agent-吗","children":[{"level":3,"title":"自主性阶梯","slug":"自主性阶梯","link":"#自主性阶梯","children":[]},{"level":3,"title":"选型决策树","slug":"选型决策树","link":"#选型决策树","children":[]}]},{"level":2,"title":"二、Agent 应用的技术拼图","slug":"二、agent-应用的技术拼图","link":"#二、agent-应用的技术拼图","children":[]},{"level":2,"title":"三、技术栈选择：原生 SDK vs 框架 vs 低代码","slug":"三、技术栈选择-原生-sdk-vs-框架-vs-低代码","link":"#三、技术栈选择-原生-sdk-vs-框架-vs-低代码","children":[]},{"level":2,"title":"四、开发环境准备","slug":"四、开发环境准备","link":"#四、开发环境准备","children":[]},{"level":2,"title":"五、Agent 开发的心智模型","slug":"五、agent-开发的心智模型","link":"#五、agent-开发的心智模型","children":[]},{"level":2,"title":"本篇小结","slug":"本篇小结","link":"#本篇小结","children":[]}],"git":{"createdTime":null,"updatedTime":null,"contributors":[]},"readingTime":{"minutes":4.95,"words":1484},"filePathRelative":"ai/agent-dev/01-agent-dev-path.md","excerpt":"","autoDesc":true}');export{P as comp,K as data};
