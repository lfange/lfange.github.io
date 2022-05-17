
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
