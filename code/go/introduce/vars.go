package main

import (
    "fmt"
)
// 变量声明

// 指定变量类型，如果没有初始化，则变量默认为零值
func main() {
   
	var1()

	ArrayVar()
}


func var1() {
	var a, b int = 252, 8624579
	a, b = b, a
	fmt.Println(a, b)

	c, d := "double ball", 6854952

	c = "lucky ball"
	fmt.Println(c, d)

	// var (  // 这种因式分解关键字的写法一般用于声明全局变量
	// 	a int
	// 	b bool
	// )

	_, numb, strs := numbers()
	fmt.Println("Numbers()" + strs, numb)
}

func numbers()(int, int, string){
	a, b, c := 1, 2, "str"
	return a, b, c
}

func ArrayVar() {
	var balance = [6]int{2,1,3,5,23,15}
	fmt.Println("Array ", balance)

	for key, value := range balance {
		fmt.Println("key :", key , value)
	} 	
}