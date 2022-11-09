package controller

import (
	"github.com/gin-gonic/gin"
	"lfange.com/hello/response"
	"lfange.com/hello/serve"
	"strconv"
)

type dbMap struct {
}

func DbController(c *gin.Context) {
	//var dbList []model.DbModelPo
	issueCount, _ := c.GetQuery("issueCount")
	name, _ := c.GetQuery("name")

	iss, _ := strconv.Atoi(issueCount)
	println("period", issueCount, iss)

	list := serve.DbServe(name, iss)

	println("DbServe", list)
	//Println(dbList)
	response.Success(c, gin.H{"results": list}, "db first")
}
