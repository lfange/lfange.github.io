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
      '/computer/net/README.md',
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
      },
      {
        text: 'Vue advanced',
        link: '/Front/vue/advanced/vuecli',
        // children: [ 
        //   '/Front/vue/README.md', 
        //   '/Front/vue/VueScoped.md'
        // ]
      },
      { 
        text: "JavaScript",
        link: '/Front/JavaScript/currie'
      },
      {
        text: "Vue3",
        link: '/Front/Vue3/basic',
      }
    ],
  },
];

export default navbar;
