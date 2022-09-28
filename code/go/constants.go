package main

import ("fmt")
import "unsafe"

func main() {
	const WIDTH int = 50
	const HEIGHT int = 50
	var area int
	var a, b, c = 1, false, "string"
	area = WIDTH * HEIGHT

	fmt.Printf("面积: %d", area, "area :", 5 + area)
	fmt.Println(a, b, c)
	
	// emun()

	// constIndex()

	typeTransform()
}

func emun() {
	// 常量可以用len(), cap(), unsafe.Sizeof()函数计算表达式的值。常量表达式中，函数必须是内置函数，否则编译不过：
	const (
		ab = "string"
		aa = len(ab)
		aaa = unsafe.Sizeof(ab)
	)
	fmt.Println("ab emun: ", ab, aa, aaa)
}


func constIndex() {
	// iota 在 const关键字出现时将被重置为 0(const 内部的第一行之前)，const 中每新增一行常量声明将使 iota 计数一次(iota 可理解为 const 语句块中的行索引)。
	// const (
	// 	aa = iota
	// 	bb = iota
	// 	cc = iota
	// )
	// 简写
	const (
		aa = "iota"
		bb = "just"
		cc
	)

	fmt.Println("iota 简写", aa, bb, cc) // iota just just

	// iota 特殊常量
	const (
		a = "22"   //0
		b          //1
		c          //2
		d = "ha"   //独立值，iota += 1
		e          //"ha"   iota += 1
		f = 100    //iota +=1
		g          //100  iota +=1
		h = iota   //7,恢复计数
		i          //8
	)

	fmt.Println("iota 计数索引", a,b,c,d,e,f,g,h,i)
}

// 类型转换
func typeTransform() {
	var a int = 15
	var b int = 7
	var mean float32

	fmt.Printf("mean的值为: %f \n", mean)
	
	mean = float32(a) / float32(b)

	fmt.Printf("mean的值为: %f \n", mean)
	fmt.Println("typeTransform ", float32(a), float32(b))
}