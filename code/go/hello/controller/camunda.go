package controller

import (
	"fmt"
	camunda_client_go "github.com/citilinkru/camunda-client-go/v3"
	"github.com/citilinkru/camunda-client-go/v3/processor"
	"github.com/gin-gonic/gin"
	"time"
)

var client *camunda_client_go.Client

// 初始化 go camunda Clinet
func InitCamunda() {
	client = camunda_client_go.NewClient(camunda_client_go.ClientOptions{
		EndpointUrl: "http://localhost:8080/engine-rest",
		ApiUser: "demo",
		ApiPassword: "demo",
		Timeout: time.Second * 10,
	})
}

func ExteralController(c *gin.Context)  {
	WorkerId, _ := c.GetQuery("WorkerId")

	fmt.Printf("WorkerId: %s", WorkerId)
	ExternalTask()
}

func ExternalTask()  {
	fmt.Println("vExternalTaskExternalTaskExternalTaskh")
	logger := func(err error) {
		fmt.Println(err.Error())
	}
	asyncResponseTimeout := 5000
	proc := processor.NewProcessor(client, &processor.Options{
		WorkerId: "some-random-id",
		LockDuration: time.Second * 5,
		MaxTasks: 10,
		MaxParallelTaskPerHandler: 100,
		AsyncResponseTimeout: &asyncResponseTimeout,
	}, logger)

	println("proc", proc)

	proc.AddHandler(
		[]*camunda_client_go.QueryFetchAndLockTopic{
			{TopicName: "modelexteral"},
		},
		func(ctx *processor.Context) error {
			fmt.Printf("Running task %s. WorkerId: %s. TopicName: %s\n", ctx.Task.Id, ctx.Task.WorkerId, ctx.Task.TopicName)

			err := ctx.Complete(processor.QueryComplete{
				Variables: &map[string]camunda_client_go.Variable {
					"result": {Value: "Hello world!", Type: "string"},
				},
			})
			if err != nil {
				fmt.Printf("Error set complete task %s: %s\n", ctx.Task.Id, err)

				//return ctx.HandleFailure(processor.QueryHandleFailure{
				//	ErrorMessage: errTxt,
				//	Retries: &retries,
				//	RetryTimeout: &retryTimeout,
				//})
			}

			fmt.Printf("Task %s completed\n", ctx.Task.Id)
			return nil
		},
	)
}