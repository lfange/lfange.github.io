// var intersect = function (nums1, nums2) {
// 	const result = []
// 	nums1.forEach(num => {
// 		if (nums2.includes(num)) {
// 			const delIndex = nums2.findIndex(n => num === n)
// 			result.push(num)
// 			nums2.splice(delIndex, 1)
// 		}
// 	})
// 	console.log('result', result)
// return result
// }

var intersect = function(nums1, nums2) {
	const result = []
	const map = {}
	nums1.forEach(num => {
		if (map[num]) map[num]++
		else map[num] = 1
	})
	nums2.forEach(num => {
		if (map[num]) {
			result.push(num)
			map[num]--
		}
	})
	return result
}


intersect([1, 2, 2, 1], [2, 2, 2])
