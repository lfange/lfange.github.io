package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"lfange.com/hello/common"
	"lfange.com/hello/model"
	"lfange.com/hello/response"
	"net/http"
	"strconv"
	_ "strconv"
)

func UController(ctx *gin.Context) {
	db := common.GetDB()
	if db == nil {
		response.Response(ctx, http.StatusOK, 200, nil, "DB有问题")
	}
	//获取参数
	name := ctx.DefaultPostForm("name", "unkown")
	job := ctx.PostForm("job")
	meber := model.Meber{
		Name: name,
		Job:  job,
	}

	if err := db.Create(&meber).Error; err != nil {
		response.Response(ctx, http.StatusInternalServerError, 500, nil, err.Error())
		return
	}
	var form model.Meber
	if ctx.ShouldBind(&form) == nil {
		fmt.Println("fro", form.Name)
		response.Success(ctx,
			gin.H{
				"form": form,
			}, "成功了啊")

	}
}

//func PostSholudB(c *gin.Context) {
//	db := common.GetDB()
//
//
//}

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
	job := c.Query("job")
	println("name", name)
	if job == "" {
		println("job is null")
	}

	println("job", job)
	var mebers []model.Meber
	//results := db.Where(model.Meber{Name: name}).Find(&model.Meber{})
	results := db.Where("name = ? and job = ?", name, job).Find(&mebers)
	response.Success(c, gin.H{"result": results.Value }, "success!!!")
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

// 更新数据
func Update(c *gin.Context) {
	db := common.GetDB()
	var meber model.Meber
	keyid, _ := strconv.Atoi(c.Params.ByName("id"))
	if db.First(&meber, keyid).RecordNotFound() {
		response.Fail(c, "该数据没有", nil)
		return
	}
	println("CreateTagRequest", c.PostForm("name"))
	if err := db.Model(&meber).Where("id = ?", keyid).Update(&model.Meber{
		Name: c.PostForm("name"),
		Job:  c.PostForm("job"),
	}).Error; err != nil {
		response.Response(c, http.StatusInternalServerError, 500, nil, err.Error())
		return
	}
	response.Success(c, gin.H{"par": c.Params}, "kkkkk")
}

func Delete(c *gin.Context) {
	db := common.GetDB()

	id, _ := strconv.Atoi(c.Params.ByName("id"))

	if err := db.Delete(model.Meber{}, id).Error; err != nil {
		response.Fail(c, "删除失败", nil)
		return
	}
	response.Success(c, nil, "success")
}
