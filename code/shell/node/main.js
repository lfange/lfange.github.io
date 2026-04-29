import Vue from 'vue'

import App from './App'
//import ElementUI from 'element-ui';
import anti from "ant-design-vue"
//import 'element-ui/lib/theme-chalk/index.css';
import 'ant-design-vue/dist/antd.css';
import VueRouter from 'vue-router'
import routers from './router'
import MyTitle from './components/MyTitle'
import Sign from './components/Sign'
import db from './js/DBtools'
import VueUeditorWrap from 'vue-ueditor-wrap'
import dateFmt from './js/dateFmt'
// import printPDF from './js/fmtbody_bak'
import store from "./store/index"
import moment from 'moment'
import { ipcRenderer } from 'electron'

var path = require('path');
const fs = require('fs');
const os = require('os');
var winston = require('winston');

var md5 = require('md5.js');
Vue.prototype.$md5 = md5;
//console.log(new md5().update('42').digest('hex'))
Vue.prototype.$moment = moment

//import Print from 'vue-print-nb'
window.ndd = {}
//import Print from './js/Print'

//const WebSocket =  require('./js/WebSocket').default;


const formatter = winston.format.combine(
  // string use util.format
  winston.format.splat(),
  // timestamp to format
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.printf(info => {
    return `${info.timestamp} ${info.level}:${info.message}`;
  })
);


const logger = winston.createLogger({
  level: 'info',
  format: formatter,
  defaultMeta: { service: 'client log' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    //new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'client_kk.log', maxsize: 5242880, maxFiles: 5 }),
  ],
});

// 基础路径获取设置
var defpath = path.resolve(__dirname, '../');
var templatePath = path.resolve(__dirname, '../', 'templatePath');  // 模板文件存放位置
var tempPath = path.resolve(__dirname, '../', 'temp');  // 圖片存放位置
if (process.env.NODE_ENV != 'development') {
  defpath = defpath.substring(0, defpath.indexOf('resources') + 10)
  templatePath = path.join(defpath, 'templatePath'); // 生产环境同步更新模板路径
  tempPath = path.join(defpath, 'temp');
}
// 圖片存儲位置
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath)
}

Vue.config.productionTip = false

Vue.prototype.$logger = logger
window.ndd['$logger'] = logger

import websocket from './js/WebSocket'
import vueEsign from 'vue-esign'
import picFmt from './js/ysPics'
// import { json } from 'sequelize/types';


window.ndd['$receivePath'] = "D:\\tmp"

window.ndd['$sendheart'] = true;

Vue.prototype.$WebSocket = websocket;
Vue.prototype.$dateFmt = dateFmt;
Vue.prototype.$picFmt = picFmt;
// Vue.prototype.$printPDF = printPDF;
// window.ndd['$printPDF'] = printPDF;

Vue.prototype.sortBy = function (property, asc) {
  //默认升序,不能写在闭包里面，写在闭包里面是无效的……asc没反应就
  if (asc == undefined) {
    asc = -1
  } else {
    asc = asc ? -1 : 1
  }
  return function (value1, value2) {
    let a = value1[property]
    let b = value2[property]
    return a < b ? asc : a > b ? asc * -1 : 0
  }
}

Vue.use(anti);

Vue.use(VueRouter)
Vue.use(vueEsign)


Vue.prototype.$uuid = require('uuid');
//加载数据库
Vue.prototype.$Nedb = db

//加载常用表
Vue.prototype.$01_01 = db(defpath + '/db/01_01')//检查任务
Vue.prototype.$01_01.sort({ 'checkBeginDate': 1 });

setTimeout(function () {
  Vue.prototype.$01_02 = db(defpath + '/db/01_02')//历史检查
}, 3000)

//
Vue.prototype.$01_04 = db(defpath + '/db/01_04') //登记问题记录
Vue.prototype.$01_05 = db(defpath + '/db/01_05') //登记问题现象
Vue.prototype.$01_06 = db(defpath + '/db/01_06') //检查清单

Vue.prototype.$02_01 = db(defpath + '/db/02_01')//单位信息
Vue.prototype.$02_02 = db(defpath + '/db/02_02')//科研地址缓存
Vue.prototype.$02_03 = db(defpath + '/db/02_03')//
Vue.prototype.$02_04 = db(defpath + '/db/02_04')//机关事业单位(tReachStandard)

Vue.prototype.$02_05 = db(defpath + '/db/02_05')  //检查对象
Vue.prototype.$02_06 = db(defpath + '/db/02_06')  //检查对象-管理要素
Vue.prototype.$02_07 = db(defpath + '/db/02_07')  //受检部门信息
Vue.prototype.$02_08 = db(defpath + '/db/02_08')  //受检部门信息

Vue.prototype.$02_09 = db(defpath + '/db/02_09')  //要害部门部位信息
Vue.prototype.$02_10 = db(defpath + '/db/02_10')  //存储单位检查对象（前端用）
Vue.prototype.$02_11 = db(defpath + '/db/02_11')  //要害部门部位缓存

Vue.prototype.$03_01 = db(defpath + '/db/03_01')//人员信息
Vue.prototype.$03_02 = db(defpath + '/db/03_02')//专家考核


Vue.prototype.$04_01 = db(defpath + '/db/04_01')//检查细则
Vue.prototype.$04_01.sort({ 'sort': 1 });
Vue.prototype.$04_02 = db(defpath + '/db/04_02')//细则问题
Vue.prototype.$04_02.sort({ 'sort': 1 });
Vue.prototype.$04_03 = db(defpath + '/db/04_03') //问题现象 
Vue.prototype.$04_04 = db(defpath + '/db/04_04') //检查模版细则ID
Vue.prototype.$04_05 = db(defpath + '/db/04_05') //检查工作简况
Vue.prototype.$04_06 = db(defpath + '/db/04_06') //模版数据
Vue.prototype.$04_07 = db(defpath + '/db/04_07')  // 模版关系数据
Vue.prototype.$04_08 = db(defpath + '/db/04_08')  //PAD登陆人员信息


Vue.prototype.$05_01 = db(defpath + '/db/05_01') //试卷试题ID
Vue.prototype.$05_02 = db(defpath + '/db/05_02') //试卷相关出题方式
Vue.prototype.$05_02.sort({ 'sort': 1 });
Vue.prototype.$05_03 = db(defpath + '/db/05_03') //试卷试题
Vue.prototype.$05_04 = db(defpath + '/db/05_04') // 填空题答案
Vue.prototype.$05_05 = db(defpath + '/db/05_05') // 选择题答案
Vue.prototype.$05_06 = db(defpath + '/db/05_06') //
Vue.prototype.$05_07 = db(defpath + '/db/05_07') //试卷名字ID
Vue.prototype.$05_07.sort({ 'createTime': -1 });


Vue.prototype.$06_01 = db(defpath + '/db/06_01') //地区数据
Vue.prototype.$06_01.sort({ 'sort': 1 });

Vue.prototype.$06_02 = db(defpath + '/db/06_02') //人员，检查类型，单位性质相关码表
Vue.prototype.$06_02.sort({ 'sort': 1 });

Vue.prototype.$06_03 = db(defpath + '/db/06_03') //码表
Vue.prototype.$06_03.sort({ 'sort': 1 });
Vue.prototype.$06_04 = db(defpath + '/db/06_04') //
Vue.prototype.$09_01 = db(defpath + '/db/09_01')

Vue.prototype.$13_01 = db(defpath + '/db/13_01')

Vue.prototype.$01_04_cache = db(defpath + '/db/01_04_cache')
Vue.prototype.$log_feddback = db(defpath + '/db/log_feddback')
Vue.prototype.$pic_cache = db(defpath + '/db/pic_cache')
Vue.prototype.$cop_cache = db(defpath + '/db/cop_cache')
Vue.prototype.$cache_share = db(defpath + '/db/cache_share')

//Vue.use(Print);
Vue.component('myTitle', MyTitle);
Vue.component('Sign', Sign);
Vue.component('vue-ueditor-wrap', VueUeditorWrap)

// 注册一个全局自定义指令 v-focus
Vue.directive('focus', {
  // 当绑定元素插入到 DOM 中。
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
});

window.ndd['$fs'] = fs;
window.ndd['$os'] = os;
window.ndd['$mpath'] = path;
window.ndd['$adm_zip'] = require('adm-zip');
window.ndd['$wmi'] = require('node-wmi');
window.ndd['$moment'] = moment;

//window.ndd['$unzip'] = require('unzip')

// 10
window.ndd['$path'] = defpath
window.ndd['templatePath'] = templatePath

window.ndd['unzips'] = function (path, filename, fn) {
  var adm_zip = window.ndd['$adm_zip'];
  var unzip = new adm_zip(path + filename);
  try {
    var tmpurl = path + '/temp';//临时文件夹
    var dburl = path + '/dbcache';//本地数据库
    var dataurl = path + '/db'
    var path = require('path');

    unzip.extractAllTo(dburl, true);


    window.ndd['$fs'].readdirSync(dburl).forEach(function (name, index, arr) {
      if ((index == arr.length - 1) && fn) {
        fn();
      }
      if (name.indexOf('MD5') > -1) return true;
      var filePath = path.resolve(dburl, name);
      var str = window.ndd['$fs'].readFileSync(filePath).toString()

      console.log('name====', name);
      console.log("str=====", str)
      if (str == '' || name.indexOf('BM_') > -1 || name.indexOf('10_') > -1 || name.indexOf('09_') > -1) {
        window.ndd['$fs'].unlinkSync(filePath)
        return true;
      }
      var dbname = name.split('.')[0];
      var dbfile = JSON.parse(str);

      if (name.indexOf('01_') > -1 || name.indexOf('02_') > -1) {
        if (typeof Vue.prototype['$' + dbname] != 'undefined') {
          Vue.prototype['$' + dbname].insert(dbfile).then(function (data) {
            window.ndd['$fs'].unlinkSync(filePath)
            console.log('1,插入数据' + dbname, data);

          }).catch(function (err) {
            window.ndd['$logger'].info('添加数据出错', dbname, err)
          })
        } else {
          var thedb = db(dataurl + '/' + dbname);

          thedb.insert(dbfile).then(function (data) {
            window.ndd['$fs'].unlinkSync(filePath)
            console.log('2,插入数据' + dbname, data);

          }).catch(function (err) {
            window.ndd['$logger'].info('添加数据出错', dbname, err)
          })
        }
      } else {
        //增加时间戳，控制删除
        //thedb.insert(dbfile).then(function(data){}).catch(function(err){})
        if (typeof Vue.prototype['$' + dbname] != 'undefined') {
          Vue.prototype['$' + dbname].remove({}, { multi: true }).then(function () {

            Vue.prototype['$' + dbname].insert(dbfile).then(function (data) {
              Vue.prototype['$' + dbname].db.persistence.compactDatafile();
              window.ndd['$fs'].unlinkSync(filePath)
            }).catch(function (err) {
              window.ndd['$fs'].unlinkSync(filePath)
              Vue.prototype['$' + dbname].db.persistence.compactDatafile();
            })
          }).catch(function (err) {
            window.ndd['$logger'].info('添加数据出错', dbname, err)
          });
        } else {
          var thedb = db(dataurl + '/' + dbname);
          thedb.remove({}, { multi: true }).then(function () {
            thedb.insert(dbfile).then(function (data) {
              thedb.db.persistence.compactDatafile();
            }).catch(function (err) {
              thedb.db.persistence.compactDatafile();
              window.ndd['$fs'].unlinkSync(filePath)

            })
          }).catch(function (err) {
            window.ndd['$logger'].info('添加数据出错', dbname, err)
          });
        }
      }
    })
  } catch (error) {
    console.log('解压出错', error);
    window.ndd['$logger'].info('解压出错', error)
    fn(error)
  }
}

const zipPic = function (pid) {
  Vue.prototype['$pic_cache'].find({ projectId: pid }).then(function (data) {
    if (data && data.length > 0 && data[0]['pics'] && data[0]['pics'].length > 0) {
      let piclist = data[0]['pics'];
      var adm_zip = window.ndd['$adm_zip'];
      var zip = new adm_zip();
      for (let i in piclist) {
        zip.addLocalFile(piclist[i]['url']);
      }
      //zip.writeZip(/*target file name*/ "/home/me/files.zip");
      zip.writeZip(/*target file name*/ window.ndd['$path'] + '/temp/' + pid + '_pic.zip');
    }
  })
}
window.ndd['$zipPic'] = zipPic;


async function initbaseData(receivePathName) {
  try {
    const files = window.ndd['$fs'].readdirSync(receivePathName);
    for (const name of files) {
      let filePath = window.ndd['$mpath'].resolve(receivePathName, name);
      console.log('filePath', filePath);

      let str = window.ndd['$fs'].readFileSync(filePath).toString();

      if (str == '' || name.indexOf('BM_') > -1 || name.indexOf('10_') > -1 || name.indexOf('09_') > -1 || name.indexOf('action') > -1) {
        window.ndd['$fs'].unlinkSync(filePath);
        continue;
      }
      let dbname = name.split('.')[0];
      let suffix = name.split('.')[1];
      if (suffix != 'json') {
        window.ndd['$fs'].unlinkSync(filePath);
        continue;
      }

      console.log('dbname', dbname);
      let dbfile = str == '' ? [] : JSON.parse(str);
      if (name.indexOf('01_') > -1 || name.indexOf('02_') > -1) {
        if (typeof Vue.prototype['$' + dbname] != 'undefined') {
          if (name.indexOf("01_01") > -1 || name == "01_01") { dbfile["expchecks"] = ""; }

          if (name.indexOf("02_05") > -1) {
            const parsed = JSON.parse(str);
            if (!Array.isArray(parsed)) {
              console.log('数组无效或为空');
              continue;
            }
            for (const item of parsed) {
              const did = item.inspectionObjectId;
              const data = await Vue.prototype.$02_05.find({ inspectionObjectId: did });
              if (data.length > 0) {
                await Vue.prototype.$02_05.remove({ inspectionObjectId: did }, { multi: true });
                await Vue.prototype.$02_05.insert(item);
              } else {
                await Vue.prototype.$02_05.insert(item);
              }
              Vue.prototype.$02_05.db.persistence.compactDatafile();
            }
          } else if (name.indexOf("02_06") > -1) {
            const parsed = JSON.parse(str);
            if (!Array.isArray(parsed)) {
              console.log('数组无效或为空');
              continue;
            }
            for (const item of parsed) {
              const did = item.inspectionItemId;
              const data = await Vue.prototype.$02_06.find({ inspectionItemId: did });
              if (data.length > 0) {
                await Vue.prototype.$02_06.remove({ inspectionItemId: did }, { multi: true });
                await Vue.prototype.$02_06.insert(item);
              } else {
                await Vue.prototype.$02_06.insert(item);
              }
              Vue.prototype.$02_06.db.persistence.compactDatafile();
            }
          } else if (name.indexOf("02_07") > -1) {
            const parsed = JSON.parse(str);
            if (!Array.isArray(parsed)) {
              console.log('数组无效或为空');
              continue;
            }
            for (const item of parsed) {
              const did = item.orgcode;
              const data = await Vue.prototype.$02_07.find({ orgcode: did });
              if (data.length > 0) {
                await Vue.prototype.$02_07.remove({ orgcode: did }, { multi: true });
                await Vue.prototype.$02_07.insert(item);
              } else {
                await Vue.prototype.$02_07.insert(item);
              }
              Vue.prototype.$02_07.db.persistence.compactDatafile();
            }
          } else if (name.indexOf("02_08") > -1) {
            const data = JSON.parse(str);
            if (!Array.isArray(data)) {
              console.log('数组无效或为空');
              continue;
            }
            const rawData = await Vue.prototype.$02_08.find({}, { _id: 0 });
            if (rawData.length === 0) {
              await Vue.prototype.$02_08.insert(data);
              Vue.prototype.$02_08.db.persistence.compactDatafile();
            } else {
              const allSections = [...data, ...rawData];
              const mergedData = {};
              const allArrays = {};
              allSections.forEach(section => {
                for (const key in section) {
                  if (Array.isArray(section[key])) {
                    if (!allArrays[key]) allArrays[key] = [];
                    allArrays[key].push(...section[key]);
                  } else {
                    mergedData[key] = section[key];
                  }
                }
              });
              for (const key in allArrays) {
                const uniqueMap = new Map();
                allArrays[key].forEach(item => {
                  if (item.id) uniqueMap.set(item.id, item);
                  else uniqueMap.set(JSON.stringify(item), item);
                });
                mergedData[key] = Array.from(uniqueMap.values());
              }
              console.log('mergedData=========', mergedData);
              await Vue.prototype.$02_08.remove({}, { multi: true });
              for (let key in mergedData) {
                if (mergedData.hasOwnProperty(key) && key !== '_id') {
                  const obj = { [key]: mergedData[key] };
                  await Vue.prototype.$02_08.insert(obj);
                  Vue.prototype.$02_08.db.persistence.compactDatafile();
                }
              }
            }
          } else {
            await Vue.prototype['$' + dbname].insert(dbfile);
            if (window.ndd['$fs'].existsSync(filePath)) {
              window.ndd['$fs'].unlinkSync(filePath);
            }
            Vue.prototype['$' + dbname].db.persistence.compactDatafile();
          }
        }
      } else {
        if (typeof Vue.prototype['$' + dbname] != 'undefined') {
          if (name.indexOf("04_06") > -1) {
            const parsed = JSON.parse(str);
            if (!Array.isArray(parsed)) {
              console.log('数组无效或为空');
              continue;
            }
            for (const item of parsed) {
              const did = item.templateId;
              const data = await Vue.prototype.$04_06.find({ templateId: did });
              if (data.length > 0) {
                await Vue.prototype.$04_06.remove({ templateId: did }, { multi: true });
                await Vue.prototype.$04_06.insert(item);
              } else {
                await Vue.prototype.$04_06.insert(item);
              }
              Vue.prototype.$04_06.db.persistence.compactDatafile();
            }
          } else if (name.indexOf("04_07") > -1) {
            const parsed = JSON.parse(str);
            if (!Array.isArray(parsed)) {
              console.log('数组无效或为空');
              continue;
            }
            for (const item of parsed) {
              const did = item.tempId;
              const data = await Vue.prototype.$04_07.find({ tempId: did });
              if (data.length > 0) {
                await Vue.prototype.$04_07.remove({ tempId: did }, { multi: true });
                await Vue.prototype.$04_07.insert(item);
              } else {
                await Vue.prototype.$04_07.insert(item);
              }
              Vue.prototype.$04_07.db.persistence.compactDatafile();
            }
          } else {
            await Vue.prototype['$' + dbname].remove({}, { multi: true });
            await Vue.prototype['$' + dbname].insert(dbfile);
            if (window.ndd['$fs'].existsSync(filePath)) {
              window.ndd['$fs'].unlinkSync(filePath);
            }
            Vue.prototype['$' + dbname].db.persistence.compactDatafile();
          }
        }
      }
    }

    console.info('dirPath==============>', receivePathName);
    console.log('删除检查单文件:');
    window.ndd['$fs'].rmdirSync(receivePathName, { recursive: true });
    store.commit('setTaskFinish', true);
    console.log('检查单数据插入成功');
    return true;
  } catch (error) {
    console.error('检查单数据插入失败:', error.message);
    return false;
  }
}

function findByUnitId(tableCode, data, did) {
  for (const item of data) {
    // 每个 item 只有一个键，例如 "T_MILITARY_PLACE"
    const [tableName, records] = Object.entries(item)[0];
    if (tableName === tableCode) {
      if (Array.isArray(records)) {
        for (const record of records) {
          if (record.id === did) {
            return record;
          }
        }
      }
    }
  }
  return null;
}

setTimeout(function () {
  // initbaseData();
}, 5000)

console.log('defpath', defpath)

const router = new VueRouter({
  mode: 'hash',
  routes: routers
})
/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>',
  router: router,
  store
}).$mount('#app')

let sendDirectory = "";
let receiveDirectory = "";

ipcRenderer.on('receivePath', (event, arg) => {
  console.log('接收目录：', arg);
  receiveDirectory = arg;
  window.ndd['$receivePath'] = receiveDirectory;

  console.log('接收目录：', window.ndd['$receivePath']);
});

ipcRenderer.on('sendDirPath', (event, arg) => {
  console.log('发送目录：', arg);
  sendDirectory = arg;
});


/**
 * 任务队列处理器
 * 用于处理高并发下的文件解析任务，确保任务按顺序执行
 */
class TaskQueue {
  constructor(concurrency = 1, timeout = 300000) { // 默认5分钟超时
    this.queue = [];
    this.concurrency = concurrency;
    this.timeout = timeout;
    this.running = 0;
  }

  push(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  async next() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    const taskPromise = task();
    const timeoutPromise = new Promise((_, rej) => 
      setTimeout(() => rej(new Error('任务处理超时')), this.timeout)
    );

    try {
      const result = await Promise.race([taskPromise, timeoutPromise]);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.next();
    }
  }
}

const fileProcessQueue = new TaskQueue(1);

ipcRenderer.on('receiveFilePath', (event, arg) => {
  console.log('接收文件路径：', arg);
  console.log('发送文件路径：', sendDirectory);
  
  // 将任务加入队列处理
  fileProcessQueue.push(() => processFile(arg))
    .then(() => {
      console.log(`文件处理任务完成: ${arg}`);
    })
    .catch((err) => {
      console.error(`文件处理任务失败: ${arg}`, err.message);
    });
});

async function processFile(filePathName) {
  var path = require('path');
  let actionName = null;
  let extractedDirPath = null;
  
  console.log(`[任务开始] 开始处理文件: ${filePathName}`);
  try {
    const fileName = path.basename(filePathName, '.zip');
    const parts = fileName.split('_');
    const padCode = parts.length > 3 ? parts[3] : null;
    
    if (!padCode) {
      console.warn(`[任务终止] 无法从文件名中提取 padCode: ${fileName}`);
      try {
        window.ndd['$fs'].unlinkSync(filePathName);
      } catch (error) {
        console.error('删除失败:', error.message);
      }
      return false;
    }

    const currentHost = os.hostname().toLowerCase();
    const targetHost = (padCode || '').toLowerCase();
    
    if (targetHost && targetHost !== currentHost) {
      console.info(`[任务终止] 主机不匹配 (${targetHost} != ${currentHost})，清理文件`);
      try {
        window.ndd['$fs'].unlinkSync(filePathName);
      } catch (error) {
        console.error('删除失败:', error.message);
      }
      return false;
    }

    const templatePath = window.ndd['templatePath'];
    if (!fs.existsSync(templatePath)) fs.mkdirSync(templatePath);

    console.log(`[解压开始] 文件: ${filePathName}`);
    const extractedFiles = extractZipFile(filePathName);
    if (extractedFiles && extractedFiles.length > 0) {
      extractedDirPath = path.dirname(extractedFiles[0].path);
      console.log(`[解压完成] 目录: ${extractedDirPath}, 文件数: ${extractedFiles.length}`);
    } else {
      console.warn('[解压警告] 未解压出任何文件');
    }

    for (const file of extractedFiles) {
      const ext = file.name && file.name.toLowerCase();
      if (ext.indexOf('.docx') !== -1) {
        try {
          const dir = file.path;
          fs.copyFileSync(dir, `${templatePath}\\${file.name}`, fs.constants.COPYFILE_FICLONE);
          console.log(`[模板复制] 已复制: ${file.name}`);
        } catch (err) {
          console.error('复制模板文件templatePath操作失败', err.message);
        }
      }

      if (file.name === 'action.json') {
        console.log(`[解析配置] 找到 action.json: ${file.path}`);
        var actionJsonPath = file.path;
        var data = loadAndTransformJson(file.path);
        actionName = data.action;
        const checkId = data.changeId;
        const createTime = data.createTime;
        
        console.log(`[业务处理] action: ${actionName}, checkId: ${checkId}`);
        
        const query = {
          $and: [
            { changeId: checkId },
            { createTime: { $gte: createTime } }
          ]
        };

        const records = await Vue.prototype.$13_01.find(query);
        if (records.length > 0) {
          console.info(`[业务跳过] 任务已存在: ${checkId}`);
          try {
            const dirPath = path.dirname(actionJsonPath);
            window.ndd['$fs'].rmdirSync(dirPath, { recursive: true, force: true });
          } catch (error) {
            console.error('删除失败:', error.message);
          }
          
          if (actionName !== 'PadCheckFormResultAck') {
            console.log(`[应答发送] 补发 Ack: ${actionName}`);
            await packageReturnMessage(checkId, actionName + 'Ack', true, createTime);
          }
        } else {
          console.log(`[业务入库] 写入 $13_01: ${checkId}`);
          await Vue.prototype.$13_01.insert(data);
          
          switch (actionName) {
            case 'WebCheckForm':
              console.log('[分支处理] WebCheckForm');
              const existingData = await Vue.prototype.$01_01.find({ id: checkId });
              if (existingData.length > 0) {
                console.info(`[业务跳过] 任务明细已存在: ${checkId}`);
                try {
                  const dirPath = path.dirname(actionJsonPath);
                  window.ndd['$fs'].rmdirSync(dirPath, { recursive: true, force: true });
                } catch (error) {
                  console.error('删除失败:', error.message);
                }
              } else {
                const extractedPath = path.dirname(file.path);
                const ok = await initbaseData(extractedPath);
                await packageReturnMessage(checkId, 'WebCheckFormAck', ok, createTime);
              }
              break;
              
            case 'WebCancelCheckForm':
              console.log('[分支处理] WebCancelCheckForm');
              await handleWebCancelCheckForm(data, extractedFiles, actionJsonPath, createTime);
              break;
              
            case 'PadCheckFormResultAck':
              console.log('[分支处理] PadCheckFormResultAck');
              await handlePadCheckFormResultAck(data, actionJsonPath);
              break;
              
            case 'WebPadBasisDataSync': {
              console.log('[分支处理] WebPadBasisDataSync');
              const extractedFilePath = path.dirname(file.path);
              const status = await initbaseData(extractedFilePath);
              await packageReturnMessage(checkId, 'WebPadBasisDataSyncAck', status, createTime);
              break;
            }
              
            case 'WebPadTaskSynAck':
              console.log('[分支处理] WebPadTaskSynAck');
              const fileDir = path.dirname(file.path);
              await handleWebPadTaskSynAck(fileDir);
              break;
              
            default:
              console.warn(`[分支警告] 未知 action 类型: ${actionName}`);
          }
        }
        break; 
      }
    }

    if (!actionName) {
      throw new Error('未找到有效的 action.json 文件');
    }
    console.log(`[任务完成] 文件处理成功: ${filePathName}`);
    return true;
  } catch (error) {
    console.error(`[任务异常] 文件: ${filePathName}, 错误: ${error.message}`);
    if (extractedDirPath) {
      try {
        window.ndd['$fs'].rmdirSync(extractedDirPath, { recursive: true, force: true });
        console.log('[清理完成] 异常后清理目录成功');
      } catch (e) {
        console.error('[清理失败] 异常后清理目录失败:', e.message);
      }
    }
    throw error; 
  }
}

function getFileNameWithoutExtension(filePath) {
  // 1. 获取完整的文件名（带后缀）
  const fullFileName = path.basename(filePath);
  // 2. 获取扩展名（包含点，如 '.txt'）
  const extension = path.extname(filePath);
  // 3. 去除扩展名
  return fullFileName.slice(0, -extension.length);
}

function extractZipFile(zipPath) {
  try {
    var adm_zip = window.ndd['$adm_zip'];
    var unzip = new adm_zip(zipPath);

    const folder = getFileNameWithoutExtension(zipPath);
    const extractDir = path.resolve(__dirname, '../', folder);

    // 获取ZIP中的文件列表
    const zipEntries = unzip.getEntries();
    const fileList = zipEntries
      .filter(entry => !entry.isDirectory)
      .map(entry => entry.entryName);

    console.info(`开始解压，共 ${fileList.length} 个文件`);

    // 解压所有文件
    unzip.extractAllTo(extractDir, true);

    // 获取解压后的文件列表
    const extractedFiles = [];
    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const fullPath = path.join(extractDir, entry.entryName);
        try {
          const stat = window.ndd['$fs'].statSync(fullPath);
          extractedFiles.push({
            name: entry.entryName,
            path: fullPath,
            size: entry.header.size
          });
        } catch (error) {
          console.error(`文件解压后未找到：${entry.entryName}`);
        }
      }
    }

    console.info(`解压完成: ${extractedFiles.length} 个文件已提取`);

    // 删除文件 
    try {
      window.ndd['$fs'].unlinkSync(zipPath);
    } catch (error) {
      console.warn('删除文件失败');
    }


    return extractedFiles;
  } catch (error) {
    console.error(`解压失败: ${error.message}`);
    throw error;
  }
}

function loadAndTransformJson(filePath) {
  try {
    let rawData = window.ndd['$fs'].readFileSync(filePath).toString()
    const jsonData = JSON.parse(rawData);
    return jsonData;
  } catch (error) {
    console.error(`处理JSON文件失败: ${error.message}`);
    return new Map(); // 返回安全默认值
  }
}


async function packageReturnMessage(checkId, action, status, taskCreateTime) {
  let tempFilePaths = [];
  try {
    const tmpDir = window.ndd['$os'].tmpdir();
    const fileName = 'action.json';
    const extractFileName = `BM_02_${formatDate()}_${window.ndd['$os'].hostname()}_TOWEB`;
    const param = {
      action: action,
      padCode: window.ndd['$os'].hostname(),
      changeId: checkId,
      createTime: new Date().getTime(),
      restoreTime: taskCreateTime,
      fileNames: [fileName],
      message: status ? '成功' : '失败',
      status: status ? 0 : -1,
      serialNo: extractFileName
    }

    const filePath = path.join(tmpDir, fileName);
    await window.ndd['$fs'].promises.writeFile(filePath, JSON.stringify(param, null, 2));
    tempFilePaths.push(filePath);

    const extractZipFile = `${extractFileName}.temp`
    const extractZipPath = path.join(tmpDir, extractZipFile);

    const files = [filePath]
    const result = await new Promise((resolve, reject) => {
      compressMultipleFiles(files, extractZipPath, {
        compressionLevel: 9,
        preservePaths: false
      }, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    if (!result) {
      throw new Error('文件压缩失败')
    }
    tempFilePaths.push(extractZipPath);
    const targetPath = path.join(sendDirectory, extractZipFile);
    await window.ndd['$fs'].promises.copyFile(extractZipPath, targetPath);
    const sendTempPath = targetPath;
    const sendFileName = `${extractFileName}.zip`
    const finalPathName = path.join(sendDirectory, sendFileName);

    try {
      await window.ndd['$fs'].promises.rename(sendTempPath, finalPathName);
      console.log('文件重命名成功');
    } catch (error) {
      console.log('文件重命名失败');
    }
    console.log(`应答消息已生成: ${finalPathName}`);
    return finalPathName;

  } catch (error) {
    console.error('应答返回消息失败:', error);
    throw error;
  } finally {
    for (const filePath of tempFilePaths) {
      try {
        await window.ndd['$fs'].promises.unlink(filePath);
      } catch (err) {
        console.warn(`清理临时文件失败 ${filePath}`);
      }
    }
  }
}

function formatDate() {
  // 时间戳转换为可读日期
  const timestamp = Date.now();
  const date = new Date(timestamp);
  // 自定义格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  const formattedDate = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  return formattedDate;
}

/**
* 多文件压缩
* @param {*} filePaths 
* @param {*} outputPath 
* @param {*} options 
*/
function compressMultipleFiles(filePaths, outputPath, options = {}) {
  const {
    compressionLevel = 9,
    preservePaths = false,
    createDir = true,
    onProgress = null
  } = options;
  const fs1 = require('fs-extra');

  try {
    // 过滤有效的文件
    const validFiles = [];
    const invalidFiles = [];

    for (const filePath of filePaths) {
      if (fs1.existsSync(filePath)) {
        validFiles.push(filePath);
      } else {
        invalidFiles.push(filePath);
        console.warn(`文件不存在，已跳过: ${filePath}`);
      }
    }

    if (validFiles.length === 0) {
      throw new Error('没有有效的文件可以压缩');
    }

    if (invalidFiles.length > 0) {
      console.warn(`跳过了 ${invalidFiles.length} 个不存在的文件`);
    }

    // 创建输出目录
    if (createDir) {
      const outputDir = path.dirname(outputPath);
      if (!fs1.existsSync(outputDir)) {
        fs1.mkdirSync(outputDir, { recursive: true });
      }
    }

    console.log(`开始压缩 ${validFiles.length} 个文件...`);

    // 创建ZIP实例
    // 
    var adm_zip = window.ndd['$adm_zip'];
    var zip = new adm_zip();
    let totalSize = 0;

    // 添加文件
    validFiles.forEach((filePath, index) => {
      const fileStats = fs1.statSync(filePath);
      totalSize += fileStats.size;

      const entryName = preservePaths
        ? filePath
        : path.basename(filePath);

      if (preservePaths) {
        const entryDir = path.dirname(entryName);
        zip.addLocalFile(filePath, entryDir);
      } else {
        // 如果文件名重复，添加序号
        const baseName = path.basename(filePath);
        let finalName = baseName;
        let counter = 1;

        while (zip.getEntry(finalName)) {
          const ext = path.extname(baseName);
          const name = path.basename(baseName, ext);
          finalName = `${name}_${counter}${ext}`;
          counter++;
        }

        zip.addLocalFile(filePath, '', finalName);
      }
    });

    // 设置压缩级别
    if (compressionLevel !== undefined) {
      zip.getEntries().forEach(entry => {
        entry.header.method = compressionLevel === 0 ? 0 : 8;
      });
    }

    // 写入ZIP文件
    zip.writeZip(outputPath);

    // 统计信息
    const outputStats = fs1.statSync(outputPath);
    const compressionRatio = (1 - (outputStats.size / totalSize)) * 100;

    console.info(`   文件压缩完成`);
    return {
      success: true,
      outputPath: outputPath,
      fileCount: validFiles.length,
      inputSize: totalSize,
      outputSize: outputStats.size,
      compressionRatio: compressionRatio,
      invalidFiles: invalidFiles
    };
  } catch (error) {
    throw new Error(`多文件压缩失败: ${error.message}`);
  }
}

async function handleWebCancelCheckForm(data, extractedFiles, actionJsonPath, taskCreateTime) {
  const id = data.changeId;
  console.log('进入任务撤销')
  try {
    const status = await removeTask(id);
    await packageReturnMessage(id, 'WebCancelCheckFormAck', status, taskCreateTime);
    return true;
  } finally {
    try {
      await window.ndd['$fs'].promises.unlink(actionJsonPath);
      const dirPath = path.dirname(actionJsonPath);
      await window.ndd['$fs'].promises.rmdir(dirPath);
    } catch (error) {
      console.warn('删除文件失败');
    }
  }
}


function removeTask(did) {
  return new Promise((resolve, reject) => {
    try {
      Vue.prototype.$01_01.find({ id: did }).then(function (data) {
        if (data.length === 0) {
          console.log('没有找到相应的检查单数据');
          resolve(false);
          return
        }
        let unitId = data[0]['unitId'];
        if (data[0]['checkModel'] == 'organ' || data[0]['checkModel'] == 'institution') {
          Vue.prototype.$02_04.remove({ id: unitId }, { multi: true }).then(function (d) {
            console.log('删除单位信息');
          });
        } else {
          Vue.prototype.$02_01.remove({ id: unitId }, { multi: true }).then(function (d) {
            console.log('删除单位信息');
          });
          Vue.prototype.$02_02.remove({ unitId: unitId }, { multi: true }).then(function (d) {
            console.log('删除单位信息');
          });
          Vue.prototype.$02_03.remove({ unitId: unitId }, { multi: true }).then(function (dd) {
            console.log('删除科研地址记录', dd);
          });
        }
        Vue.prototype.$01_01.remove({ id: did }, { multi: true }).then(
          function (d) {
            console.log('删除检查任务成功=========', d);
            window.ndd['$logger'].info('删除检查任务成功' + did);
            Vue.prototype.$01_01.db.persistence.compactDatafile();
            Vue.prototype.$02_01.db.persistence.compactDatafile();
            Vue.prototype.$02_02.db.persistence.compactDatafile();
            Vue.prototype.$02_03.db.persistence.compactDatafile();
            Vue.prototype.$02_04.db.persistence.compactDatafile();
            store.commit('setTaskFinish', true);
            resolve(true);
          },
          function (err) {
            console.log('删除检查任务失败========', err);
            resolve(true);
          }
        );
      });
    } catch (error) {
      console.error('删除检查任务失败:', error);
      resolve(false);
    }
  });
}

async function handlePadCheckFormResultAck(data, actionJsonPath) {
  const { changeId, status } = data || {};
  console.log('任务结果上报确认消息');

  try {
    if (status === 0 && changeId) {
      await Vue.prototype.$01_01.update({ id: changeId }, { $set: { isdel: 'Y' } });
      console.log('检查单上报状态更新成功', changeId);

      setTimeout(() => {
        Vue.prototype.$01_01.db.persistence.compactDatafile();
        store.commit('setTaskFinish', true);
      }, 1000);
    } else if (status === 1) {
      await removeTask(changeId);
    } else {
      console.log('任务结果上报确认失败', status);
    }
    return true;
  } finally {
    if (actionJsonPath) {
      try {
        await window.ndd['$fs'].promises.unlink(actionJsonPath);
        const dirPath = path.dirname(actionJsonPath);
        await window.ndd['$fs'].promises.rmdir(dirPath);
      } catch (error) {
        console.warn('删除文件失败');
      }
    }
  }
}

async function handleWebPadTaskSynAck(receivePathName) {
  try {
    const self = Vue.prototype;
    const files = window.ndd['$fs'].readdirSync(receivePathName);
    
    for (const name of files) {
      let filePath = window.ndd['$mpath'].resolve(receivePathName, name);
      console.log('处理同步文件:', filePath);

      let str = window.ndd['$fs'].readFileSync(filePath).toString();
      if (str === '' || name.indexOf('BM_') > -1 || name.indexOf('10_') > -1 || name.indexOf('09_') > -1 || name.indexOf('action') > -1) {
        window.ndd['$fs'].unlinkSync(filePath);
        continue;
      }

      if (name === '11_01.json') {
        const data = JSON.parse(str);
        console.log('解析 11_01.json:', data);

        for (const item of data) {
          console.log(`清理已完成任务: ID=${item.id}, 类型=${item.taskType}`);
          const cd = await self.$01_01.find({ id: item.id });
          
          for (const taskRecord of cd) {
            const unitId = taskRecord.unitId;
            if (taskRecord.checkType === 'random' || taskRecord.checkType === 'scene' || taskRecord.checkType === 'special') {
              await self.$01_02.remove({ unitId: unitId }, { multi: true });
              await self.$02_01.remove({ id: unitId });
              await self.$02_02.remove({ unitId: unitId });
              await self.$02_03.remove({ unitId: unitId });
              console.log(`清理科研单位数据完成: unitId=${unitId}`);
            } else {
              await self.$01_02.remove({ unitId: unitId }, { multi: true });
              await self.$02_04.remove({ id: unitId });
              console.log(`清理机关单位数据完成: unitId=${unitId}`);
            }
          }
          
          await self.$01_01.remove({ id: item.id });
          console.log(`删除检查任务完成: id=${item.id}`);
        }
        
        // 集中进行压缩
        self.$01_01.db.persistence.compactDatafile();
        self.$01_02.db.persistence.compactDatafile();
        self.$02_01.db.persistence.compactDatafile();
        self.$02_02.db.persistence.compactDatafile();
        self.$02_03.db.persistence.compactDatafile();
        self.$02_04.db.persistence.compactDatafile();
        store.commit('setTaskFinish', true);
      }
    }
    return true;
  } catch (err) {
    console.error('handleWebPadTaskSynAck 执行失败:', err.message);
    throw err;
  }
}
