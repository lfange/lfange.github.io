# 创建自签名代码签名证书

### 生成自签名证书流程

- 生成自签名证书 ：在内网服务器上生成一个代码签名证书。
- 导入根证书 ：通过域控（Group Policy）将该证书的根证书导入所有终端电脑的“受信任的根证书颁发机构”。
- 打包签名 ：使用该证书对 Electron 应用进行签名。
- 效果 ：杀毒软件看到程序有受信任的内部签名，会自动停止拦截。

### 本地生成自签名

#### 1. 创建自签名代码签名证书

```powershell
$cert = New-SelfSignedCertificate -Type CodeSigningCert `
    -Subject "CN=医疗系统软件中心, O=医疗病历项目组, C=CN" `
    -KeyUsage DigitalSignature `
    -FriendlyName "医疗系统内网代码签名证书" `
    -NotAfter (Get-Date).AddYears(10) # 有效期10年
```

#### 2. 设置证书导出密码（请记住这个密码，打包时要用）

```powershell
$password = ConvertTo-SecureString -String "YourPassword123" -Force -AsPlainText
```

#### 3. 将证书导出为 .pfx 文件

```powershell
Export-PfxCertificate -Cert $cert -FilePath "E:\work\github\print\internal-codesign.pfx" -Password $password
```

### 让内网机器“信任”该证书

由于是自签名证书，默认情况下 Windows 仍会提示“未知发布者”。你需要让内网的所有客户端电脑信任你的根证书：

1. 导出根证书 (.cer) ： 从 .pfx 生成 .cer 文件

   ```powershell
    # 1. 定义你的 PFX 文件路径和当时设置的密码
    $pfxPath = "E:\work\github\print\internal-codesign.pfx"
    $password = "YourPassword123" # 替换为你设置的密码

    # 2. 加载证书
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
    $cert.Import($pfxPath, $password, [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::DefaultKeySet)

    # 3. 导出为 CER 文件（仅包含公钥，不含私钥，可以安全分发）
    $cerPath = "E:\work\github\print\internal-codesign.cer"
    $bin = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    [System.IO.File]::WriteAllBytes($cerPath, $bin)

    Write-Host "成功！已生成公钥文件: $cerPath" -ForegroundColor Green
   ```

1. 双击 打开 internal-codesign.cer 。
1. 点击底部的 “安装证书...” 按钮。
1. 存储位置 ：选择 “本地计算机” （这需要管理员权限），然后点击“下一步”。
1. 证书存储 ：


    - 不要让 Windows 自动选择。
    - 勾选 “将所有的证书都放入下列存储” 。
    - 点击 “浏览” 。
    - 关键： 选择 “受信任的根证书颁发机构” ，点击确定。

5. 点击“下一步”，然后点击“完成”。
6. 系统会弹出安全提示，询问是否信任此发布者，点击 “是”

验证安装是否成功 ： 方式一

- 打开 “控制面板” -> “系统和安全” -> “管理工具” -> “证书管理器”。
- 在 “受信任的根证书颁发机构” 下，检查是否已安装 internal-codesign.cer 证书。

方式二

- 按下 Win + R ，输入 certlm.msc 并回车（打开本地计算机证书管理器）。
- 展开左侧的 “受信任的根证书颁发机构” -> “证书” 。
- 在列表中寻找你设置的名称（例如： 医疗系统软件中心 ）。
- 如果能看到它，说明这台电脑现在已经完全信任你的签名了。

#### 内网 IT 统一推送（推荐） ：

如果是通过域控（AD 域）管理，IT 部门可以通过 组策略 (GPO) 批量将此 .cer 文件下发到所有机器的“受信任的根证书颁发机构”中。

### electron 打包配置

将生成的 internal-codesign.pfx 放在项目根目录下，package.json 中配置添加这个配置

```json
"win": {
  "sign": "./sign.js",  // 如果是内网则需要配置签名打包获取时间戳
  "icon": "build/icons/sticon.ico",
  "target": [
    "nsis"
  ],
  "publisherName": "client_k",
  "icon": "build/icons/icon.ico",
  "requestedExecutionLevel": "requireAdministrator",
  "certificateFile": "internal-codesign.pfx",
  "certificatePassword": "YourPassword123", // 确保这是你生成 pfx 时设置的密码
  "timeStampServer": "" // 关键：设为空字符串，禁用联网获取时间戳
}
```

sign.js

```js
const { execSync } = require('child_process')
const path = require('path')

exports.default = async function (configuration) {
  // electron-builder 传递的参数在 configuration 对象中
  const filePath = configuration.path
  // 注意：旧版 electron-builder 可能将证书路径放在 options 中
  const certFile = configuration.options.certificateFile || 'internal-codesign.pfx'
  const certPassword = configuration.options.certificatePassword || '123456'

  // 1. 指定 signtool 的绝对路径 (从你之前的报错日志中提取)
  // 请确保这个路径在你的机器上是存在的
  const signtool = path.join(
    process.env.LOCALAPPDATA,
    'electron-builder/Cache/winCodeSign/winCodeSign-2.4.0/windows-10/x64/signtool.exe'
  )

  console.log(`--- 开始手动签名 ---`)
  console.log(`文件: ${filePath}`)

  try {
    // 2. 核心：去掉 /t 参数，增加 /fd sha256 确保兼容性
    const command = `"${signtool}" sign /f "${certFile}" /p "${certPassword}" /d "现场监督检查支撑工具" /fd sha256 /v "${filePath}"`

    console.log(`执行命令: ${command}`)
    execSync(command, { stdio: 'inherit' })
    console.log(`--- 签名成功 ---`)
  } catch (e) {
    console.error('--- 手动签名失败 ---')
    // 如果上面的路径不对，尝试直接打印错误，看能不能找到 signtool
    throw e
  }
}
```

配置完后 `npm run build`就可以了，打包时可以看见开始手动签名，签名成功。
