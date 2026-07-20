/**+
 * 
 * 观察者模式
 */

const queuedObservers = new Set()

const observe = (fn) => queuedObservers.add(fn)

const observable = (obj) => new Proxy(obj, { set })

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver)
  queuedObservers.forEach((Observer) => Observer())
  return result
}

const person = observable({ name: '张三', age: 18 })

function print() {
  console.log(`${person.name} , ${person.age}`)
}

observe(print)

function getName() {
  console.log('getName 方法调用： ' + person.name)
}

observe(getName)

person.age = 16
