import { defineClientConfig } from '@vuepress/client'
import { Button, Tabs } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';


export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.use(Button)
    app.use(Tabs)
    console.log('enhance', app)
    console.log('router', router)
    console.log('siteData', siteData)
  },
  setup() {},
  rootComponents: [],
})