import{_ as i}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as t,d as e,e as s,w as l,a as d,r,o as c}from"./app-Cf5pFDp0.js";const o={},m=d(`<h1 id="上下文工程" tabindex="-1"><a class="header-anchor" href="#上下文工程"><span>上下文工程</span></a></h1><h2 id="上下文窗口-稀缺的「工作内存」" tabindex="-1"><a class="header-anchor" href="#上下文窗口-稀缺的「工作内存」"><span>上下文窗口：稀缺的「工作内存」</span></a></h2><p>上下文窗口（如 200k token）看起来很大，但在 agent 场景下极易耗尽：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>系统提示                ~3-10k   （常驻）
CLAUDE.md / 记忆         ~1-5k   （常驻）
任务描述 + 多轮对话      ~2-10k
每次 Read 一个文件       ~1-5k   （读 10 个文件就没了一半）
工具输出（测试日志/搜索） ~1-50k  （一次 npm 报错可能 10k+）
─────────────────────────────
一个中等任务跑半小时，很容易塞满窗口
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>上下文工程 = 在有限的窗口里，让每一轮循环时模型都能看到「当下最有用的信息」。</strong> 这是 2025 年后取代 prompt engineering 的核心话语——单次提示优化变成了持续的信息调度。</p></blockquote><h2 id="上下文的三个区域" tabindex="-1"><a class="header-anchor" href="#上下文的三个区域"><span>上下文的三个区域</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────┐
│ 系统提示 + 记忆文件（常驻）     │ ← identity，每轮都在
├─────────────────────────────┤
│ 对话历史（增长）               │ ← 会被压缩
├─────────────────────────────┤
│ 当前轮工具结果（最新鲜）        │ ← 衰减最快
└─────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>信息价值随时间衰减：三小时前读的配置文件内容，可能不如一句「之前确认过端口是 8080」。</p><h2 id="机制一-压缩-compaction" tabindex="-1"><a class="header-anchor" href="#机制一-压缩-compaction"><span>机制一：压缩（Compaction）</span></a></h2><p>窗口逼近上限时的处理：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>硬截断（最差）：丢掉最早的消息 —— 早期约束丢失，行为漂变
摘要压缩（主流）：把早期对话总结成一段「工作纪要」替换原文
  ✅ 保住：任务目标、已做决定、关键文件路径、未完成事项
  ✂️ 丢弃：原始文件内容、已解决的报错细节

Claude Code 的做法：上下文快满时自动 compact，
保留最近 N 轮原文 + 前面部分的摘要，用户也可手动 /compact
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>摘要质量决定 agent 的「长期记忆人格」——差的压缩会让它忘记自己为什么改这个文件。</p><h2 id="机制二-外部记忆-memory" tabindex="-1"><a class="header-anchor" href="#机制二-外部记忆-memory"><span>机制二：外部记忆（Memory）</span></a></h2><p>把信息移出窗口，按需取回：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>CLAUDE.md / AGENTS.md     项目级常驻记忆（约定、风格、命令）
~/.claude/CLAUDE.md       用户全局记忆（跨项目偏好）
memory 目录 + 索引         长期记忆：一个事实一个文件，
                          每次会话只把「索引」载入上下文，
                          需要时再 Read 具体记忆文件
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>设计哲学：<strong>记忆是「读时加载」而非「全量注入」</strong>。索引让模型知道存在什么，正文按需读取——这本质上是给上下文做了个虚拟内存。</p></blockquote><h2 id="机制三-记忆文件怎么写才有效" tabindex="-1"><a class="header-anchor" href="#机制三-记忆文件怎么写才有效"><span>机制三：记忆文件怎么写才有效</span></a></h2><p>CLAUDE.md 是给模型看的「团队手册」，有效写法：</p><div class="language-markdown line-numbers-mode" data-ext="md" data-title="md"><pre class="language-markdown"><code><span class="token title important"><span class="token punctuation">#</span> 项目说明</span>
（一两句话说清项目是什么）

<span class="token title important"><span class="token punctuation">#</span> 约定</span>
<span class="token list punctuation">-</span> 单元测试放在 test/ 目录，与源文件路径对应
<span class="token list punctuation">-</span> commit message 用中文
<span class="token list punctuation">-</span> 发布必须跑 bash deploy.sh，不要手动 git push

<span class="token title important"><span class="token punctuation">#</span> 已知问题</span>
<span class="token list punctuation">-</span> deploy.sh 没有 set -e，构建失败也会推送（历史遗留，别修，等 v2）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>无效写法（模型会无视）：</p><div class="language-markdown line-numbers-mode" data-ext="md" data-title="md"><pre class="language-markdown"><code>长篇大论的背景故事 / 大段吹水
与代码库可见事实重复的内容（模型自己会读代码）
模糊指令：「写优雅的代码」（没有可执行性）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>原则：<strong>CLAUDE.md 只写「代码里看不见的决策与偏好」</strong>。看得见的（目录结构、函数签名）让模型自己查，别浪费常驻 token。</p></blockquote><h2 id="机制四-prompt-caching" tabindex="-1"><a class="header-anchor" href="#机制四-prompt-caching"><span>机制四：Prompt Caching</span></a></h2><p>上下文是前缀匹配缓存的——这直接改变 harness 的设计约束：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>API 侧：请求的前 N token 命中缓存 → 这部分按 1/10 价格计费且更快
前提：前缀必须完全一致

对循环的影响：
✅ 系统提示、记忆、早期对话天然命中（循环只往尾部追加）
❌ 往系统提示里放「当前时间」「随机 id」= 每轮缓存全失效
❌ 压缩/摘要会改写历史 → 缓存失效一次，之后重新命中
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>工程启示：<strong>只追加、不修改</strong>是上下文的黄金操作。一切「回头改历史」的机制都要付出缓存代价。</p></blockquote><h2 id="机制五-工具结果的上下文纪律" tabindex="-1"><a class="header-anchor" href="#机制五-工具结果的上下文纪律"><span>机制五：工具结果的上下文纪律</span></a></h2><p>harness 侧能做的最大优化——控制工具输出尺寸：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>- Read 支持行号范围：能读 50 行就别读 2000 行
- Bash 输出截断：超长输出保留头尾 + 提示被截断
- 搜索工具默认 files_with_matches，要看内容再 Read
- 结构化优先：MCP 工具返回「结论」而非「原始 JSON 大杂烩」
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一个反例：让 agent 跑 <code>npm install</code>，依赖树输出 30k token 进上下文——一次就烧掉 15% 窗口。好 harness 会截断到「最后 20 行 + 成功/失败」。</p><h2 id="实战-诊断「ai-变笨了」" tabindex="-1"><a class="header-anchor" href="#实战-诊断「ai-变笨了」"><span>实战：诊断「AI 变笨了」</span></a></h2><p>长会话中模型开始忘事、重复劳动，排查顺序：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>1. /context 或 token 计数 → 窗口用了多少？
2. 早期关键决定是否还在原文里？（还是被压缩吞了）
3. 是否被无关工具输出淹没（大文件、长日志）
4. 处理：
   - 手动 /compact（带一句「保留 X 决定」的压缩指令更好）
   - 或新开会话，把「任务状态摘要」贴进去
   - 把长期有效的信息沉淀进 CLAUDE.md / memory
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="面试-交流高频概念" tabindex="-1"><a class="header-anchor" href="#面试-交流高频概念"><span>面试/交流高频概念</span></a></h2><ul><li><strong>Context Engineering vs Prompt Engineering</strong>：单次优化 → 持续调度系统</li><li><strong>Lost in the middle</strong>：长上下文中部信息召回率低 → 关键信息放开头结尾</li><li><strong>Compaction trade-off</strong>：省窗口 vs 丢细节，何时触发压缩是产品决策</li><li><strong>KV Cache 命中率</strong>：为什么「追加式」上下文是便宜的，「改写式」是贵的</li></ul>`,35);function p(v,u){const n=r("RouteLink");return c(),a("div",null,[m,t("p",null,[e("下一篇："),s(n,{to:"/ai/agent-harness/04-tools-and-mcp.html"},{default:l(()=>[e("工具系统与 MCP")]),_:1}),e("——模型的手是怎么定义出来的。")])])}const b=i(o,[["render",p],["__file","03-context-engineering.html.vue"]]),x=JSON.parse('{"path":"/ai/agent-harness/03-context-engineering.html","title":"上下文工程","lang":"zh-CN","frontmatter":{"title":"上下文工程","icon":"article","category":["AI","Guide"],"tag":["agent-harness","context-engineering"],"description":"上下文工程 上下文窗口：稀缺的「工作内存」 上下文窗口（如 200k token）看起来很大，但在 agent 场景下极易耗尽： 上下文工程 = 在有限的窗口里，让每一轮循环时模型都能看到「当下最有用的信息」。 这是 2025 年后取代 prompt engineering 的核心话语——单次提示优化变成了持续的信息调度。 上下文的三个区域 信息价值随...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/ai/agent-harness/03-context-engineering.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"上下文工程"}],["meta",{"property":"og:description","content":"上下文工程 上下文窗口：稀缺的「工作内存」 上下文窗口（如 200k token）看起来很大，但在 agent 场景下极易耗尽： 上下文工程 = 在有限的窗口里，让每一轮循环时模型都能看到「当下最有用的信息」。 这是 2025 年后取代 prompt engineering 的核心话语——单次提示优化变成了持续的信息调度。 上下文的三个区域 信息价值随..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-09-09T11:07:17.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"agent-harness"}],["meta",{"property":"article:tag","content":"context-engineering"}],["meta",{"property":"article:modified_time","content":"2026-09-09T11:07:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"上下文工程\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-09-09T11:07:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"上下文窗口：稀缺的「工作内存」","slug":"上下文窗口-稀缺的「工作内存」","link":"#上下文窗口-稀缺的「工作内存」","children":[]},{"level":2,"title":"上下文的三个区域","slug":"上下文的三个区域","link":"#上下文的三个区域","children":[]},{"level":2,"title":"机制一：压缩（Compaction）","slug":"机制一-压缩-compaction","link":"#机制一-压缩-compaction","children":[]},{"level":2,"title":"机制二：外部记忆（Memory）","slug":"机制二-外部记忆-memory","link":"#机制二-外部记忆-memory","children":[]},{"level":2,"title":"机制三：记忆文件怎么写才有效","slug":"机制三-记忆文件怎么写才有效","link":"#机制三-记忆文件怎么写才有效","children":[]},{"level":2,"title":"机制四：Prompt Caching","slug":"机制四-prompt-caching","link":"#机制四-prompt-caching","children":[]},{"level":2,"title":"机制五：工具结果的上下文纪律","slug":"机制五-工具结果的上下文纪律","link":"#机制五-工具结果的上下文纪律","children":[]},{"level":2,"title":"实战：诊断「AI 变笨了」","slug":"实战-诊断「ai-变笨了」","link":"#实战-诊断「ai-变笨了」","children":[]},{"level":2,"title":"面试/交流高频概念","slug":"面试-交流高频概念","link":"#面试-交流高频概念","children":[]}],"git":{"createdTime":1788952037000,"updatedTime":1788952037000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":4.54,"words":1361},"filePathRelative":"ai/agent-harness/03-context-engineering.md","localizedDate":"2026年9月9日","excerpt":"","autoDesc":true}');export{b as comp,x as data};
