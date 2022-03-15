function PromiseA(promises) {
	return new Promise((resolve, reject) => {

		var countNum = 0
		var promiseNum = promises.length
		var resolvedvalue = new Array(promiseNum)
		for (var i = 0; i < promiseNum; i++) {
			(function(i) {
				Promise.resolve(promises[i]).then(val => {
					countNum++
					resolvedvalue[i] = val

					if (countNum === promiseNum) {
						return resolve(resolvedvalue)
					}
				}, rej => {
					return reject(rej)
				})
			})(i)
		}
	})
}


var p1 = Promise.resolve(1),
	p2 = Promise.resolve(5),
	p3 = Promise.resolve(3)

PromiseA([p1, p2, p3])
	.then(res => {
		console.log('val', res)
	})


var timer = function() {
	console.log('item', i)
	for (var i = 0; i < 5; i++) {
		var item = []
		item.push(i)
	}
	console.log('item', i)
}

timer()
