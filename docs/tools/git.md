---
icon: tool
title: Git
category:
  - Git
tag:
  - Git
---

## 工作区域

1. 工作区即自己当前分支所修改的代码，git add xx 之前的！不包括 git add xx 和 git commit xxx 之后的。

2. 暂存区  
   已经 `git add xxx` 进去，且未 `git commit xxx` 的

3. 本地分支已经 git commit -m xxx 提交到本地分支的

git reset HEAD <路径/文件名>

### 取消工作区修改

`git checkout — file` 可以丢弃工作区的修改  
`git checkout . ` 本地所有修改的。没有的提交的，都返回到原来的状态

git stash #把所有没有提交的修改暂存到 stash 里面。可用 git stash pop 恢复

## 取消暂存区修改

`git reset HEAD` 如果后面什么都不跟的话 就是上一次 add 里面的全部撤销了, 即取消暂存区的到工作区

```javascript
git reset HEAD
```

### 回滚到指定 commit

`git log` 查看提交记录

```javascript
commit f6f350c9c73eb703bdf996fc686d5eb0e0cf2a3c (HEAD -> master, origin/master, origin/HEAD)
Author: lfange <653398363@qq.com>
Date:   Tue Oct 25 16:43:38 2022 +0800
```

找到需要回滚的 commit `f6f350c9c73eb703bdf996fc686d5eb0e0cf2a3c`,执行以下命令就可以回滚到这个版本

```javascript
git reset --hard f6f350c9c73eb703bdf996fc686d5eb0e0cf2a3c
```

回到最新的一次提交  
`git reset --hard HEAD^` or `git reset HEAD^` 此时代码保留，回到 git add 之前

如果需要同时回滚远程

```javascript
git push -f
```

### git 强制拉取远程覆盖本地

撤销本地、暂存区、版本库（用远程服务器的`master`替换本地、暂存区、版本库）

```javascript
git reset --hard origin/master
```

## git tag

1. 在控制台打印出当前仓库的所有标签：git tag, 查看远程服务器标签 git ls-remote --tags

2. 搜索符合模式的标签：git tag -l 'v0.0.\*'

3. 创建附注标签：git tag -a v0.0.1 -m "v0.0.1 发布", annotate

4. 删除标签：git tag -d v0.0.1

5. 查看标签的版本信息：git show v0.0.1

6. 指向打 v0.0.2 标签时的代码状态：git checkout v0.0.2

7. 将 v0.0.1 标签提交到 git 服务器：git push origin v0.0.1

8. 将本地所有标签一次性提交到 git 服务器：git push origin –tags
9. 以下命令就可以取得该 tag 对应的代码了： git checkout tag_name
10. 如果要在 tag 代码的基础上做修改，你需要一个分支，这样会从 tag 创建一个分支，然后就和普通的 git 操作一样了： git checkout -b branch_name tag_name

## git stash

`git stash` 可以将当前未提交的修改(即，**工作区的修改和暂存区的修改**)先暂时储藏起来，这样工作区干净了后，就可以切换分支下拉一个 fix 分支。在完成线上 bug 的修复工作后又切换回来

`git stash` 是本地的，不会通过 git push 命令上传到 git server 上

`git stash save [stashMessage]` 存储当前修改,并给当前修改新增别名

### 标识储藏记录

### 查看存储

`git stash list` 查看所有储藏

### 取出储藏

`git stash pop` 用于取出最近一次储藏的修改到工作区，将缓存堆栈中的第一个 stash 删除，并将对应修改应用到当前的工作目录下。

`git stash apply stash@xx` 将缓存堆栈中的 stash 多次应用到工作目录中，但并不删除 stash 拷贝

### 移除 stash

使用`git stash drop`命令，后面跟着 stash 名字

### 查看指定 stash 的 diff

使用 `git stash show` 命令，后面跟着 stash 名字。示例如下

### 从 stash 创建分支

`git stash branch stash@xx`

命令

```javascript
git stash list [<options>]
git stash show [<stash>]
git stash drop [-q|--quiet] [<stash>]
git stash ( pop | apply ) [--index] [-q|--quiet] [<stash>]
git stash branch <branchname> [<stash>]
git stash save [-p|--patch] [-k|--[no-]keep-index] [-q|--quiet]
         [-u|--include-untracked] [-a|--all] [<message>]
git stash [push [-p|--patch] [-k|--[no-]keep-index] [-q|--quiet]
         [-u|--include-untracked] [-a|--all] [-m|--message <message>]]
         [--] [<pathspec>…​]]
git stash clear
git stash create [<message>]
git stash store [-m|--message <message>] [-q|--quiet] <commit>
```

## git restore

`git restore filename` 撤消工作区的修改返回到最近一次 add(缓存区)的版本或者最近一次 commit(当前版本库)的版本(内容恢复到没修改之前的状态)

`git restore --staged filename` 将暂存区的文件从暂存区撤出，但不会更改文件的内容。

## git 同时推送 github 和 gitee

1. 进入工程根目录打开.git 文件夹（需要显示隐藏文件夹）

2. 打开.git 文件夹下的 config 文件进行编辑添加 github 和 gitee 仓库地址

添加 url 仓库地址前应保证本地对提交仓库 git 的用户权限

```javascript
[remote "origin"]
  # github 仓库
	url = https://github.com/lfange/xxx.git
	# gitee 仓库
  url = https://gitee.com/lfange/xxx.git
  fetch = +refs/heads/*:refs/remotes/origin/*
```

然后可以在控制台或者`git`仓库看到推送记录

## git 忽略文件

### 忽略未存在缓冲区的文件

在项目根目录创建`.gitignore`文件，直接添加需要忽略的文件至 `.gitignore`中.如`node_modules/`

### 忽略已存在缓冲区的文件

该情况可能出现在，修改了配置文件，或者修改一些配置适应本地环境的文件。  
使用 `git update-index --assume-unchanged PATH/FILE` 来不追踪该文件更新与否。 PATH/FILE 特定文件比如 config/config.php 等等。

### 已经存在缓冲区，但是希望其以后从缓冲区移除

该情况可能出现在，某些文件可能不需要添加到缓冲区，但是不小心添加到缓冲区，需要忽略，可以先从缓冲区移除，在从.gitignore 文件中忽略 `git rm --cached testFile` //将该文件从缓冲区移除永远不追踪该文件

```javascript
$ git rm --cached .vscode/
rm '.vscode/c_cpp_properties.json'
rm '.vscode/settings.json'
```

## 重命名本地分支

- 在当前分支时

```javascript
git branch -m new_branch_name
```

- 当不在当前分支时

```javascript
git branch -m old_branch_name new_branch_name
```

- 删除本地分支

```javascript
git branch -d localBranchName
```

- 删除远程分支

```javascript
git push origin --delete old_branch_name
```

- 上传新命名的本地分支

```javascript
git push origin new_branch_name
```

- 关联修改后的本地分支与远程分支

```javascript
git branch --set-upstream-to origin/new_branch_name
```

## 查看远程仓库地址

`git remote -v `

### 修改远程仓库地址

1. 直接修改 `git remote set-url origin <url>`

2. 先删后加

```javascript
git remote rm origin
git remote add origin [url]
```

3. .git 文件夹下修改

打开 .git 文件夹下的 config 文件， 修改 remote origin url 地址

```javascript
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[remote "origin"]
	url = http://192.168.200.39:999/wangni/blsjgl.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

## 合并 commit

- 先从版本库回退内容到暂存区，再重新提交工作区的内容

  使用 `git reset --soft` 回退版本库和暂存区的版本，同时保留工作区的变动，之后再重新提交工作区的内容就好了

  合并 commit 之前，先拉取代码，保证本地是最新的，因为合并后要执行 `git push --force`操作，在 reset 后，本地索引和服务器已经不一致，所以要强制执行 git push

  如果 push 失败，出现 Reject，则需要开启分支强制合入的选项，取消分支保护。

  **Settings -> Repository -> Protected Branches -> Protected branch （找到分支） -> Unprotect**

- git rebase

  1.  git log 查看分支
  2.  git rebase -i HEAD~n 使用 git rebase -i HEAD~5 压缩 5 个 commit 为 1 个，或者 git rebase -i 51efaef517abdbf674478de6073c12239d78a56a （第一个 commit 的 id）
      - pick：使用 commit。
      - reword：使用 commit，修改 commit 信息。
      - squash：使用 commit，将 commit 信息合入上一个 commit。
      - fixup：使用 commit，丢弃 commit 信息。

## Git-合并两个不同的仓库

A 仓库地址为：git@github.com:xxx/notebook.git B 仓库地址为：git@e.coding.net:xxx/notebook/notebook.git 需要将 A 仓库改动合并到 B 仓库中，首先保证 A 仓库内所有的改动均已提交

1. 下载需要进行合并的仓库 B

```javascript
git clone git@e.coding.net:xxx/notebook/notebook.git
```

2. 添加需要被合并的远程仓库 A

```javascript
git remote add base git@github.com:xxx/notebook.git
```

将 base 作为远程仓库，添加到 本地仓库(origin)中，设置别名为 base(自定义，为了方便与本地仓库 origin 作区分) 3. 把 base 远程仓库（A）中数据抓取到本仓库（B）

```
git fetch base
```

第 2 步 git remote add xxx 我们仅仅是新增了远程仓库的引用，这一步真正将远程仓库的数据抓取到本地，准备后续的更新

4. 基于 base 仓库的 master 分支，新建一个分支，并切换到该分支，命名为 "githubB"

```javascript
git checkout -b githubB base/master
```

此时使用 git branch 查看所有分支 5. 我们切换到需要合并的分支 master, `git checkout master` 6. 合并

```javascript
git merge githubB --allow-unrelated-histories
```

如果不加 `--allow-unrelated-histories` 关键字会报错

```javascript
fatal: refusing to merge unrelated histories
```

如果在流程中报上述错误加该关键词`--allow-unrelated-histories`即可。

合并过程中可能会遇到各种冲突，如果有冲突解决就可以了。 7. 提交

```javascript
git push origin master
```

## 参考

[git docs](https://git-scm.com/docs)
