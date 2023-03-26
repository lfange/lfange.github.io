// import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import MyPlugin from './Myplugin'
// import viteImagemin from 'vite-plugin-imagemin'

// console.log('viteImagemin', viteImagemin.toString())

const plugins = [
  // backToTopPlugin(),
  ['vuepress-plugin-auto-sidebar', {}],
  MyPlugin({
    id: 'source',
  }),
  // viteImagemin({
  //   verbose: true,
  //   gifsicle: {
  //     optimizationLevel: 7,
  //     interlaced: false,
  //   },
  //   optipng: {
  //     optimizationLevel: 7,
  //   },
  //   mozjpeg: {
  //     quality: 20,
  //   },
  //   pngquant: {
  //     quality: [0.8, 0.9],
  //     speed: 4,
  //   },
  //   svgo: {
  //     plugins: [
  //       {
  //         name: 'removeViewBox',
  //       },
  //       {
  //         name: 'removeEmptyAttrs',
  //         active: false,
  //       },
  //     ],
  //   },
  // }),
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
