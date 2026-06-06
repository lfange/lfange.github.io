// 检查并请求通知监听权限
auto.waitFor()

toast('程序开始执行')

// 安全地启动通知监听
function startNotificationObserver() {
  try {
    // 检查是否已经开启了通知监听权限
    var enabledListeners = android.provider.Settings.Secure.getString(
      context.getContentResolver(),
      'enabled_notification_listeners'
    )
    var isEnabled = enabledListeners && enabledListeners.indexOf(context.getPackageName()) != -1

    if (!isEnabled) {
      toastLog('请授予通知监听权限')
      try {
        // 尝试打开标准通知监听设置页
        app.startActivity({
          action: 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS',
        })
      } catch (e) {
        // 如果标准的失败了，尝试 Auto.js 可能在用的那个（虽然它可能导致了报错）
        try {
          app.startActivity({
            action: 'android.settings.ACTION_NOTIFICATION_ACCESS_SETTINGS',
          })
        } catch (e2) {
          log('无法自动打开设置页: ' + e2)
          toastLog('请手动开启通知访问权限')
        }
      }
    }

    // 监听通知消息
    events.observeNotification()
  } catch (err) {
    log('启动通知监听失败: ' + err)
    toastLog('通知监听启动异常，请检查权限')
  }
}

startNotificationObserver()
events.on('notification', function (n) {
  device.wakeUp()
  log('notification:' + n)
  try {
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
      // if (n.getText().indexOf('考勤打卡') != -1) {
      callBack(n.getText())
      // }
    }
  } catch (err) {
    callBack(err)
  }
})

// 检查 Android 版本并执行滑动
function safeSwipe(x1, y1, x2, y2, duration) {
  if (device.sdkInt < 24) {
    // Android 7.0 以下 (SDK 24 以下)
    log('当前系统版本低于 Android 7.0，无法使用无障碍滑动')
    return false
  }
  try {
    swipe(x1, y1, x2, y2, duration)
    return true
  } catch (e) {
    log('滑动失败: ' + e)
    return false
  }
}

// 强力唤醒并解锁（适用于无密码情况）
function robustWakeUp() {
  device.wakeUp()
  sleep(500)
  // 连续尝试回到主页，通常第一次点亮屏幕，第二次进入桌面
  home()
  sleep(1000)
  home()
  sleep(500)

  // 配合滑动（如果是 7.0+ 会执行，否则跳过）
  safeSwipe(500, 1800, 500, 500, 500)
  sleep(1000)
}

function doCheckIn() {
  // 1. 点亮并打开屏幕
  robustWakeUp()

  // 2. 启动钉钉
  log('正在启动钉钉...')
  launchApp('钉钉')

  // 3. 等待钉钉加载（假设你开启了“极速打卡”）
  // 极速打卡通常进入页面5-10秒内会自动触发
  sleep(10000)

  // 4. (可选) 如果没有极速打卡，需要手动点击
  // 这里建议开启钉钉的“极速打卡”功能最为稳妥

  // 5. 回到主页
  log('打卡动作完成，返回主页')
  callBack('打卡动作完成，返回主页')
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
  http.postJson('http://117.72.47.76/api/iot/checkin', {
    deviceName: device.product,
    checkType: 'success',
    rawMessage: n,
  })
  log('callBackcallBack', n)
  callFlag = false
}

log('脚本已启动，正在监听通知...')

// 设置一小时自动点亮
function keepActive() {
  robustWakeUp()
}

// setInterval(keepActive, 1000 * 60 * 60)
