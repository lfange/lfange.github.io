package common

import (
	"fmt"
	camunda_client_go "github.com/citilinkru/camunda-client-go/v3"
	"time"
)

var Clinet *camunda_client_go.Client

// 初始化 go camunda Clinet
func InitCamunda()  {
	Clinet = camunda_client_go.NewClient(camunda_client_go.ClientOptions{
		EndpointUrl: "http://localhost:8080/engine-rest",
		ApiUser: "demo",
		ApiPassword: "demo",
		Timeout: time.Second * 10,
	})
}

func ExternalTask()  {
	logger := func(err error) {
		fmt.Println(err.Error())
	}
}