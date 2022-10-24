# 前端获取 IP

## 外网

1. 首先一个获取当前客户端的 IP 地址的网址 [IPCalf](http://net.ipcalf.com/)

```javascript
Your network IP is:
ff383653-0b2a-4213-9d4a-18a9e8few2c4.local
Make the locals proud.
```

`ff383653-0b2a-4213-9d4a-18a9e8few2c4.local`机器乱码是因为 chrome 默认是隐藏掉 内网 IP 地址的，可以通过修改 chrome 浏览器的配置更改此行为, 需要设置一些额外的东西才可以将 IP 地址显示出来

Chrome：在 Chrome 浏览器地址栏中输入：`chrome://flags/`
搜索`#enable-webrtc-hide-local-ips-with-mdns` 该配置 并将属性改为 `disabled`
之后按照 chrome 的指示重启一下 IP 地址就正常了。
但是 chrome 更新到 86 版本之后就找不到#enable-webrtc-hide-local-ips-with-mdns 这个配置项了，

替代的解决方案是安装一个 `WebRTC Network Limiter` 插件，然后选择第二项`Use my default public and private IP addresses`，这样的话本地 ip 地址就又能正常的显示出来了.

## 内网

内网 IP 的获取相对比较复杂，主要是需要依赖 [webRTC](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection), webRTC 是 HTML 5 的一个扩展

> WebRTC，名称源自网页即时通信（英语：Web Real-Time Communication）的缩写，是一个支持网页浏览器进行实时语音对话或视频对话的 API。它于 2011 年 6 月 1 日开源并在 Google、Mozilla、Opera 支持下被纳入万维网联盟的 W3C 推荐标准。
