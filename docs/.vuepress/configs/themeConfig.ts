import { defaultTheme } from '@vuepress/theme-default'
import navbar from './themeConfig/navbar';
import sidebar from './themeConfig/sidebar'


const theme = defaultTheme({
    navbar: navbar,
    sidebar: sidebar,
    repo: 'https://github.com/lfange/daydayup',
})

export default theme