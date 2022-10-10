package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"lfange.com/hello/common"
	"lfange.com/hello/dto"
	"lfange.com/hello/model"
	"lfange.com/hello/response"
	"math/rand"
	"net/http"
	"time"
)

func Register(ctx *gin.Context) {
	DB := common.GetDB()
	//获取参数
	name := ctx.PostForm("name")
	mobile := ctx.PostForm("mobile")
	password := ctx.PostForm("password")
	code := ctx.PostForm("code")
	//数据验证
	if len(mobile) != 11 {
		response.Response(ctx, http.StatusUnprocessableEntity, 200, nil, "手机号必须为11位")
		return
	}
	fmt.Println("DBBBBB", DB)

	//创建用户
	hasedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	fmt.Println("bcryptbcrypt===", hasedPassword, "err", err)
	if err != nil {
		response.Response(ctx, http.StatusInternalServerError, 500, nil, "加密错误")
		return
	}
	newUser := model.User{
		Name:       name,
		Mobile:     mobile,
		Password:   string(hasedPassword),
		InviteCode: code,
	}
	if err := DB.Create(&newUser).Error; err != nil {
		fmt.Println("500----------", err)
		response.Response(ctx, http.StatusInternalServerError, 500, nil, err.Error())
		return
	}
	//返回结果

	response.Success(ctx, nil, "注册成功")
}

// 创建用户邀请码
func Invite(ctx *gin.Context) {
	udata, _ := ctx.Get("user")
	dto := dto.ToUserDto(udata.(model.User))
	DB := common.GetDB()

	var inviteCodes []model.InviteCode
	DB.Where("userid = ?", dto.ID).Find(&inviteCodes)

	if len(inviteCodes) < 5 {
		code := RandomString(5)
		newCode := model.InviteCode{
			Userid: dto.ID,
			Code:   code,
			Status: 0,
		}
		if err := DB.Create(&newCode).Error; err != nil {
			response.Response(ctx, http.StatusInternalServerError, 500, nil, err.Error())
			return
		}
		response.Response(ctx, http.StatusOK, 6000, gin.H{"inviteCode": code}, "邀请码生成成功")
	} else {
		response.Response(ctx, http.StatusOK, 60001, nil, "每个人只可以拥有5个邀请码")
		return
	}
}

// 生成随机10个字符
func RandomString(n int) string {
	var letters = []byte("123456789qwertyupkjhgfdsazxcvbnmMNBVCXZASDFGHJKPOUYTREWQ")
	result := make([]byte, n)
	rand.Seed(time.Now().Unix())
	for i := range result {
		result[i] = letters[rand.Intn(len(letters))]
	}
	return string(result)
}
