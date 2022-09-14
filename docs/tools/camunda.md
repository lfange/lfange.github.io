# Camunda

## 发布流程
  完成流程设计后，需要发布流程  
  [官网教程](https://docs.camunda.org/get-started/quick-start/deploy/)  
  [create Api](https://docs.camunda.org/manual/7.17/reference/rest/deployment/post-deployment/)

```javascript
 http://localhost:8080/engine-rest/deployment/create
```

### Parameters Request Body

xml是bpmn文件，发布流程需要传送文件的文件流数据
```javascript
const dpm = new FormData();
dpm.append("deployment-name", "payment");
dpm.append("deployment-source", "Camunda Modeler");
dpm.append("enable-duplicate-filtering", true);
dpm.append(
  'Content-Disposition: form-data;name="payment.bpmn";filename="payment.bpmn";Content-Type: text/xml',
  new Blob([xml])
);
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

## Service Tasks
  
  Service Tasks 触发有几种方法，以下是介绍通过 External Tasks来触发.

![workerId](./externalTask.jpg)

上图是一个触发Service Task的流程实例，当前节点是在Service Task处，通过 `complete` 可以完成该流程任务


示例所需要的参数对应上图

```javascript
// API 接口
http://localhost:8080/engine-rest/external-task/{externalTaskid}/complete

// Request Body
{
  "workerId": ${workerId}
}

````

## reference 

[Camunda Rest Api](https://docs.camunda.org/manual/7.17/reference/rest/overview/)