/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
	console.log('[1,2,3,1,2,6]', ...nums, new Set(nums))
	nums.sort((a,b) => {
		return a - b
	})
	const str = nums.join('')
	const reg = /(.+)\1{2,}/g
	// console.log('nums', nums.join(',').split(',').map(it => +it))

	console.log('match',nums, str.match(reg))
	console.log('test', reg.test(str))
	str.replace(reg, (a, b) => {
		console.log('a, b', a, b)
	})

};

console.log('上报时间:', 'swdac  think'.replace(/th\b/, '22') )
console.log('::::', 'swdw  think'.replace(/wd\b/, '22') )
// console.log('上报时间:', 'at noon'.replace(/\Bon/, '22') )


// nums = [1, 1, 1, 1, 3, 3, 3, 4, 3,5,5,5, 2, 4, 2]
nums = [1,2,3,1]

containsDuplicate([1,2,3,1,2,6])


const collectRepeatStr = (str) => {
  let repeatStrs = []
  const repeatRe = /(.+)\1+/g
  // \1 和 \2 表示第一个和第二个被捕获括号匹配的子字符串，\1+ 表示重复1次以上
  // \1{2,} 表示重复两次以上
  str.replace(repeatRe, (old, txt) => {
    txt && repeatStrs.push(txt)
  })
  
  return repeatStrs
}

console.log(collectRepeatStr('12323555454545666'))