var binarySearch = function(list, target) {
	let low = 0
	let high = list.length - 1
	let mid = null

	while (low <= high) {
		mid = parseInt((low + high) / 2)
		let cur = list[mid]
		console.log('low high', low, high)
		if (cur === target) {
			return mid
		} else if (cur > target) {
			high = mid - 1
		} else {
			low = mid + 1
		}
	}
	return null
}


const list = [1, 3, 5, 7, 9]
console.log('mid', binarySearch(list, 7))
