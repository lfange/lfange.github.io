---
icon: tool
title: 正则表达式
category:
  - 正则表达式
tag:
  - regular
---

> 正向表达式就是所匹配要操作的字符串在前，表达式 pattern 在后;
> 反向表达式则是表达式 pattern 在前，所匹配要操作的字符串在后。

1. **exc(?:pattern)**  
   匹配 pattern 但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用。这在使用或字符“(|)”来组合一个模式的各个部分是很有用。例如“factor(?:y|ies)”就是一个比“factory|factories”更简略的表达式

```javascript
var ary = 'factorywork'
const reg = /factor(?:y|ies)/
const str = ary.replace(reg, '')
console.log('str:', str)
// str: work

// 和(?=pattern)的区别前者是组合各个部分
// str: ywork
```

2. exc(?=pattern) ** (查找符合 pattern 规则的 exc 部分)**
   正向肯定预查，在任何匹配 pattern 的 exc 开始处匹配查找字符串。这是一个非获取匹配，该匹配不需要获取供以后使用。

```javascript
var ary = 'factory123work123factory866'
const reg = /factory(?=\d)/g
const str = ary.replace(reg, '')
console.log('str:', str)
// str: 123work123866
```

3. exc(?!pattern)  
   **正向否定预查，在任何不匹配 pattern 的 exc 开始处匹配查找字符串**。这是一个非获取匹配，也就是说，该匹配不需要获取供以后使用。

```javascript
var ary = 'factorywork123factory866'
const reg = /factory(?!\d)/g
const str = ary.replace(reg, '')
console.log('str:', str)
// str: work123factory866
```

4. (?<=pattern)exc
   反向肯定预查，与正向肯定预查类似，只是方向相反。查找符合表达式 pattern 的 exc。

```javascript
var ary = 'factorywork123factory866'
const reg = /(?<=\d)factory/g
const str = ary.replace(reg, '') // 去掉数字后面factory部分
console.log('str:', str)
// str: factorywork123866
```

5. (?<!pattern)exc
   反向否定预查，与正向否定预查类似，只是方向相反。

```javascript
var ary = 'thisfactorywork123factory866'
const reg = /(?<!\d)factory/g
const str = ary.replace(reg, '') // 去掉非数字后的factory
console.log('str:', str)
// str: thiswork123factory866
```

## 常见正则应用

1. 常见手机号处理 手机号格式化

- 手机号 3-4-4 分割

```javascript
let mobile = '13312345678'
let mobileReg = /(?=(\d{4})+$)/g

console.log(mobile.replace(mobileReg, '-')) // 133-1234-5678
```

- 手机号码中间四位数字用\*表示

```javascript
const phone = '13312345678'
const phoneReg = /^(\d{3})(\d{4})(\d{4})$/
const sp = phone.replace(phoneReg, '$1****$3')
// sp: 133****6789

// 也可以使用该正则表达3-4-4格式
const w = phone.replace(phoneReg, '$1-$2-$3')
```

> $1--$9 是 RegExp 自带的。代表的是 **分组**，即小括号里面的小正则 捕获到的内容 是用来表示正则表达式子表达式相匹配的文本。
> 这里的$1 就是代表的就是第一个括号内的内容

2. 提取连续重复的字符

```javascript
const collectRepeatStr = (str) => {
  let repeatStrs = []
  const repeatRe = /(.+)\1+/g
  // \1 和 \2 表示第一个和第二个被捕获括号匹配的子字符串，\1+ 表示重复1次以上
  // \1{2,} 表示重复两次以上
  str.replace(repeatRe, (old, txt) => {
    txt && repeatStrs.push(txt)
  })

  return repeatStrs
}

// console.log(collectRepeatStr('12323555454545666')) ['23', '5', '45', '6']
```

> replace 用法：stringObj.replace(regexp/substr,replacement)
> replace 方法不仅可以替换字符，也可以用来提取字符

- 将数字转化为大写

```javascript
var ary = ['一', '二', '三', '四', '五', '六']
const upCase = '123456'.replace(/\d/g, (i) => ary[i - 1])
console.log('upCase', upCase)
// upCase 一二三四五六
```

- 将\_后的第一个字母转化为大写

```javascript
const str1 = '_you _are _my _sweet_heart '
const str2 = str1.replace(/\_\w?/g, (a, b) => {
  return a.charAt(1).toUpperCase()
})
console.log('str2', str2) // You Are My SweetHeart
```

3. 实现一个 trim 函数

- 直接去除空格，是我们比较常用的,直接将空字符替换.
  \s 匹配任何空白字符，包括空格、制表符、换页符等等

```javascript
const trim = (str) => {
  return str.replace(/^\s*|\s*$/g, '')
}
```

- 提取非空空格法

```javascript
const trim = (str) => {
  return str.replace(/^\s*(.*?)\s*$/g, '$1')
}
```

4. 数字价格千分位分割

- 将 123456789 变成 123,456,789

```javascript
'123456789'.replace(/(?!^)(?=(\d{3})+$)/g, ',') // 123,456,789
```

5. 将字符串首字母转化为大写，剩下为小写

```javascript
const capitalize = (string) => {
  const capitalizeRegex = /(?:^|\s+)\w/g

  return string
    .toLowerCase()
    .replace(capitalizeRegex, (match) => match.toUpperCase())
}
```

6. 将字符串驼峰化

```javascript
const camelCase = (string) => {
  const camelCaseRegex = /[-_\s]+(.)?/g

  return string.replace(camelCaseRegex, (match, char) => {
    return char ? char.toUpperCase() : ''
  })
}
```

7. 通过 name 获取 url query 参数

```javascript
const getQueryByName = (name) => {
  const queryNameRegex = new RegExp(`[?&]${name}=([^&]*)(&|$)`)
  const queryNameMatch = window.location.search.match(queryNameRegex)
  // 一般都会通过decodeURIComponent解码处理
  return queryNameMatch ? decodeURIComponent(queryNameMatch[1]) : ''
}
```

8. 是否为中文

```javascript
const reg = /[\u4e00-\u9fa5]/
```
