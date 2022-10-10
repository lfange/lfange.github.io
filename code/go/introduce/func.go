package main

import ("fmt")

func main() {
	// test2()
	closure()
}

// go  值传递  不会改变参数值
func swap(x, y int) int {
	var temp int
	temp = x
	x = y
	y = temp
	return temp
}

func test1() {
	a := 1
	b := 2
	fmt.Printf("交换前 a 的值: %d\n", a)
	fmt.Printf("交换前 b 的值: %d\n", b)

	swap(a, b)

	fmt.Printf("交换后 a 的值: %d\n", a)
	fmt.Printf("交换后 b 的值: %d\n", b)
}


// go 引用传递
// 引用传递是指在调用函数时将实际参数的地址传递到函数中，那么在函数中对参数所进行的修改，将影响到实际参数。
func swap2(x *int, y *int) {
	var temp int
	temp = *x
	*x = *y
	*y = temp
	fmt.Println(x, "====", *x) // 0xc00001a088 ==== 2
	// 函数体内部 a 则为内存地址
}

func test2() {
	a := 1
	b := 2
	fmt.Printf("交换前 a 的值: %d\n", a)
	fmt.Printf("交换前 b 的值: %d\n", b)
	
	// &a &b 传递的是a,b的内存地址
  swap2(&a, &b)

	fmt.Printf("交换后 a 的值: %d\n", a)
	fmt.Printf("交换后 b 的值: %d\n", b)
}


// closure 闭包
func closure() {
	// 函数柯里化，返回的是一个函数
	nextNumber := getSequence()
	// 调用 nextNumber() 执行自增
	fmt.Println("nextNumber: ", nextNumber()) // 1
	fmt.Println("nextNumber: ", nextNumber()) // 2
	fmt.Println("nextNumber: ", nextNumber()) // 3

	nextNumber2 := getSequence()
	fmt.Println("nextNumber2: ", nextNumber2()) // 1
	fmt.Println("nextNumber2: ", nextNumber2()) // 2
}

func getSequence() func() int{
	i := 0
	return func() int {
		i += 1
		return i
	}
}