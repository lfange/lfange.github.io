package controller

import (
	"github.com/gin-gonic/gin"
	"lfange.com/hello/model"
	"lfange.com/hello/response"
	"lfange.com/hello/serve"
)

type dbMap struct {
}

func dbController(ctx *gin.Context) {
	var dbList []model.DbModelPo
	println("DbServe", serve.DbServe)
	//Println(dbList)
	response.Success(ctx, gin.H{"results": dbList}, "db first")
}
