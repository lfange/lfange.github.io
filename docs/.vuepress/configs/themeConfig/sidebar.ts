

// vue path render
const frontVuePath = (name: string): string => {
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
        frontVuePath('README'),
        frontVuePath('vuebase'),
        frontVuePath('Vuescoped'),
        frontVuePath('VueMock'),
        frontVuePath('Vuewebpack'),
        frontVuePath('componentRender'),
        '/Front/vue/生命周期.md'
      ]
    },
    {
      text: "Vue原理",
      children: [ 
        '/Front/vue/README.md',
        '/web/VueScoped'
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
