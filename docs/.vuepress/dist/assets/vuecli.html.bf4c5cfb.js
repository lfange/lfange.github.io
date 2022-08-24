import{_ as e,o as t,c as o,a as s,e as p,b as n,d as l,r as i}from"./app.c44ce874.js";const c={},r=s("h1",{id:"vue-cli-v3-x-\u521B\u5EFA\u9879\u76EE\u4F7F\u7528\u8BB0\u5F55",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#vue-cli-v3-x-\u521B\u5EFA\u9879\u76EE\u4F7F\u7528\u8BB0\u5F55","aria-hidden":"true"},"#"),n(" Vue CLi v3.x \u521B\u5EFA\u9879\u76EE\u4F7F\u7528\u8BB0\u5F55")],-1),u={href:"https://cli.vuejs.org/zh/",target:"_blank",rel:"noopener noreferrer"},d=n("\u5B98\u65B9\u6587\u6863"),k=l(`<p>\u4EE5\u4E0B\u4F7F\u7528\u7684CLi\u7248\u672C\u662F v3.11.0</p><h2 id="vue-create" tabindex="-1"><a class="header-anchor" href="#vue-create" aria-hidden="true">#</a> vue create</h2><ol><li>\u8FD0\u884C\u4EE5\u4E0B\u547D\u4EE4\u6765\u521B\u5EFA\u4E00\u4E2A\u65B0\u9879\u76EE</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>vue create hello-world
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="2"><li>\u4F60\u4F1A\u88AB\u63D0\u793A\u9009\u53D6\u4E00\u4E2A preset (\u9884\u8BBE)\u3002\u4F60\u53EF\u4EE5\u9009\u9ED8\u8BA4\u7684\u5305\u542B\u4E86\u57FA\u672C\u7684 Babel + ESLint \u8BBE\u7F6E\u7684 preset\uFF0C\u4E5F\u53EF\u4EE5\u9009\u201C\u624B\u52A8\u9009\u62E9\u7279\u6027\u201D\u6765\u9009\u53D6\u9700\u8981\u7684\u7279\u6027\u3002</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: <span class="token punctuation">(</span>Use arrow keys<span class="token punctuation">)</span>
<span class="token operator">&gt;</span> default <span class="token punctuation">(</span>babel, eslint<span class="token punctuation">)</span>
  Manually <span class="token keyword">select</span> features <span class="token punctuation">(</span>\u624B\u52A8\u9009\u62E9\u7279\u6027<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9ED8\u8BA4\u9884\u8BBE\u53EA\u5305\u542BBabel + ESLint\uFF0C\u5982\u9700\u8981\u4F7F\u7528\u5230Router\u3001CSS Pre-processors\uFF08CSS\u9884\u5904\u7406\u5668\uFF09\u7B49\u9700\u8981\u9009\u624B\u52A8\u9009\u62E9\u7279\u6027\u3002</p><ol start="3"><li>\u624B\u52A8\u9009\u62E9\u7279\u6027</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: Manually <span class="token keyword">select</span> features
? Check the features needed <span class="token keyword">for</span> your project: <span class="token punctuation">(</span>Press <span class="token operator">&lt;</span>space<span class="token operator">&gt;</span> to select, <span class="token operator">&lt;</span>a<span class="token operator">&gt;</span> to toggle all, <span class="token operator">&lt;</span>i<span class="token operator">&gt;</span> to invert selection<span class="token punctuation">)</span>
<span class="token operator">&gt;</span><span class="token punctuation">(</span>*<span class="token punctuation">)</span> Babel <span class="token comment"># \u5C06\u73B0\u4EE3JS\u8F6C\u6210\u65E7\u7248\u672C\uFF08\u51FA\u4E8E\u517C\u5BB9\u6027\u8003\u8651\uFF09</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> TypeScript <span class="token comment"># \u6DFB\u52A0\u5BF9TS\u7684\u652F\u6301</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> Progressive Web App <span class="token punctuation">(</span>PWA<span class="token punctuation">)</span> Support <span class="token comment"># \u6E10\u8FDB\u5F0FWeb\u5E94\u7528\u7A0B\u5E8F\uFF08PWA\uFF09\u7684\u652F\u6301</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> Router <span class="token comment"># \u8DEF\u7531</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> Vuex <span class="token comment"># \u72B6\u6001\u7BA1\u7406</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> CSS Pre-processors <span class="token comment"># css\u9884\u5904\u7406\u5668</span>
 <span class="token punctuation">(</span>*<span class="token punctuation">)</span> Linter / Formatter <span class="token comment"># \u4F7F\u7528ESLint\u68C0\u67E5\u4EE3\u7801\u8D28\u91CF</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> Unit Testing <span class="token comment"># \u5355\u5143\u6D4B\u8BD5</span>
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> E2E Testing  <span class="token comment"># E2E\u6D4B\u8BD5</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u56FE\u5F62\u5316\u754C\u9762\u6709\u5BF9\u7279\u6027\u7684\u4ECB\u7ECD</p></blockquote><ol start="4"><li>\u4F7F\u7528\u8DEF\u7531\u5668\u7684\u5386\u53F2\u8BB0\u5F55\u6A21\u5F0F\uFF1F\uFF08\u9700\u8981\u9002\u5F53\u7684\u670D\u52A1\u5668\u8BBE\u7F6E\u624D\u80FD\u5728\u751F\u4EA7\u4E2D\u8FDB\u884C\u7D22\u5F15\u56DE\u9000\uFF09\u901A\u8FC7\u4F7F\u7528HTML5\u5386\u53F2\u8BB0\u5F55API\uFF0CURL\u4E0D\u518D\u9700\u8981&#39;\uFF03&#39;\u5B57\u7B26\u3002</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: Manually <span class="token keyword">select</span> features
? Check the features needed <span class="token keyword">for</span> your project: Babel, Router, CSS Pre-processors, Linter
? Use <span class="token function">history</span> mode <span class="token keyword">for</span> router? <span class="token punctuation">(</span>Requires proper server setup <span class="token keyword">for</span> index fallback <span class="token keyword">in</span> production<span class="token punctuation">)</span> <span class="token punctuation">(</span>Y/n<span class="token punctuation">)</span>              
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="5"><li>\u9009\u62E9css\u9884\u5904\u7406\u5668</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: Manually <span class="token keyword">select</span> features
? Check the features needed <span class="token keyword">for</span> your project: Babel, Router, CSS Pre-processors, Linter
? Use <span class="token function">history</span> mode <span class="token keyword">for</span> router? <span class="token punctuation">(</span>Requires proper server setup <span class="token keyword">for</span> index fallback <span class="token keyword">in</span> production<span class="token punctuation">)</span> Yes
? Pick a CSS pre-processor <span class="token punctuation">(</span>PostCSS, Autoprefixer and CSS Modules are supported by default<span class="token punctuation">)</span>:
  Sass/SCSS <span class="token punctuation">(</span>with dart-sass<span class="token punctuation">)</span>
  Sass/SCSS <span class="token punctuation">(</span>with node-sass<span class="token punctuation">)</span>
  Less
<span class="token operator">&gt;</span> Stylus               
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="6"><li>\u9009\u62E9ESLint\u914D\u7F6E</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: Manually <span class="token keyword">select</span> features
? Check the features needed <span class="token keyword">for</span> your project: Babel, Router, CSS Pre-processors, Linter
? Use <span class="token function">history</span> mode <span class="token keyword">for</span> router? <span class="token punctuation">(</span>Requires proper server setup <span class="token keyword">for</span> index fallback <span class="token keyword">in</span> production<span class="token punctuation">)</span> Yes
? Pick a CSS pre-processor <span class="token punctuation">(</span>PostCSS, Autoprefixer and CSS Modules are supported by default<span class="token punctuation">)</span>: Stylus
? Pick a linter / formatter config: <span class="token punctuation">(</span>Use arrow keys<span class="token punctuation">)</span>
  ESLint with error prevention only
  ESLint + Airbnb config
<span class="token operator">&gt;</span> ESLint + Standard config <span class="token punctuation">(</span>\u6807\u51C6\u914D\u7F6E<span class="token punctuation">)</span>
  ESLint + Prettier  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="7"><li>\u9009\u62E9\u9644\u52A0\u7684lint\u7279\u6027\uFF1F</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Pick additional lint features: <span class="token punctuation">(</span>Press <span class="token operator">&lt;</span>space<span class="token operator">&gt;</span> to select, <span class="token operator">&lt;</span>a<span class="token operator">&gt;</span> to toggle all, <span class="token operator">&lt;</span>i<span class="token operator">&gt;</span> to invert selection<span class="token punctuation">)</span>
<span class="token operator">&gt;</span><span class="token punctuation">(</span>*<span class="token punctuation">)</span> Lint on save \uFF08\u4FDD\u5B58\u65F6\u68C0\u67E5lint\uFF09
 <span class="token punctuation">(</span> <span class="token punctuation">)</span> Lint and fix on commit \uFF08\u63D0\u4EA4\u65F6 lint \u548C fix\uFF09
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="8"><li>\u4F60\u559C\u6B22\u628A\u914D\u7F6E\u653E\u5728\u4EC0\u4E48\u5730\u65B9\uFF1F\u6BD4\u5982Babel\u3001PostCSS\u3001ESLint\u7B49\u914D\u7F6E</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: Manually <span class="token keyword">select</span> features
? Check the features needed <span class="token keyword">for</span> your project: Babel, Router, CSS Pre-processors, Linter
? Use <span class="token function">history</span> mode <span class="token keyword">for</span> router? <span class="token punctuation">(</span>Requires proper server setup <span class="token keyword">for</span> index fallback <span class="token keyword">in</span> production<span class="token punctuation">)</span> Yes
? Pick a CSS pre-processor <span class="token punctuation">(</span>PostCSS, Autoprefixer and CSS Modules are supported by default<span class="token punctuation">)</span>: Stylus
? Pick a linter / formatter config: Standard
? Pick additional lint features: <span class="token punctuation">(</span>Press <span class="token operator">&lt;</span>space<span class="token operator">&gt;</span> to select, <span class="token operator">&lt;</span>a<span class="token operator">&gt;</span> to toggle all, <span class="token operator">&lt;</span>i<span class="token operator">&gt;</span> to invert selection<span class="token punctuation">)</span>Lint on save
? Where <span class="token keyword">do</span> you prefer placing config <span class="token keyword">for</span> Babel, PostCSS, ESLint, etc.? <span class="token punctuation">(</span>Use arrow keys<span class="token punctuation">)</span>
<span class="token operator">&gt;</span> In dedicated config files <span class="token punctuation">(</span>\u5728\u4E13\u7528\u7684\u914D\u7F6E\u6587\u4EF6<span class="token punctuation">)</span>
  In package.json <span class="token punctuation">(</span>\u5728package.json<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="9"><li>\u5C06\u8FD9\u6B21\u5DF2\u9009\u9879\u4FDD\u5B58\u4E3A\u4E00\u4E2A\u5C06\u6765\u53EF\u590D\u7528\u7684 preset \uFF08\u9884\u8BBE\uFF09\uFF1F</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Vue CLI v3.11.0
? Please pick a preset: Manually <span class="token keyword">select</span> features
? Check the features needed <span class="token keyword">for</span> your project: Babel, Router, CSS Pre-processors, Linter
? Use <span class="token function">history</span> mode <span class="token keyword">for</span> router? <span class="token punctuation">(</span>Requires proper server setup <span class="token keyword">for</span> index fallback <span class="token keyword">in</span> production<span class="token punctuation">)</span> Yes
? Pick a CSS pre-processor <span class="token punctuation">(</span>PostCSS, Autoprefixer and CSS Modules are supported by default<span class="token punctuation">)</span>: Stylus
? Pick a linter / formatter config: Standard
? Pick additional lint features: <span class="token punctuation">(</span>Press <span class="token operator">&lt;</span>space<span class="token operator">&gt;</span> to select, <span class="token operator">&lt;</span>a<span class="token operator">&gt;</span> to toggle all, <span class="token operator">&lt;</span>i<span class="token operator">&gt;</span> to invert selection<span class="token punctuation">)</span>Lint on save
? Where <span class="token keyword">do</span> you prefer placing config <span class="token keyword">for</span> Babel, PostCSS, ESLint, etc.? In dedicated config files
? Save this as a preset <span class="token keyword">for</span> future projects? <span class="token punctuation">(</span>y/N<span class="token punctuation">)</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>~/.vuerc</p><p>\u88AB\u4FDD\u5B58\u7684 preset \u5C06\u4F1A\u5B58\u5728\u7528\u6237\u7684 home \u76EE\u5F55\u4E0B\u4E00\u4E2A\u540D\u4E3A <code>.vuerc</code> \u7684 JSON \u6587\u4EF6\u91CC\u3002\u5982\u679C\u4F60\u60F3\u8981\u4FEE\u6539\u88AB\u4FDD\u5B58\u7684 preset / \u9009\u9879\uFF0C\u53EF\u4EE5\u7F16\u8F91\u8FD9\u4E2A\u6587\u4EF6\u3002</p></blockquote><h2 id="\u56FE\u5F62\u5316\u754C\u9762" tabindex="-1"><a class="header-anchor" href="#\u56FE\u5F62\u5316\u754C\u9762" aria-hidden="true">#</a> \u56FE\u5F62\u5316\u754C\u9762</h2><p>\u5BF9\u4E8EVue CLi\u4F7F\u7528\u8FD8\u4E0D\u662F\u7279\u522B\u719F\u6089\u7684\u540C\u5B66\uFF0C\u53EF\u4EE5\u4F7F\u7528\u56FE\u5F62\u5316\u754C\u9762\u3002\u8FD0\u884C\u4EE5\u4E0B\u547D\u4EE4\u4F1A\u81EA\u52A8\u6253\u5F00\u754C\u9762</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>vue ui
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>\u56FE\u5F62\u5316\u754C\u9762\u6709\u4E2D\u6587\u7CFB\u7EDF\uFF0C\u76F4\u89C2\u7684\u529F\u80FD\u754C\u9762\uFF0C\u4EE5\u53CA\u7279\u6027\u7684\u4ECB\u7ECD\u7B49\u3002</p></blockquote>`,27);function v(b,m){const a=i("ExternalLinkIcon");return t(),o("div",null,[r,s("p",null,[s("a",u,[d,p(a)])]),k])}var f=e(c,[["render",v],["__file","vuecli.html.vue"]]);export{f as default};