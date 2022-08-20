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
  '/web/': [
    {
      text: "Vue基础",
      children: [ 'componentRender', '/vue/mvvm模式.md', '生命周期.md']
    },
    {
      text: "Vue原理",
      children: [ '/web/VueScoped' ]
    }
  ]
};

export default sidebar;
