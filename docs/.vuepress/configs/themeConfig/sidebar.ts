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
        "callApply"
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
      text: "Vue基础",
      children: [ 
        '/Front/vue/componentRender/', 
        '/Front/vue/mvvm.md', 
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
