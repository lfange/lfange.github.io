package main

import ("fmt")

type Phone interface {
	call()
}

type NokiaPhone struct {

}

func (nokiaPhone NokiaPhone) call() {
	fmt.Println("I am Nokia, I can call you!!!")
}

type IPhone struct {

}

func (iPhone IPhone) call() {
	fmt.Println("I am iPhone, I can call you!!!")
}

func main() {
	var phone Phone
	
	phone = new(NokiaPhone)
	phone.call() // I am Nokia, I can call you!!!

	phone = new(IPhone) 
	phone.call() // I am iPhone, I can call you!!!
}
