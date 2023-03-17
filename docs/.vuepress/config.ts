import { defineUserConfig } from 'vuepress'

import path from 'path'
// import { getDirname, path } from '@vuepress/utils'
import theme from './configs/themeConfig'
// import { fooTheme } from './mytheme'
import Plugins from './configs/plugins'
import head from './configs/head'
// const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
  lang: 'zh-CN',
  title: '哓番茄',
  description: '个人学习笔记',
  port: 6868,
  base: '/',
  head,
  theme,
  alias: {
    '@theme/Home.vue': path.resolve(__dirname, './components/MyHome.vue'),
    '@theme/HomeHero.vue': path.resolve(
      __dirname,
      './components/MyHomeHero.vue'
    ),
  },
  // theme: fooTheme,
  ...Plugins,
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
