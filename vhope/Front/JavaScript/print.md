---
icon: article
category:
  - JavaScript

tags:
  - Interview
---

# window.print 打印

[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)

**print() 方法用于打印当前窗口的内容**。调用 print() 方法会产生一个打印预览弹框，让用户可以设置打印请求。最简单的打印就是直接调用 window.print()，当然用 document.execCommand('print') 也可以达到同样的效果。默认打印页面中 body 里的所有内容。

## 打印样式

直接调用 print()方法去打印网页内容，我们会发现，事先调整好的布局和样式都没法实现，那么有哪些方法可以帮助我们改善打印的用户体验呢？

### 使用打印样式表

配置一份打印样式表 print.css，引入到 HTML 文档，在 <link> 上加上一个 media="print" 来标识这是打印机才会应用的样式表，这样打印的时候，就会默认将该样式表应用到文档中

```javascript
<link href="/path/print.css" media="print" rel="stylesheet" />
```

### 使用媒介查询

当我们要修改的样式没有很多的时候，其实完全不需要重新写个样式表，只要写上一个媒介查询也可以达到同样的效果，如：

```javascript
@media print {
  h1 {
    font-size: 20px;
    color: red;
  }
}
```

### 内联样式使用 media 属性

```javascript
<style type="text/css" media="print">
  // 打印样式
</style>
```

### 在 css 中使用@import 引入打印样式表

```javascript
@import url("/path/print.css") print;
```

## 打印指定区域

### startprint endprint

在需要打印的正文内容所对应的 html 开始处加上 <!--startprint--> 标识，结尾处加上 <!--endprint--> 标识，截取打印标识之间的内容替换 body 的内容，调用打印 print()方法。

```javascript
<body>
  <input type="button" value="打印此页面" onclick="printpage()" />

  <!--startprint-->
  <div id="printContent">打印内容</div>
  <!--endprint-->

  <script>
    function printpage() {
      let oldStr = window.document.body.innerHTML; // 获取body的内容
      let start = "<!--startprint-->"; // 开始打印标识, 17个字符
      let end = "<!--endprint-->"; // 结束打印标识
      let newStr = oldStr.substr(oldStr.indexOf(start) + 17); // 截取开始打印标识之后的内容
      newStr = newStr.substring(0, newStr.indexOf(end)); // 截取开始打印标识和结束打印标识之间的内容
      window.document.body.innerHTML = newStr; // 把需要打印的指定内容赋给body
      window.print(); // 调用浏览器的打印功能打印指定区域
      window.document.body.innerHTML = oldStr; // body替换为原来的内容
    }
  </script>
</body>
```

### 新窗口打印内容

新开一个窗口用来打印所需要的内容，更易扩展，如需添加一些当前文档内容没有的数据，可以直接通过 dom 操作，添加，然后渲染到新的窗口用来打印

```javascript
let printWindow = window.open('', '打印', '。。。')

// 打印样式设置
const style =
  '<style>*{margin:0px;}@media print {@page {margin: 0;}body {margin: 1cm;}}</style>'

// 获取需要打印的内容
let printHtml = document.getElementById('contentMB').innerHTML

// 需要额外打印的内容， 这里加个标题
printWindow.document.write(`<div>
      <h3 style="text-align:center">${title}</h3>
      <div style="position:relative;" class="contain"></div>
    </div>`)
printWindow.document.querySelector('.contain').innerHTML = printHtml + style

// 删除一些dom
try {
  const id = regId(printHtml)
  const parent = printWindow.document.querySelector('#xxx')
  const checkbox = printWindow.document.querySelector('#xxx')
  parent.removeChild(checkbox)
} catch (err) {
  console.error('print is wrong', err)
}

if (!!printWindow.ActiveXObject || 'ActiveXObject' in printWindow) {
  //是否ie
  this.remove_ie_header_and_footer()
}
printWindow.focus()
printWindow.document.close() //关闭document的输出流, 显示选定的数据
printWindow.print()
```

### iframe

可以将需要打印的内容在`iframe`内渲染，然后直接调用 iframe 的打印方法打印

## 强制插入分页

### page-break-before（指定元素前添加分页符）

| 值      | 描述                                                |
| ------- | --------------------------------------------------- |
| auto    | 默认值。如果必要则在元素前插入分页符。              |
| always  | 在元素前插入分页符。                                |
| avoid   | 避免在元素前插入分页符。                            |
| left    | 在元素之前足够的分页符，一直到一张空白的左页为止。  |
| right   | 在元素之前足够的分页符，一直到一张空白的右页为止。  |
| inherit | 规定应该从父元素继承 page-break-before 属性的设置。 |

```javascript
/* 在h1元素前始终插入分页符 */
@media print {
    h1 {page-break-before: always;}
}
```

### page-break-after （指定元素后添加分页符）

```javascript
/* 在 .footer 元素后始终插入分页符 */
@media print {
    .footer {page-break-after: always;}
}
```

### page-break-inside（用于设置是否在指定元素中插入分页符）

```javascript
/* 避免在 <pre> 与 <blockquote> 元素中插入分页符 */
@media print {
    pre, blockquote {page-break-inside: avoid;}
}
```

1. 不能对绝对定位的元素使用以上三种分页属性。
2. 请尽可能少地使用分页属性，并且避免在表格、浮动元素、带有边框的块元素中使用分页属性。

## 设置打印布局（横向、纵向、边距）

```javascript
@media print {
    @page {
      /* 纵向 */
      size: portrait;

      /* 横向 */
      size: landscape;

      /* 边距 上右下左 */
      margin: 1cm 2cm 1cm 2cm;
    }
  }
```

## 去除浏览器默认页眉页脚

页眉打印默认有页眉页脚信息，展现到页面外边距范围，我们可以通过去除页面模型 page 的外边距，使得内容不会延伸到页面的边缘，再通过设置 body 元素的 margin 来保证 A4 纸打印出来的页面带有外边距

```javascript
@media print {
  @page {
    margin: 0;
  }
  body {
    margin: 1cm;
  }
}
```

## 打印方法封装

```javascript
export default function printHtml(html) {
  let style = getStyle()
  let container = getContainer(html)

  document.body.appendChild(style)
  document.body.appendChild(container)

  getLoadPromise(container).then(() => {
    window.print()
    document.body.removeChild(style)
    document.body.removeChild(container)
  })
}

// 设置打印样式
function getStyle() {
  let styleContent = `#print-container {
        display: none;
    }
    @media print {
        body > :not(.print-container) {
            display: none;
        }
        html,
        body {
            display: block !important;
        }
        #print-container {
            display: block;
        }
    }`
  let style = document.createElement('style')
  style.innerHTML = styleContent
  return style
}

// 清空打印内容
function cleanPrint() {
  let div = document.getElementById('print-container')
  if (!!div) {
    document.querySelector('body').removeChild(div)
  }
}

// 新建DOM，将需要打印的内容填充到DOM
function getContainer(html) {
  cleanPrint()
  let container = document.createElement('div')
  container.setAttribute('id', 'print-container')
  container.innerHTML = html
  return container
}

// 图片完全加载后再调用打印方法
function getLoadPromise(dom) {
  let imgs = dom.querySelectorAll('img')
  imgs = [].slice.call(imgs)

  if (imgs.length === 0) {
    return Promise.resolve()
  }

  let finishedCount = 0
  return new Promise((resolve) => {
    function check() {
      finishedCount++
      if (finishedCount === imgs.length) {
        resolve()
      }
    }
    imgs.forEach((img) => {
      img.addEventListener('load', check)
      img.addEventListener('error', check)
    })
  })
}
```

直接调用

```javascript
import printHtml from '@/utils/print.js'

export default {
  methods: {
    print() {
      let printData = `<div>打印内容</div>`
      printHtml(printData)
    },
  },
}
```
