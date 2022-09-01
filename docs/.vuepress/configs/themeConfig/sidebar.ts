

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

const sidebar = {
  '/algorithms/': [
    {
      "text": "ALGORITHMS",
      "title": "ALGORITHMS",
      "collapsable": false,
      // "sidebarDepth": 1,
      "children": [
        "README.md",
        "comalgrithms"
      ]
    }
  ],
  '/Front/Vue/': [
    {
      text: "Vue",
      link: Vue2Base('basic/vuebase'),
      children: [
        Vue2Base('basic/vuebase'),
        Vue2Base('basic/animation'),
        Vue2Base('basic/Vuex'),
        Vue2Base('componet/usage'),
        Vue2Base('basic/communication'),
        Vue2Base('basic/componentRender'),
        Vue2Base('basic/vslot'),
        Vue2Base('basic/VueMock'),
      ]
    }
  ],
  '/Front/Vue/advanced/': [
    {
      text: "Vue advanced",
      link: Vue2Base('advanced/vuecli'),
      children: [
        Vue2Base('advanced/vuecli'),
        Vue2Base('advanced/Vuewebpack'),
        Vue2Base('advanced/Vuescoped'),
      ]
    }
  ],
  '/Front/vue3/': [
    {
      text: "Vue3",
      link: Vue3Base('basic'),
      collapsable: false,
      children: [ 
        Vue3Base('basic'),
        Vue3Base('change'),
      ]
    }
  ],
  '/Front/JavaScript/': [
    {
      text: "JavaScript",
      link: '/Front/JavaScript/currie',
      children: [ 
        jsBase('currie'),
        jsBase('防抖节流'),
        jsBase('callApply'),
        jsBase('brower'),
        jsBase('flatten'),
      ]
    }
  ],
  '/Front/ts/': [
    {
      text: "TypeScript",
      link: '/Front/ts/',
      collapsable: false,
      children: [ 
        TsBase('README'),
        TsBase('baseType'),
      ]
    }
  ],
  '/computer/': [
      { 
        text: '计算机组成原理',
        children: [
          comBase('pocc/README')
        ]
      },
      { 
        text: '操作系统',
        children: [
          comBase('os/README')
        ]
      },
      { 
        text: '计算机网络',
        children: [
          comBase('net/README'),
          comBase('net/network-architecture'),
        ]
      },
        // "/computer/README.md", "/computer/network-architecture.md"],
  ],
  '/tools/': [
    '/tools/',
    '/tools/vuepress/'
    // { 
    //   text: '工具类',
    //   link: '/tools/',
    //   children: [
    //     '/tools/vuepress/',
    //   ],
    // }
  ]
};

export default sidebar;
