import { defineClientConfig } from '@vuepress/client'
import { onMounted } from 'vue'
import { Button, Tabs } from 'ant-design-vue'
import 'ant-design-vue/es/tabs/style/index.css'
import 'ant-design-vue/es/button/style/index.css'

// "@vssue/api-github-v4": "^1.4.7",
// "@vssue/vuepress-plugin-vssue": "^1.4.8"

export default defineClientConfig({
  async enhance({ app, router, siteData }) {
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
    app.use(Button)
    app.use(Tabs)
    // app.component('Layouts', Layout)
    // app.use(Layouts)
  },
  setup() {
    onMounted(() => {
      console.log(
        '%c Guys, what are you looking for Something!',
        'color: fuchsia; '
      )

      console.log(
        '%ccontact me:     %c653398363@qq.com',
        'background-color: fuchsia ; color: white ; font-weight: bold ; ' +
          'font-size: 20px ; font-style: italic ; text-decoration: underline ; ' +
          "font-family: 'american typewriter' ; text-shadow: 1px 1px 3px black ;",
        'color: red'
      )
      console.log(String.raw`
      _      ______                     
      | |    |  ____|                    
      | |    | |__ __ _ _ __   __ _  ___ 
      | |    |  __/ _\` | '_ \ / _\` |/ _ \
      | |____| | | (_| | | | | (_| |  __/
      |______|_|  \__,_|_| |_|\__, |\___|
                               __/ |     
                              |___/      

        __          __  _                            _                            _     _             _ 
        \ \        / / | |                          | |                          | |   | |           | |
        \ \  /\  / /__| | ___ ___  _ __ ___   ___  | |_ ___    _ __ ___  _   _  | |__ | | ___   __ _| |
          \ \/  \/ / _ \ |/ __/ _ \| '_ ${'`'} _ \ / _ \ | __/ _ \  | '_ ${'`'} _ \| | | | | '_ \| |/ _ \ / _${'`'} | |
          \  /\  /  __/ | (_| (_) | | | | | |  __/ | || (_) | | | | | | | |_| | | |_) | | (_) | (_| |_|
            \/  \/ \___|_|\___\___/|_| |_| |_|\___|  \__\___/  |_| |_| |_|\__, | |_.__/|_|\___/ \__, (_)
                                                                          __/ |                 __/ |  
                                                                          |___/                 |___/   

        `)
    })
  },
  // bundler: {
  //   chunkSizeWarningLimit: 10000,
  // },
  layouts: {},
})
