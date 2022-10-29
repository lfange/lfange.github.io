package main

import  (
	."fmt"
	"time"
)



func sum(s []int, c chan int) {
	sum := 0
	for _, v := range s {
		sum += v
	}
	time.Sleep(100 * time.Millisecond)
	c <- sum  // 把 sum 发送到通道 c
}


func main()  {
	s := []int{7, 3, 5, -3, 8, -19}
	
	c :=make(chan int)
	Println("111111111")
	go sum(s[:len(s)/2], c)
	Println("======")
	go sum(s[len(s)/2:], c)
	x, y := <-c, <-c // 从通道 c 中接收
	
	Println("v :", x, y, x+y)
	Println("last")
}
