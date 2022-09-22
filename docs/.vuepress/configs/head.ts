import type { HeadConfig } from '@vuepress/core'

const head: HeadConfig[] = [

  ['meta', { name: 'application-name', content: 'Lfange Blog!' }],
  ['meta', { name: 'apple-mobile-web-app-title', content: 'VuePress Lfange Blog!!' }],
  ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ['link', { rel: 'icon', href: '/p.png' }]
]

export default head
