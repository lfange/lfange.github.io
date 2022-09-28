package main

import ("fmt")

// declare global variable
var a int

func main() {

	// global
	fmt.Println("global variable: ", a) // 0
	fmt.Println("main sum", sum(a, 12)) // 0 + 12 = 12

	localScope()
}

// 局部作用域
func localScope() {
	a, b, c := 10, 20, 15

	fmt.Println("global variable: ", a) // 0

	c = sum(a, b)
	fmt.Println("c ", c)
}

// 函数定义 两数相加
func sum(a, b int) int {
	fmt.Printf("sum() 函数中的a %d\n", a)
	fmt.Printf("sum() 函数中的b %d\n", b)

	return a + b
}