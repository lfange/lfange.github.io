// import { defaultTheme } from '@vuepress/theme-default'
import { vhope } from '../theme/index'
import { defaultTheme } from '@vuepress/theme-default'
import navbar from './themeConfig/navbar'
import sidebar from './themeConfig/sidebar'
// import { hopeTheme } from 'vuepress-theme-hope'

// console.log('defaultTheme', defaultTheme.toString())
// console.log('Mytheme', Mytheme.toString())

const theme = vhope({
  navbar,
  sidebar,

  repo: 'lfange',
  docsDir: 'docs', // 编辑的文件夹
  docsBranch: 'master', // 假如文档放在一个特定的分支下
  editLink: true,
  // 默认为 "Edit this page"
  editLinkText: '帮助我改善此页面！',
  toggleSidebar: 'toggleSidebar',
})

export default theme
