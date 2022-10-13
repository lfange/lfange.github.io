package controller

import (
	"github.com/gin-gonic/gin"
	"lfange.com/hello/common"
	"lfange.com/hello/model"
	"lfange.com/hello/response"
	"net/http"
	_ "strconv"
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
	results := db.Find(&mebers)

	response.Success(ctx, gin.H{"results": results}, "okkkk")
}

// 获取Get参数
func GetUrl(c *gin.Context) {
	db := common.GetDB()
	name := c.DefaultQuery("name", "fanye")

	// UserName := c.DefaultPostForm("username", "unkown")   formdata
	//password := c.PostForm("password")
	job := c.Query("job")
	println("name", name)
	println("job", job)
	var mebers []model.Meber
	//results := db.Where(model.Meber{Name: name}).Find(&model.Meber{})
	results := db.Where( "name = ?", name).Find(&mebers)

	response.Success(c, gin.H{"results": results}, "success!!!")
}

// 获取路径中的参数
func GetMeberId(c *gin.Context) {

	//var meber model.Meber

	//// 将request的body中的数据，自动按照json格式解析到结构体
	//if err := c.ShouldBindJSON(&meber); err != nil {
	//	// 返回错误信息
	//	// gin.H封装了生成json数据的工具
	//	response.Response(c, http.StatusInternalServerError, 500, nil, err.Error())
	//	return
	db := common.GetDB()
	keyid := c.Param("id")
	results := db.First(&model.Meber{}, keyid)
	response.Success(c, gin.H{"results": results}, "okkkk")
}
