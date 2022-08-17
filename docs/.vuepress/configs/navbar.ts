import { defaultTheme } from '@vuepress/theme-default'

const theme = defaultTheme({
    sidebar: "auto",
    navbar: [
      { text: "数据结构与算法", link: "/" },
      { text: "guide", children: [ "/guide/01test", "/guide/02test" ] },
      { text: "vue3", link: "/vue3/", 
        children: [ "/vue3/01.组件渲染", "/vue3/02.组件更新", "/vue3/03.组件更新" ]
      },
      {
        text: '前端',
        link: '/web/', //目录页链接，此处link是vdoing主题新增的配置项，有二级导航时，可以点击一级导航跳到目录页
        children: [
          // 说明：以下所有link的值只是在相应md文件定义的永久链接（不是什么特殊生成的编码）。另外，注意结尾是有斜杠的
          {
            text: '前端文章',
            children: [
              { text: 'JavaScript', link: '/pages/8143cc480faf9a11/' },
              { text: 'Vue', link: '/pages/5d463fbdb172d43b/' },
            ],
          },
          {
            text: '学习笔记',
            children: [
              { text: '《JavaScript教程》笔记', link: '/note/javascript/' },
              { text: '《JavaScript高级程序设计》笔记', link: '/note/js/' },
              { text: '《ES6 教程》笔记', link: '/note/es6/' },
              { text: '《Vue》笔记', link: '/vue/' },
              {
                text: '《TypeScript 从零实现 axios》',
                link: '/vue/typescript-axios/',
              },
              {
                text: '《Git》学习笔记',
                link: '/vue/git/',
              },
              {
                text: '《TypeScript》笔记',
                link: '/vue/51afd6/',
              },
            ],
          },
        ],
      },
    ],
})

export default theme