import type { HeadConfig } from '@vuepress/core'

const head: HeadConfig[] = [

  ['meta', { name: 'application-name', content: 'lfange blog!!' }],
  ['meta', { name: 'apple-mobile-web-app-title', content: 'VuePress lfange blog!!' }],
  ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ['link', { rel: 'icon', href: '/study.png' }]
]

export default head
