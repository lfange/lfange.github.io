import{_ as i}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as l,b as n,e as t,w as s,a as o,r as d,o as c,d as a}from"./app-Cf5pFDp0.js";const r={},p=o(`<h1 id="typescript-概览与环境配置" tabindex="-1"><a class="header-anchor" href="#typescript-概览与环境配置"><span>TypeScript 概览与环境配置</span></a></h1><h2 id="typescript-是什么" tabindex="-1"><a class="header-anchor" href="#typescript-是什么"><span>TypeScript 是什么</span></a></h2><p>TypeScript = <strong>Type + JavaScript</strong>，是 JavaScript 的超集，由微软开发并开源。它在 JS 的基础上添加了<strong>可选的静态类型系统</strong>和现代 ECMAScript 特性，最终编译为纯 JavaScript 运行。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌──────────────────────────────┐
│  TypeScript = JavaScript     │
│    + 静态类型                 │
│    + 接口/泛型/枚举等扩展语法   │
│    + 未来 ES 特性（降级编译）   │
└──────────────────────────────┘
        │ tsc 编译（类型擦除）
        ▼
      JavaScript
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关键认知：</p><ul><li><strong>类型在编译时全部被擦除</strong>，运行时就是纯 JS（<code>enum</code> 等少数语法除外，会被编译成代码）</li><li>TS <strong>不做任何性能优化</strong>，只做类型检查 + 语法转换</li><li>TS 的类型系统是「结构化类型」（Structural Typing）：只看结构不看名字，两个结构相同的类型互相兼容</li></ul><h2 id="为什么要用-ts" tabindex="-1"><a class="header-anchor" href="#为什么要用-ts"><span>为什么要用 TS</span></a></h2><table><thead><tr><th>痛点（JS）</th><th>TS 的解决</th></tr></thead><tbody><tr><td>函数参数类型不明确，<code>Cannot read property of undefined</code> 运行时才炸</td><td>编译期标红，编码时编辑器直接提示</td></tr><tr><td>重构不敢动代码</td><td>改动类型不匹配的地方全部报错，重构有安全感</td></tr><tr><td>大项目交接靠读源码</td><td>类型即文档，接口签名一目了然</td></tr><tr><td>第三方库 API 全靠查文档</td><td>d.ts 提供精准的自动补全</td></tr></tbody></table><h2 id="环境搭建" tabindex="-1"><a class="header-anchor" href="#环境搭建"><span>环境搭建</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">npm</span> <span class="token function">install</span> <span class="token parameter variable">-g</span> typescript
tsc <span class="token parameter variable">-v</span>          <span class="token comment"># 查看版本</span>

tsc <span class="token parameter variable">--init</span>      <span class="token comment"># 生成 tsconfig.json</span>

tsc index.ts    <span class="token comment"># 编译单文件，生成 index.js</span>
<span class="token function">node</span> index.js   <span class="token comment"># 运行</span>

<span class="token comment"># 开发时免编译直接跑</span>
<span class="token function">npm</span> i <span class="token parameter variable">-g</span> ts-node
ts-node index.ts

<span class="token comment"># 让 ts-node 支持直接跑 ES Module</span>
<span class="token function">npm</span> i <span class="token parameter variable">-g</span> ts-node esm
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现代项目一般不手动 <code>tsc</code>，而是由构建工具接管：</p><ul><li><strong>Vite</strong>：<code>vite</code> 开发时用 esbuild 转译（不做类型检查），<code>vue-tsc</code>/<code>tsc --noEmit</code> 单独跑类型检查</li><li><strong>Next.js</strong>：内置 TS 支持，检测到 <code>.ts</code> 文件自动生成配置</li></ul><h2 id="tsconfig-json-核心配置" tabindex="-1"><a class="header-anchor" href="#tsconfig-json-核心配置"><span>tsconfig.json 核心配置</span></a></h2><div class="language-jsonc line-numbers-mode" data-ext="jsonc" data-title="jsonc"><pre class="language-jsonc"><code>{
  &quot;compilerOptions&quot;: {
    /* 目标与模块 */
    &quot;target&quot;: &quot;ES2020&quot;,              // 编译出的 JS 版本
    &quot;module&quot;: &quot;ESNext&quot;,              // 模块体系
    &quot;moduleResolution&quot;: &quot;bundler&quot;,   // 模块解析策略（配合 vite）
    &quot;lib&quot;: [&quot;ES2020&quot;, &quot;DOM&quot;],        // 可用的全局 API 类型

    /* 严格性（新项目全部打开） */
    &quot;strict&quot;: true,                  // 总开关，下面几项全开
    &quot;noImplicitAny&quot;: true,           // 禁止隐式 any
    &quot;strictNullChecks&quot;: true,        // null/undefined 不再是所有类型的子类型
    &quot;noUnusedLocals&quot;: true,          // 未使用的变量报错
    &quot;noUnusedParameters&quot;: true,      // 未使用的参数报错

    /* 输出 */
    &quot;outDir&quot;: &quot;./dist&quot;,              // 编译输出目录
    &quot;rootDir&quot;: &quot;./src&quot;,              // 源码根目录
    &quot;declaration&quot;: true,             // 生成 .d.ts（打包库必须）
    &quot;sourceMap&quot;: true,               // 生成 sourcemap
    &quot;noEmit&quot;: true,                  // 只做类型检查不产出（交给 vite/esbuild 时用）

    /* 模块交互 */
    &quot;esModuleInterop&quot;: true,         // 允许 default import 导入 CJS 模块
    &quot;allowSyntheticDefaultImports&quot;: true,
    &quot;resolveJsonModule&quot;: true,       // 可以 import json
    &quot;skipLibCheck&quot;: true,            // 跳过 node_modules 里 d.ts 的检查，加速编译
    &quot;baseUrl&quot;: &quot;.&quot;,
    &quot;paths&quot;: {                       // 路径别名
      &quot;@/*&quot;: [&quot;src/*&quot;]
    }
  },
  &quot;include&quot;: [&quot;src&quot;],                // 参与编译的文件
  &quot;exclude&quot;: [&quot;node_modules&quot;, &quot;dist&quot;]
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="常用配置速记" tabindex="-1"><a class="header-anchor" href="#常用配置速记"><span>常用配置速记</span></a></h3><table><thead><tr><th>配置</th><th>作用</th><th>不开的后果</th></tr></thead><tbody><tr><td><code>strict</code></td><td>严格模式总开关</td><td>一半的类型检查形同虚设</td></tr><tr><td><code>strictNullChecks</code></td><td>null 检查</td><td>任何地方都可能 <code>undefined</code> 炸掉</td></tr><tr><td><code>noImplicitAny</code></td><td>禁止隐式 any</td><td>类型系统到处是漏洞</td></tr><tr><td><code>noEmit</code></td><td>只检查不编译</td><td>和构建工具职责重叠时产出冲突</td></tr></tbody></table><h2 id="编译流程" tabindex="-1"><a class="header-anchor" href="#编译流程"><span>编译流程</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>index.ts
   │ ① Scanner 扫描 → Token 流
   │ ② Parser 解析 → AST（语法树）
   │ ③ Binder 绑定 → Symbol（符号表）
   │ ④ Checker 检查 → 类型诊断（报错在这步）
   │ ⑤ Emit 产出 → .js + .d.ts + sourcemap
   ▼
index.js
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>语言服务（编辑器补全、悬浮提示）复用同一套管线，所以编辑器提示和 <code>tsc</code> 报错一致。</p></blockquote><h2 id="类型检查的范围" tabindex="-1"><a class="header-anchor" href="#类型检查的范围"><span>类型检查的范围</span></a></h2><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token comment">// 1. 变量声明</span>
<span class="token keyword">let</span> name<span class="token operator">:</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&#39;lf&#39;</span>

<span class="token comment">// 2. 函数签名</span>
<span class="token keyword">function</span> <span class="token function">add</span><span class="token punctuation">(</span>a<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">number</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> a <span class="token operator">+</span> b
<span class="token punctuation">}</span>

<span class="token comment">// 3. 推断（最常用——不必处处写类型）</span>
<span class="token keyword">let</span> age <span class="token operator">=</span> <span class="token number">18</span>          <span class="token comment">// 推断为 number（不能改成字符串了）</span>
<span class="token keyword">const</span> brand <span class="token operator">=</span> <span class="token string">&#39;Vue&#39;</span>   <span class="token comment">// const 推断为字面量类型 &#39;Vue&#39;</span>

<span class="token comment">// 4. any 是逃生舱（尽量别用）</span>
<span class="token keyword">let</span> data<span class="token operator">:</span> <span class="token builtin">any</span> <span class="token operator">=</span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
data<span class="token punctuation">.</span>foo<span class="token punctuation">.</span>bar<span class="token punctuation">.</span><span class="token function">baz</span><span class="token punctuation">(</span><span class="token punctuation">)</span>    <span class="token comment">// 不报错，运行时爆炸</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="本系列导航" tabindex="-1"><a class="header-anchor" href="#本系列导航"><span>本系列导航</span></a></h2>`,22),u=n("li",null,"概览与环境配置（本篇）",-1);function v(m,b){const e=d("RouteLink");return c(),l("div",null,[p,n("ol",null,[u,n("li",null,[t(e,{to:"/Front/ts/02-basic-types.html"},{default:s(()=>[a("基础类型")]),_:1})]),n("li",null,[t(e,{to:"/Front/ts/03-interface-and-type.html"},{default:s(()=>[a("接口与类型别名")]),_:1})]),n("li",null,[t(e,{to:"/Front/ts/04-functions-and-generics.html"},{default:s(()=>[a("函数与泛型")]),_:1})]),n("li",null,[t(e,{to:"/Front/ts/05-advanced-types.html"},{default:s(()=>[a("高级类型")]),_:1})]),n("li",null,[t(e,{to:"/Front/ts/06-classes-and-modules.html"},{default:s(()=>[a("类与模块")]),_:1})]),n("li",null,[t(e,{to:"/Front/ts/07-type-narrowing-techniques.html"},{default:s(()=>[a("类型收窄与实战技巧")]),_:1})]),n("li",null,[t(e,{to:"/Front/ts/08-ts-engineering.html"},{default:s(()=>[a("工程实践与面试题")]),_:1})])])])}const g=i(r,[["render",v],["__file","01-ts-overview.html.vue"]]),q=JSON.parse('{"path":"/Front/ts/01-ts-overview.html","title":"TypeScript 概览与环境配置","lang":"zh-CN","frontmatter":{"title":"TypeScript 概览与环境配置","icon":"article","category":["TypeScript","Guide"],"tag":["typescript","basics"],"description":"TypeScript 概览与环境配置 TypeScript 是什么 TypeScript = Type + JavaScript，是 JavaScript 的超集，由微软开发并开源。它在 JS 的基础上添加了可选的静态类型系统和现代 ECMAScript 特性，最终编译为纯 JavaScript 运行。 关键认知： 类型在编译时全部被擦除，运行时就是纯...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/Front/ts/01-ts-overview.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"TypeScript 概览与环境配置"}],["meta",{"property":"og:description","content":"TypeScript 概览与环境配置 TypeScript 是什么 TypeScript = Type + JavaScript，是 JavaScript 的超集，由微软开发并开源。它在 JS 的基础上添加了可选的静态类型系统和现代 ECMAScript 特性，最终编译为纯 JavaScript 运行。 关键认知： 类型在编译时全部被擦除，运行时就是纯..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-09-09T10:20:55.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"typescript"}],["meta",{"property":"article:tag","content":"basics"}],["meta",{"property":"article:modified_time","content":"2026-09-09T10:20:55.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"TypeScript 概览与环境配置\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-09-09T10:20:55.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"TypeScript 是什么","slug":"typescript-是什么","link":"#typescript-是什么","children":[]},{"level":2,"title":"为什么要用 TS","slug":"为什么要用-ts","link":"#为什么要用-ts","children":[]},{"level":2,"title":"环境搭建","slug":"环境搭建","link":"#环境搭建","children":[]},{"level":2,"title":"tsconfig.json 核心配置","slug":"tsconfig-json-核心配置","link":"#tsconfig-json-核心配置","children":[{"level":3,"title":"常用配置速记","slug":"常用配置速记","link":"#常用配置速记","children":[]}]},{"level":2,"title":"编译流程","slug":"编译流程","link":"#编译流程","children":[]},{"level":2,"title":"类型检查的范围","slug":"类型检查的范围","link":"#类型检查的范围","children":[]},{"level":2,"title":"本系列导航","slug":"本系列导航","link":"#本系列导航","children":[]}],"git":{"createdTime":1788949255000,"updatedTime":1788949255000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":3.5,"words":1050},"filePathRelative":"Front/ts/01-ts-overview.md","localizedDate":"2026年9月9日","excerpt":"","autoDesc":true}');export{g as comp,q as data};
