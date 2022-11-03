package model

import (
	"github.com/jinzhu/gorm"
)

type DbModelPo struct {
	gorm.Model
	red  string
	blue string
}
