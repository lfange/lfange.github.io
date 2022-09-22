import { defineUserConfig } from 'vuepress'
import theme from './configs/themeConfig'
import Plugins from './configs/plugins'
import head from './configs/head'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'fange`s Blog Home！',
  description: '个人学习笔记',
  port: 6868,
  base: '/daydayup/',
  head,
  theme,
  ...Plugins
})