
const obj = { 
	num: 1,
	name: 'objp'
}

const myobj = Object.create(obj)
myobj.num += 1
console.log('obj', obj, obj.num)
console.log('myobj', myobj, myobj.num)