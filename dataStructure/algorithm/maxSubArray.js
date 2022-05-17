/**
 * 给你一个整数数组 nums ，
 * 请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。
 */

var maxSubArray = function(nums) {
	let sum = nums[0]
	let res = nums[0]

	let obj = {
		start: 0,
		end: 0
	}
	let arr = []

	for (let i = 1; i < nums.length; i++) {
		const current = nums[i]
		if (sum + current >= current) {
			sum += current
		} else {
			sum = current
			obj.start = i
		}

		if (sum > res) {
			arr.push(i)
			res = sum
			obj.end = i
		}

	}
	return arr
}

const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

// maxSubArray(nums)
console.log('maxSubArray1', maxSubArray(nums))

<<<<<<< HEAD
function maxSubArray1(nums) {
	let sum = nums[0]
	let ret = nums[0]

	const arr = []
	for (let i = 1; i < nums.length; i++) {
		if (sum + nums[i] >= nums[i]) {
=======
const maxSubArr = function(nums) {
	let result = nums[0]
	let sum = nums[0]

	for (let i = 1; i < nums.length; i++) {
		if (nums[i] + sum >= nums[i]) {
>>>>>>> 4a7e24331ea0ca005c84ada19d140c156fccb28c
			sum += nums[i]
		} else {
			sum = nums[i]
		}

<<<<<<< HEAD
		if (sum > ret) {
			arr.push(i)
			ret = sum
		}
	}

	return arr
}



function isValid(s) {
	if (!s) return true;
	let temp = s.replace(/\{\}|\[\]|\(\)/g, '');
	console.log('s', s, 'temp', temp)
	return temp === s ? false : isValid(temp);
}

let strrr = "([])[]]"
console.log('isValid', isValid(strrr))
=======
		if (sum > result) {
			result = sum
		}
	}
	return result
}

console.log(maxSubArr([-7, -5, -12, -6, -1, -2]))


const twoSum = function(nums, target) {
	const sumObj = new Map()
	for (let i = 0; i < nums.length; i++) {
		if (sumObj.has(target - nums[i])) {
			return [sumObj.get(target - nums[i]), i]
		} else {
			sumObj.set(nums[i], i)
		}
	}
	return null
}


console.log('twoSum', twoSum([3, 2, 8, 6, 4], 6))
>>>>>>> 4a7e24331ea0ca005c84ada19d140c156fccb28c
