---
icon: article
category:
  - JavaScript

tag:
  - Interview
---

# 并行任务处理函数

```js
/**
 *
 * @param {*} tasks
 * @param {*} parallelCount
 * @returns
 */

function paralleTask(tasks, parallelCount = 2) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      resolve()
      return
    }

    let nextIndex = 0,
      finishCount = 0
    function _run() {
      console.log(`output->nextIndex`, nextIndex)
      const task = tasks[nextIndex]
      nextIndex++

      task
        .then((res) => {
          console.log(`output->res`, res)
          finishCount++
          if (nextIndex < tasks.length) {
            _run()
          } else if (finishCount === tasks.length) {
            resolve()
          }
        })
        .catch((err) => {
          reject(err)
        })
    }

    for (let i = 0; i < tasks.length && i < parallelCount; i++) {
      console.log(`output->iiiiiiiii`, i)
      _run()
    }
  })
}
```
