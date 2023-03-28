# 前端获取唯一标识

有时候业务需要在客户端生成浏览器唯一稳定 ID。

## canvas

Canvas（画布）是 HTML5 中的一种动态绘图标签，可以用它来绘制图片。在不同操作系统、不同浏览器上，Canvas 绘制的图像将以不同的方式呈现，由于不同的系统显卡在绘制 canvas 时渲染的各个参数不同，所以绘制出来的图片的数据的 crc 校验是不一样的，具有很强的唯一性。原理是：在图片格式上，浏览器使用不同的图形处理引擎、图像导出选项、压缩级别，在系统层面，操作系统有不同的字体，它们使用不同的算法和设置来进行抗锯齿和子像素渲染。另外，Canvas 具有良好的兼容性，几乎被所有主流浏览器支持。

在具体代码上，通过 Canvas 绘图 API 绘制文字或图形后，通过 canvas.toDataURL() 方法获得 base64 编码，根据需要可再 hash 成指纹。

```javascript
function getId() {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  ctx.font = '22px Arial'
  ctx.fillStyle = 'red'
  ctx.fillText('hello fange', 20, 20)
  return canvas.toDataURL('image/jpeg')
}
```

## FingerprintJS

[FingerprintJS](https://github.com/fingerprintjs/fingerprintjs)（下文简称 FPJS）是一个浏览器指纹库，同时具有开源版和 Pro 版（付费版），可查询浏览器属性并从中计算出哈希值。与 Cookie 和本地存储不同，指纹在隐身模式下保持不变，甚至在浏览器数据清除时也是如此。

它最早的灵感就是来源于 EFF 提出浏览器指纹的概念，在此基础上，又增加了许多特征参数，包括一些新型的识别技术，比如：Canvas、AudioContext 等，在不断地迭代中，优化这些参数，并用最快的方式生成指纹。

```javascript
// Initialize the agent at application startup.
const fpPromise = import('https://openfpcdn.io/fingerprintjs/v3').then(
  (FingerprintJS) => FingerprintJS.load()
)

// Get the visitor identifier when you need it.
fpPromise
  .then((fp) => fp.get())
  .then((result) => {
    // This is the visitor identifier:
    const visitorId = result.visitorId
    console.log(visitorId)
    document.querySelector('#ID').innerHTML = visitorId
  })
```

## webRTC

内网 IP 的获取相对比较复杂，主要是需要依赖 [webRTC](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection), webRTC 是 HTML 5 的一个扩展

> WebRTC，名称源自网页即时通信（英语：Web Real-Time Communication）的缩写，是一个支持网页浏览器进行实时语音对话或视频对话的 API。它于 2011 年 6 月 1 日开源并在 Google、Mozilla、Opera 支持下被纳入万维网联盟的 W3C 推荐标准。

封装好获取 IP 的方法，`ice.candidate.address`可以直接获取 Ip 地址，如果获取的 ip 地址为`b40199c4-35d2-4861-877f-17bf040ec543.local`类型的机器码，则参照下面的 Chrome 取消 IP 隐藏设置

`b40199c4-35d2-4861-877f-17bf040ec543.local`机器乱码是因为 chrome 默认是隐藏掉 内网 IP 地址的，可以通过修改 chrome 浏览器的配置更改此行为, 需要设置一些额外的东西才可以将 IP 地址显示出来

```javascript
function RTCGetIp() {
  return new Promise((resolve, reject) => {
    //compatibility for Firefox and chrome
    window.RTCPeerConnection =
      window.RTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection;
    var pc = new RTCPeerConnection({
      iceServers: [],
    });
    let myIP;
    const noop = () => {};
    pc.createDataChannel("bogus"); // 随便创建 create a bogus data channel
    const reg =
      /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
    pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
    pc.onicecandidate = function (ice) {
      // ice.candidate.address: xxx.xxx.xxx.xxx
      if (ice && ice.candidate && ice.candidate.candidate) {
        myIP = ice.candidate.address; // 也可以通过解析candidate字符串获取ip reg.exec(ice.candidate.candidate)[1]
        pc.onicecandidate = noop;
        resolve(myIP);
      }
    };
  });
};

await RTCGetIp()
```

### RTCIP 在线获取

获取当前客户端的 IP 地址的网址 [IPCalf](http://net.ipcalf.com/)，该网站是根据 RTC 获取 IP 地址的。

```javascript
Your network IP is:
ff383653-0b2a-4213-9d4a-18a9e8few2c4.local
Make the locals proud.
```

### Chrome 取消 IP 隐藏设置

1. Chrome：在 Chrome 浏览器地址栏中输入：`chrome://flags/`
2. 搜索`#enable-webrtc-hide-local-ips-with-mdns` 该配置 并将属性改为 `disabled`
   之后按照 chrome 的指示点击`Relaunch`重启一下 IP 地址就正常了。
   但是 chrome 更新到 86 版本之后就找不到#enable-webrtc-hide-local-ips-with-mdns 这个配置项了，

替代的解决方案是安装一个 `WebRTC Network Limiter` 插件，然后选择第二项`Use my default public and private IP addresses`，这样的话本地 ip 地址就又能正常的显示出来了.

## 参考

[生成浏览器唯一稳定 ID 的探索](https://zhuanlan.zhihu.com/p/400206593)
