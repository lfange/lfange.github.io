const path = require('path')
const setFrontmatter = require('./node_utils/setFrontmatter')
const getSidebarData = require('./node_utils/getSidebarData')
const { createPage, deletePage } = require('./node_utils/handlePage')
const chalk = require('chalk') // 命令行打印美化
const yaml = require('js-yaml') // yaml转js
const log = console.log

// md容器名
const CARD_LIST = 'cardList'
const CARD_IMG_LIST = 'cardImgList'

// siteConfig base 配置
let base = ''

module.exports = (options, ctx) => {
  console.log('options, ctx', options, ctx)
  const { sourceDir, themeConfig, siteConfig } = ctx
  // resolve algolia
  const isAlgoliaSearch =
    themeConfig.algolia ||
    Object.keys((siteConfig.locales && themeConfig.locales) || {}).some(
      (base) => themeConfig.locales[base].algolia
    )
  return {
    // https://github.com/xugaoyi/vuepress-theme-vdoing
    // https://github.com/vuejs/vuepress
    alias () {
      return {
        '@AlgoliaSearchBox': isAlgoliaSearch
          ? path.resolve(__dirname, 'components/AlgoliaSearchBox.vue')
          : path.resolve(__dirname, 'noopModule.js'),
      }
    },
    plugins: [],
  }
}
