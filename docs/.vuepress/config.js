// import { defineUserConfig } from '@vuepress/cli'
// import defaultTheme from '@vuepress/theme-default'

// console.log('theme', typeof defaultTheme)

// export default defineUserConfig({ 
//   // ...
//   title: 'Lfange Blog!!!',
//   description: 'Just playing around',

  
//   // configure default theme
//   theme: defaultTheme({
//     locales: {
//       nav: [
//         { text: 'Home', link: '/' },
//         { text: 'Guide', link: '/guide/' },
//         { text: 'vue3', link: '/vue3/' },
//       ]
//     }
//   })

// });

module.exports = {
  title: "Lfange",
  description: "headheadheadhead",
  head: [
    ['meta', { name: 'Keywords', content: '小光头的java日记,java笔记,java面试' }],
    ['meta', { name: 'description', content: '小光头的java日记用心分享' }],
    ['link', { rel: 'icon', href: '/assets/img/favicon.ico' }]
  ],
  themeConfig: {
    lastUpdated: 'Last Updated', // string | boolean
  },
  themeConfig: {
    locales: {
      colorMode: 'dark',
      sidebar: 'auto',
      nav: [
        { text: "Home", link: "/" },
        { text: "Guide", link: "/guide/" },
        { text: "vue3", link: "/vue3/" },
      ],
    },
  }
};
