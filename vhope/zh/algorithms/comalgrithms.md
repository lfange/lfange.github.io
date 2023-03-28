# 常见算法

## 二分法

二分查找是最简单的方法，针对于有序数组寻找指定的值

```javascript
var binarySearch = function (list, target) {
  if (list.length === 0) return null;

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

const arr = [1, 3, 5, 8, 9, 12, 13, 16];
console.log("binarySearch", binarySearch(arr, 1));
```

## 数组不使用sort查找最小值
```javascript
function minSelect(arr) {
	let min = arr[0]
	for (let i = 0; i < arr.length; i++) {
		min = min < arr[i] ? min : arr[i]
	}
	return min
}

const a = [5,16,25,18,32,03]
console.log('backwards', minSelect(a))
```

## 存在重复元素
给你一个整数数组 nums 。如果任一值在数组中出现 至少两次 ，返回 true ；如果数组中每个元素互不相同，返回 false

### 常规方法
```javascript
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function (nums) {
  nums.sort((a, b) => a - b);
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === nums[i + 1]) return true;
  }
  return false;
  // return new Set(nums).size !== nums.length
};
```

### count计数法
```javascript
// forEach 实现
var ObjDuplicate = function (nums) {
  const duplicate = {};
  nums.forEach((val) => {
    if (!duplicate.hasOwnProperty(val)) duplicate[val] = 0;
    else duplicate[val]++;
  });
  return [...Object.values(duplicate)].some((count) => count > 0);
};

// Map 实现
var MapDuplicate = function (nums) {
  const duplicate = new Map();
  nums.forEach((val, key) => {
    if (!duplicate.has(val)) duplicate.set(val, 0);
    else {
      let ad = duplicate.get(val);
      duplicate.set(val, ++ad);
    }
  });
  return [...duplicate.values()].some((count) => count > 0);
};

nums = [2, 5, 7333, 7, 5678, 58, 9, 7];
console.log("Q", ObjDuplicate(nums));
```

### 正则表达式查找
```javascript
const collectRepeatStr = (str) => {
  let repeatStrs = [];
  const repeatRe = /(.+)\1+/g;
  // \1 和 \2 表示第一个和第二个被捕获括号匹配的子字符串，\1+ 表示重复1次以上
  // \1{2,} 表示重复两次以上   /(.+)\1{2,}/g
  str.replace(repeatRe, (old, txt) => {
    txt && repeatStrs.push(txt);
  });
  return repeatStrs;
};

// console.log(collectRepeatStr('12323555454545666'))
```

## 两数之和

给定一个整数数组 nums  和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那   两个   整数，并返回它们的数组下标。  
 你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

### 两数求和第一种方法

```javascript
var maxSubArray = function (nums) {
  let sum = nums[0];
  let res = nums[0];

  let obj = {
    start: 0,
    end: 0,
  };
  let arr = [];

  for (let i = 1; i < nums.length; i++) {
    const current = nums[i];
    if (sum + current >= current) {
      sum += current;
    } else {
      sum = current;
      obj.start = i;
    }

    if (sum > res) {
      arr.push(i);
      res = sum;
      obj.end = i;
    }
  }
  return arr;
};

const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

// maxSubArray(nums)
console.log("maxSubArray1", maxSubArray(nums));
```

### 两数求和第二种方法

```javascript
const maxSubArr = function (nums) {
  let result = nums[0];
  let sum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] + sum >= nums[i]) {
      sum += nums[i];
    } else {
      sum = nums[i];
    }

    if (sum > result) {
      result = sum;
    }
  }
  return result;
};

console.log(maxSubArr([-7, -5, -12, -6, -1, -2]));
```

### 两数求和第三种方法

```javascript
const twoSum = function (nums, target) {
  const sumObj = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (sumObj.has(target - nums[i])) {
      return [sumObj.get(target - nums[i]), i];
    } else {
      sumObj.set(nums[i], i);
    }
  }
  return null;
};

console.log("twoSum", twoSum([3, 2, 8, 6, 4], 6));
```

## 买卖股票的最佳时期
给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。

你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。

```javascript
var maxProfit = function(prices) {
	let minNum = prices[0]
	let profit = 0

	for (let i = 0; i < prices.length; i++) {
		profit = Math.max(profit, prices[i] - minNum)
		minNum = Math.min(minNum, prices[i])
	}
	console.log('profit', profit)
	return profit
}

// [7,1,5,3,6,4]
maxProfit([7,1,5,3,6,4])
```

## 字符串中的第一个唯一字符
给定一个字符串 s ，找到 它的第一个不重复的字符，并返回它的索引 。如果不存在，则返回 -1 。

### 方法一
```javascript
/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function(s) {
	for (let i in s) {
		if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) {
			return i
		}
	}
	return -1
}
```

### 方法二
```javascript
var firstUniqChar = function(s) {
	const map = new Map()
	const arr = s.split('')
	for (let i = 0; i < arr.length; i++) {
		if (map.get(arr[i])) {
			let cur = map.get(arr[i])
			cur++
			map.set(arr[i], cur)
			console.log('cur', map.get(arr[i]))
		} else {
			map.set(arr[i], 1)
		}
	}
	for (let [i, nums] of map) {
		if (nums === 1) {
			console.log('ii', i)
			return s.indexOf(i)
		}
	}
	return -1
}
```

<!-- ### 方法三
```javascript	
var firstUniqChar = function(s) {
	const reg = /(.+)\1+/g
	let str = s.replace(reg, (a, b) => {
		console.log('reg', a, b)
	})
	return -1
};
console.log('firstUniqChar', firstUniqChar(s = "loveleetcode"))
``` -->

## 两个数组的交集

给你两个整数数组 nums1 和 nums2 ，请你以数组形式返回两数组的交集。返回结果中每个元素出现的次数，应与元素在两个数组中都出现的次数一致（如果出现次数不一致，则考虑取较小值）。可以不考虑输出结果的顺序。

### 循环对比删除原数组

```ts
function intersect(nums1: number[], nums2: number[]): number[] {
	const result = []
	nums1.forEach(num => {
		if (nums2.includes(num)) {
			const delIndex = nums2.findIndex(n => num === n)
			result.push(num)
			nums2.splice(delIndex, 1)
		}
	})
	return result 
};
```
### 暴力循环
```ts
function intersect(nums1: number[], nums2: number[]): number[] {
    const result: number[] = [];
    const map = {}
    nums1.forEach((num: number) => {
        if(map[num]) map[num]++
        else map[num] = 1
    })
    nums2.forEach((num: number) => {
        if (map[num]) {
            result.push(num)
            map[num]--
        }
    })
    return result
};
console.log(intersect([1, 2, 2, 1], [2, 2, 2]))
```