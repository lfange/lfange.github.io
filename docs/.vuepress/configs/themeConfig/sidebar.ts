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
        "防抖节流"
      ]
    }
  ],
  "/guide/": [
    {
      text: "guide111",
      children: [ '/guide/01test.md', '/guide/02test.md'],
    },
  ],
  '/vue/': [
    {
      text: "Vue基础",
      children: [ '/vue/mvvm模式.md', '生命周期.md']
    },
  ]
};

export default sidebar;
