// ==================== 钉钉自动打卡脚本 ====================
// Auto.js 4.1.1版本适用
// 功能：监听QQ消息"打卡" -> 解锁屏幕 -> 打开钉钉 -> 打卡 -> 返回主页

// 脚本配置
var config = {
  qqPackage: 'com.tencent.mobileqq', // QQ包名
  dingdingPackage: 'com.alibaba.android.rimet', // 钉钉包名
  keyword: '打卡', // 触发关键词
  swipeStartY: 0.8, // 上滑起始位置(屏幕高度的比例)
  swipeEndY: 0.2, // 上滑结束位置(屏幕高度的比例)
  // 如果需要密码解锁，在这里设置（不需要则留空）
  screenPassword: '', // 例如："123456"
}

// 请求必要权限
auto.waitFor()
console.show() // 显示控制台，便于调试

// 检查无障碍权限
if (!auto.service) {
  toast('请开启无障碍服务')
  app.startActivity({
    action: 'android.settings.ACCESSIBILITY_SETTINGS',
  })
  exit()
}

// 主函数：监听QQ消息
function startListening() {
  toast('开始监听QQ消息...')
  log("脚本已启动，等待包含'" + config.keyword + "'的QQ消息")

  // 监听通知栏消息
  events.observeNotification()
  events.onNotification(function (notification) {
    // 只处理QQ的消息
    if (notification.getPackageName() !== config.qqPackage) {
      return
    }

    // 获取通知内容
    var text = notification.getText()
    var title = notification.getTitle()
    log('收到QQ通知 - 标题: ' + title + ', 内容: ' + text)

    // 检查是否包含关键词
    if (text && text.indexOf(config.keyword) >= 0) {
      log('检测到打卡关键词，开始执行打卡流程')
      toast('检测到打卡指令，5秒后开始执行...')

      // 延迟几秒，让手机稳定一下
      sleep(5000)

      // 执行打卡流程
      executeClockIn()
    }
  })

  // 保持脚本运行
  setInterval(function () {
    log('监听中...')
  }, 60000)
}

// 执行打卡流程
function executeClockIn() {
  log('===== 开始执行打卡流程 =====')

  // 1. 唤醒并解锁屏幕
  if (!wakeAndUnlock()) {
    toast('解锁屏幕失败，流程终止')
    return
  }

  // 2. 打开钉钉
  log('打开钉钉应用')
  toast('打开钉钉')
  launchApp('钉钉')
  sleep(5000) // 等待钉钉启动

  // 3. 等待钉钉主界面加载
  waitForPackage(config.dingdingPackage)
  log('钉钉已启动')

  // 4. 执行打卡操作
  performDingdingClock()

  // 5. 返回主页
  sleep(3000)
  home()
  log('已返回主页')
  toast('打卡流程执行完毕')
  log('===== 打卡流程结束 =====')
}

// 唤醒并解锁屏幕
function wakeAndUnlock() {
  log('检查屏幕状态')

  // 如果屏幕已亮，直接返回true
  if (device.isScreenOn()) {
    log('屏幕已是亮屏状态')
    return true
  }

  log('屏幕未亮，尝试唤醒')

  // 唤醒屏幕
  device.wakeUp()
  sleep(1500) // 等待屏幕完全点亮

  // 检查是否有锁屏界面
  // 上滑解锁（从屏幕底部向上滑动）
  var x = device.width / 2
  var startY = device.height * config.swipeStartY
  var endY = device.height * config.swipeEndY

  log('执行上滑手势: (' + x + ', ' + startY + ') -> (' + x + ', ' + endY + ')')
  swipe(x, startY, x, endY, 300)
  sleep(2000)

  // 如果需要密码解锁
  if (config.screenPassword) {
    log('输入解锁密码')
    setText(config.screenPassword)
    sleep(500)
    // 点击确认按钮（通常是右下角的确定或回车）
    click(device.width - 200, device.height - 200)
    sleep(2000)
  }

  log('屏幕解锁完成')
  return true
}

// 钉钉打卡操作
function performDingdingClock() {
  log('开始执行钉钉打卡')

  // 等待钉钉主界面加载完成
  sleep(3000)

  // 尝试找到并点击"工作"按钮
  var maxRetries = 5
  var retryCount = 0

  while (retryCount < maxRetries) {
    log('尝试进入工作台，第' + (retryCount + 1) + '次尝试')

    // 方法1：通过文本查找"工作"
    var workBtn = text('工作').findOne(2000)
    if (workBtn) {
      log("找到'工作'按钮")
      workBtn.click()
      sleep(3000)
      break
    }

    // 方法2：通过描述查找
    var workDesc = desc('工作').findOne(2000)
    if (workDesc) {
      log("通过描述找到'工作'按钮")
      workDesc.click()
      sleep(3000)
      break
    }

    retryCount++
    if (retryCount < maxRetries) {
      log('未找到工作按钮，等待后重试')
      sleep(2000)
    }
  }

  // 查找考勤打卡按钮
  log('查找考勤打卡按钮')
  retryCount = 0
  var clockBtn = null

  while (retryCount < maxRetries && !clockBtn) {
    // 尝试多种方式查找打卡按钮
    clockBtn =
      descMatches(/.*考勤.*打卡.*|.*打卡.*/).findOne(2000) ||
      textMatches(/.*考勤.*打卡.*|.*打卡.*/).findOne(2000) ||
      desc('考勤打卡').findOne(1000) ||
      text('考勤打卡').findOne(1000)

    if (!clockBtn) {
      log('未找到打卡按钮，第' + (retryCount + 1) + '次尝试')
      // 尝试滑动屏幕查找
      swipe(device.width / 2, device.height * 0.7, device.width / 2, device.height * 0.3, 500)
      sleep(1500)
      retryCount++
    }
  }

  if (clockBtn) {
    log('找到打卡按钮，准备点击')
    clockBtn.click()
    sleep(3000)

    // 检查是否进入打卡页面，查找打卡按钮
    log('查找打卡操作按钮')
    var punchBtn =
      descMatches(/.*上班打卡.*|.*下班打卡.*|.*打卡.*/).findOne(3000) ||
      textMatches(/.*上班打卡.*|.*下班打卡.*|.*打卡.*/).findOne(3000)

    if (punchBtn) {
      // 随机延迟1-3秒，模拟人工操作
      var randomDelay = random(1000, 3000)
      log('等待' + randomDelay / 1000 + '秒后点击打卡')
      sleep(randomDelay)

      punchBtn.click()
      log('已点击打卡按钮')
      sleep(2000)

      // 处理打卡成功后的弹窗
      var confirmBtn =
        text('我知道了').findOne(2000) ||
        desc('我知道了').findOne(2000) ||
        text('完成').findOne(2000) ||
        desc('完成').findOne(2000)
      if (confirmBtn) {
        confirmBtn.click()
        log('关闭成功提示')
      }

      toast('打卡成功')
    } else {
      log('未找到打卡操作按钮')
    }
  } else {
    log('未找到考勤打卡入口')
    toast('未找到打卡入口')
  }
}

// 等待指定包名的应用出现在前台
function waitForPackage(packageName, timeout) {
  timeout = timeout || 10000
  var startTime = new Date().getTime()

  while (new Date().getTime() - startTime < timeout) {
    if (currentPackage() == packageName) {
      return true
    }
    sleep(500)
  }
  return false
}

// 启动脚本
startListening()

// 脚本停止时的清理工作
events.on('exit', function () {
  events.stopObservingNotification()
  log('脚本已停止')
})
