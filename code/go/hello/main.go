package main

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"lfange.com/hello/config"
	"lfange.com/hello/routes"
	"net/http"
)

func main() {
	InitConfig() //初始化配置
	//db := common.InitDB()
	//defer db.Close()
	InitGin() //初始化Gin框架并启动
}

func InitGin() {
	r := gin.Default()
	//r
	r = routes.CollectRoutes(r)
	r.StaticFS("/png", http.Dir("./App.png"))
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "hello World!")
	})
	r.Run(":8000")
}

func InitConfig() {
	config.InitLogger()
	viper.SetConfigName("application")
	viper.SetConfigType("yml")
	viper.AddConfigPath("./config/")
	err := viper.ReadInConfig()
	if err != nil {
		panic("" + err.Error())
	}
}
