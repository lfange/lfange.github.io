package main

import (
	"fmt"
	"time"
)

func main()  {

	// go say("hello")
	// 	 say("world")
	channe()
}


// Go 允许使用 go 语句开启一个新的运行期线程， 即 goroutine，以一个不同的、新创建的 goroutine 来执行一个函数。 同一个程序中的所有 goroutine 共享同一个地址空间。
func say(s string)  {
		for i := 0; i < 5; i++ {
			time.Sleep(100 * time.Millisecond)
			fmt.Println(s)
		}
}

func sum( s []int, c chan int)  {
	fmt.Println("s:", s)
	sum := 0
	for _, v := range s {
		sum += v
	}
	c <- sum
}

// channel 通道
func channe() {
	s := []int{7, 3, 4, 6, 8, 9}
	
	c := make(chan int)

	go sum(s[:len(s) / 2], c)
	go sum(s[2:5], c)

	x, y := <-c, <-c

	fmt.Println(x, y, x+y)
}


