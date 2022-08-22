---
title: 常见算法
permalink: /algorithms/cal
categories: 
  - 算法
  - 基础
tags: 
  - null
author: 
  name: lfange
  link: https://github.com/lfange
---

``` javascript
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
	nums.sort((a, b) => a - b)
	for (let i = 0; i < nums.length; i++) {
		if (nums[i] === nums[i + 1]) return true
	}
	return false
	// return new Set(nums).size !== nums.length  
};


// 对象 count计数
var ObjDuplicate = function(nums) {
	const duplicate = {}
	nums.forEach(val => {
		if (!duplicate.hasOwnProperty(val)) duplicate[val] = 0
		else duplicate[val]++
	})
	return [...Object.values(duplicate)].some(count => count > 0)
}

// map count计数法
var MapDuplicate = function(nums) {
	const duplicate = new Map()
	nums.forEach((val, key) => {
		if (!duplicate.has(val)) duplicate.set(val, 0)
		else {
			let ad = duplicate.get(val)
			duplicate.set(val, ++ad)
		}
	})
	return [...duplicate.values()].some(count => count > 0)
}

nums = [2, 5, 7333, 7,5678,58,9,7]
console.log('Q', ObjDuplicate(nums))

const collectRepeatStr = (str) => {
	let repeatStrs = []
	const repeatRe = /(.+)\1+/g
	// \1 和 \2 表示第一个和第二个被捕获括号匹配的子字符串，\1+ 表示重复1次以上
	// \1{2,} 表示重复两次以上   /(.+)\1{2,}/g
	str.replace(repeatRe, (old, txt) => {
		txt && repeatStrs.push(txt)
	})
	return repeatStrs
}

// console.log(collectRepeatStr('12323555454545666'))
```