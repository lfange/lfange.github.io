package common

import (
	"fmt"
	"github.com/spf13/viper"
)

// viper 设置
func InitViper() {
	viper.SetConfigName("application")
	viper.SetConfigType("yml")
	viper.AddConfigPath("./config/")
	err := viper.ReadInConfig()
	if err != nil {
		fmt.Println("viper InitConfig errr" + err.Error())
	}
	fmt.Println("viper InitConfig errr finish")
}