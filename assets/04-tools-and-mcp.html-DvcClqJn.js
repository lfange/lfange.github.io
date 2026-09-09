import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as t,d as e,e as i,w as l,a as d,r,o}from"./app-Cf5pFDp0.js";const c={},p=d(`<h1 id="工具系统与-mcp" tabindex="-1"><a class="header-anchor" href="#工具系统与-mcp"><span>工具系统与 MCP</span></a></h1><h2 id="核心认知-工具描述就是提示词" tabindex="-1"><a class="header-anchor" href="#核心认知-工具描述就是提示词"><span>核心认知：工具描述就是提示词</span></a></h2><p>模型选工具、填参数，<strong>完全依据</strong>工具的 name + description + schema。写工具描述 = 写给模型的提示词：</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code><span class="token comment">// ❌ 差的描述</span>
<span class="token punctuation">{</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;search&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;搜索&quot;</span>
<span class="token punctuation">}</span>

<span class="token comment">// ✅ 好的描述（来自真实 harness 的风格）</span>
<span class="token punctuation">{</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Grep&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;内容搜索工具，基于 ripgrep，支持正则。优先用本工具而非 Bash grep。output_mode: &#39;content&#39; 返回匹配行，&#39;files_with_matches&#39; 只返回文件路径（默认）。当你在多个文件中查找某符号定义时用它。&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;input_schema&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;object&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;pattern&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;string&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;正则表达式，注意转义字面量大括号&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;glob&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;string&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;文件过滤，如 &#39;*.ts&#39;&quot;</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;required&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;pattern&quot;</span><span class="token punctuation">]</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>描述里写什么：</p><ul><li><strong>何时用 / 何时不用</strong>（「优先用本工具而非 Bash grep」——路由指令）</li><li><strong>参数语义与坑</strong>（转义、单位、默认值）</li><li><strong>返回什么</strong>（帮模型决定要不要用）</li></ul><h2 id="一个编码-harness-的标准工具集" tabindex="-1"><a class="header-anchor" href="#一个编码-harness-的标准工具集"><span>一个编码 Harness 的标准工具集</span></a></h2><table><thead><tr><th>类别</th><th>工具</th><th>设计要点</th></tr></thead><tbody><tr><td>读</td><td>Read / Glob / Grep</td><td>只读可并行；Read 带行号范围防上下文爆炸</td></tr><tr><td>写</td><td>Write / Edit / NotebookEdit</td><td>Edit 必须先 Read（防盲改）；精确 old_string 匹配</td></tr><tr><td>执行</td><td>Bash / PowerShell</td><td>超时控制、输出截断、后台任务</td></tr><tr><td>采集</td><td>WebFetch / WebSearch</td><td>外部信息入口</td></tr><tr><td>代理</td><td>Task（Agent）/ SendMessage</td><td>派生子代理（见下篇）</td></tr></tbody></table><blockquote><p>注意「专用工具优于 Bash」原则：<code>Grep</code> 工具比 <code>bash grep</code> 好——结果结构化、可被权限系统理解、不依赖模型记住 shell 语法。Bash 是万能逃生舱，不是首选。</p></blockquote><h2 id="权限模型-工具的闸门" tabindex="-1"><a class="header-anchor" href="#权限模型-工具的闸门"><span>权限模型：工具的闸门</span></a></h2><p>工具调用在执行前过权限层（读 / 写 / 执行）：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>分级放行：
  只读工具（Read/Grep/Glob）   → 默认允许（低风险）
  写操作（Edit/Write）          → 依据会话权限模式放行或询问
  危险命令（rm -rf、git push）  → 显式询问用户
  网络请求                     → 域名白名单

用户可配置（.claude/settings.json）：
  {
    &quot;permissions&quot;: {
      &quot;allow&quot;: [&quot;Bash(npm test:*)&quot;, &quot;Read(./**)&quot;],
      &quot;deny&quot;: [&quot;Bash(curl:*)&quot;, &quot;Read(.env)&quot;]
    }
  }

被拒绝的调用：不抛异常，返回「用户拒绝了」作为工具结果 → 模型改道
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="mcp-工具的外部生态" tabindex="-1"><a class="header-anchor" href="#mcp-工具的外部生态"><span>MCP：工具的外部生态</span></a></h2><h3 id="解决什么问题" tabindex="-1"><a class="header-anchor" href="#解决什么问题"><span>解决什么问题</span></a></h3><p>每家 harness × 每个数据源 = N×M 重复适配：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>没有 MCP：每个 AI 应用各自为 GitHub/Slack/数据库写集成
有了 MCP：数据源方写一次 MCP Server，所有 MCP 客户端（Claude Code、
          Cursor、自建 harness…）即插即用 ——「AI 的 USB-C 接口」
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="架构" tabindex="-1"><a class="header-anchor" href="#架构"><span>架构</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌────────────┐   MCP 协议    ┌──────────────┐
│ MCP Client │ ◀──────────▶ │ MCP Server   │
│ (harness)  │  stdio/HTTP  │ (GitHub 等)   │
└────────────┘              └──────────────┘
暴露三类原语：
  Tools     可执行的动作（创建 issue、查 PR）
  Resources 可读取的数据（文件、数据库记录）
  Prompts   预置的提示模板
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="实际接入-以-claude-code-为例" tabindex="-1"><a class="header-anchor" href="#实际接入-以-claude-code-为例"><span>实际接入（以 Claude Code 为例）</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 添加一个 GitHub MCP server</span>
claude mcp <span class="token function">add</span> github -- npx <span class="token parameter variable">-y</span> @modelcontextprotocol/server-github

<span class="token comment"># 配置后模型自动获得新工具（如 create_issue、list_prs）</span>
<span class="token comment"># 可用 /mcp 查看已连接的 server 和工具列表</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="mcp-的上下文成本问题与解法" tabindex="-1"><a class="header-anchor" href="#mcp-的上下文成本问题与解法"><span>MCP 的上下文成本问题与解法</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>问题：每个 MCP server 的工具 schema 都要进上下文。
     接 10 个 server × 平均 20 个工具 → 系统提示膨胀几十 k，
     且大部分工具本轮用不上。

解法（现代 harness 的做法）：
  ToolSearch：默认只注入一个「搜索工具」的 meta-tool，
  模型按需搜索、动态加载具体工具 schema。
  上下文占用从 O(所有工具) 降到 O(1)。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="设计你自己的工具-五条军规" tabindex="-1"><a class="header-anchor" href="#设计你自己的工具-五条军规"><span>设计你自己的工具：五条军规</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>1. 描述写给模型看，不是写给人看
   写清楚「什么时候该用我」「参数怎么填」「我会返回什么」

2. 返回结论，不返回原始数据
   ❌ 返回 2000 行 JSON 让模型自己找
   ✅ 返回结构化摘要 + 支持按需取详情

3. 宁可多个小工具，不要一个万能大工具
   「deploy」「rollback」「status」 优于 「admin(action: ...)」

4. 幂等与破坏性显式标注
   描述里写明「此操作不可逆」，配合权限层询问

5. 错误信息要能指导模型自纠
   ❌ &quot;Error: invalid path&quot;
   ✅ &quot;路径不存在。当前目录是 /app，可用文件：src/、tests/&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="案例分析-为什么-edit-工具长那样" tabindex="-1"><a class="header-anchor" href="#案例分析-为什么-edit-工具长那样"><span>案例分析：为什么 Edit 工具长那样</span></a></h2><p>真实 harness 的 Edit 工具要求：<code>old_string</code> 必须唯一匹配（否则报错）+ 编辑前必须先 Read 过该文件：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>为什么这么「麻烦」？
1. old_string 唯一匹配 → 防止模型凭想象改错位置
2. 先 Read 后 Edit   → 保证模型看到的是文件真实内容，
                       而不是几轮前可能过期的记忆
3. 匹配失败返回错误并附提示 → 模型重新 Read 再试，自愈
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每个看似别扭的工具设计，背后都是对模型失败模式的理解。</p><h2 id="本篇小结" tabindex="-1"><a class="header-anchor" href="#本篇小结"><span>本篇小结</span></a></h2><ul><li>工具描述 = 提示词，决定模型行为上限</li><li>专用工具优于 Bash 直调；读并行、写串行</li><li>权限层是工具执行前的闸门，拒绝结果作为反馈回注</li><li>MCP 统一了工具生态，「ToolSearch 动态加载」解决了工具过多的上下文膨胀</li></ul>`,30);function u(v,m){const n=r("RouteLink");return o(),a("div",null,[p,t("p",null,[e("下一篇："),i(n,{to:"/ai/agent-harness/05-subagents-and-worktrees.html"},{default:l(()=>[e("子代理与并行执行")]),_:1}),e("。")])])}const g=s(c,[["render",u],["__file","04-tools-and-mcp.html.vue"]]),k=JSON.parse('{"path":"/ai/agent-harness/04-tools-and-mcp.html","title":"工具系统与 MCP","lang":"zh-CN","frontmatter":{"title":"工具系统与 MCP","icon":"article","category":["AI","Guide"],"tag":["agent-harness","mcp","tools"],"description":"工具系统与 MCP 核心认知：工具描述就是提示词 模型选工具、填参数，完全依据工具的 name + description + schema。写工具描述 = 写给模型的提示词： 描述里写什么： 何时用 / 何时不用（「优先用本工具而非 Bash grep」——路由指令） 参数语义与坑（转义、单位、默认值） 返回什么（帮模型决定要不要用） 一个编码 Ha...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/ai/agent-harness/04-tools-and-mcp.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"工具系统与 MCP"}],["meta",{"property":"og:description","content":"工具系统与 MCP 核心认知：工具描述就是提示词 模型选工具、填参数，完全依据工具的 name + description + schema。写工具描述 = 写给模型的提示词： 描述里写什么： 何时用 / 何时不用（「优先用本工具而非 Bash grep」——路由指令） 参数语义与坑（转义、单位、默认值） 返回什么（帮模型决定要不要用） 一个编码 Ha..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-09-09T11:07:17.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"agent-harness"}],["meta",{"property":"article:tag","content":"mcp"}],["meta",{"property":"article:tag","content":"tools"}],["meta",{"property":"article:modified_time","content":"2026-09-09T11:07:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"工具系统与 MCP\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-09-09T11:07:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"核心认知：工具描述就是提示词","slug":"核心认知-工具描述就是提示词","link":"#核心认知-工具描述就是提示词","children":[]},{"level":2,"title":"一个编码 Harness 的标准工具集","slug":"一个编码-harness-的标准工具集","link":"#一个编码-harness-的标准工具集","children":[]},{"level":2,"title":"权限模型：工具的闸门","slug":"权限模型-工具的闸门","link":"#权限模型-工具的闸门","children":[]},{"level":2,"title":"MCP：工具的外部生态","slug":"mcp-工具的外部生态","link":"#mcp-工具的外部生态","children":[{"level":3,"title":"解决什么问题","slug":"解决什么问题","link":"#解决什么问题","children":[]},{"level":3,"title":"架构","slug":"架构","link":"#架构","children":[]},{"level":3,"title":"实际接入（以 Claude Code 为例）","slug":"实际接入-以-claude-code-为例","link":"#实际接入-以-claude-code-为例","children":[]},{"level":3,"title":"MCP 的上下文成本问题与解法","slug":"mcp-的上下文成本问题与解法","link":"#mcp-的上下文成本问题与解法","children":[]}]},{"level":2,"title":"设计你自己的工具：五条军规","slug":"设计你自己的工具-五条军规","link":"#设计你自己的工具-五条军规","children":[]},{"level":2,"title":"案例分析：为什么 Edit 工具长那样","slug":"案例分析-为什么-edit-工具长那样","link":"#案例分析-为什么-edit-工具长那样","children":[]},{"level":2,"title":"本篇小结","slug":"本篇小结","link":"#本篇小结","children":[]}],"git":{"createdTime":1788952037000,"updatedTime":1788952037000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":4.15,"words":1245},"filePathRelative":"ai/agent-harness/04-tools-and-mcp.md","localizedDate":"2026年9月9日","excerpt":"","autoDesc":true}');export{g as comp,k as data};
