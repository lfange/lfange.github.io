# 前端代码规范

## ESlint

[eslint](https://github.com/eslint/eslint) 是 `JavaScript` 一个代码检测工具，用于检测代码中潜在的问题和错误，作用提高代码质量和规范。

### 安装 eslint

```js
pnpm add eslint -D
```

### 快速构建 eslint 配置文件

```js
pnpm init @eslint/config
```

执行完成后，自动生成 eslint 配置文件 `.eslintrc.js` 可在 `.eslintrc.js` 中配置 rules 定义校验规则

```js
 rules: {
         indent: ['error', 4], // 用于指定代码缩进的方式，这里配置为使用四个空格进行缩进。
        'linebreak-style': [0, 'error', 'windows'], // 用于指定换行符的风格，这里配置为使用 Windows 风格的换行符（\r\n）。
        quotes: ['error', 'single'], // 用于指定字符串的引号风格，这里配置为使用单引号作为字符串的引号。
        semi: ['error', 'always'], //用于指定是否需要在语句末尾添加分号，这里配置为必须始终添加分号。
        '@typescript-eslint/no-explicit-any': ['off'] // 用于配置 TypeScript 中的 "any" 类型的使用规则，这里配置为关闭禁止显式使用 "any" 类型的检查。
    }
```

## husky

[husky](https://github.com/typicode/husky) 是一个 Git 钩子（Git hooks）工具，它可以让你在 Git 事件发生时执行脚本，进行代码格式化、测试等操作。

- `pre-commit`：在执行 Git commit 命令之前触发，用于在提交代码前进行代码检查、格式化、测试等操作。
- `commit-msg`：在提交消息（commit message）被创建后，但提交操作尚未完成之前触发，用于校验提交消息的格式和内容。
- `pre-push`：在执行 Git push 命令之前触发，用于在推送代码前进行额外检查、测试等操作。

### 安装

注意！需要在 .git 文件同目录下安装 husky，否则无法识别环境导致安装失败！

#### 在项目根目录下运行以下命令安装 `husky`

```js
pnpm add husky --save-dev
```

#### 启用 git 钩子

```js
npm pkg set scripts.prepare="husky install"
```

安装成功后会在 package.json 文件中 script 中生成命令

注意！如为自动生成需手动添加，将以下内容粘贴到 package.json 文件中

```js
// package.json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

#### 创建.husky 目录，执行如下代码

```js
npm run prepare
```

执行成功后，项目中生成一个 .husky 目录

![husky](./assets/husky.png)

注意！如未生成 .husky 目录，推荐使用命令 npx husky install

### 创建 Git 挂钩

#### pre-commit

在 Git 提交之前做 eslint 语法校验 。

1. 创建钩子脚本文件

```js
npx husky add .husky/pre-commit "npx lint-staged"
```

执执行成功，.husky 目录多出一个 pre-commit 文件

注意！window 电脑输入后，可能会报错如下

```js
Usage:
  husky install [dir] (default: .husky)
  husky uninstall
  husky set|add <file> [cmd]
```

解决方式，删除 "npm test" 重新执行 `npx husky add .husky/commit-msg`

2. 配置代码检测

git 提交前，执行 pre-commit 钩子脚本，进行校验代码语法、格式修复等操作。

- 打开 pre-commit 文件，内容如下：

```js
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
```

- 下方代码添加到 pre-commit 文件中。lint-staged 模块， 用于对 git 暂存区检测

```js
npx --no-install lint-staged
```

::: tip

npx --no-install lint-staged 是一个命令，用于在不安装 lint-staged 的情况下运行该工具。

npx --no-install 命令用于从远程下载并执行指定的命令。

:::

## lint-staged

- 作用： [lint-staged](https://github.com/okonet/lint-staged) 可以让你在 Git 暂存（staged）区域中的文件上运行脚本，通常用于在提交前对代码进行格式化、静态检查等操作。
- 使用方式：你可以在项目中使用 `lint-staged` 配合 husky 钩子来执行针对暂存文件的脚本。具体的使用步骤如下：

### 安装

```js
pnpm add lint-staged --save-dev
```

在 package.json 文件中添加以下配置：

```js

{
  "lint-staged": {
    // src/**/*.{js,jsx,ts,tsx} 校验暂存区、指定目录下的文件类型
    // 校验命令，执行 eslint 、prettier
    "src/**/*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

- `"src/\*_/_.{js,jsx,ts,tsx}"` 是指定要针对的暂存文件模式，你可以根据自己的项目需求来配置。
- `["prettier --write","eslint --fix"]` 为校验命令，可执行 eslint 、prettier 等规则

## prettier

[prettier](https://github.com/prettier/prettier) 是一个代码格式化工具。 prettier 与上述 husky 和 lint-staged 搭配使用，可以在提交代码之前自动格式化代码。具体的使用步骤如下：

### 安装

在项目根目录下运行以下命令安装 prettier：

`pnpm add prettier --save-dev` 建 .prettierrc.js 文件，并定义你想要的代码样式，例如：

```js
module.exports = {
  semi: true, //强制在语句末尾使用分号。
  trailingComma: 'none', //不允许在多行结构的最后一个元素或属性后添加逗号。
  singleQuote: true, //使用单引号而不是双引号来定义字符串。
  printWidth: 120, //指定每行代码的最大字符宽度，超过这个宽度的代码将被换行
  tabWidth: 4, //指定一个制表符（Tab）等于多少个空格。
}
```

这里的配置选项根据你的需求定义，具体选项可以参考 prettier 文档。在 lint-staged 的配置中添加 "prettier --write"，例如

```js
{
  "lint-staged": {
    // src/**/*.{js,jsx,ts,tsx} 校验暂存区、指定目录下的文件类型
    // 校验命令，执行 eslint 、prettier
    "src/**/*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

## code 自动保存

第一种，在 vscode 设置里面配置 点击 Vscode 的设置=>工作区=>文本编辑器

![ctrls](./assets/ctrls.png)

安装步骤

## Commitizen

[Commitizen](https://github.com/commitizen-tools/commitizen)是一个命令行工具，用于以一致的方式编写规范的提交消息。在使用 Commitizen 之前，你需要安装 Commitizen 及其适配器。

### 安装和使用步骤

- 确保你的项目已经初始化并安装了 pnpm。打开命令行终端，并在项目根目录下运行以下命令来安装 commitizen 和 cz-conventional-changelog：使用 pnpm：

```js
pnpm add --save-dev commitizen cz-conventional-changelog
```

- 安装完成后，在 package.json 中添加一个 config.commitizen 的字段，并设置它的值为 cz-conventional-changelog。示例如下：

```js
"config": {
  "commitizen": {
    "path": "cz-conventional-changelog"
  }
}
```

在 `package.json` 中的 scripts 字段中添加一个 `commit` 的命令。示例如下：

```js
"scripts": {
  "commit": "git-cz"
}
```

- 这将允许你使用 `npm run commit` 或 `pnpm commit` 命令来进行交互式的提交

现在，你可以使用 `npm run commit` 或 `pnpm commit` 命令来进行提交。这将打开一个交互式的界面，引导你填写提交消息。

如：

1. 提交修改文件

```js
git add .
```

2. 开始交互式提交，填写规范信息

```js
npm run commit
```

3. 选择提交类型

```js
? Select the type of change that you're committing: (Use arrow keys)
> feat:     A new feature //新功能
  fix:      A bug fix //错误修复
  docs:     Documentation only changes //仅文档更改
  style:    [样式]Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  refactor: [重构] A code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
  test:     Adding missing tests or correcting existing tests
```

4. 根据提示填写内容，可选择空格跳过

```js
? What is the scope of this change // 此更改的范围是什么
? Write a short, imperative tense description of the change//【必填】 简短的描述这个变化
? Provide a longer description of the change//提供变更的详细说明：
? Are there any breaking changes? //有什么突破性的变化吗？【y/n】
? Does this change affect any open issues? (y/N) //此更改是否会影响任何悬而未决的问题（是/否）

// 完成提交，输出打印日志：
[master 2cf55e0] docs: 修改commitzen文档
 1 file changed, 2 insertions(+), 2 deletions(-)
```

当你完成提交消息后，Commitizen 会自动生成符合规范的提交消息，并将其添加到 Git commit 中。根据 cz-conventional-changelog 的规范，提交消息需要包括类型（type）、范围（scope）、简短的描述（subject）和可选的详细描述（body）。

## 冲突

### ESLint 和 Prettier 冲突

有时，ESLint 的规则和 Prettier 的规则可能存在冲突，导致代码格式化不一致。使用 [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) 可以关闭 ESLint 中与 Prettier 冲突的规则。

```js
pnpm add eslint-config-prettier eslint-plugin-prettier -D
```

- `eslint-config-prettier` ：关闭 eslint 中与 prettier 相互冲突的规则
- `eslint-plugin-prettier` : 允许 eslint 用 prettier 格式化代码的能力。安装依赖并修改.eslintrc 文件

在 `.eslintrc.js` 文件中，在 extends 配置基础上，追加内容

```js
// .eslintrc
{
   //
 - "extends": ["eslint:recommended"] // 原先配置
 + "extends": ["eslint:recommended",  "prettier"] // 添加配置
  // 其余的配置
}
```

同理，plugins 配置基础上，追加 prettier

```js
"plugins": [ "@typescript-eslint", "react","prettier" // 添加 prettier 插件 ],
```

### @typescript-eslint/dot-notation

- 错误日志：

```js
Error: Error while loading rule '@typescript-eslint/dot-notation':
You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.
```

- 错误原因

这个错误是由于在使用 @typescript-eslint/dot-notation 规则时，没有为 @typescript-eslint/parser 提供正确的 parserOptions.project 属性值引起的。

- 解决方式

eslint 配置文件中，设置一个有效的 parserOptions.project ，指向你的 TypeScript 配置文件（tsconfig.json）。

```js
parserOptions: {
    project: './tsconfig.json',
},
```

### @typescript-eslint" uniquely.

- 错误日志：

```js
ESLint couldn't determine the plugin "@typescript-eslint" uniquely.
```

- 解决方式

1. 重新安装 eslint 相关依赖

```js
npm cache clean --force //先清除缓存依赖
```

```js
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier eslint-plugin-prettier
```

2. `.eslintrc.js` 文件，配置 root：true

root 被设置为 true 时，ESLint 使用当前配置文件作为根配，将停止在父级目录中查找其他配置文件。

![root](./assets/640.png)

### Warning: React version not specified

使用了 eslint-plugin-react 插件，未在配置文件中指定 React 版本，会遇到下述警告信息。

**Warning: React version not specified in eslint-plugin-react settings. See https://github.com/jsx-eslint/eslint-plugin-react#configuration .**

在 .eslintrc.js 添加声明

```js
"settings": {
  "react": {
    "version": "detect" //detect 自动检测react版本
  }
},
```
