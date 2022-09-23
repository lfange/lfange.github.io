# 设置 git 同时推送 github 和 gitee 远程仓库

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
