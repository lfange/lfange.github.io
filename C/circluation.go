package main

import ("fmt")

func main() {
	// for1()
	// for2()
	// forange1()
	// formap()
	gotofor()
}


// for 循环
func for1() {
	sum := 0
		for i := 0; i <= 10; i++ {
			sum += i
		}
	fmt.Println("For count sum: ", sum)
}

func for2() {
	sum := 1
		for ; sum <= 10;  {
			sum += sum
		}
		// equal to
		// for sum <= 10 {
		// 	sum += sum
		// }
	fmt.Println("for2 ::: ", sum)
	
	// 无限循环的for
	// for {
	// 
	// }
}

// For-each range 循环

func forange1() {
	strings := []string{"google", "niubi"}
	for key, value := range strings {
		fmt.Println(key, value)
	}

	// 另外两种方式
	// for key : = range strings 
	// for _, value := range strings

	numbers := [6]int{1, 2, 3, 5}

	for i, value := range numbers {
		fmt.Println("%d 索引 的值为 %d", i, value, numbers[i])
	}
}


func formap() {
	map1 := make(map[int](float32))
	map1[1] = 1.0
	map1[2] = 2.0
	map1[3] = 3.0

	// 读取key, value
	for key, value := range map1 {
		fmt.Printf("key: %d, value: %f\n",key, value)
	}
}

// goto   类似于 continue
func gotofor() {
	a := 10
	
	LOOP: for a < 20 {
		if a == 15 {
			a += 1
			goto LOOP
		}

		fmt.Printf("a的值为: %d\n", a)
		a++
	}
}