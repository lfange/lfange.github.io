# Vue mock usage

本文是基于 vue/cli 3.0 创建的项目进行讲解

首先我们来说一说 vue/cli 3.0 与 2.0 的一些不同：

1.  3.0 移除了 static 文件目录，新增了 public 目录，这个目录下的静态资源不会经过 webpack 的处理，会被直接拷贝，所以我们能够直接访问到该目录下的资源，静态数据（如 json 数据、图片等）需要存放在这里。
    <!-- more -->

    > 放在`public`目录下的静态资源可直接通过(http://localhost:8080/+ 文件名称)来访问，不需要在前面加一个`/public`路径

2.  3.0 移除了 config、build 等配置目录，如果需要进行相关配置我们需要在根目录下创建` vue.config.js` 进行配置。

## 方式一

> 使用 mockjs 插件实现本地 mock 数据

1. 安装`mockjs`插件
   ```sh
   npm i mockjs -D
   ```
2. 在 src 目录下创建一个`mock`文件夹，在`mock`文件夹下创建一个`index.js`和一个`data`文件夹（用于存放项目需要的模拟数据）

   ```
   .
   ├── src
   │   ├── mock
   │   │   └── data
   │   │   │   └──  test.json
   │   │   └── index.js
   .   .
   ```

3. `mock`目录下的`index.js`示例如下：

   ```js
   const Mock = require('mockjs')

   // 格式： Mock.mock( url, 'post'|'get' , 返回的数据)
   Mock.mock('/api/test', 'get', require('./data/test.json'))
   Mock.mock('/api/test2', 'post', require('./data/test2.json'))
   ```

4. 在`main.js`入口文件中引入 mock 数据，不需要时，则注释掉

   ```js
   require('./mock') // 引入mock数据，不需要时，则注释掉
   ```

5. 最后，在 vue 模板中使用即可

   ```js
   axios
     .get('/api/test')
     .then(function (res) {
       console.log(res)
     })
     .catch(function (err) {
       console.log(err)
     })
   ```

## 方式二

> 在 public 文件夹放 mock 数据（无需使用 mockjs 插件）

1. 在`public`文件夹下创建一个`mock`文件夹，用来存放模拟数据的 json 文件

   ```
   .
   ├── public
   │   ├── mock
   │   │   └── test.json
   .   .
   ```

   > 放在`public`目录下的静态资源可直接通过(http://localhost:8080/ + 文件名称)来访问，不需要在前面加一个`/public`路径。

2. 在`vue.config.js`里进行路径配置，如下:

   ```js
   module.exports = {
     devServer: {
       proxy: {
         '/api': {
           // 代理接口
           target: 'http://localhost:8080',
           ws: true, // proxy websockets
           changeOrigin: true, // 是否开启跨域
           pathRewrite: {
             // 路径重写
             '^/api': '/mock',
           },
         },
       },
     },
   }
   ```

   [devServer.proxy 官方文档](https://cli.vuejs.org/zh/config/#devserver-proxy)

3. 最后，在 vue 模板中使用即可

   ```js
   axios
     .get('/api/test.json') // 注意这里需要.json后缀
     .then(function (res) {
       console.log(res)
     })
     .catch(function (err) {
       console.log(err)
     })
   ```

> 这方式貌似不支持`post`请求，有待研究。

## 方式三

> 前端本地启动一个 nodejs 服务，vue 项目向 nodejs 服务请求 mock 数据

1. 创建一个 node 项目（为了方便，本例直接在 vue 项目根目录创建，当然也可以是其它任何地方）

   ```
   ├── 项目根目录
   │   └── serve.js
   ```

2. `serve.js`示例

   ```js
   const http = require('http')
   // url模块用于处理与解析 前端传给后台的URL，适用于get请求（不适用于post请求），详情参见文档
   const urlLib = require('url')

   http
     .createServer(function (req, res) {
       const urlObj = urlLib.parse(req.url, true) // 注意：这里的第二个参数一定要设置为：true, query才能解析为对象形式,可以更加方便地获取key:value
       const url = urlObj.pathname
       const get = urlObj.query
       console.log(url)
       // 模拟的mock数据
       const data = {
         code: 200,
         list: [
           {
             id: '0001',
             name: 'test',
           },
           {
             id: '0002',
             name: 'test2',
           },
         ],
       }

       // console.log(get.user)
       if (url === '/test') {
         // 接口名
         res.write(JSON.stringify(data))
       }
       res.end()
     })
     .listen(9000)
   ```

3. 启动 node 服务

   ```sh
   node serve.js
   ```

4. 配置`vue.config.js`的`proxy`，解决跨域

   ```js
   module.exports = {
     devServer: {
       proxy: {
         '/api': {
           target: 'http://localhost:9000',
           ws: true, // proxy websockets
           changeOrigin: true, // 是否开启跨域
           pathRewrite: {
             // 路径重写
             '^/api': '',
           },
         },
       },
     },
   }
   ```

5. 最后，在 vue 模板中使用即可

   ```js
   axios
     .get('/api/test')
     .then(function (res) {
       console.log(res)
     })
     .catch(function (err) {
       console.log(err)
     })
   ```

## 总结

方式二目前来看只支持 get 方式请求，对于 post 请求还有待研究。方式三虽然也是一种实现方式，但实现起来比较麻烦。个人建议使用方式一，灵活、方便。

## 相关文章

[《Vue CLi3 修改 webpack 配置》](Vuewebpack.md)
