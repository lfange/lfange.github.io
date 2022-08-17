import { backToTopPlugin } from '@vuepress/plugin-back-to-top'

const plugins = [
  backToTopPlugin(),
  ['vuepress-plugin-auto-sidebar', {
    
  }]
]

export default (() => plugins) 