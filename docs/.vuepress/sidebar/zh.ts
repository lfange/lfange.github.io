import { sidebar } from 'vuepress-theme-hope'

// vue path render
const Vue2Base = (name: string): string => {
  return `/Front/Vue/${name}.md`
}

const Vue3Base = (name: string): string => {
  return `/Front/vue3/${name}.md`
}

const jsBase = (name: string): string => {
  return `/Front/JavaScript/${name}.md`
}

const TsBase = (name: string): string => {
  return `/Front/ts/${name}.md`
}

const comBase = (name: string): string => {
  return `/computer/${name}.md`
}

export const zhSidebarConfig = sidebar({
  '/': [
    // {
    //   icon: 'discover',
    //   prefix: '/algorithms/',
    //   link: '/algorithms/',
    //   text: 'ALGORITHMS',
    //   children: ['README.md', 'comalgrithms'],
    // },
    // {
    //   text: "指南",
    //   icon: "lightbulb",
    //   prefix: "guide/",
    //   children: [
    //     "get-started/",
    //     "interface/",
    //     "layout/",
    //     "markdown/",
    //     "feature/",
    //     "blog/",
    //     "advanced/",
    //   ],
    // },
    // {
    //   //
    //   icon: 'discover',
    //   prefix: 'Front/',
    //   text: '前端',
    //   children: [
    //     'Vue/',
    //     {
    //       icon: 'discover',
    //       prefix: 'JavaScript/',
    //       // link: 'JavaScript/',
    //       text: 'JavaScript',
    //       children: [
    //       ],
    //     },
    // ],
    // },
    // {
    //   text: 'computer',
    //   '/computer/': 'structure',
    // },
    // '/backend/',
    // '/tools/',
    // '/serve/',
  ],
  '/algorithms/': 'structure',
  '/Front/': 'structure',
  // '/Front/Vue/': [
  //   Vue2Base('basic/vuebase'),
  //   Vue2Base('basic/animation'),
  //   Vue2Base('basic/Vuex'),
  //   Vue2Base('componet/usage'),
  //   Vue2Base('basic/communication'),
  //   Vue2Base('basic/componentRender'),
  //   Vue2Base('basic/vslot'),
  //   Vue2Base('basic/VueMock'),
  // ],
  // '/Front/Vue/advanced/': [
  //   Vue2Base('advanced/vuecli'),
  //   Vue2Base('advanced/Vuewebpack'),
  //   Vue2Base('advanced/Vuescoped'),
  //   Vue2Base('advanced/VueRouter'),
  // ],
  // '/Front/vue3/': [
  //   Vue3Base('basic'),
  //   Vue3Base('change'),
  //   Vue3Base('vite'),
  //   Vue3Base('tsx'),
  // ],
  // '/Front/JavaScript/': [
  //   jsBase('currie'),
  //   jsBase('防抖节流'),
  //   jsBase('callApply'),
  //   jsBase('brower'),
  //   jsBase('flatten'),
  //   jsBase('module'),
  //   jsBase('print'),
  //   jsBase('rtcpeer'),
  //   jsBase('normal'),
  // ],
  // '/Front/ts/': [TsBase('README'), TsBase('baseType')],
  // '/Front/browser/': ['Front/browser/README.md', 'Front/browser/cache.md'],
  // '/Front/performance/': [
  //   'Front/performance/README.md',
  //   'Front/performance/lighthouse.md',
  // ],
  '/computer/': [
    // {
    //   text: "计算机组成原理",
    //   children: [comBase("pocc/README")],
    // },
    // {
    //   text: "操作系统",
    //   children: [comBase("os/README")],
    // },
    {
      text: '计算机网络',
      icon: 'network',
      children: [
        // comBase("net/README"),
        comBase('net/network-architecture'),
      ],
    },
    // "/computer/README.md", "/computer/network-architecture.md"],
  ],
  '/backend/Golang/': ['/backend/Golang/README.md', '/backend/Golang/Tutorial.md', '/backend/Golang/gorm.md'],
  '/tools/': ['/tools/', '/tools/vuepress/', '/tools/camunda/', '/tools/git/', '/tools/regular', '/tools/GPT'],
  '/serve/': ['/serve/linux.md', '/serve/ngnix.md', '/serve/frps.md'],
  '/interview/': [
    '/interview/READMD.md',
    '/interview/interCode.md',
    // 'interview/task.md',
  ],
  '/eng/': 'structure',
})
