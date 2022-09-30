package main

import (
	"fmt"
)


func main()  {
	// cal()

	if result, errorMsg := Divide(100, 10); errorMsg == "" {
		fmt.Println("errorMsg", errorMsg)
		fmt.Println("100/10 = ", result)
	}

	 // 当除数为零的时候会返回错误信息
	if _, errorMsg := Divide(100, 0); errorMsg != "" {
		fmt.Println("errorMsg is: ", errorMsg)
	}
}

// type error interface {
// 	Error() string
// }

// func Sqrt(f float64) (float64, error) {
// 	if f < 0 {
// 		return 0, error.New("math: square root of negative number")
// 	}
// }


// func cal() {
// 	result, err := Sqrt(-1)
// 	if (err != nil) {
// 		fmt.Println("err", err)
// 	}
// }
// 出口那里有施工车辆升降梯升起施工，为了避让

type DivideError struct {
	dividee int
	divider int
}

func (de *DivideError) Error() string {
	strFormat := `
	Cannot proceed, the divider is zero.
	`
	return fmt.Sprintf(strFormat, de.dividee)
}

func Divide(varDividee int, varDivider int) (result int, errorMsg string) {
	if varDivider == 0 {
		dData := DivideError {
			dividee: varDividee,
			divider: varDivider,
		}

		errorMsg = dData.Error()
		return
	} else {
		return varDividee / varDivider, ""
	}
}
