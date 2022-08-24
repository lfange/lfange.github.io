// navbar of headlink
const navbar = [
  {
    text: "算法",
    link: "/algorithms/",
    // children: [
      // '/algorithms/READEME'
    // ],
  },
  { text: "guide", children: ["/guide/01test", "/guide/02test"] },
  {
    text: "计算机",
    link: "/computer/",
  },
  {
    text: "前端",
    link: "/Front/",
    children: [
      {
        text: "Vue Base",
        link: '/Front/vue/basic/vuebase',
        children: [
        //   "/Front/vuebase.md"
        ]
      },
      {
        text: 'Vue Advanced',
        link: '/Front/vue/',
        // children: [ 
        //   '/Front/vue/README.md', 
        //   '/Front/vue/VueScoped.md'
        // ]
      },
      { 
        text: "JavaScript", 
        children: [

        ]
      },
      {
        text: "Vue3",
        children: [
          // { 
          //   text: "Vue", link: "/pages/5d463fbdb172d43b/", 
          //   children: [
          //     '/web/mvvm模式.md'
          //   ] 
          // },
        ],
      },
      {
        text: "vue3",
        link: "/Front/vue/",
        children: [ 
          "/Front/vue3/01.组件渲染", 
          "/Front/vue3/02.组件更新", 
          "/Front/vue3/03.组件更新"
        ],
      }
    ],
  },
];

export default navbar;
