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

	meberRoutes := r.Group("/v1/meber")

	meberRoutes.POST("", controller.UController)
	meberRoutes.GET("/UList", controller.UList)
	meberRoutes.GET("/:id", controller.GetMeberId)
	meberRoutes.GET("/GetUrl", controller.GetUrl)

	return r
}
