// 检查并请求通知监听权限
auto.waitFor()

toast('程序开始执行')
// 监听通知消息
events.observeNotification()
events.on('notification', function (n) {
  device.wakeUp()
  // 监听来自QQ且包含“打卡”字样的消息
  if (n.getPackageName() == 'com.tencent.mobileqq') {
    log('收到打卡指令，开始执行...')
    if (n.getText().indexOf('打卡') != -1) {
      doCheckIn()
    }

    if (n.getText().indexOf('测试') != -1) {
      doAutoTest(n)
    }

    if (n.getText().indexOf('首页') != -1) {
      home()
    }
  }

  // 钉钉
  if (n.getPackageName() == 'com.alibaba.android.rimet') {
    if (n.getText().indexOf('打卡成功') != -1) {
      callBack(n)
    }
  }
})

function doCheckIn() {
  // 1. 点亮并打开屏幕
  if (!device.isScreenOn()) {
    device.wakeUp()
    sleep(1000)
    // OPPO 向上滑动解锁（如果没有密码）
    swipe(500, 1800, 500, 500, 500)
    sleep(1000)
  }

  // 2. 启动钉钉
  log('正在启动钉钉...')
  launchApp('钉钉')

  // 3. 等待钉钉加载（假设你开启了“极速打卡”）
  // 极速打卡通常进入页面5-10秒内会自动触发
  sleep(6000)

  // 4. (可选) 如果没有极速打卡，需要手动点击
  // 这里建议开启钉钉的“极速打卡”功能最为稳妥

  // 5. 回到主页
  log('打卡动作完成，返回主页')
  home()
  sleep(1000)

  // 6. 反馈：如果你想让QQ回复，需要更复杂的逻辑，
  // 简单点可以直接利用钉钉自身的打卡成功推送通知给你的另一台设备
}
var testFlag = false
var base_url = 'http://117.72.47.76/api'
function doAutoTest(n) {
  if (testFlag) return
  testFlag = true
  var res = http.postJson('http://117.72.47.76/api/iot/checkin', {
    deviceName: device.product,
    checkType: 'test',
    rawMessage: n.getText(),
  })

  testFlag = false
  log('doAutoTest' + res)
}

var callFlag = false
function callBack(n) {
  if (callFlag) return
  callFlag = true
  var url = base_url + '/iot/checkin'
  http.postJson(url, {
    deviceName: device.product,
    checkType: 'checkinSuccess',
    rawMessage: n.getText(),
  })

  callFlag = false
}

log('脚本已启动，正在监听通知...')
