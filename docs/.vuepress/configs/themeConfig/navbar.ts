// navbar of headlink
const navbar = [
  {
    text: "算法",
    link: "/algorithms/",
  },
  {
    text: "计算机",
    link: "/computer/",
    children: [
      '/computer/os/README.md',
      '/net/README.md',
      '/computer/pocc/README.md',
    ]
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
        link: '/Front/JavaScript/currie',
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
      }
    ],
  },
];

export default navbar;
