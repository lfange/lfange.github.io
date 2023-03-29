---
icon: article
category:
  - Vite

tags:
  - Quickly Start
  - 前端工程化
---

# Vite

## vue3 + vite env 环境配置

[Vite 环境变量](https://cn.vitejs.dev/guide/env-and-mode.html)

### 新建文件

在项目跟目录建 `.env.development` `.env.production`

```javascript
// .env.development
NODE_ENV = development
VITE_APP_BASE_API = /stage-api
```

### 创建代码提示 env.d.ts

src/types/env.d.ts

```javascript
interface ImportMetaEnv {
  VITE_APP_BASE_API: string;
}
```

### 组件中使用

```javascript
import.meta.env.VITE_APP_BASE_API
```

### vite.config.ts 中使用

```javascript
import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log('command', env) // { VITE_APP_BASE_API: '/stage-api', VITE_USER_NODE_ENV: 'development' }
  return {
    plugins[],
    base: env.VITE_APP_BASE_API
  }
})
```

## Vite 插件开发

[Vite2 插件开发指南](https://zhuanlan.zhihu.com/p/364275970)
[十分钟带你了解 vite 插件开发](https://juejin.cn/post/7067827608842403848)
