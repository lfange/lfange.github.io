import type { HeadConfig } from '@vuepress/core'

const head: HeadConfig[] = [
  ['meta', { name: 'application-name', content: '哓番茄 Lfange Blog!' }],
  [
    'meta',
    { name: 'apple-mobile-web-app-title', content: '哓番茄 Lfange Blog!!' },
  ],
  ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ['link', { rel: 'icon', href: '/images/icons/p.png' }],
  ['meta', { name: 'baidu-site-verification', content: 'code-4j7CtE1noP' }],
  [
    'meta',
    {
      name: 'keywords',
      content: '哓番茄, Lfange Blog!, JavaScript, linux, git',
    },
  ],
  // <meta name="baidu-site-verification" content="code-4j7CtE1noP" />
]

export default head
