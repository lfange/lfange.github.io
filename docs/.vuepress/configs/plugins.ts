// import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import MyPlugin from './Myplugin'

console.log('Myplugin', MyPlugin.name)

const plugins = [
  // backToTopPlugin(),
  ['vuepress-plugin-auto-sidebar', {}],
  MyPlugin({
    id: 'source',
  }),
  // ['@vssue/vuepress-plugin-vssue', {
  //   // 设置平台，而不是 `api`
  //   platform: 'github-v4',
  //   // 其他的 Vssue 配置
  //   owner: 'lfange', // 仓库的拥有者的名称
  //   repo: 'lfange.github.io', // 存储 Issue 和评论的仓库的名称
  //   clientId: 'f1309179924acb97c720', // 刚保存下来的  Client ID
  //   clientSecret: '9642dae529f47a9649217ffec15dca010dc00786 ', //  刚才保存下来的 Client secrets
  //   autoCreateIssue: true
  // }]
]

export default () => plugins
