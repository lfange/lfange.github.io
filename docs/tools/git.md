# git order

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