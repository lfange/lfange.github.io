import { defineClientConfig } from '@vuepress/client'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';


export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.use(Antd)
    console.log('enhance', app)
    console.log('router', router)
    console.log('siteData', siteData)
  },
  setup() {},
  rootComponents: [],
})