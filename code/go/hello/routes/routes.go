package routes

import (
	"github.com/gin-gonic/gin"
	"lfange.com/hello/config"
	"lfange.com/hello/controller"
)

func CollectRoutes(r *gin.Engine) *gin.Engine {
	r.Use(config.LoggerToFile())
	r.POST("/v1/account/register", controller.Register)

	r.GET("/v1/account/invite", controller.Invite) //邀请码生成
	r.POST("/v1/meber", controller.UController)

	r.GET("/v1/meber", controller.UList)
	r.GET("/v1/GetMeberId", controller.GetMeberId)

	return r
}
