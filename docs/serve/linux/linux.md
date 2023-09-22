---
icon: article

category:
  - Serve
  - Guide

tag:
  - linux
  - Quickly Start
---

# Linux

[Linux Tutorial](http://www.codebaoku.com/linux/linux-index.html)

## ps

查找指定进程格式：

```javascript
ps -ef | grep 进程关键字
```

查询`node`进程

```javascript
[root@VM-12-17-centos ~]# ps -ef | grep node
root      9122 31385  0 20:49 pts/0    00:00:00 grep --color=auto node
root     28969     1  0 Apr11 ?        00:00:22 node index.js

```

关闭进程

```javascript
kill -9 进程号
```

## 后台运行

为了使这些进程能够在后台运行，也就是说不在终端屏幕上运行，有几种选择方法可供使用

### &

当在前台运行某个作业时，终端被该作业占据；可以在命令后面加上& 实现后台运行。例如：`sh test.sh &` 适合在后台运行的命令有 f i n d、费时的排序及一些 s h e l l 脚本。

在后台运行作业时要当心：需要用户交互的命令不要放在后台执行，因为这样你的机器就会在那里傻等。不过，作业在后台运行一样会将结果输出到屏幕上，干扰你的工作。如果放在后台运行的作业会产生大量的输出，最好使用下面的方法把它的输出重定向到某个文件中：

PS：当你成功地提交进程以后，就会显示出一个进程号，可以用它来监控该进程，或杀死它。(ps -ef | grep 进程号 或者 kill -9 进程号）

```javascript
command  >  out.file  2>&1  &
```

这样，所有的标准输出和错误输出都将被重定向到一个叫做 out.file 的文件中。

### nohup

使用&命令后，作业被提交到后台运行，当前控制台没有被占用，但是一但把当前控制台关掉(退出帐户时)，作业就会停止运行。nohup 命令可以在你退出帐户之后继续运行相应的进程。nohup 就是不挂起的意思( no hang up)。该命令的一般形式为：

```javascript
nohup command &

// example
nohup node index.js &
```

如果使用 nohup 命令提交作业，那么在缺省情况下该作业的所有输出都被重定向到一个名为 nohup.out 的文件中，除非另外指定了输出文件：

```javascript
nohup command >> myout.file 2>&1 &
```

使用了`nohup`之后，很多人就这样不管了，其实这样有可能在当前账户非正常退出或者结束的时候，命令还是自己结束了。所以在使用`nohup`命令后台运行命令之后，需要使用`exit`正常退出当前账户，这样才能保证命令一直在后台运行

1. ctrl + z  
   可以将一个正在前台执行的命令放到后台，并且处于暂停状态。
2. Ctrl + c  
   终止前台命令。
3. jobs  
   查看当前有多少在后台运行的命令。 `jobs -l` 选项可显示所有任务的 PID，`jobs` 的状态可以是 running, stopped, Terminated。但是如果任务被终止了（kill），shell 从当前的 shell 环境已知的列表中删除任务的进程标识。

[shell 输出重定向](http://www.codebaoku.com/shell/shell-redirect.html)

- `command >> out.file`是将 command 的输出重定向到 out.file 文件，即输出内容不打印到屏幕上，而是输出到 out.file 文件中。
- 标准输入文件(stdin)：stdin 的文件描述符为 0，Unix 程序默认从 stdin 读取数据。
- 标准输出文件(stdout)：stdout 的文件描述符为 1，Unix 程序默认向 stdout 输出数据。
- 标准错误文件(stderr)：stderr 的文件描述符为 2，Unix 程序会向 stderr 流中写入错误信息。

- 2>&1 是将标准出和错误输出合并，这里是重定向到了 out.file 文件，即将标准出错也输出到 out.file 文件中。最后一个&， 是让该命令在后台执行。

## 传送文件

### scp

本地和服务器之间用 [`scp`](https://www.runoob.com/linux/linux-comm-scp.html) 命令 相互传送文件， `secure copy`

```javascript
usage: scp [-346BCpqrv] [-c cipher] [-F ssh_config] [-i identity_file]
           [-l limit] [-o ssh_option] [-P port] [-S program] source ... target
```

1. 本地向服务器

```javascript
scp local_file remote_username@remote_ip:remote_folder
// 或者
scp local_file remote_username@remote_ip:remote_file
// 或者
scp local_file remote_ip:remote_folder
// 或者
scp local_file remote_ip:remote_file
```

2. 从服务器获取

```javascript
scp root@www.runoob.com:/home/root/others/music /home/space/music/1.mp3
scp -r www.runoob.com:/home/root/others/ /home/space/music/
```

### xshell 软件里的 xftp 程序

[xshell](https://www.xshell.com/zh/xshell/) 这个软件很好，强烈推荐哦！！！

里面有个 xftp 小插件，可以支持文件在笔记本和服务器互传，这个小插件需要单独在网上下载，直接百度搜 xftp，很方便。

### rcp

目标主机需要事先打开 rcp 功能，并设置好 rcp 的权限：把源主机加入到可信任主机列表中，否则无法在源主机上使用 rcp 远程复制文件到目标主机

### wget

wget [参数] ftp://<目标机器 ip 或主机名>/<文件的绝对路径> #proftpd 格式

```javascript
wget ftp://remote_ip//home/work/source.txt  #从192.168.0.10上拷贝文件夹source.txt
```

## Linux 设置开机启动

### 添加命令

编辑文件 `/etc/rc.local`

```bash
vim /etc/rc.local
```

在文件末尾加上你开机需要执行的命令即可（写绝对路径，添加到系统环境变量的除外），如：

```bash
nohup /usr/local/srs2/objs/srs -c /usr/local/srs2/conf/z.conf>/usr/local/srs2/log.txt &
```

### 添加 Shell 脚本

将写好的脚本（.sh 文件）放到目录 /etc/profile.d/ 下，系统启动后就会自动执行该目录下的所有 shell 脚本。

### 添加服务

新建`/etc/init.d/demo.sh` 文件

```bash
#!/bin/sh
# chkconfig: 2345 85 15
# description:auto_run

#程序根位置
MY_ROOT=/usr/local/srs2/

#运行程序位置
MY_PATH="${MY_ROOT}objs/srs"

#LOG位置
LOG_PATH="$MY_ROOT"log.txt

#开始方法
start() {
    cd $MY_ROOT
    nohup $MY_PATH -c conf/z.conf>$LOG_PATH &
    echo "$MY_PATH start success."
}

#结束方法
stop() {
    kill -9 `ps -ef|grep $MY_PATH|grep -v grep|grep -v stop|awk '{print $2}'`
    echo "$MY_PATH stop success."
}

case "$1" in
start)
    start
    ;;
stop)
    stop
    ;;
restart)
    stop
    start
    ;;
*)
    echo "Userage: $0 {start|stop|restart}"
    exit 1
esac
```

1. 添加执行权限给 sh 文件和 jar 可执行权限

```bash
chmod +x /etc/init.d/srs.sh
```

2. 设置开机启动  
   首先，添加为系统服务

   ```bash
   chkconfig --add srs.sh
   ```

   开机自启动

   ```bash
   chkconfig srs.sh on
   ```

   查看

   ```bash
   chkconfig --list
   ```

   启动

   ```bash
   service srs.sh start
   ```

   停用

   ```bash
   service srs.sh stop
   ```

   查看启动情况

   ```bash
   lsof -i:1935
   ```
