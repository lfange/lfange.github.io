import { defineUserConfig } from 'vuepress'
import theme from './configs/themeConfig'
import Plugins from './configs/plugins'
import head from './configs/head'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Lfange`s Blog ！',
  description: '这是我的第一个 VuePress 站点',
  port: 6868,
  base: '/daydayup/',
  head,
  theme,
  ...Plugins
})