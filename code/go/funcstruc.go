package main

import ("fmt";"math")

// Go 语言中同时有函数和方法。一个方法就是一个包含了接受者的函数，接受者可以是命名类型或者结构体类型的一个值或者是一个指针。所有给定类型的方法属于该类型的方法集.
type Circle struct {
	radius float64
}

func (c Circle) getArea() float64 {
	// c.radius 即为Circle 类型对象中的属性
	return 3.14 * c.radius * c.radius
}

func main() {
	var c1 Circle
	c1.radius = 10.00
	fmt.Println("圆的面积 = ", c1.getArea())

	varfunc()

	recur()
}


// 类似于JS 声明式函数
func varfunc() {
	// 声明函数作为变量
	getSquareRoot := func(x float64) float64 {
		return math.Sqrt(x)
	}

	// 函数作为实参
	fmt.Println("函数实参: ", getSquareRoot(9))

	// 调用回调函数
	testCallBack(33, callBack)
}


// 声明一个函数类型
type cb func(int) int

func testCallBack(x int, f cb) {
	f(x)
}

func callBack(x int) int {
	fmt.Printf("我是回调, x: %d\n", x)
	return x
}


// 递归  菲波那切数列

func recur() {
	for i := 0; i < 10; i++ {
		fmt.Println(fibonacci(i))		
	}
}

func fibonacci(n int) int {
	if n < 2 {
		return n
	} else {
		return (fibonacci(n - 2) + fibonacci(n - 1))
	}
}