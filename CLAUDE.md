# 项目说明

本项目是基于 VuePress 2 + vuepress-theme-hope 的个人博客/文档站（哓番茄 Lfange Blog）。
文档源码在 `docs/`，构建产物在 `docs/.vuepress/dist/`，发布到 GitHub Pages 的 `gh-pages` 分支（仓库 `lfange/lfange.github.io`）。

---

# AI 文档工作流（必须遵守）

当本会话中需要**新建任何 Markdown 文档/笔记/博客**时，必须按下面 5 步执行。
仅回答问题、查阅代码、修改非文档文件时，不触发本流程。

## 1. 存放位置与自动归类

所有新文档必须放在 `docs/` 下的分类子目录中，**禁止放在项目根目录**。
根据文档内容判断归属，现有分类目录：

| 目录 | 归类内容 |
|------|----------|
| `docs/algorithms/` | 算法、数据结构、LeetCode 等 |
| `docs/Front/` | 前端（含 `Vue/`、`vue3/`、`JavaScript/`、`ts/`、`engineering/`、`electron/` 等子目录） |
| `docs/backend/` | 后端（含 `Golang/`、`Node/`、`database/` 等子目录） |
| `docs/computer/` | 计算机基础（含 `os/` 操作系统、`net/` 网络） |
| `docs/interview/` | 面试题、面经 |
| `docs/serve/` | 服务部署（linux、nginx、frps 等） |
| `docs/tools/` | 工具（git、GPT、vuepress 等） |
| `docs/ai/` | AI、大模型、AI Agent、LangChain 等 |
| `docs/web3/` | web3 |
| `docs/eng/` | 英语 |

- 优先放入最贴切的现有目录；目录下的子目录也优先复用（如前端 Vue 笔记放 `docs/Front/Vue/`）。
- 若现有目录都不合适，可在 `docs/` 下**新建子目录**作为新分类。新分类目录必须创建 `README.md`（frontmatter 至少含 `icon` 字段）作为分类首页，并在第 2 步注册侧边栏。

## 2. 注册侧边栏（关键，不可遗漏）

侧边栏配置在 `docs/.vuepress/sidebar/zh.ts`。新建文档后必须检查该文件：

- 若目标目录在配置中为 `'structure'`（当前包括 `/algorithms/`、`/Front/`、`/backend/`、`/tools/`、`/serve/`、`/eng/`、`/ai/`、`/web3/`）：新文档**自动**出现在侧边栏，无需改配置。
- 若目标目录为**手动 children 数组**（当前包括 `/computer/`、`/interview/`）：**必须**在对应数组中追加新文档路径，写法参照现有的 `comBase('<相对路径不带 .md>')` 等辅助函数，或直接写完整路径字符串如 `'/computer/xxx.md'`。
- 若**新建了分类目录**：在 `zhSidebarConfig` 对象中追加 `'/新目录名/': 'structure'`；并视情况在 `docs/.vuepress/navbar/zh.ts` 增加顶部导航入口。

## 3. 文档命名与 frontmatter 规范

- 文件名：小写英文或拼音，使用 kebab-case（如 `event-loop.md`、`shi-xian-yuan-li.md`），不要大小写混用。
- 文档顶部 frontmatter 至少包含 `title` 字段；分类目录的 `README.md` 含 `icon`。

## 4. 生成后自动打包发布（全自动）

文档创建完成、侧边栏配置更新后，**立即**执行发布，无需询问用户确认：

```sh
bash deploy.sh "<本次内容的简短 commit message>"
```

要求：
- 必须用 `bash` 调用 `deploy.sh`（Windows 环境下 `bash` 已在 PATH 中，位于 `F:\software\git\usr\bin\`）。不要用 `sh deploy.sh` 或 `npm run deploy`。
- commit message 用简短中文或英文概括本次新增/改动（如 `"新增 event-loop 笔记"`）。
- 执行前用一句话向用户说明「即将发布：<内容摘要>」，然后立即执行 `bash deploy.sh`，不再二次确认。
- `deploy.sh` 会依次执行：`npm run docs:build` 打包 -> 进入 `docs/.vuepress/dist` -> `git init/add/commit` -> `git push -f` 强制推送到 `lfange/lfange.github.io` 的 `gh-pages` 分支，覆盖线上站点。
- 若构建或推送失败，如实报告错误信息，不要掩盖，也不要假装成功。
- 判断发布成功：输出末尾出现 `finish!!!` 且 git push 行显示 `master -> gh-pages (forced update)` 即成功。
- 已知无害噪声（勿误判为失败）：① commit message 中文在 PowerShell 控制台显示为乱码（编码问题），实际 git commit 内容正确；② 末尾 `rmdir: failed to remove 'dist': No such file or directory`（`rm -rf dist` 已删目录，`rmdir` 重复删除），无害。

## 5. 不触发自动发布的情形

- 只是回答问题、查阅代码、修改非文档文件 -> 不发布。
- 修改已有文档但用户未明确要求发布 -> 不发布。
- 仅当**新建文档**或用户明确说「发布/部署」时，才执行 `bash deploy.sh`。
