

// vue path render
const Vue2Base = (name: string): string => {
  return `/Front/Vue/${name}.md`
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
  "/guide/": [
    {
      text: "guide111",
      children: [ '/guide/01test.md', '/guide/02test.md'],
    },
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
    }
  ],
  '/computer/': [
    {
      text: '计算机相关',
      children: ["/computer/README.md", "/computer/network-architecture.md"],
    }
  ]
};

export default sidebar;
