const _items = new WeakMap()
// const _items = Symbol()
class Stack {
	constructor(MaxSize) {
		this.MaxSize = MaxSize
		this[_items] = []
		this.top = -1
	}

	push(data) {
		this[_items].push(data)
		// if (this.Node.length === this.MaxSize) return false
		// this.Node[++this.top] = data
		// return true
	}

	pop() {
		this[_items].pop()
		// if (this.Node.length === -1) return false
		// const x = this.Node[this.top--]
		// return x
	}
}

// const stack = new Stack(10)

/**
 * 中缀转后缀表达式
 */

const strs = `((15 / (7 - (1 + 1))) * 3) - (2 + (1 + 1))` // 
// const strs = `5 + 6 * 8 - 2`

function toSur(arr) {
	let str = arr.replace(/\s/g, '')
	const stack = []
	let lasStr = ''

	const regs = ['+', '-', '*', '/', '(', ')']

	for (let i of str) {
		if (regs.includes(i)) {
			// 遇到运算符
			if (['+', '-', '*', '/'].includes(i)) {
				recurPop(i)
			}

			if (i === ')') {
				recurLimited(i)
			}

			stack.push(i)
		} else {
			// 遇到操作数直接加入后缀表达式
			lasStr += i
		}
	}

	while (stack.length) {
		const lastElem = stack[stack.length - 1] || ''
		const pop = stack.pop()
		if (pop !== ')' && pop !== '(') lasStr += pop
	}

	return lasStr

	// 递归优先级高于或等于当前运算符的运算符
	function recurPop(i) {
		const lastElem = stack[stack.length - 1] || ''
		if (
			['+', '-'].includes(i) && (['+', '-', '*', '/'].includes(lastElem)) || ['*', '/'].includes(i) && (['*', '/']
				.includes(lastElem))
		) {
			const pop = stack.pop()
			if (pop !== ')' || pop !== '(') lasStr += pop
			recurPop(i)
		}
	}

	// 遇到')'递归取出栈内非'('的运算符
	function recurLimited(i) {
		const lastElem = stack[stack.length - 1] || ''

		const pop = stack.pop()
		if (pop !== ')' && pop !== '(') lasStr += pop

		if (lastElem !== '(') {
			recurLimited(i)
		}
	}
}

console.log('', toSur(strs))

/**
 * 
 * 
 */

const tokens = ["4", "-2", "/", "2", "-3", "-",
	"-"] // ["10","6","9","3","+","-11","*","/","*","17","+","5","+"] // ["4","13","5","/","+"] // ["2","1","+","3","*"]

function evalRPN(tokens) {
	const regs = []

	const calResult = []

	for (let i of tokens) {
		// 遇到运算符
		if (['+', '-', '*', '/'].includes(i)) {
			// recurPop(i)
			recurCalculate(i)
		} else {
			calResult.push(i)
		}
	}

	function recurCalculate(i) {
		let last = calResult.pop()
		let first = calResult.pop()
		let res = `${first} ${i} ${last}`
		try {
			calResult.push(parseInt(eval(res)))
		} catch (e) {
			console.log('res', res, 2 - -3, eval(`${first} ${i} ${last}`))
			console.log('Error Message:', e.message, e)
		}
	}
	return parseInt(calResult)
}

console.log('evalRPN', evalRPN(tokens))
