import{_ as n,o as s,c as a,d as t}from"./app.c44ce874.js";const p={},o=t(`<h1 id="call-bind-apply" tabindex="-1"><a class="header-anchor" href="#call-bind-apply" aria-hidden="true">#</a> call bind apply</h1><h2 id="\u4F5C\u7528\u548C\u533A\u522B" tabindex="-1"><a class="header-anchor" href="#\u4F5C\u7528\u548C\u533A\u522B" aria-hidden="true">#</a> \u4F5C\u7528\u548C\u533A\u522B</h2><ol><li>apply \u3001 call \u3001bind \u4E09\u8005\u90FD\u662F\u7528\u6765\u6539\u53D8\u51FD\u6570\u7684this\u5BF9\u8C61\u7684\u6307\u5411\u7684\uFF1B</li><li>apply \u3001 call \u3001bind \u4E09\u8005\u7B2C\u4E00\u4E2A\u53C2\u6570\u90FD\u662Fthis\u8981\u6307\u5411\u7684\u5BF9\u8C61\uFF0C\u4E5F\u5C31\u662F\u60F3\u6307\u5B9A\u7684\u4E0A\u4E0B\u6587\uFF1B</li><li>apply \u3001 call \u3001bind \u4E09\u8005\u90FD\u53EF\u4EE5\u5229\u7528\u540E\u7EED\u53C2\u6570\u4F20\u53C2\uFF1B<br> bind \u662F\u8FD4\u56DE\u5BF9\u5E94\u51FD\u6570\uFF0C\u4FBF\u4E8E\u7A0D\u540E\u8C03\u7528\uFF1Bapply \u3001call \u5219\u662F\u7ACB\u5373\u8C03\u7528 \u3002</li></ol><ul><li>\u7B2C\u4E8C\u4E2A\u53C2\u6570\u7684\u533A\u522B\uFF1A <ul><li>call\u7684\u53C2\u6570\u662F\u76F4\u63A5\u653E\u8FDB\u53BB\u7684\uFF0C\u7B2C\u4E8C\u7B2C\u4E09\u7B2Cn\u4E2A\u53C2\u6570\u5168\u90FD\u7528\u9017\u53F7\u5206\u9694\uFF0C\u76F4\u63A5\u653E\u5230\u540E\u9762obj.myFun.call(db,&#39;\u6210\u90FD&#39;,...&#39;string&#39; );</li><li>apply\u7684\u6240\u6709\u53C2\u6570\u90FD\u5FC5\u987B\u653E\u5728\u4E00\u4E2A\u6570\u7EC4\u91CC\u9762\u4F20\u8FDB\u53BB obj.myFun.apply(db,[&#39;\u6210\u90FD&#39;, ..., &#39;string&#39; ]);</li><li>bind\u9664\u4E86\u8FD4\u56DE\u662F<strong>\u51FD\u6570</strong>\u4EE5\u5916\uFF0C\u5B83\u7684\u53C2\u6570\u548Ccall \u4E00\u6837\u3002<br> \u5F53\u7136\uFF0C\u4E09\u8005\u7684\u53C2\u6570\u4E0D\u9650\u5B9A\u662Fstring\u7C7B\u578B\uFF0C\u5141\u8BB8\u662F\u5404\u79CD\u7C7B\u578B\uFF0C\u5305\u62EC\u51FD\u6570 \u3001 object \u7B49\u7B49\uFF01</li></ul></li></ul><h2 id="apply\u3001call" tabindex="-1"><a class="header-anchor" href="#apply\u3001call" aria-hidden="true">#</a> apply\u3001call</h2><p>\u5728 javascript \u4E2D\uFF0Ccall \u548C apply \u90FD\u662F\u4E3A\u4E86\u6539\u53D8\u67D0\u4E2A\u51FD\u6570\u8FD0\u884C\u65F6\u7684\u4E0A\u4E0B\u6587\uFF08context\uFF09\u800C\u5B58\u5728\u7684\uFF0C\u6362\u53E5\u8BDD\u8BF4\uFF0C\u5C31\u662F\u4E3A\u4E86\u6539\u53D8\u51FD\u6570\u4F53\u5185\u90E8 this \u7684\u6307\u5411\u3002 JavaScript \u7684\u4E00\u5927\u7279\u70B9\u662F\uFF0C\u51FD\u6570\u5B58\u5728\u300C\u5B9A\u4E49\u65F6\u4E0A\u4E0B\u6587\u300D\u548C\u300C\u8FD0\u884C\u65F6\u4E0A\u4E0B\u6587\u300D\u4EE5\u53CA\u300C\u4E0A\u4E0B\u6587\u662F\u53EF\u4EE5\u6539\u53D8\u7684\u300D\u8FD9\u6837\u7684\u6982\u5FF5\u3002</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">Color</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
 
<span class="token class-name">Color</span><span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">color</span><span class="token operator">:</span> <span class="token string">&quot;red&quot;</span><span class="token punctuation">,</span>
    <span class="token function-variable function">say</span><span class="token operator">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&quot;My color is &quot;</span> <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>color<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
 
<span class="token keyword">var</span> cColor <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Color</span><span class="token punctuation">;</span>
cColor<span class="token punctuation">.</span><span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">//My color is red</span>

<span class="token keyword">const</span> myfruits <span class="token operator">=</span> <span class="token punctuation">{</span>
	<span class="token literal-property property">color</span><span class="token operator">:</span> <span class="token string">&#39;yellow&#39;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>call apply \u4F7F\u7528cColor\u7684\u65B9\u6CD5</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code>cColor<span class="token punctuation">.</span><span class="token function">say</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>myfruits<span class="token punctuation">)</span><span class="token punctuation">;</span>     <span class="token comment">//My color is yellow</span>
cColor<span class="token punctuation">.</span><span class="token function">say</span><span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>myfruits<span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">//My color is yellow</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u9A8C\u8BC1\u662F\u5426\u662F\u6570\u7EC4" tabindex="-1"><a class="header-anchor" href="#\u9A8C\u8BC1\u662F\u5426\u662F\u6570\u7EC4" aria-hidden="true">#</a> \u9A8C\u8BC1\u662F\u5426\u662F\u6570\u7EC4</h2><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token function">functionisArray</span><span class="token punctuation">(</span><span class="token parameter">obj</span><span class="token punctuation">)</span><span class="token punctuation">{</span> 
    <span class="token keyword">return</span> <span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>obj<span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token string">&#39;[object Array]&#39;</span> <span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u5B9A\u4E49\u4E00\u4E2A-log-\u65B9\u6CD5-\u8BA9\u5B83\u53EF\u4EE5\u4EE3\u7406-console-log-\u65B9\u6CD5" tabindex="-1"><a class="header-anchor" href="#\u5B9A\u4E49\u4E00\u4E2A-log-\u65B9\u6CD5-\u8BA9\u5B83\u53EF\u4EE5\u4EE3\u7406-console-log-\u65B9\u6CD5" aria-hidden="true">#</a> \u5B9A\u4E49\u4E00\u4E2A log \u65B9\u6CD5\uFF0C\u8BA9\u5B83\u53EF\u4EE5\u4EE3\u7406 console.log \u65B9\u6CD5</h2><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>console<span class="token punctuation">,</span> arguments<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token function">log</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">//1</span>
<span class="token function">log</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">//1 2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u5982\u679C\u8981\u7ED9log\u6253\u5370\u52A0\u4E2A\u524D\u7F00" tabindex="-1"><a class="header-anchor" href="#\u5982\u679C\u8981\u7ED9log\u6253\u5370\u52A0\u4E2A\u524D\u7F00" aria-hidden="true">#</a> \u5982\u679C\u8981\u7ED9log\u6253\u5370\u52A0\u4E2A\u524D\u7F00</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
  <span class="token keyword">var</span> args <span class="token operator">=</span> <span class="token class-name">Array</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>arguments<span class="token punctuation">)</span><span class="token punctuation">;</span>
  args<span class="token punctuation">.</span><span class="token function">unshift</span><span class="token punctuation">(</span><span class="token string">&#39;log content: &#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 
  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>console<span class="token punctuation">,</span> args<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="bind" tabindex="-1"><a class="header-anchor" href="#bind" aria-hidden="true">#</a> bind</h2><p>bind()\u65B9\u6CD5\u4F1A\u521B\u5EFA\u4E00\u4E2A\u65B0\u51FD\u6570\uFF0C\u79F0\u4E3A\u7ED1\u5B9A\u51FD\u6570\uFF0C\u5F53\u8C03\u7528\u8FD9\u4E2A\u7ED1\u5B9A\u51FD\u6570\u65F6\uFF0C\u7ED1\u5B9A\u51FD\u6570\u4F1A\u4EE5\u521B\u5EFA\u5B83\u65F6\u4F20\u5165 bind()\u65B9\u6CD5\u7684\u7B2C\u4E00\u4E2A\u53C2\u6570\u4F5C\u4E3A this\uFF0C\u4F20\u5165 bind() \u65B9\u6CD5\u7684\u7B2C\u4E8C\u4E2A\u4EE5\u53CA\u4EE5\u540E\u7684\u53C2\u6570\u52A0\u4E0A\u7ED1\u5B9A\u51FD\u6570\u8FD0\u884C\u65F6\u672C\u8EAB\u7684\u53C2\u6570\u6309\u7167\u987A\u5E8F\u4F5C\u4E3A\u539F\u51FD\u6570\u7684\u53C2\u6570\u6765\u8C03\u7528\u539F\u51FD\u6570</p><h3 id="bind-1" tabindex="-1"><a class="header-anchor" href="#bind-1" aria-hidden="true">#</a> bind</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">var</span> unboundSlice <span class="token operator">=</span> <span class="token class-name">Array</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span>slice<span class="token punctuation">;</span>
<span class="token keyword">var</span> slice <span class="token operator">=</span> <span class="token class-name">Function</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span>unboundSlice<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// bind\u8FD4\u56DE\u4E00\u4E2A\u65B0\u51FD\u6570\u8C03\u7528</span>
<span class="token function">slice</span><span class="token punctuation">(</span>arguments<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="call-bind-apply\u5B9E\u73B0" tabindex="-1"><a class="header-anchor" href="#call-bind-apply\u5B9E\u73B0" aria-hidden="true">#</a> call bind apply\u5B9E\u73B0</h2><h3 id="call\u7684\u5B9E\u73B0" tabindex="-1"><a class="header-anchor" href="#call\u7684\u5B9E\u73B0" aria-hidden="true">#</a> call\u7684\u5B9E\u73B0</h3><p>\u901A\u8FC7\u5BF9\u8C61\u5C5E\u6027\u7684\u65B9\u5F0F\u8C03\u7528\u51FD\u6570\uFF0C\u8FD9\u4E2A\u51FD\u6570\u91CC\u9762\u7684this\u6307\u5411\u8FD9\u4E2A\u5BF9\u8C61 \u6BCF\u6B21\u8C03\u7528\u65B0\u589E\u4E00\u4E2Asymbol\u5C5E\u6027\uFF0C\u8C03\u7528\u5B8C\u6BD5\u5220\u9664 \u8FD9\u4E2Asymbol\u5C5E\u6027\u5C31\u662F\u8C03\u7528mycall\u65B9\u6CD5\u7684\u51FD\u6570 \u51FD\u6570\u5F62\u53C2\u4E2D\u4F7F\u7528...arg\u662F\u5C06\u591A\u4E2A\u5F62\u53C2\u90FD\u585E\u5230\u4E00\u4E2A\u6570\u7EC4\u91CC\uFF0C\u5728\u51FD\u6570\u5185\u90E8\u4F7F\u7528arg\u8FD9\u4E2A\u53D8\u91CF\u65F6\uFF0C\u5C31\u662F\u5305\u542B\u6240\u6709\u5F62\u53C2\u7684\u6570\u7EC4 \u5728\u8C03\u7528 context<a href="...arg">fn</a>\u65F6\u5019\uFF0C...arg\u662F\u4E3A\u4E86\u5C55\u5F00\u6570\u7EC4\uFF0C\u4F9D\u6B21\u4F20\u5165\u53C2\u6570\u8C03\u7528\u51FD\u6570</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token class-name">Function</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">myCall</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">context<span class="token punctuation">,</span> <span class="token operator">...</span>arg</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">const</span> fn <span class="token operator">=</span> <span class="token function">Symbol</span><span class="token punctuation">(</span><span class="token string">&#39;\u4E34\u65F6\u5C5E\u6027&#39;</span><span class="token punctuation">)</span>
	context<span class="token punctuation">[</span>fn<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">this</span>
	context<span class="token punctuation">[</span>fn<span class="token punctuation">]</span><span class="token punctuation">(</span><span class="token operator">...</span>arg<span class="token punctuation">)</span>
	<span class="token keyword">delete</span> context<span class="token punctuation">[</span>fn<span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="apply\u5B9E\u73B0" tabindex="-1"><a class="header-anchor" href="#apply\u5B9E\u73B0" aria-hidden="true">#</a> apply\u5B9E\u73B0</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token class-name">Function</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">myApply</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">context<span class="token punctuation">,</span> arg</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">const</span> fn <span class="token operator">=</span> <span class="token function">Symbol</span><span class="token punctuation">(</span><span class="token string">&#39;\u4E34\u65F6\u5C5E\u6027&#39;</span><span class="token punctuation">)</span>
	context<span class="token punctuation">[</span>fn<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">this</span>
	context<span class="token punctuation">[</span>fn<span class="token punctuation">]</span><span class="token punctuation">(</span><span class="token operator">...</span>arg<span class="token punctuation">)</span>
	<span class="token keyword">delete</span> context<span class="token punctuation">[</span>fn<span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="bind\u5B9E\u73B0" tabindex="-1"><a class="header-anchor" href="#bind\u5B9E\u73B0" aria-hidden="true">#</a> bind\u5B9E\u73B0</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token class-name">Function</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">myBind</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">context<span class="token punctuation">,</span> <span class="token operator">...</span>firstarg</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">const</span> that <span class="token operator">=</span> <span class="token keyword">this</span>
	<span class="token keyword">const</span> <span class="token function-variable function">bindFn</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter"><span class="token operator">...</span>secoundarg</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> that<span class="token punctuation">.</span><span class="token function">myCall</span><span class="token punctuation">(</span>context<span class="token punctuation">,</span> <span class="token operator">...</span>firstarg<span class="token punctuation">,</span> <span class="token operator">...</span>secoundarg<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	bindFn<span class="token punctuation">.</span>prototype <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>that<span class="token punctuation">.</span>prototype<span class="token punctuation">)</span>
	<span class="token keyword">return</span> bindFn
<span class="token punctuation">}</span>

<span class="token class-name">Function</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">myBind</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">objThis<span class="token punctuation">,</span> <span class="token operator">...</span>params</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">const</span> thisFn <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">;</span> <span class="token comment">// \u5B58\u50A8\u6E90\u51FD\u6570\u4EE5\u53CA\u4E0A\u65B9\u7684params(\u51FD\u6570\u53C2\u6570)</span>
	<span class="token comment">// \u5BF9\u8FD4\u56DE\u7684\u51FD\u6570 secondParams \u4E8C\u6B21\u4F20\u53C2</span>
	<span class="token keyword">let</span> <span class="token function-variable function">fToBind</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter"><span class="token operator">...</span>secondParams</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&#39;secondParams&#39;</span><span class="token punctuation">,</span> secondParams<span class="token punctuation">,</span> <span class="token operator">...</span>secondParams<span class="token punctuation">)</span>
     <span class="token comment">// this\u662F\u5426\u662FfToBind\u7684\u5B9E\u4F8B \u4E5F\u5C31\u662F\u8FD4\u56DE\u7684fToBind\u662F\u5426\u901A\u8FC7new\u8C03\u7528</span>
		<span class="token keyword">const</span> isNew <span class="token operator">=</span> <span class="token keyword">this</span> <span class="token keyword">instanceof</span> <span class="token class-name">fToBind</span>
    <span class="token comment">// new\u8C03\u7528\u5C31\u7ED1\u5B9A\u5230this\u4E0A,\u5426\u5219\u5C31\u7ED1\u5B9A\u5230\u4F20\u5165\u7684objThis\u4E0A</span>
		<span class="token keyword">const</span> context <span class="token operator">=</span> isNew <span class="token operator">?</span> <span class="token keyword">this</span> <span class="token operator">:</span> <span class="token function">Object</span><span class="token punctuation">(</span>objThis<span class="token punctuation">)</span> 
    <span class="token comment">// \u7528call\u8C03\u7528\u6E90\u51FD\u6570\u7ED1\u5B9Athis\u7684\u6307\u5411\u5E76\u4F20\u9012\u53C2\u6570,\u8FD4\u56DE\u6267\u884C\u7ED3\u679C</span>
		<span class="token keyword">return</span> <span class="token function">thisFn</span><span class="token punctuation">.</span><span class="token function">call</span><span class="token punctuation">(</span>context<span class="token punctuation">,</span> <span class="token operator">...</span>params<span class="token punctuation">,</span> <span class="token operator">...</span>secondParams<span class="token punctuation">)</span><span class="token punctuation">;</span> 
	<span class="token punctuation">}</span><span class="token punctuation">;</span>
   <span class="token comment">// \u590D\u5236\u6E90\u51FD\u6570\u7684prototype\u7ED9fToBind</span>
	fToBind<span class="token punctuation">.</span>prototype <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>thisFn<span class="token punctuation">.</span>prototype<span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token keyword">return</span> fToBind<span class="token punctuation">;</span> <span class="token comment">// \u8FD4\u56DE\u62F7\u8D1D\u7684\u51FD\u6570</span>
<span class="token punctuation">}</span>


<span class="token keyword">const</span> obj2 <span class="token operator">=</span> <span class="token punctuation">{</span>
	<span class="token literal-property property">a</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>

<span class="token keyword">var</span> fnbind <span class="token operator">=</span> test<span class="token punctuation">.</span><span class="token function">myBind</span><span class="token punctuation">(</span>obj2<span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
<span class="token function">fnbind</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>

<span class="token keyword">function</span> <span class="token function">test</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>test<span class="token punctuation">.</span><span class="token function">myCall</span><span class="token punctuation">(</span>obj2<span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">4</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,27),e=[o];function c(l,i){return s(),a("div",null,e)}var r=n(p,[["render",c],["__file","callApply.html.vue"]]);export{r as default};