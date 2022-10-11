package controller

import (
	"github.com/gin-gonic/gin"
	"lfange.com/hello/common"
	"lfange.com/hello/model"
	"lfange.com/hello/response"
	"net/http"
)

func UController(ctx *gin.Context) {
	db := common.GetDB()
	if db == nil {
		response.Response(ctx, http.StatusOK, 200, nil, "DB有问题")
	}
	//获取参数
	name := ctx.PostForm("name")
	job := ctx.PostForm("job")

	meber := model.Meber{
		Name: name,
		Job:  job,
	}

	if err := db.Create(&meber).Error; err != nil {
		response.Response(ctx, http.StatusInternalServerError, 500, nil, err.Error())
		return
	}
	response.Success(ctx, nil, "成功了啊")
}

func UList(ctx *gin.Context) {
	var mebers []model.Meber
	db := common.GetDB()
	db.Find(&mebers)
	results := db.Find(&mebers)

	response.Success(ctx, gin.H{"results": results}, "okkkk")
}

func GetMeberId(c *gin.Context) {

	//var meber model.Meber
	//Println("&meber", &meber)
	//// 将request的body中的数据，自动按照json格式解析到结构体
	//if err := c.ShouldBindJSON(&meber); err != nil {
	//	// 返回错误信息
	//	// gin.H封装了生成json数据的工具
	//	response.Response(c, http.StatusInternalServerError, 500, nil, err.Error())
	//	return
	//}

	db := common.GetDB()

	results := db.Model(model.Meber{
		Name: "fange",
	})

	response.Success(c, gin.H{"results": results}, "okkkk")
}
