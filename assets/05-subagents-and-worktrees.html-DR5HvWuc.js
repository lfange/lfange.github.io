import{_ as a}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as t,b as i,d as e,e as s,w as l,a as d,r,o as c}from"./app-Cf5pFDp0.js";const o={},u=d(`<h1 id="子代理与并行执行" tabindex="-1"><a class="header-anchor" href="#子代理与并行执行"><span>子代理与并行执行</span></a></h1><h2 id="为什么需要子代理" tabindex="-1"><a class="header-anchor" href="#为什么需要子代理"><span>为什么需要子代理</span></a></h2><p>主 agent 的上下文是「一车道」，三个痛点：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>1. 上下文挤爆：扫 50 个文件找 bug，读完主上下文也满了
2. 无法并行：单循环只能串行干活
3. 任务污染：探索性搜索产生大量垃圾中间结果，
   干扰主任务的推理质量

解法：把子任务扔给「独立上下文」的 subagent，
     只把结论带回主线。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="子代理的本质" tabindex="-1"><a class="header-anchor" href="#子代理的本质"><span>子代理的本质</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────────────────┐
│ 主 Agent（主上下文）                       │
│   任务：修复登录 bug                       │
│                                          │
│   Task(&quot;在 50 个文件中找到 auth 相关实现&quot;) │──┐
│                                          │  │ 只带回结论：
│   （继续做自己的事/等待）                    │  │ &quot;auth 逻辑在
│                                          │  │  src/auth/token.ts:42&quot;
│   ◀──────────────────────────────────────┼──┘
└─────────────────────────────────────────┘
         │ 新开一个完整上下文
         ▼
   Subagent：自己的循环、自己的工具、
   可能不同的模型/系统提示/权限
   （扫了 50 个文件 = 消耗了它自己的 100k 上下文，
    这些 token 从未污染主上下文）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关键认知：</p><ul><li>子代理有<strong>独立完整</strong>的 agentic loop（它自己就是个小 harness）</li><li>子代理的最终输出作为<strong>工具结果</strong>返回主 agent</li><li>子代理的中间过程（读了哪些文件、试了什么）对主 agent <strong>不可见</strong>——这正是价值所在</li></ul><h2 id="子代理的类型" tabindex="-1"><a class="header-anchor" href="#子代理的类型"><span>子代理的类型</span></a></h2><table><thead><tr><th>类型</th><th>定义位置</th><th>特点</th></tr></thead><tbody><tr><td>通用 subagent</td><td>harness 内置</td><td>什么都能干的默认代理</td></tr><tr><td>自定义 agent</td><td><code>.claude/agents/*.md</code></td><td>用 Markdown 定义专属系统提示 + 工具集 + 模型</td></tr><tr><td>命名 teammate</td><td>agent 团队模式</td><td>长期驻留，可被 SendMessage 继续对话</td></tr></tbody></table><p>自定义 agent 示例（<code>.claude/agents/code-reviewer.md</code>）：</p><div class="language-markdown line-numbers-mode" data-ext="md" data-title="md"><pre class="language-markdown"><code><span class="token front-matter-block"><span class="token punctuation">---</span>
<span class="token front-matter yaml language-yaml"><span class="token key atrule">name</span><span class="token punctuation">:</span> code<span class="token punctuation">-</span>reviewer
<span class="token key atrule">description</span><span class="token punctuation">:</span> 代码审查专家。当需要审查代码质量、找 bug 时使用
<span class="token key atrule">tools</span><span class="token punctuation">:</span> Read<span class="token punctuation">,</span> Grep<span class="token punctuation">,</span> Glob   <span class="token comment"># 最小工具集</span>
<span class="token key atrule">model</span><span class="token punctuation">:</span> inherit</span>
<span class="token punctuation">---</span></span>

你是资深代码审查员。审查时：
<span class="token list punctuation">-</span> 只报告可验证的问题，按严重程度排序
<span class="token list punctuation">-</span> 必须引用 file:line
<span class="token list punctuation">-</span> 每个发现给出具体失败场景
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>tools</code> 限定 + <code>description</code> 路由：主 agent 看到描述就知道何时委派——工具描述即提示词的原则在子代理身上复现。</p></blockquote><h2 id="并行执行模式" tabindex="-1"><a class="header-anchor" href="#并行执行模式"><span>并行执行模式</span></a></h2><h3 id="_1-fan-out-扇出" tabindex="-1"><a class="header-anchor" href="#_1-fan-out-扇出"><span>1. Fan-out（扇出）</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>主 Agent ──┬── Subagent A：审查正确性
           ├── Subagent B：审查性能
           └── Subagent C：审查测试覆盖
                     │
        汇总三个结论 ▼（wall-clock = 最慢的一个，不是三者之和）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-对抗性验证" tabindex="-1"><a class="header-anchor" href="#_2-对抗性验证"><span>2. 对抗性验证</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>发现 &quot;X 有 bug&quot; → 3 个独立验证者，各自被要求「证明这个结论是错的」
                → 多数推翻 = 丢弃
价值：单代理自查会「顺着说服自己」，独立视角才投得出反对票
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-流水线-vs-屏障" tabindex="-1"><a class="header-anchor" href="#_3-流水线-vs-屏障"><span>3. 流水线 vs 屏障</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>屏障（barrier）：全等齐再下一步 —— 适合需要合并视角的判断
流水线（pipeline）：A 的产出直接进 B，不等 C —— wall-clock 更短
原则：能用 pipeline 别用 barrier（经典误区：每层都 all() 等齐）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="并行写冲突-worktree-隔离" tabindex="-1"><a class="header-anchor" href="#并行写冲突-worktree-隔离"><span>并行写冲突：Worktree 隔离</span></a></h2><p>多个子代理同时改文件 = 灾难。解法：git worktree——每个写型子代理在自己的工作树副本上干：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>主仓库（只读分析、合并结果）
  ├── worktree-1 → subagent 改登录模块   （独立分支）
  ├── worktree-2 → subagent 改支付模块   （独立分支）
  └── worktree-3 → subagent 改文档      （独立分支）
互不冲突，完成后各自提交，主线 review/合并
未变更的 worktree 自动清理
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>代价：每个 worktree 是完整目录拷贝（盘空间 + 初始化时间），只给「并行写文件」的代理用，纯读的代理不需要。</p></blockquote><h2 id="编排谱系-从模型自由到代码确定" tabindex="-1"><a class="header-anchor" href="#编排谱系-从模型自由到代码确定"><span>编排谱系：从模型自由到代码确定</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>谱系左端：模型自主编排
  主 agent 自己决定何时派谁、怎么合并（灵活、不可预测）
  Task/Agent 工具 + 自然语言指令

谱系右端：代码确定性编排
  用脚本/DSL 固定执行图（明确、可测试）
  如 Claude Code 的 Workflow：JS 脚本里显式 pipeline()/parallel()，
  agent() 调用可被缓存与断点续跑

实践选择：
  探索型任务（找 bug、调研）→ 模型自主
  生产型任务（批量迁移、全量审查）→ 确定性编排 + 单步模型执行
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="什么任务适合派子代理" tabindex="-1"><a class="header-anchor" href="#什么任务适合派子代理"><span>什么任务适合派子代理</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>✅ 适合：
  大范围搜索/调研（结果小、过程大）
  独立可验证的子任务（批量迁移、逐文件处理）
  需要独立视角（审查、验证）
  与主线推理无关的机械操作

❌ 不适合：
  强依赖主任务上下文的判断（来回传话比自己做还贵）
  两步就能完成的小事（spawn 开销 &gt; 收益）
  需要用户频繁交互的流程
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="成本心智" tabindex="-1"><a class="header-anchor" href="#成本心智"><span>成本心智</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>token：子代理各自烧自己的上下文，总 token 往往更高——
      你买的是「主上下文不被污染」和「并行 wall-clock」
延迟：并行后 wall-clock = max(子任务)，串行 = sum(子任务)
经验：读密集型调查类任务，3-5 个子代理并行，整体提速 2-4 倍
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="本篇小结" tabindex="-1"><a class="header-anchor" href="#本篇小结"><span>本篇小结</span></a></h2><ul><li>子代理 = 独立上下文的完整 agent，只向主线返回结论</li><li>三大并行模式：fan-out、对抗验证、流水线</li><li>并行写必须 worktree 隔离</li><li>编排谱系：模型自主 ↔ 代码确定，按任务可预测性选择</li></ul>`,32);function v(m,p){const n=r("RouteLink");return c(),t("div",null,[u,i("p",null,[e("下一篇："),s(n,{to:"/ai/agent-harness/06-hooks-skills-commands.html"},{default:l(()=>[e("扩展机制：Hooks / Skills / Commands")]),_:1}),e("。")])])}const h=a(o,[["render",v],["__file","05-subagents-and-worktrees.html.vue"]]),k=JSON.parse('{"path":"/ai/agent-harness/05-subagents-and-worktrees.html","title":"子代理与并行执行","lang":"zh-CN","frontmatter":{"title":"子代理与并行执行","icon":"article","category":["AI","Guide"],"tag":["agent-harness","subagent"],"description":"子代理与并行执行 为什么需要子代理 主 agent 的上下文是「一车道」，三个痛点： 子代理的本质 关键认知： 子代理有独立完整的 agentic loop（它自己就是个小 harness） 子代理的最终输出作为工具结果返回主 agent 子代理的中间过程（读了哪些文件、试了什么）对主 agent 不可见——这正是价值所在 子代理的类型 自定义 age...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/ai/agent-harness/05-subagents-and-worktrees.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"子代理与并行执行"}],["meta",{"property":"og:description","content":"子代理与并行执行 为什么需要子代理 主 agent 的上下文是「一车道」，三个痛点： 子代理的本质 关键认知： 子代理有独立完整的 agentic loop（它自己就是个小 harness） 子代理的最终输出作为工具结果返回主 agent 子代理的中间过程（读了哪些文件、试了什么）对主 agent 不可见——这正是价值所在 子代理的类型 自定义 age..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-09-09T11:07:17.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"agent-harness"}],["meta",{"property":"article:tag","content":"subagent"}],["meta",{"property":"article:modified_time","content":"2026-09-09T11:07:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"子代理与并行执行\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-09-09T11:07:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"为什么需要子代理","slug":"为什么需要子代理","link":"#为什么需要子代理","children":[]},{"level":2,"title":"子代理的本质","slug":"子代理的本质","link":"#子代理的本质","children":[]},{"level":2,"title":"子代理的类型","slug":"子代理的类型","link":"#子代理的类型","children":[]},{"level":2,"title":"并行执行模式","slug":"并行执行模式","link":"#并行执行模式","children":[{"level":3,"title":"1. Fan-out（扇出）","slug":"_1-fan-out-扇出","link":"#_1-fan-out-扇出","children":[]},{"level":3,"title":"2. 对抗性验证","slug":"_2-对抗性验证","link":"#_2-对抗性验证","children":[]},{"level":3,"title":"3. 流水线 vs 屏障","slug":"_3-流水线-vs-屏障","link":"#_3-流水线-vs-屏障","children":[]}]},{"level":2,"title":"并行写冲突：Worktree 隔离","slug":"并行写冲突-worktree-隔离","link":"#并行写冲突-worktree-隔离","children":[]},{"level":2,"title":"编排谱系：从模型自由到代码确定","slug":"编排谱系-从模型自由到代码确定","link":"#编排谱系-从模型自由到代码确定","children":[]},{"level":2,"title":"什么任务适合派子代理","slug":"什么任务适合派子代理","link":"#什么任务适合派子代理","children":[]},{"level":2,"title":"成本心智","slug":"成本心智","link":"#成本心智","children":[]},{"level":2,"title":"本篇小结","slug":"本篇小结","link":"#本篇小结","children":[]}],"git":{"createdTime":1788952037000,"updatedTime":1788952037000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":4.31,"words":1292},"filePathRelative":"ai/agent-harness/05-subagents-and-worktrees.md","localizedDate":"2026年9月9日","excerpt":"","autoDesc":true}');export{h as comp,k as data};
