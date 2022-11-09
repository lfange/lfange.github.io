import { defineClientConfig } from '@vuepress/client'
import { Button, Tabs } from 'ant-design-vue';
import 'ant-design-vue/es/tabs/style/index.css';
import 'ant-design-vue/es/button/style/index.css';
import Layout from './theme/layouts/Layout.vue'
import NotFound from './theme/NotFound.vue'
import Comment from './components/comment.vue'
import Demo from './components/NpmBadge.vue'

// "@vssue/api-github-v4": "^1.4.7",
// "@vssue/vuepress-plugin-vssue": "^1.4.8"

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // app.use(Vssue, {
    //    // 设置要使用的平台 api
    //   api: GithubV4,
    // // 设置平台，而不是 `api` 
    //   platform: 'github-v4',
    //   // 其他的 Vssue 配置
    //   owner: 'lfange', // 仓库的拥有者的名称
    //   repo: 'lfange.github.io', // 存储 Issue 和评论的仓库的名称
    //   clientId: 'f1309179924acb97c720', // 刚保存下来的  Client ID
    //   clientSecret: '9642dae529f47a9649217ffec15dca010dc00786 ', //  刚才保存下来的 Client secrets  只有在使用某些平台时需要
    // })
    app.component("Comment", Comment)
    app.component("Demo", Demo)
    app.use(Button)
    app.use(Tabs)
    // app.component("Layouts", Layouts)
    // app.use(Layouts)
    // console.log('enhance', app)
    // console.log('router', router)
    // console.log('siteData~', siteData)
  },
  setup() {},
  layouts: {
    Layout,
    NotFound,
  },
})