// import { path } from '@vuepress/utils'
import path from 'path'
// const __dirname = getDirname(import.meta.url)
// const path = require('path')
// const setFrontmatter = require('./node_utils/setFrontmatter')
// const getSidebarData = require('./node_utils/getSidebarData')
// const { createPage, deletePage } = require('./node_utils/handlePage')
// const chalk = require('chalk') // 命令行打印美化
// const yaml = require('js-yaml') // yaml转js
const log = console.log
console.log('__dirname', __dirname,);
console.log('__filename->', __filename)
// md容器名
const CARD_LIST = 'cardList'
const CARD_IMG_LIST = 'cardImgList'

log('const path =path', path.resolve('./docs/.vuepress/client.ts'))
// siteConfig base 配置
let base = ''

export const vhope = (options, ctx) => {
  console.log('options, ctx', Object.keys(options), ctx)
  // const { themeConfig, siteConfig } = ctx
  // resolve algolia
  // const isAlgoliaSearch =
  //   themeConfig.algolia ||
  //   Object.keys((siteConfig.locales && themeConfig.locales) || {}).some(
  //     (base) => themeConfig.locales[base].algolia
  //   )
  return {
    name: 'vhope',
    // https://github.com/xugaoyi/vuepress-theme-vdoing
    // https://github.com/vuejs/vuepress
    clientConfigFile: path.resolve('./docs/.vuepress/client.ts'),
    alias () {
      return {
        // '@AlgoliaSearchBox': isAlgoliaSearch
        // '@AlgoliaSearchBox': isAlgoliaSearch
        //   ? path.resolve(__dirname, 'components/AlgoliaSearchBox.vue')
        //   : path.resolve(__dirname, 'noopModule.js'),
      }
    },
    plugins: [],
  }
}
