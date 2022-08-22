## 两数之和

  给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。

  你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。


```javascript
var maxSubArray = function (nums) {
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

const maxSubArr = function (nums) {
  let result = nums[0]
  let sum = nums[0]

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] + sum >= nums[i]) {
      sum += nums[i]
    } else {
      sum = nums[i]
    }

    if (sum > result) {
      result = sum
    }
  }
  return result
}

console.log(maxSubArr([-7, -5, -12, -6, -1, -2]))

const twoSum = function (nums, target) {
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

```