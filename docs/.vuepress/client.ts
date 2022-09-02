import { defineClientConfig } from '@vuepress/client'
import { Button } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';


export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.use(Button)
    console.log('enhance', app)
    console.log('router', router)
    console.log('siteData', siteData)
  },
  setup() {},
  rootComponents: [],
})