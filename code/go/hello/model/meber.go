package model

import "github.com/jinzhu/gorm"

type Meber struct {
	gorm.Model
	Name string `json:`
	Job string
}