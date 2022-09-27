package main

import (
    "fmt"
)
// 变量声明

// 指定变量类型，如果没有初始化，则变量默认为零值
func main() {
   
    var a, b int = 252, 8624579
		a, b = b, a
		fmt.Println(a, b)

		c, d := "double ball", 6854952

		c = "lucky ball"
		fmt.Println(c, d)

		var (  // 这种因式分解关键字的写法一般用于声明全局变量
			a int
			b bool
		)
		fmt.Println("var global ")


		_, numb, strs := numbers()
		fmt.Println("Numbers()" + strs, numb)
}


func numbers()(int, int, string){
	a, b, c := 1, 2, "str"
	return a, b, c
}