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

func getUController(ctx *gin.Context) {

}
