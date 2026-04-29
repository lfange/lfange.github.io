const { exec } = require('child_process')
const iconv = require('iconv-lite')

class SafeNetworkConfig {
  constructor() {
    this.encoding = 'gbk'
    this.backupFile = './network_backup.json'
  }

  /**
   * 执行命令
   */
  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { encoding: 'buffer', windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr: iconv.decode(stderr, this.encoding) })
        } else {
          resolve({
            stdout: iconv.decode(stdout, this.encoding),
            stderr: iconv.decode(stderr, this.encoding),
          })
        }
      })
    })
  }

  /**
   * 获取当前网络配置（备份）
   */
  async getCurrentConfig(interfaceName) {
    try {
      const { stdout } = await this.execCommand(`netsh interface ip show config "${interfaceName}"`)

      const config = {
        interfaceName,
        ipAddress: null,
        subnetMask: null,
        gateway: null,
        dhcp: false,
        backupTime: new Date().toISOString(),
      }

      // 检查 DHCP
      if (stdout.includes('DHCP 启用: 是') || stdout.includes('DHCP enabled: Yes')) {
        config.dhcp = true
      }

      // 提取 IP
      const ipMatch = stdout.match(/(?:IP 地址|IP Address):\s*(\d+\.\d+\.\d+\.\d+)/)
      if (ipMatch) config.ipAddress = ipMatch[1]

      // 提取子网掩码
      const maskMatch = stdout.match(/(?:子网掩码|Subnet Mask):\s*(\d+\.\d+\.\d+\.\d+)/)
      if (maskMatch) config.subnetMask = maskMatch[1]

      // 提取网关
      const gatewayMatch = stdout.match(/(?:默认网关|Default Gateway):\s*(\d+\.\d+\.\d+\.\d+)/)
      if (gatewayMatch && !gatewayMatch[1].includes('无') && !gatewayMatch[1].includes('None')) {
        config.gateway = gatewayMatch[1]
      }

      return config
    } catch (error) {
      console.error('获取配置失败:', error)
      return null
    }
  }

  /**
   * 备份当前配置
   */
  async backupConfig(interfaceName) {
    const config = await this.getCurrentConfig(interfaceName)
    if (config) {
      const fs = require('fs')
      fs.writeFileSync(this.backupFile, JSON.stringify(config, null, 2))
      console.log('配置已备份:', config)
      return config
    }
    return null
  }

  /**
   * 恢复配置
   */
  async restoreConfig() {
    const fs = require('fs')

    if (!fs.existsSync(this.backupFile)) {
      throw new Error('没有找到备份文件')
    }

    const backup = JSON.parse(fs.readFileSync(this.backupFile, 'utf8'))
    console.log('正在恢复配置:', backup)

    if (backup.dhcp) {
      // 恢复为 DHCP
      await this.execCommand(`netsh interface ip set address "${backup.interfaceName}" dhcp`)
      await this.execCommand(`netsh interface ip set dns "${backup.interfaceName}" dhcp`)
      console.log('已恢复为 DHCP 模式')
    } else {
      // 恢复静态 IP
      let command = `netsh interface ip set address "${backup.interfaceName}" static ${backup.ipAddress} ${backup.subnetMask}`
      if (backup.gateway) {
        command += ` ${backup.gateway}`
      } else {
        command += ` none`
      }
      await this.execCommand(command)
      console.log(`已恢复静态 IP: ${backup.ipAddress}`)
    }

    return backup
  }

  /**
   * 设置 IP（带自动恢复）
   */
  async setIPWithRollback(interfaceName, newIP, subnetMask = null, gateway = null) {
    // 1. 备份当前配置
    console.log('步骤1: 备份当前配置...')
    const backup = await this.backupConfig(interfaceName)

    if (!backup) {
      throw new Error('无法获取当前配置，操作中止')
    }

    // 2. 确定子网掩码
    let finalMask = subnetMask
    if (!finalMask) {
      // 如果没有指定，从备份中获取或使用默认值
      finalMask = backup.subnetMask || this.getDefaultSubnetMask(newIP)
      console.log(`使用子网掩码: ${finalMask}`)
    }

    // 3. 确定网关
    let finalGateway = gateway
    if (finalGateway === undefined) {
      finalGateway = backup.gateway || null
    }

    // 4. 尝试设置新 IP
    console.log(`步骤2: 尝试设置新 IP: ${newIP} ${finalMask} ${finalGateway || '无网关'}`)

    try {
      let command = `netsh interface ip set address "${interfaceName}" static ${newIP} ${finalMask}`
      if (finalGateway) {
        command += ` ${finalGateway}`
      } else {
        command += ` none`
      }

      await this.execCommand(command)

      // 5. 验证设置是否成功
      console.log('步骤3: 验证设置...')
      await this.sleep(2000) // 等待2秒让配置生效

      const newConfig = await this.getCurrentConfig(interfaceName)

      if (newConfig.ipAddress === newIP) {
        console.log('✅ IP 设置成功！')
        return {
          success: true,
          backup: backup,
          newConfig: newConfig,
        }
      } else {
        throw new Error(`IP 验证失败: 期望 ${newIP}，实际 ${newConfig.ipAddress}`)
      }
    } catch (error) {
      // 6. 设置失败，恢复配置
      console.error('❌ 设置失败:', error.message)
      console.log('步骤4: 正在恢复配置...')

      await this.restoreConfig()

      throw new Error(`设置 IP 失败，已恢复原配置。原因: ${error.message}`)
    }
  }

  /**
   * 获取默认子网掩码
   */
  getDefaultSubnetMask(ipAddress) {
    if (!ipAddress) return '255.255.255.0'

    const firstOctet = parseInt(ipAddress.split('.')[0])

    if (firstOctet >= 1 && firstOctet <= 126) {
      return '255.0.0.0' // A类
    } else if (firstOctet >= 128 && firstOctet <= 191) {
      return '255.255.0.0' // B类
    } else {
      return '255.255.255.0' // C类（默认）
    }
  }

  /**
   * 测试网络连通性
   */
  async testConnectivity(target = '8.8.8.8', timeout = 3000) {
    return new Promise((resolve) => {
      const command = `ping -n 1 -w ${timeout} ${target}`

      this.execCommand(command)
        .then(({ stdout }) => {
          const success = stdout.includes('TTL=') || stdout.includes('来自')
          resolve({ success, output: stdout })
        })
        .catch(() => resolve({ success: false, output: '' }))
    })
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ============ 使用示例 ============

async function main() {
  const network = new SafeNetworkConfig()

  try {
    // 示例1: 设置 IP（自动使用原子网掩码）
    console.log('=== 示例1: 只改 IP，保留原掩码 ===')
    const result1 = await network.setIPWithRollback('以太网', '192.168.30.220')
    console.log(result1)
  } catch (error) {
    console.error('操作失败:', error.message)
  }

  try {
    // 示例2: 指定子网掩码和网关
    console.log('\n=== 示例2: 指定完整配置 ===')
    const result2 = await network.setIPWithRollback(
      '以太网',
      '192.168.30.220',
      '255.255.255.0', // 指定掩码
      '192.168.30.1' // 指定网关
    )
    console.log(result2)
  } catch (error) {
    console.error('操作失败:', error.message)
  }

  try {
    // 示例3: 测试错误恢复（故意设置错误 IP）
    console.log('\n=== 示例3: 测试错误恢复 ===')
    const result3 = await network.setIPWithRollback(
      '以太网',
      '999.999.999.999', // 无效 IP，会失败
      '255.255.255.0'
    )
  } catch (error) {
    console.log('预期的错误，已自动恢复:', error.message)
  }
}

// 简单调用
async function setIPWithAutoRollback(interfaceName, newIP, subnetMask = null, gateway = null) {
  const network = new SafeNetworkConfig()
  return await network.setIPWithRollback(interfaceName, newIP, subnetMask, gateway)
}

// 使用
setIPWithAutoRollback('以太网', '192.168.30.220', '255.255.255.0', '192.168.30.1')
  .then((result) => {
    console.log('成功:', result)
  })
  .catch((error) => {
    console.error('失败（已自动恢复）:', error)
  })
