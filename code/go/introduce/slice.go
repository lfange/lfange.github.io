package main

import ("fmt")

func main() {
	
	// ready()
	// sliceOp()

	methods()
}

func ready() {
	var s []int = []int{1,2,3}
	// s := []int{1,2,3}

	s1 :=make([]int, 6)

	var numbers []int = make([]int, 3, 5)

	printslice(s)  // len=3 cap=3 slice=[1 2 3]
	printslice(s1)		// len=6 cap=6 slice=[0 0 0 0 0 0]
	printslice(numbers)  // len=3 cap=5 slice=[0 0 0]   

	// 空切片
	var empty []int
	printslice(empty)  // len=0 cap=0 slice=[]
	// numbers == nil
}


// 切片操作
func sliceOp() {
	numbers := []int{1,2,3,4,5,6,7,8}
	printslice(numbers)

	fmt.Println("numbers ::", numbers)  // [1 2 3 4 5 6 7 8]
	fmt.Println("numbers ::", numbers[1:4])  // [2 3 4]
	fmt.Println("numbers ::", numbers[:3])  // [1 2 3]
	fmt.Println("numbers ::", numbers[4:])  // [5 6 7 8]   

	numbers1 := make([]int, 0, 5)
	printslice(numbers1)

	numbers2 := numbers[:2]
	fmt.Println("numbers2", numbers2)
}

// append copy
func methods() {
	var numbers []int
	printslice(numbers)

	numbers = append(numbers, 0)
	printslice(numbers)

	/* 同时添加多个元素 */
	numbers = append(numbers, 23,5,8,6)
	printslice(numbers)

	/* 创建切片 numbers1 是之前切片的两倍容量*/
	numbers1 := make([]int, len(numbers), cap(numbers) * 2)
	printslice(numbers1)
	
	/* 拷贝 numbers 的内容到 numbers1 */
	copy(numbers1, numbers)
	printslice(numbers1)

}


func printslice(x []int) {
	fmt.Printf("len=%d cap=%d slice=%v\n", len(x), cap(x), x)
}
