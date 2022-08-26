import { defaultTheme } from '@vuepress/theme-default'
import navbar from './themeConfig/navbar';
import sidebar from './themeConfig/sidebar'


const theme = defaultTheme({
    navbar,
    sidebar,

    repo: 'lfange/daydayup',
    docsDir: 'docs', // 编辑的文件夹
    docsBranch: 'master', // 假如文档放在一个特定的分支下
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: '帮助我改善此页面！',
    blogger: {
        // 博主信息，显示在首页侧边栏
        name: 'Fange',
        slogan: '技术小',
    },
})

export default theme