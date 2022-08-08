/**
 * @param {Object} arr 
 * 二分法
 */

var binarySearch = function(arr, target) {
	if (arr.length === 0) return []

	let left = 0
	let right = arr.length - 1

	while (left <= right) {
		let mid = Math.floor((left + right) / 2)
		if (arr[mid] === target) {
			return mid
		} else if (arr[mid] < target) {
			left = mid + 1
			console.log('<<<', mid)
		} else {
			right = mid - 1
		}
	}

}

const arr = [1, 3, 5, 8, 9, 12, 13, 16]
console.log('binarySearch', binarySearch(arr, 1))


var arr1 = [5, 6]

let a = 8,
	b = 9
console.log('arr1', arr1)
console.log('a, b', a, b)

function sor() {

}
