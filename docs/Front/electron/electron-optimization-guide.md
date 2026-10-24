# Electron 打包优化指南

> 解决 app.asar 文件过大（1.5G+）和打包速度慢的问题

---

## 目录

1. [问题分析](#问题分析)
2. [包体积优化](#包体积优化)
3. [打包速度优化](#打包速度优化)
4. [实际案例](#实际案例)
5. [最佳实践](#最佳实践)

---

## 问题分析

### 为什么 app.asar 会这么大？

常见原因：

1. **node_modules 包含了所有依赖**（开发依赖 + 生产依赖）
2. **源代码未压缩**（包含源地图、注释、未使用的代码）
3. **大型资源文件未优化**（图片、字体、视频）
4. **原生模块包含完整的编译工具链**
5. **重复文件**
6. **包含测试文件和文档**

### 为什么打包这么慢？

1. **文件数量太多**（node_modules 几万+文件）
2. **压缩算法效率低**
3. **没有利用缓存**
4. **重复执行不必要的步骤**

---

## 包体积优化

### 1. 分析包体积

首先分析是什么占用了空间：

```bash
# 安装分析工具
npm install -g @electron/unpack

# 解压 asar 文件
npx @electron/unpack app.asar unpacked

# 分析大小
cd unpacked
du -sh * | sort -rh
```

或者使用专门的分析工具：

```bash
# 使用 webpack-bundle-analyzer（如果用 webpack）
npm install --save-dev webpack-bundle-analyzer

# 使用 source-map-explorer
npm install -g source-map-explorer
source-map-explorer main.js
```

### 2. 优化 package.json

只保留生产依赖：

```json
{
  "dependencies": {
    // 只保留运行时必需的
    "electron-log": "^4.4.8",
    "electron-updater": "^6.1.1"
  },
  "devDependencies": {
    // 所有开发相关的放在这里
    "webpack": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 3. electron-builder 配置优化

```json
{
  "build": {
    "appId": "com.yourapp.id",
    "productName": "YourApp",
    
    // 只包含必要的文件
    "files": [
      "dist/**/*",
      "package.json"
    ],
    
    // 明确排除不需要的文件
    "files": [
      "dist/**/*",
      "package.json",
      "!**/*.ts",              // 排除 TypeScript 源文件
      "!**/*.map",             // 排除 source map
      "!**/test/**",           // 排除测试文件
      "!**/tests/**",
      "!**/__tests__/**",
      "!**/*.test.js",
      "!**/*.spec.js",
      "!**/docs/**",           // 排除文档
      "!**/README*",
      "!**/LICENSE*",
      "!**/CHANGELOG*",
      "!**/.git/**",
      "!**/node_modules/**/test/**",
      "!**/node_modules/**/tests/**"
    ],
    
    // 启用 asar 压缩
    "asar": true,
    
    // 压缩级别优化
    "compression": "maximum",  // 'store' | 'normal' | 'maximum'
    
    // 文件过滤（更精细的控制）
    "fileAssociations": {
      // ...
    },
    
    // 排除原生模块中不需要的架构
    "asarUnpack": [
      // 只保留当前平台需要的
      "node_modules/some-package/build/Release/**"
    ],
    
    // macOS 优化
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": ["arm64", "x64"]
        }
      ],
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "minimize": true  // 最小化
    },
    
    // Windows 优化
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    
    // Linux 优化
    "linux": {
      "target": ["AppImage"]
    },
    
    // 移除未使用的语言包
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    
    // npm 依赖优化
    "npmRebuild": true,
    "npmArgs": ["--production"]  // 只安装生产依赖
  }
}
```

### 4. 使用 webpack/vite 打包源代码

把 main 和 renderer 进程代码打包成单文件：

#### webpack 配置示例

```javascript
// webpack.main.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'electron-main',
  entry: './src/main/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'index.js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // 删除 console
            drop_debugger: true,
          },
          format: {
            comments: false,  // 删除注释
          },
        },
        extractComments: false,
      }),
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    // 保留不需要打包的原生模块
    'some-native-module': 'commonjs some-native-module',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
```

```javascript
// webpack.renderer.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'electron-renderer',
  entry: './src/renderer/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb 以下内联
          },
        },
        generator: {
          filename: 'images/[name].[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
  ],
};
```

#### vite 配置示例

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 5. 优化 node_modules

#### 使用 packageManager 锁定版本

```json
{
  "packageManager": "pnpm@8.0.0",  // pnpm 更节省空间
  "resolutions": {
    // 统一依赖版本
    "lodash": "^4.17.21"
  }
}
```

#### npm prune 删除开发依赖

```bash
# 只保留生产依赖
npm ci --only=production
# 或者
npm install --production
```

#### 使用更小的替代方案

| 大型依赖 | 更轻量的替代 | 体积减少 |
|---------|-----------|---------|
| lodash | lodash-es + tree-shaking 或 lodash.get 等单独包 | 90%+ |
| moment.js | dayjs / date-fns | 80%+ |
| jQuery | 原生 API 或 cash-dom | 90%+ |
| axios | fetch API 或 redaxios | 70%+ |

示例：

```javascript
// 不好 - 导入整个 lodash
import _ from 'lodash';

// 好 - 只导入需要的
import get from 'lodash.get';

// 更好 - 原生实现
const get = (obj, path, defaultValue) => {
  // 简单实现
};
```

### 6. 优化资源文件

#### 图片优化

```javascript
// 使用 imagemin 自动压缩
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

async function optimizeImages() {
  await imagemin(['src/assets/images/*.{jpg,png}'], {
    destination: 'dist/images',
    plugins: [
      imageminMozjpeg({ quality: 75 }),
      imageminPngquant({ quality: [0.6, 0.8] }),
    ],
  });
}
```

#### 使用现代图片格式

```html
<!-- 优先使用 WebP，回退到 PNG -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="Description">
</picture>
```

#### 字体优化

- 只包含需要的字重
- 字体子集化（只包含使用的字符）
- 使用 WOFF2 格式

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### 7. Tree Shaking 配置

确保启用 tree shaking：

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: true,
  },
};
```

在 package.json 中声明：

```json
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

### 8. 动态加载 / Code Splitting

```javascript
// 不好 - 一次性加载所有模块
import * as utils from './utils';
import * as modals from './modals';

// 好 - 按需加载
const heavyModule = await import('./heavy-module');
```

React 示例：

```javascript
// 路由级别的代码分割
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/Home'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 打包速度优化

### 1. 利用缓存

#### electron-builder 缓存

```json
{
  "build": {
    "cache": "~/.electron-build-cache"
  }
}
```

#### webpack 缓存

```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};
```

### 2. 优化压缩设置

```json
{
  "build": {
    // 开发时用 'store' 速度快
    "compression": "store",
    
    // 或者只在生产环境用 maximum
    "compression": "${env.NODE_ENV === 'production' ? 'maximum' : 'store'}"
  }
}
```

### 3. 并行构建

```bash
# 使用并发加速
npm install -g concurrently

concurrently "npm run build:main" "npm run build:renderer"
```

### 4. 增量构建

```javascript
// 使用 webpack 的 watch 模式
webpack --watch

// 或者开发时只打包当前平台
electron-builder --dir --mac --x64
```

### 5. 只构建必要的平台

```json
{
  "build": {
    "mac": {
      "target": {
        "target": "dmg",
        "arch": ["arm64"]  // 只构建 ARM64，不是 x64 + arm64
      }
    },
    "win": {
      "target": {
        "target": "nsis",
        "arch": ["x64"]  // 只构建 x64
      }
    }
  }
}
```

### 6. 使用更好的压缩工具

```bash
# 使用 7-Zip 替代默认压缩
# 或使用 pigz（并行 gzip）
npm install --save-dev @electron/asar
```

---

## 实际案例

### 优化前（1.5G）

```
app.asar/
├── node_modules/          1.2G  # 最大元凶
├── src/                   200M
│   ├── assets/            150M  # 未优化的图片
│   ├── main/              20M
│   └── renderer/          30M
├── tests/                 30M
├── docs/                  20M
└── ...
```

### 优化后（~100M）

```
app.asar/
├── node_modules/          50M   # 只保留生产依赖
├── dist/                  30M
│   ├── main.js            2M    # 打包压缩后
│   ├── renderer/          25M   # 代码分割 + tree shaking
│   └── assets/            3M    # 优化后的图片
└── package.json           1K
```

### 完整的优化步骤示例

#### 1. 分析现状

```bash
# 分析项目依赖
npm ls --production > dependencies.txt
npm ls --development > dev-dependencies.txt

# 查看最大的几个包
du -sh node_modules/* | sort -rh | head -20
```

#### 2. 清理

```bash
# 删除 node_modules 重新安装只生产依赖
rm -rf node_modules
npm install --production

# 检查体积
du -sh node_modules
```

#### 3. 配置打包

```json
{
  "build": {
    "asar": true,
    "compression": "maximum",
    "files": [
      "dist/**/*",
      "package.json",
      "!**/*.ts",
      "!**/*.map",
      "!**/test*/**",
      "!**/__test*/**"
    ],
    "npmArgs": ["--production"]
  }
}
```

#### 4. 资源优化脚本

```javascript
// scripts/optimize-assets.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

async function optimize() {
  // 转换图片为 WebP
  await imagemin(['assets/images/*.{jpg,png}'], {
    destination: 'dist/assets/images',
    plugins: [imageminWebp({ quality: 75 })]
  });
  
  console.log('Assets optimized!');
}

optimize();
```

---

## 最佳实践检查清单

### 包体积优化

- [ ] 分析包体积找出占用大户
- [ ] 分离开发依赖和生产依赖
- [ ] 使用 webpack/vite 打包代码
- [ ] 启用 tree shaking
- [ ] 代码分割，按需加载
- [ ] 优化图片和资源文件
- [ ] 用更小的依赖替代
- [ ] 删除测试文件、文档、Source Maps
- [ ] 使用 production 模式
- [ ] 排除不需要的语言包和资源

### 打包速度优化

- [ ] 启用缓存
- [ ] 开发时禁用压缩
- [ ] 只构建需要的平台
- [ ] 使用增量构建
- [ ] 并行执行任务
- [ ] 减少文件数量

---

## 参考工具

### 分析工具

- **[electron-builder 内置分析](https://www.electron.build/)** - 输出详细的打包日志
- **[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)** - webpack 可视化
- **[source-map-explorer](https://github.com/danvk/source-map-explorer)** - source map 分析
- **[Bundlephobia](https://bundlephobia.com/)** - 查看 npm 包大小

### 优化工具

- **[terser](https://terser.org/)** - JavaScript 压缩
- **[imagemin](https://github.com/imagemin/imagemin)** - 图片优化
- **[purgecss](https://purgecss.com/)** - 删除未使用的 CSS
- **[fonttools](https://github.com/fonttools/fonttools)** - 字体子集化

---

## 总结

通过以上优化，通常可以：
- **体积减少 70-90%**：从 1.5G 降到 100-200MB
- **打包速度提升 3-10 倍**：从几分钟降到几十秒

关键是理解你的项目中有什么，删除不需要的，优化需要的！
