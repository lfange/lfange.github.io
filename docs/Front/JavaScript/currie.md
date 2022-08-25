# 函数柯里化

### 什么是柯里化？
  指的是将一个接受多个参数的函数 变为 接受一个参数返回一个函数的固定形式，这样便于再次调用
### 柯里化的好处
  1. 参数复用；2. 提前返回；3. 延迟计算/运行.

```javascript
  function curryingAdd(x) {
    return function(y) {
      return x + y
    }
  }

  console.log('curryingAdd(1)(2) ', curryingAdd(1)(2) )

  function add() {
    console.log('_args', arguments) 
    const _args = [...arguments]
    const fn = function () {
      _args.push(...arguments)
      return fn
    }
    
    fn.toString = function () {
      return _args.reduce((sum, cur) => sum + cur)
    }
    return fn
  }
  document.write(add(1)(2)(3)(4,6,9,55)(5))

  Function.prototype.call = function (contxt) {
    
  }
```
#### js中经常使用的bind，实现的机制就是Currying.
```javascript
Function.prototype.bind = function (context) {
    var _this = this
    var args = Array.prototype.slice.call(arguments, 1)
 
    return function() {
        return _this.apply(context, args)
    }
}
```
### 正常正则验证字符串 reg.test(txt)
  > 函数封装后
```javascript
function check(reg, txt) {
    return reg.test(txt)
}

// check(/\d+/g, 'test')       //false
// check(/[a-z]+/g, 'test')    //true

// Currying后
function curryingCheck(reg) {
    return function(txt) {
        return reg.test(txt)
    }
}
var hasNumber = curryingCheck(/\d+/g)
var hasLetter = curryingCheck(/[a-z]+/g)
// hasNumber('test1')      // true
// hasNumber('testtest')   // false
// hasLetter('21212')      // false
```



