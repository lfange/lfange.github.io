# 介绍

[TypeScript官网](https://www.typescriptlang.org/)  
[TypeScript中文网](https://www.tslang.cn/)

TypeScript 是一种由微软开发的自由和开源的编程语言。它是 JavaScript 的一个超集，而且本质上向这个语言添加了可选的静态类型和基于类的面向对象编程。

> TypeScript 是 JavaScript 的超集，具有可选的类型并可以编译为纯 JavaScript。从技术上讲 TypeScript 就是具有静态类型的 JavaScript

## TypeScript 优缺点

- 增强代码的可维护性，尤其在大型项目的时候效果显著
- 友好地在编辑器里提示错误，编译阶段就能检查类型发现大部分错误
- 支持最新的 JavaScript 新特特性
- 周边生态繁荣，vue3 已全面支持 typescript

## 缺点

- 需要一定的学习成本
- 和一些插件库的兼容并不是特别完美，如以前在 vue2 项目里使用 typescript 就并不是那么顺畅
- 增加前期开发的成本，毕竟你需要写更多的代码（但是便于后期的维护）

## 安装 typescript

```javascript
npm install -g  typescript // 全局安装 tss

tsc -v  // 查看版本

// 生成 tsconfig.json 配置文件
tsc --init
```

执行命令后就可以生成了一个 tsconfig.json 文件，[ts配置](https://www.tslang.cn/docs/handbook/tsconfig-json.html)可在此文件内编写

在我们 helloworld.ts 文件中,随便写点什么

```javascript
const s: string = "今朝有酒今朝醉";
console.log(s);
```

控制台执行 tsc helloworld.ts 命令，目录下生成了一个同名的 helloworld.js 文件，代码如下

```javascript
var s = "今朝有酒今朝醉";
console.log(s);
```

通过 tsc 命令， typescript 代码被转换成 js 代码

```javascript
node helloworld.js
```

即可看到输出结果

## 安装 ts-node

通过我们上面的一通操作，我们知道了运行 tsc 命令就可以编译生成一个 js 文件，但是如果每次改动我们都要手动去执行编译，然后再通过 node 命令才能查看运行结果岂不是太麻烦了

而 ts-node 正是来解决这个问题的

```javascript
npm i -g ts-node // 全局安装ts-node
```

有了这个插件，我们就可以直接运行.ts 文件

```javascript
ts-node helloworld.ts
```

可以看到我们的打印结果已经输出,后续我们的示例都可以通过这个命令来进行验证

## TypeScript基本类型

[TypeScript基本类型](https://www.tslang.cn/docs/handbook/basic-types.html)