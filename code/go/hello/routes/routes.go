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
	meberRoutes.PUT("/:id", controller.Update)
	meberRoutes.DELETE("/:id", controller.Delete)

	//r.GET('/db', )
	// dbolue select
	dbolue := r.Group("/v1")
	dbolue.GET("/list", controller.DbController)

	craw := r.Group("/v1/")
	craw.GET("/craw", controller.CrawController)

	camunda := r.Group("/camunda")
	camunda.GET("/exteral", controller.ExteralController)

	return r
}
