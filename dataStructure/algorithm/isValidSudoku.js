var isValidSudoku = function(board) {
	// for (let i = 0; i < board.length; i++) {
	// 	let nums = []
	// 	const str =	board[i].toString().replace(/\,|\./g, '').replace(/(?!$)(?<=(\d+))/g,',')
	// 	console.log('str', str)
	// 	console.log('board', nums)
	// }

	const rows = new Array(9).fill(0).map(() => new Array(9).fill(0));
	const columns = new Array(9).fill(0).map(() => new Array(9).fill(0));
	const subboxes = new Array(3).fill(0).map(() => new Array(3).fill(0).map(() => new Array(9).fill(0)));
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			const c = board[i][j];
			if (c !== '.') {
				const index = c.charCodeAt() - '0'.charCodeAt() - 1;
				console.log('index', index)
				rows[i][index]++;
				columns[j][index]++;
				subboxes[Math.floor(i / 3)][Math.floor(j / 3)][index]++;
				if (rows[i][index] > 1 || columns[j][index] > 1 || subboxes[Math.floor(i / 3)][Math.floor(j / 3)][
						index
					] > 1) {
					return false;
				}
			}
		}
	}
	return true
}


const board = [
	["5", "3", ".", ".", "7", ".", ".", ".", "."],
	["6", ".", ".", "1", "9", "5", ".", ".", "."],
	[".", "9", "8", ".", ".", ".", ".", "6", "."],
	["8", ".", ".", ".", "6", ".", ".", ".", "3"],
	["4", ".", ".", "8", ".", "3", ".", ".", "1"],
	["7", ".", ".", ".", "2", ".", ".", ".", "6"],
	[".", "6", ".", ".", ".", ".", "2", "8", "."],
	[".", ".", ".", "4", "1", "9", ".", ".", "5"],
	[".", ".", ".", ".", "8", ".", ".", "7", "9"]
]

console.log('charCodeAt', isValidSudoku(board))


var sym1 = Symbol();
var sym2 = Symbol('foo');
var sym3 = Symbol('foo');

console.log('sym1',sym1)
console.log('sym2',sym2)
console.log('sym3',sym3)
console.log('sym3',typeof sym2)