import { defineUserConfig } from 'vuepress'
import theme from './configs/navbar'
import Plugins from './configs/plugins'


export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Lfange Blog ！',
  description: '这是我的第一个 VuePress 站点',
  port: 6868,
  
  theme,
  ...Plugins
})