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

function maxSubArray1(nums) {
	let sum = nums[0]
	let ret = nums[0]

	const arr = []
	for (let i = 1; i < nums.length; i++) {
		if (sum + nums[i] >= nums[i]) {
			sum += nums[i]
		} else {
			sum = nums[i]
		}

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
