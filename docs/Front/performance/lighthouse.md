---
icon: article
category:
  - 前端性能优化
tag:
  - SPA
  - 性能
---

# Lighthouse

## FCP

**FCP（First Contentful Paint)** 即首次内容绘制。它统计的是从进入页面到首次有 DOM 内容绘制所用的时间。这里的 DOM 内容指的是文本、图片、非空的 canvas 或者 SVG。我们也可以在 Performance 面板看到这个指标： ​

FCP 和我们常说的白屏问题相关，它记录了页面首次绘制内容的时间。一个常见的影响这个指标的问题是：FOIT（flash of invisible text，不可见文本闪烁问题），即网页使用了体积较大的外部字体库，导致在加载字体资源完成之前字体都不可见。可以通过 font-display API 来控制字体的展示来解决。

但值得注意的是，页面首次绘制的内容可能不是有意义的。比如页面绘制了一个占位的 loading 图片，这通常不是用户所关心的内容。

## LCP

LCP（Largest Contentful Paint）即最大内容绘制。它统计的是从页面开始加载到视窗内最大内容绘制的所需时间，这里的内容指文本、图片、视频、非空的 canvas 或者 SVG 等。

在 LCP 之前，lighthouse 还使用过 FMP（First Meaningful Paint，首次有意义内容绘制）指标。FMP 是根据布局对象（layout objects）变化最大的时刻来决定的。但是这个指标计算比较复杂，通常和具体的页面以及浏览器的实现相关，这也会导致计算不够准确。比如，用户在某个时刻绘制了大量的小图标。

Simpler is better！用户感知网页的加载速度以及当前的可用性，可以简单地用最大绘制的元素来测量。LCP 指向的最大元素通常会随着页面的加载而变化（只在用户交互操作之前），以下是一个网站的示例：

## TTI

要同时满足以下几个条件：

页面开始绘制内容，即 FCP 指标开始之后
用户的交互可以及时响应：
页面中大部分可见的元素已经注册了对应的监听事件（通常在 DOMContentLoaded 事件之后）
在 TTI 之后持续 5 秒的时间内无长任务执行（没有超过 50 ms 的执行任务 & 没有超过 2 个 GET 请求）
