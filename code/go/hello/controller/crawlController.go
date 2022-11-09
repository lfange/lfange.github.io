package controller

import (
	"github.com/gin-gonic/gin"
	"lfange.com/hello/response"
	"lfange.com/hello/serve"
)

func CrawController(c *gin.Context)  {
	list := serve.CrawServe

	//Println(dbList)
	response.Success(c, gin.H{"results": list}, "db first")
}