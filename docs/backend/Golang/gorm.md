# gorm

[gorm快速入门](https://gorm.io/zh_CN/docs/index.html#%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8)

## 数据库连接

[data open](https://gorm.io/zh_CN/docs/connecting_to_the_database.html)

`MySQL` 数据库连接

```javascript
import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
)

func main() {
  // 参考 https://github.com/go-sql-driver/mysql#dsn-data-source-name 获取详情
  dsn := "user:pass@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
}
```

[DSN (Data Source Name)](https://github.com/go-sql-driver/mysql#dsn-data-source-name) 设置

```javascript
username:password@protocol(address)/dbname?param=value
```

## 参数处理

[params](http://www.codebaoku.com/gin/gin-parameter.html)


- 设置默认值

```javascript
Name string `gorm:"default:galeone"`
```
