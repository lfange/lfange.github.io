function Person (name, age) {
  this.name = name
  this.age = age
  this.sayName = function () {
    console.log(this.name)
  }
}

const admin = new Person('admin', 18)

console.log(`output->1111`, admin)
console.dir(Person.__proto__)
console.dir(Person)

const aaa = { name: 11111 }

const set1 = new Set([1, 2, aaa])
const set2 = new Set([1, 'good'])
set1.add(11)
console.log(`output->ad`, set1, set1.has(11))
console.log(`output->ad`, set1.keys(), set1.values(), set1.entries())

console.log(`intersec()`, set1.symmetricDifference(set2))

const weak1 = new WeakSet([aaa])

console.log(`output->weak1, `, weak1,)
console.log(`aaa->aaa, `, aaa,)