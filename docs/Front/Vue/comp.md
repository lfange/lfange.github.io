# 组件开发是否是越细越好

### 精选评论

##### *强：
> 答：并不是拆分粒度越小越好。原因：1、在我的日常开发中，有两种情况会去拆分组件，第一种是根据页面的布局或功能，将整个页面拆分成不同的模块组件，最后将这些模块组件拼起来形成页面；第二种是在实现第一部拆分出来的这些模块组件的时候，发现其中有一些模块组件具有相同或相似的功能点，将这些相似的功能点抽离出来写成公共组件，然后在各个模块中引用。无论是模块组件还是公共组件，拆分组件的出发点都和组件的大小粒度无关。可维护性和复用性才是拆分组件的出发点。2、对于组件的渲染，会先通过renderComponentRoot去生成组件的子树vnode，再递归patch去处理这个子树vnode。也就是说，对于同样一个div，如果将其封装成组件的话，会比直接渲染一个div要多执行一次生成组件的子树vnode的过程。并且还要设置并运行带副作用的渲染函数。也就是说渲染组件比直接渲染元素要耗费更多的性能。如果组件过多，这些对应的过程就越多。如果按照组件粒度大小去划分组件的话会多出很多没有意义的渲染子树和设置并运行副作用函数的过程。综上所述，并不是拆分粒度越小越好，只要按照可维护性和复用性去划分组件就好。

##### **夕：
> 我的观点是组件的拆分粒度越细不一定就越好。单纯为了拆而拆的话，意义其实不大。Vue官方文档对组件的定义是可复用的Vue.js实例。我觉得重点就在可复用吧，把那些复用度高的单独拆出来，这样很方便的在其他组件中引入使用。

##### **潮：
> 这里先用 ensureRenderer() 来延时创建渲染器，这里没太理解为什么是延时创建，看着是直接函数调用，求老师解惑

 ###### &nbsp;&nbsp;&nbsp; 讲师回复：
> &nbsp;&nbsp;&nbsp; 因为 ensureRenderer 是在执行 createApp 的时候调用的，如果你不执行 createApp 而只使用 vue 的一些响应式 API，就不会创建这个渲染器，所以说延时渲染。

##### *硕：
> 我觉得组件的拆分应该不是越细越好，虽说组件是更新的最小粒度，粒度细的话组件更新的时候可以有更少的diff和渲染消耗，但是组件的创建和渲染其自身就是一个消耗性能的递归行为，最好的拆分方式应该是从功能的复用和业务逻辑的抽象方面考虑，我始终认为，如果基于用户体验的前提，所有的静态内容都不应该封装成组件，虽然会导致模板变大，但这是值得的😳

##### **国：
> 组件粒度细的好处是方便维护，在组件深度很大时，把公共的组件封装起来，以便进行复用！如果没有公共组件的话，进行拆分会导致组件增多，根据渲染机制来看，因为每个组件是一颗树，这样会导致子树也会增多，这样渲染的次数势必也会增多，从而带来性能问题

##### **棋：
> Vue为什么会有vnode在vue1.x时是没有vnode的，利用vue的双向绑定可以明确知晓那个地方或DOM使用了这个变量，在变量发生变化时直接重新渲染使用地方。这是细颗粒化，但是带来的问题就是项目越大要记录的地方就越多，内存占用的就越多。在vue2.x后就加入了vnode使用中等颗粒化，发生数据变化后通知对应组件进行path重新渲染。vnode来重新渲染性能不一定是最高的，但确是最均衡的选择。把渲染任务给了vnode，那就要最大程度的优化它。2.x在将模板解析为AST树时就会经过解析器(解析为AST树)、优化器(标记静态节点和静态根节点)，另外构建AST层级关系使用的是栈，这是为了防止用递归层级过深爆栈。最后解析完成的AST就有元素节点、文本节点(带变量的文本和不带变量的文本节点)和静态根节点最后一步就是使用代码生成器将变量({{name}})、v-for、v-if等渲染，生成最终的vnode

##### **贤：
> 答: 并非拆分颗粒度越小越好···················例子1: App入口页, 里面存在header content footer三块区域(均为静态: 不存在响应式数据). 此时如果我们把这三块区域分别拆分成app-header app-content app-footer组件. 那么拆分的App渲染时长肯定时比没有拆分的App渲染时间要长的(多了组件vnode的创建过程)··················例子2: 同样是入口App页, 里面仍然是header content footer三块区域, 但与上次不同的是, 这三块区域分别依赖响应式数据headerData contentData footerData. 这时如果我们把这三块区域拆分成app-header app-content footer-content三个组件. 而此时我们修改了headerData的数据.那么这时拆分的App页面肯定是要比没有拆分的App更新速度要快(拆分App中的headerData搜集到的渲染watcher是app-header, 而没有拆分的headerData搜集到的渲染watcher是整个App)··················总结: 所以说拆分粒度需要根据业务而言, 并非越小越好, 当然不拆分更不好(容易被同事打伤)

##### **淼：
> 组件拆分就是方便复用，至于需不需要拆分得很细，还是看产品设计来吧。好不好其实都是相对的。

##### **凯：
> 1. 对于通用的，无业务逻辑的，可拆分的较细，方便日后组件的沉淀2. 对于业务逻辑高度重复的组件可单独抽成一个组件，使用者只需关心使用的api即可3. 对于过于复杂的页面，可按模块进行拆分，按照"高内聚，低耦合"原则，相关逻辑抽到对应的模块组件内，方便日后的维护

##### **纯：
> 老师，可以简单再讲讲，它是如何 “延时创建渲染器” 的吗？这里有点不懂

 ###### &nbsp;&nbsp;&nbsp; 讲师回复：
> &nbsp;&nbsp;&nbsp; 举个例子，当你执行 createApp 的时候，内部才会执行 ensureRenderer 方法，这个时候才会创建渲染器。而你不执行 createApp，只引入 vue 的一些响应式库的话，是不会创建渲染器的

##### *东：
> 并不是越细越好，应该要考虑到组件到可维护性以及逻辑到复用程度去进行一个拆分。

##### **用户8529：
> 组件的拆分粒不是越细越好，更多的还是要根据业务来，更好的可复用

##### *航：
> 这个是哪个版本的源码位置 资质愚钝前几天github下的位置都没有求大佬告知

 ###### &nbsp;&nbsp;&nbsp; 讲师回复：
> &nbsp;&nbsp;&nbsp; 分析的时候基本都是在 beta 版本，确实是不断变化的，建议看最新版本的源码，有具体的问题也可以提出

##### **无限：
> 黄老师我问两个问题：对于一个比较复杂的页面来说，比如我一个页面有6-7个填写区域，其中可能会有两两区域数据联动或者交互的地方。为了代码的整洁性，我习惯的将每个区域拆成一个组件去完成。但是通信成本增加了，表单提交时的验证也增加了，需要用到一些边界方法来做。这种情况下有什么好的建议？ 另外一个问题，如何避免组件层次封装过深？谢谢。

 ###### &nbsp;&nbsp;&nbsp; 讲师回复：
> &nbsp;&nbsp;&nbsp; 表单的设计建议参考 Element UI 那种，每一个基础的表单组件都是独立可用的，然后整体上再封装 Form 和 FormItem 来管理表单，包括验证。组件封装的粒度需要权衡，切忌过度封装，拆成一个独立的可复用的单元就行。

##### **伟：
> 肯定是越细越好，DOM diff 是组件级别的，只是我们工作中做不到那么细，都太懒了

##### **思：
> 组件的拆分颗粒度并不是越细越好. 首先对于组件的拆分一般是分为两种情况: 如果支持纯粹的为了组件拆分变的很小颗粒度的时候, 特别是大型项目, 会发现数据追踪更加不好追踪, 有时候还增加了维护的难度

##### **通：
> 问: 组件是否越小越好？答：不会，因为创建组件本身就是一个消耗的过程

##### **明：
> function ensureRenderer() { return renderer || (renderer = createRenderer(rendererOptions))}老师这段不是就加个 | 吗？跟tree-shaking有什么关系？

 ###### &nbsp;&nbsp;&nbsp; 讲师回复：
> &nbsp;&nbsp;&nbsp; 因为 ensureRenderer 的调用实际是用户在执行 createApp 的时候触发的，如果你只从 Vue 里引入 reactivity 相关 API，而不执行 createApp，也就不会执行 ensureRenderer，就不会创建渲染器，渲染器相关代码就会在打包过程中通过 tree-shaking 移除掉。

##### **宇：
> 老师您好，看完这一节，我有一些不明白的点，我还是没清楚subTree和initialVNode, 能不能形象的解释一下，谢谢老师了🙏

 ###### &nbsp;&nbsp;&nbsp; 讲师回复：:no-pre
> &nbsp;&nbsp;&nbsp; 建议认真学习“渲染 vnode” 小节，举的例子就已经说的很明白了，组件VNode是描述组件的抽象节点，比如 `<hello>`渲染对应的就是组件 vnode，子树 vnode 是整个组件渲染生成 DOM 对应的 vnode 树，比如 hello 组件内部自身渲染的 DOM 对应的 vnode 就是子树 vnode。

##### **翔：
> 是否拆分，不应该关注粒度，应该关注复用性与维护性。如果一段代码不能复用，没必要拆分，组件也一样。如果拆分可以通过好的命名让主逻辑更简洁清晰，拆分也是很好的选择

