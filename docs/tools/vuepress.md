# vuepress 集成 ant-design-vue

## 安装 ant-design-vue

```javascript
pnpm add ant-design-vue -D
```

## 修改 client.ts

vuepress2.x 版本修改用于客户端应用增强的 docs/.vuepress/client.ts

修改后文件如下：

```javascript
import { defineClientConfig } from "@vuepress/client";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.use(Antd);
  },
  setup() {},
  rootComponents: [],
});
```

## md 文件使用

接下来就可以像往常一样食用 antd 的组件了

vuepress2.x 使用 vue可见[官网](https://v2.vuepress.vuejs.org/zh/advanced/cookbook/markdown-and-vue-sfc.html)

```vue
<a-button type="primary">Primary Button</a-button>
```

<a-button type="primary">Primary Button</a-button>
