

// vue path render
const Vue2Base = (name: string): string => {
  return `/Front/Vue/${name}.md`
}

const jsBase = (name: string): string => {
  return `/Front/JavaScript/${name}.md`
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
      "sidebarDepth": 1,
      "children": [
        "README.md",
        "currie",
        "防抖节流",
        "callApply",
        "comalgrithms"
      ]
    }
  ],
  '/Front/': [
    {
      text: "Vue",
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
    },
    {
      text: "Vue Cli",
      children: [
        Vue2Base('vuecli/vuecli'),
        Vue2Base('vuecli/Vuewebpack'),
      ]
    },
    {
      text: "Vue Advanced",
      children: [ 
        Vue2Base('README'),
        Vue2Base('advanced/Vuescoped'),
      ]
    },
    {
      text: "JavaScript",
      children: [ 
        jsBase('currie'),
        jsBase('防抖节流'),
        jsBase('callApply'),
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
          comBase('cnet/README'),
          comBase('cnet/network-architecture'),
        ]
      },
        // "/computer/README.md", "/computer/network-architecture.md"],
  ]
};

export default sidebar;
