import { defineUserConfig } from 'vuepress'
import theme from './configs/themeConfig'
// import { fooTheme } from './mytheme'
import Plugins from './configs/plugins'
import head from './configs/head'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '哓番茄',
  description: '个人学习笔记',
  port: 6868,
  base: '/',
  head,
  theme,
  // theme: fooTheme,
  ...Plugins,
})
