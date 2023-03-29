import { defineUserConfig } from 'vuepress'
import theme from './theme'

export default defineUserConfig({
  base: '/',
  head: [
    ['meta', { name: 'application-name', content: '哓番茄 Lfange Blog!' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-title', content: '哓番茄 Lfange Blog!!' },
    ],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    ['link', { rel: 'icon', href: '/images/icons/p.png' }],
    ['meta', { name: 'baidu-site-verification', content: 'code-4j7CtE1noP' }],
    [
      'meta',
      {
        name: 'keywords',
        content: '哓番茄, Lfange Blog!, JavaScript, linux, git',
      },
    ],
    // ['meta', { name: 'baidu-site-verification', content: '4H7tszevS8' }],
    // ['meta', { name: 'baidu-site-verification', content: 'nGf5yi0Gec' }],
    [
      'link',
      {
        rel: 'mask-icon',
        href: '/assets/safari-pinned-tab.svg',
        color: '#5c92d1',
      },
    ],
  ],
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '哓番茄',
      description: '个人博客，记录',
    },
    '/en/': {
      lang: 'en-US',
      title: 'lfange',
      description: 'description about me!',
    },
  },
  theme,

  // Enable it with pwa
  shouldPrefetch: false,
})
