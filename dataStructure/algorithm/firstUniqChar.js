/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function(s) {
	// 方法一
	// for (let i in s) {
	// 	if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) {
	// 		return i
	// 	}
	// }

	// 方法二
	// const map = new Map()
	// const arr = s.split('')
	// for (let i = 0; i < arr.length; i++) {
	// 	if (map.get(arr[i])) {
	// 		let cur = map.get(arr[i])
	// 		cur++
	// 		map.set(arr[i], cur)
	// 		console.log('cur', map.get(arr[i]))
	// 	} else {
	// 		map.set(arr[i], 1)
	// 	}
	// }
	// for (let [i, nums] of map) {
	// 	if (nums === 1) {
	// 		console.log('ii', i)
	// 		return s.indexOf(i)
	// 	}
	// }
	
	// 方法三
	
	const reg = /(.+)\1+/g
	let str = s.replace(reg, (a, b) => {
		console.log('reg', a, b)
	})

	// console.log('map', map)
	// console.log('arr', arr)
	return -1
};



console.log('firstUniqChar', firstUniqChar(s = "loveleetcode"))
