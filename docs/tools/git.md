# git order

## 工作区域

1. 工作区
   即自己当前分支所修改的代码，git add xx 之前的！不包括 git add xx 和 git commit xxx 之后的。

2. 暂存区  
   已经 `git add xxx` 进去，且未 `git commit xxx` 的

3. 本地分支
   已经 git commit -m xxx 提交到本地分支的

git reset HEAD <路径/文件名>

### 取消工作区修改

`git checkout — file` 可以丢弃工作区的修改  
`git checkout . ` 本地所有修改的。没有的提交的，都返回到原来的状态

git stash #把所有没有提交的修改暂存到 stash 里面。可用 git stash pop 恢复

### 取消暂存区修改

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
使用 `git update-index --assume-unchanged PATH/FILE` 来不追踪该文件更新与否。
PATH/FILE 特定文件比如 config/config.php 等等。

### 已经存在缓冲区，但是希望其以后从缓冲区移除

该情况可能出现在，某些文件可能不需要添加到缓冲区，但是不小心添加到缓冲区，需要忽略，可以先从缓冲区移除，在从.gitignore 文件中忽略
`git rm --cached testFile` //将该文件从缓冲区移除永远不追踪该文件

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

- 删除远程分支

```javascript
git push --delete origin old_branch_name
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

1. 直接修改
   `git remote set-url origin <url>`

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

## 参考

[git docs](https://git-scm.com/docs)
