import { navbar } from 'vuepress-theme-hope'

export const zhNavbarConfig = navbar([
  '/',
  // { text: "案例", icon: "discover", link: "/zh/demo/" },
  // {
  //   text: "指南",
  //   icon: "creative",
  //   prefix: "/zh/guide/",
  //   children: [
  //     {
  //       text: "Bar",
  //       icon: "creative",
  //       prefix: "bar/",
  //       children: ["baz", { text: "...", icon: "more", link: "" }],
  //     },
  //     {
  //       text: "Foo",
  //       icon: "config",
  //       prefix: "foo/",
  //       children: ["ray", { text: "...", icon: "more", link: "" }],
  //     },
  //   ],
  // },
  // {
  //   text: 'V2 文档',
  //   icon: 'note',
  //   link: 'https://theme-hope.vuejs.press/zh/',
  // },
  {
    text: 'Interest',
    icon: 'discover',
    link: '/eng/',
  },
  {
    text: '算法',
    icon: 'creative',
    link: '/algorithms/',
  },
  {
    text: '计算机',
    icon: 'note',
    link: '/computer/',
    children: [
      // '/computer/os/README.md',
      '/computer/net/network-architecture',
      '/computer/os',
      // '/computer/pocc/README.md',
    ],
  },
  {
    text: '前端',
    icon: 'ability',
    link: '/Front/',
    // children: [
    //   {
    //     text: 'Vue Base',
    //     link: '/Front/vue/basic/vuebase',
    //   },
    //   {
    //     text: 'Vue advanced',
    //     link: '/Front/vue/advanced/vuecli',
    //     // children: [
    //     //   '/Front/vue/README.md',
    //     //   '/Front/vue/VueScoped.md'
    //     // ]
    //   },
    //   {
    //     text: 'Vue3',
    //     link: '/Front/Vue3/basic',
    //   },
    //   {
    //     text: 'JavaScript',
    //     link: '/Front/JavaScript/currie',
    //   },
    //   {
    //     text: 'TypeScript',
    //     link: '/Front/ts/',
    //   },
    //   {
    //     text: '浏览器',
    //     link: '/Front/browser/README.md',
    //   },
    //   {
    //     text: '性能优化',
    //     link: '/Front/performance/README.md',
    //   },
    // ],
  },
  {
    text: '后端',
    icon: 'engine',
    link: '/backend/',
    children: ['/backend/Golang/README.md'],
  },
  {
    text: '服务',
    link: '/serve/',
    children: ['/serve/linux/README.md', '/serve/ngnix.md', '/serve/frps.md'],
  },
  // {
  //   text: 'web3',
  //   link: '/web3/',
  // },
  {
    text: '工具',
    icon: 'launch',
    link: '/tools/',
  },
])
