// ==================== 钉钉定时自动打卡脚本 ====================
// Auto.js 4.1.1版本适用
// 功能：在指定时间段随机时间自动唤醒屏幕 -> 解锁 -> 打开钉钉 -> 打卡 -> 返回主页

// 脚本配置
var config = {
  // 打卡时间段配置
  morningStart: { hour: 8, minute: 30 }, // 早上开始时间 8:30
  morningEnd: { hour: 8, minute: 50 }, // 早上结束时间 8:50
  eveningStart: { hour: 17, minute: 35 }, // 晚上开始时间 17:35
  eveningEnd: { hour: 17, minute: 50 }, // 晚上结束时间 17:50

  // 应用包名
  dingdingPackage: 'com.alibaba.android.rimet', // 钉钉包名

  // 屏幕解锁参数
  swipeStartY: 0.8, // 上滑起始位置(屏幕高度的比例)
  swipeEndY: 0.2, // 上滑结束位置(屏幕高度的比例)
  screenPassword: '', // 锁屏密码（不需要密码则留空）

  // 是否只在工作日打卡（周一到周五）
  workdayOnly: true,
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

// ==================== 主函数：计算随机时间并等待执行 ====================
function main() {
  log('========== 钉钉定时打卡脚本启动 ==========')

  // 获取当前时间
  var now = new Date()
  log('当前时间: ' + formatTime(now))

  // 计算今天两个时间段对应的随机时间戳
  var morningTime = getRandomTimeInRange(
    config.morningStart.hour,
    config.morningStart.minute,
    config.morningEnd.hour,
    config.morningEnd.minute
  )

  var eveningTime = getRandomTimeInRange(
    config.eveningStart.hour,
    config.eveningStart.minute,
    config.eveningEnd.hour,
    config.eveningEnd.minute
  )

  // 如果是工作日才设置打卡
  if (!config.workdayOnly || isWorkday()) {
    // 设置早上打卡
    if (morningTime > now.getTime()) {
      var waitMs = morningTime - now.getTime()
      log('早上打卡时间: ' + formatTime(new Date(morningTime)))
      log('距离早上打卡还有: ' + formatTimeRemaining(waitMs))

      // 等待到早上打卡时间
      setTimeout(function () {
        log('到达早上打卡时间，开始执行打卡')
        executeClockIn()
      }, waitMs)
    } else {
      log('早上打卡时间已过，跳过')
    }

    // 设置晚上打卡
    if (eveningTime > now.getTime()) {
      var waitMs = eveningTime - now.getTime()
      log('晚上打卡时间: ' + formatTime(new Date(eveningTime)))
      log('距离晚上打卡还有: ' + formatTimeRemaining(waitMs))

      // 等待到晚上打卡时间
      setTimeout(function () {
        log('到达晚上打卡时间，开始执行打卡')
        executeClockIn()
      }, waitMs)
    } else {
      log('晚上打卡时间已过，跳过')
    }
  } else {
    log('今天是非工作日，不设置打卡任务')
  }

  // 保持脚本运行
  log('脚本将持续运行，等待定时任务触发...')
}

// ==================== 计算指定时间段内的随机时间 ====================
function getRandomTimeInRange(startHour, startMin, endHour, endMin) {
  var now = new Date()
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 计算时间段的起始和结束时间戳
  var startTime = new Date(today)
  startTime.setHours(startHour, startMin, 0, 0)

  var endTime = new Date(today)
  endTime.setHours(endHour, endMin, 59, 999) // 包含到最后一秒

  // 在起始和结束之间生成随机时间
  var randomTime = startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime())

  return randomTime
}

// ==================== 判断今天是否是工作日（周一到周五） ====================
function isWorkday() {
  var today = new Date().getDay()
  // 周日是0，周一到周五是1-5，周六是6
  return today >= 1 && today <= 5
}

// ==================== 格式化时间 ====================
function formatTime(date) {
  var hour = date.getHours().toString().padStart(2, '0')
  var minute = date.getMinutes().toString().padStart(2, '0')
  var second = date.getSeconds().toString().padStart(2, '0')
  return hour + ':' + minute + ':' + second
}

// ==================== 格式化剩余时间 ====================
function formatTimeRemaining(ms) {
  var seconds = Math.floor(ms / 1000)
  var hours = Math.floor(seconds / 3600)
  seconds %= 3600
  var minutes = Math.floor(seconds / 60)
  seconds %= 60
  return hours + '小时' + minutes + '分钟' + seconds + '秒'
}

// ==================== 执行打卡流程 ====================
function executeClockIn() {
  log('===== 开始执行打卡流程 =====')
  toast('开始自动打卡')

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

// ==================== 唤醒并解锁屏幕 ====================
function wakeAndUnlock() {
  log('检查屏幕状态')

  // 如果屏幕未亮，唤醒屏幕
  if (!device.isScreenOn()) {
    log('屏幕未亮，尝试唤醒')
    device.wakeUp()
    sleep(1500) // 等待屏幕完全点亮
  } else {
    log('屏幕已是亮屏状态')
  }

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
    // 尝试查找数字键盘并输入密码
    for (var i = 0; i < config.screenPassword.length; i++) {
      var digit = config.screenPassword.charAt(i)
      var btn = text(digit).findOne(2000)
      if (btn) {
        btn.click()
        sleep(300)
      }
    }
    sleep(1000)

    // 尝试点击确认按钮（通常是右下角的确定或回车）
    var confirmBtn = text('确定').findOne(1000) || text('OK').findOne(1000) || text('完成').findOne(1000)
    if (confirmBtn) {
      confirmBtn.click()
    }
    sleep(2000)
  }

  log('屏幕解锁完成')
  return true
}

// ==================== 钉钉打卡操作 ====================
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
    // 随机延迟1-3秒，模拟人工操作
    var randomDelay = random(1000, 3000)
    log('等待' + randomDelay / 1000 + '秒后点击')
    sleep(randomDelay)

    clockBtn.click()
    sleep(3000)

    // 检查是否进入打卡页面，查找打卡按钮
    log('查找打卡操作按钮')
    var punchBtn =
      descMatches(/.*上班打卡.*|.*下班打卡.*|.*打卡.*/).findOne(3000) ||
      textMatches(/.*上班打卡.*|.*下班打卡.*|.*打卡.*/).findOne(3000)

    if (punchBtn) {
      // 随机延迟1-3秒，模拟人工操作
      var randomDelay2 = random(1000, 3000)
      log('等待' + randomDelay2 / 1000 + '秒后点击打卡')
      sleep(randomDelay2)

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
      // 可能是极速打卡，已经自动打卡成功
      log('未找到打卡操作按钮，可能是极速打卡已自动完成')
      toast('可能是极速打卡成功')
    }
  } else {
    log('未找到考勤打卡入口')
    toast('未找到打卡入口')
  }
}

// ==================== 等待指定包名的应用出现在前台 ====================
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

// ==================== 启动主函数 ====================
main()

// 脚本停止时的清理工作
events.on('exit', function () {
  log('脚本已停止')
})
