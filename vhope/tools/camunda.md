---
icon: tool
title: Camunda
category:
  - 流程引擎
tags:
  - Camunda
---

## 发布流程

完成流程设计后，需要发布流程  
 [官网教程](https://docs.camunda.org/get-started/quick-start/deploy/)
[知乎](https://zhuanlan.zhihu.com/p/375908620)  
 [create Api](https://docs.camunda.org/manual/7.17/reference/rest/deployment/post-deployment/)

```javascript
 http://localhost:8080/engine-rest/deployment/create
```

### Parameters Request Body

xml 是 bpmn 文件，发布流程需要传送文件的文件流数据

```javascript
const dpm = new FormData()
dpm.append('deployment-name', 'payment')
dpm.append('deployment-source', 'Camunda Modeler')
dpm.append('enable-duplicate-filtering', true)
dpm.append(
  'Content-Disposition: form-data;name="payment.bpmn";filename="payment.bpmn";Content-Type: text/xml',
  new Blob([xml])
)
```

## 开始流程

请求接口

```javascript
http://localhost:8080/engine-rest/process-definition/key/${ID}/start
```

请求头设置 `Content-Type` = `application/json`

请求参数

```javascript
{
  "variables": {
    "amount": {
      "value":555,
      "type":"integer"
    },
    "item": {
      "value": "item-xyz"
    }
  }
}
```

## process-instance

### Activity Instance

> 通过 id 检索给定流程实例的活动实例（树 [API](https://docs.camunda.org/manual/7.17/reference/rest/process-instance/get-activity-instances/)

```javascript
/process-instance/dcb58801-34c1-11ed-8348-00d8617d5d1d/activity-instances
```

### form-variables

> [form-variables](https://docs.camunda.org/manual/7.17/reference/rest/task/get-form-variables/)
> 检索任务的表单项，如果定义了表单，则返回表单项内容

```javascript
// GET
/task/{id}/form-variables
```

## UserTask

[submit-form Api](https://docs.camunda.org/manual/7.17/reference/rest/task/post-submit-form/)

```javascript
// API
http://localhost:8080/engine-rest/task/0e9396b2-34bd-11ed-b695-00d8617d5d1d/submit-form

// Parameters:
{
    "variables": {
        "amount": {
            "value": 9568751
        },
        "item": {
            "value": "item"
        },
        "approved": {
            "value": true
        }
    }
}
```

## Service Tasks

Service Tasks 触发有[几种方法](https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/service-task/)，以下是使用 External Tasks 触发.

External Tasks 可以选择[`java`或`NodeJs`](https://docs.camunda.org/get-started/quick-start/service-task/)编写外部任务，每当走到 Service Task，都会触发外部任务

![workerId](./externalTask.jpg)  
上图是一个触发 Service Task 的流程实例，当前节点是在 Service Task 处

[node task Worker](https://docs.camunda.org/get-started/quick-start/service-task/)

### Implement an external task worker

```javascript
const { Client, logger } = require('camunda-external-task-client-js')
const open = require('open')
var fs = require('fs') // 引入fs模块

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = {
  baseUrl: 'http://localhost:8080/engine-rest',
  use: logger,
  asyncResponseTimeout: 10000,
}

// create a Client instance with custom configuration
const client = new Client(config)

// susbscribe to the topic: 'charge0914'
client.subscribe('charge0914', async function ({ task, taskService }) {
  // Put your business logic here

  // Get a process variable
  const amount = task.variables.get('amount')
  const item = task.variables.get('item')

  console.log(
    `Charging credit card with an amount of ${amount}€ for the item '${item}'...`
  )

  fs.writeFile(
    './taskService.txt',
    JSON.stringify(task),
    { flag: 'a' },
    function (err) {
      if (err) {
        throw err
      }
      // 写入成功后读取测试
      // fs.readFile('./taskService.txt', 'utf-8', function(err, data) {
      //     if (err) {
      //         throw err;
      //     }
      //     console.log(data);
      // });
    }
  )
  open('https://docs.camunda.org/get-started/quick-start/success')

  // Complete the task
  await taskService.complete(task)
})
```

### 通过 `complete` 可以完成该流程任务

[complete Api](https://docs.camunda.org/manual/7.17/reference/rest/external-task/post-complete/)  
示例所需要的参数对应上图

```javascript
// API 接口
http://localhost:8080/engine-rest/external-task/{externalTaskid}/complete

// Request Body
{
  "workerId": ${workerId}
}
```

::: tip Worker Id 为空
![WorkId Empty](./emptyworkId.jpg)
在使用时，我发现当 `externalTask`没有开启脚本的时候`WorkerId`有为空的情况， `node ./xx.js`运行脚本就没有问题了。
:::

## reference

[Camunda Rest Api](https://docs.camunda.org/manual/7.17/reference/rest/overview/)
