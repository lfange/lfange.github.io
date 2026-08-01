import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as s,o as e,b as a}from"./app-ByTKU10L.js";const t={},i=a(`<h1 id="linux-操作系统及国产化操作系统深度分析" tabindex="-1"><a class="header-anchor" href="#linux-操作系统及国产化操作系统深度分析"><span>Linux 操作系统及国产化操作系统深度分析</span></a></h1><h2 id="目录" tabindex="-1"><a class="header-anchor" href="#目录"><span>目录</span></a></h2><ol><li><a href="#1-linux-%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E6%A6%82%E8%BF%B0">Linux 操作系统概述</a></li><li><a href="#2-%E4%B8%BB%E6%B5%81-linux-%E5%8F%91%E8%A1%8C%E7%89%88%E5%88%86%E6%9E%90">主流 Linux 发行版分析</a></li><li><a href="#3-%E5%9B%BD%E4%BA%A7%E5%8C%96%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E6%B7%B1%E5%BA%A6%E5%88%86%E6%9E%90">国产化操作系统深度分析</a></li><li><a href="#4-%E9%BA%92%E9%BA%9F%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-kylinos">麒麟操作系统 (KylinOS)</a></li><li><a href="#5-%E7%BB%9F%E4%BF%A1-uos">统信 UOS</a></li><li><a href="#6-%E6%B7%B1%E5%BA%A6-deepin">深度 Deepin</a></li><li><a href="#7-%E5%8D%8E%E4%B8%BA-openeuler">华为 openEuler</a></li><li><a href="#8-%E5%9B%BD%E4%BA%A7%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E5%AF%B9%E6%AF%94%E6%80%BB%E7%BB%93">国产操作系统对比总结</a></li><li><a href="#9-%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C-demo">常用操作 Demo</a></li><li><a href="#10-%E9%80%89%E5%9E%8B%E5%BB%BA%E8%AE%AE%E4%B8%8E%E8%B6%8B%E5%8A%BF%E5%B1%95%E6%9C%9B">选型建议与趋势展望</a></li></ol><hr><h2 id="_1-linux-操作系统概述" tabindex="-1"><a class="header-anchor" href="#_1-linux-操作系统概述"><span>1. Linux 操作系统概述</span></a></h2><h3 id="_1-1-linux-内核与发行版" tabindex="-1"><a class="header-anchor" href="#_1-1-linux-内核与发行版"><span>1.1 Linux 内核与发行版</span></a></h3><p>Linux 严格来说只是一个操作系统内核，由 Linus Torvalds 于 1991 年发布。完整的操作系统 = Linux 内核 + GNU 工具链 + 包管理器 + 桌面环境 + 应用程序，这个组合称为&quot;Linux 发行版&quot;（Distribution）。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌──────────────────────────────────────────────────┐
│                  应用程序层                        │
│         (LibreOffice, Firefox, VS Code...)        │
├──────────────────────────────────────────────────┤
│                  桌面环境层                        │
│         (GNOME, KDE, XFCE, DDE, UKUI...)         │
├──────────────────────────────────────────────────┤
│                  系统服务层                        │
│     (systemd, NetworkManager, PulseAudio...)      │
├──────────────────────────────────────────────────┤
│                  包管理层                          │
│         (APT/dpkg, YUM/RPM, DNF, pacman...)      │
├──────────────────────────────────────────────────┤
│                  GNU 工具链                       │
│         (bash, glibc, coreutils, gcc...)          │
├──────────────────────────────────────────────────┤
│                  Linux 内核                        │
│     (进程调度, 内存管理, 文件系统, 网络栈, 驱动)    │
└──────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-2-linux-发行版家族图谱" tabindex="-1"><a class="header-anchor" href="#_1-2-linux-发行版家族图谱"><span>1.2 Linux 发行版家族图谱</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>                    Linux Kernel
                         │
         ┌───────────────┼───────────────┐
         │               │               │
     Debian 系       Red Hat 系      其他独立系
         │               │               │
    ┌────┴────┐     ┌────┴────┐     ┌───┴───┐
  Debian   Ubuntu  RHEL   Fedora  Arch  openSUSE
    │         │      │       │      │       │
  Deepin   Mint   CentOS  Alma  Manjaro  SUSE
  UOS      Kylin  Rocky   EuroLinux
           (早期)  Oracle  Anolis OS
                  openEuler
                  麒麟V10(新)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="_2-主流-linux-发行版分析" tabindex="-1"><a class="header-anchor" href="#_2-主流-linux-发行版分析"><span>2. 主流 Linux 发行版分析</span></a></h2><h3 id="_2-1-debian-系" tabindex="-1"><a class="header-anchor" href="#_2-1-debian-系"><span>2.1 Debian 系</span></a></h3><h4 id="debian" tabindex="-1"><a class="header-anchor" href="#debian"><span>Debian</span></a></h4><table><thead><tr><th>维度</th><th>评价</th></tr></thead><tbody><tr><td><strong>稳定性</strong></td><td>⭐⭐⭐⭐⭐ 极其稳定，&quot;坚如磐石&quot;，stable 分支经过极其严格的测试</td></tr><tr><td><strong>软件数量</strong></td><td>⭐⭐⭐⭐⭐ 官方仓库超 59000 个软件包</td></tr><tr><td><strong>易用性</strong></td><td>⭐⭐⭐ 需要一定 Linux 基础</td></tr><tr><td><strong>社区支持</strong></td><td>⭐⭐⭐⭐⭐ 全球最大的社区发行版之一</td></tr><tr><td><strong>更新周期</strong></td><td>慢，约 2 年一个大版本</td></tr><tr><td><strong>适用场景</strong></td><td>服务器、对稳定性要求极高的生产环境</td></tr></tbody></table><p><strong>优点：</strong></p><ul><li>极度稳定，适合关键任务环境</li><li>完全由社区驱动，开源纯粹度高</li><li>APT 包管理系统成熟稳定</li><li>支持架构最广泛（x86, ARM, MIPS, PowerPC 等）</li></ul><p><strong>缺点：</strong></p><ul><li>软件版本较旧（追求稳定性所致）</li><li>桌面体验不如 Ubuntu 等优化得好</li><li>对新硬件的支持可能滞后</li></ul><h4 id="ubuntu" tabindex="-1"><a class="header-anchor" href="#ubuntu"><span>Ubuntu</span></a></h4><table><thead><tr><th>维度</th><th>评价</th></tr></thead><tbody><tr><td><strong>稳定性</strong></td><td>⭐⭐⭐⭐ LTS 版本非常稳定</td></tr><tr><td><strong>易用性</strong></td><td>⭐⭐⭐⭐⭐ 最友好的 Linux 发行版之一</td></tr><tr><td><strong>生态完善度</strong></td><td>⭐⭐⭐⭐⭐ 商业支持好，Canonical 公司背书</td></tr><tr><td><strong>社区活跃度</strong></td><td>⭐⭐⭐⭐⭐ 全球用户量最大的 Linux 发行版</td></tr><tr><td><strong>适用场景</strong></td><td>桌面、服务器、云计算（广泛）</td></tr></tbody></table><p><strong>优点：</strong></p><ul><li>用户界面友好，入门门槛低</li><li>LTS 版本提供 5 年（可扩展至 10 年）支持</li><li>云平台支持最佳（AWS、Azure、GCP 首选）</li><li>大量商业软件提供 Ubuntu 原生支持</li><li>Snap 包格式简化应用分发</li></ul><p><strong>缺点：</strong></p><ul><li>对 Snap 的强推引起部分社区反感</li><li>系统资源占用相对较高</li><li>部分决策受商业利益影响</li></ul><h3 id="_2-2-red-hat-系" tabindex="-1"><a class="header-anchor" href="#_2-2-red-hat-系"><span>2.2 Red Hat 系</span></a></h3><h4 id="rhel-red-hat-enterprise-linux" tabindex="-1"><a class="header-anchor" href="#rhel-red-hat-enterprise-linux"><span>RHEL (Red Hat Enterprise Linux)</span></a></h4><table><thead><tr><th>维度</th><th>评价</th></tr></thead><tbody><tr><td><strong>企业级特性</strong></td><td>⭐⭐⭐⭐⭐ 全球企业级 Linux 标杆</td></tr><tr><td><strong>商业支持</strong></td><td>⭐⭐⭐⭐⭐ 世界级技术支持</td></tr><tr><td><strong>认证生态</strong></td><td>⭐⭐⭐⭐⭐ 几乎所有企业软件的认证平台</td></tr><tr><td><strong>成本</strong></td><td>需要订阅费用（开发用途可免费）</td></tr><tr><td><strong>适用场景</strong></td><td>大型企业核心业务、金融、政府</td></tr></tbody></table><p><strong>优点：</strong></p><ul><li>10 年生命周期支持</li><li>通过 SELinux 提供强大的安全策略</li><li>完善的认证体系（符合 FIPS、CC 等标准）</li><li>企业级技术支持服务</li></ul><p><strong>缺点：</strong></p><ul><li>订阅费用较高</li><li>桌面体验不如 Ubuntu</li><li>新特性引入保守</li></ul><h4 id="centos-stream-rocky-linux-almalinux" tabindex="-1"><a class="header-anchor" href="#centos-stream-rocky-linux-almalinux"><span>CentOS Stream / Rocky Linux / AlmaLinux</span></a></h4><p>随着 CentOS 8 在 2021 年提前终止维护，社区分化出 Rocky Linux 和 AlmaLinux 作为 RHEL 的兼容替代品。CentOS Stream 变为 RHEL 的上游开发分支。</p><table><thead><tr><th>发行版</th><th>定位</th></tr></thead><tbody><tr><td><strong>Rocky Linux</strong></td><td>CentOS 创始人发起，RHEL 下游二进制兼容</td></tr><tr><td><strong>AlmaLinux</strong></td><td>CloudLinux 公司支持，RHEL 下游二进制兼容</td></tr><tr><td><strong>CentOS Stream</strong></td><td>RHEL 上游，滚动更新</td></tr></tbody></table><hr><h2 id="_3-国产化操作系统深度分析" tabindex="-1"><a class="header-anchor" href="#_3-国产化操作系统深度分析"><span>3. 国产化操作系统深度分析</span></a></h2><h3 id="_3-1-国产操作系统发展背景" tabindex="-1"><a class="header-anchor" href="#_3-1-国产操作系统发展背景"><span>3.1 国产操作系统发展背景</span></a></h3><p>国产操作系统的发展受以下因素驱动：</p><ol><li><strong>信创产业政策</strong>：国家信息技术应用创新产业推动，要求关键领域使用自主可控技术</li><li><strong>信息安全需求</strong>：政府和关键行业对操作系统安全可控的需求</li><li><strong>技术自主可控</strong>：减少对 Windows 等闭源系统的依赖</li><li><strong>产业生态建设</strong>：构建从芯片到应用的完整国产化生态链</li></ol><h3 id="_3-2-国产操作系统技术路线" tabindex="-1"><a class="header-anchor" href="#_3-2-国产操作系统技术路线"><span>3.2 国产操作系统技术路线</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>国产操作系统
    │
    ├── 基于 Linux 内核（主流路线）
    │   ├── Debian/Ubuntu 系
    │   │   ├── 统信 UOS (Deepin 商业版)
    │   │   ├── 深度 Deepin (社区版)
    │   │   └── 银河麒麟（早期版本）
    │   │
    │   └── RHEL/CentOS 系
    │       ├── 银河麒麟 V10 (新版本)
    │       ├── 中标麒麟 (NeoKylin)
    │       ├── openEuler (华为)
    │       └── Anolis OS (阿里)
    │
    └── 非 Linux 内核（自研路线）
        ├── 鸿蒙 HarmonyOS (华为，微内核)
        └── 统信 UOS 服务器版（支持多内核）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="_4-麒麟操作系统-kylinos" tabindex="-1"><a class="header-anchor" href="#_4-麒麟操作系统-kylinos"><span>4. 麒麟操作系统 (KylinOS)</span></a></h2><h3 id="_4-1-产品谱系" tabindex="-1"><a class="header-anchor" href="#_4-1-产品谱系"><span>4.1 产品谱系</span></a></h3><p>麒麟软件由**中国电子（CEC）**旗下，是中国历史最悠久的国产操作系统品牌之一。</p><table><thead><tr><th>产品</th><th>技术路线</th><th>定位</th></tr></thead><tbody><tr><td><strong>银河麒麟桌面操作系统 V10</strong></td><td>基于 Linux 内核，兼容 RHEL 生态</td><td>桌面办公</td></tr><tr><td><strong>银河麒麟服务器操作系统 V10</strong></td><td>基于 Linux 内核，兼容 RHEL 生态</td><td>服务器</td></tr><tr><td><strong>银河麒麟高级服务器操作系统 V10</strong></td><td>基于 openEuler 技术路线</td><td>高端服务器</td></tr><tr><td><strong>中标麒麟</strong></td><td>早期品牌，已逐步整合</td><td>桌面/服务器</td></tr></tbody></table><h3 id="_4-2-技术架构" tabindex="-1"><a class="header-anchor" href="#_4-2-技术架构"><span>4.2 技术架构</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────────────────┐
│            麒麟桌面环境 (UKUI)            │
│     (基于 Qt 的自研桌面环境)              │
├─────────────────────────────────────────┤
│        麒麟应用商店 / 软件中心            │
├─────────────────────────────────────────┤
│         KYEC 安全增强框架                 │
│     (内核安全模块 + 应用白名单 + 审计)    │
├─────────────────────────────────────────┤
│         RPM 包管理 (兼容 RHEL/CentOS)     │
├─────────────────────────────────────────┤
│         Linux Kernel (LTS) + 国产芯片补丁 │
├─────────────────────────────────────────┤
│   国产硬件适配层                          │
│   (飞腾/鲲鹏/龙芯/申威/海光/兆芯)         │
└─────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-3-优点" tabindex="-1"><a class="header-anchor" href="#_4-3-优点"><span>4.3 优点</span></a></h3><table><thead><tr><th>优点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>硬件兼容性广泛</strong></td><td>支持六大国产 CPU 平台：飞腾(ARM)、鲲鹏(ARM)、龙芯(MIPS/LoongArch)、申威(Alpha)、海光(x86)、兆芯(x86)，是适配国产芯片最全的操作系统</td></tr><tr><td><strong>安全性强</strong></td><td>内置 KYEC（Kylin Enhanced Security）安全框架，支持三权分立（系统管理员、安全管理员、审计管理员），通过等保 2.0 四级认证</td></tr><tr><td><strong>生态兼容性好</strong></td><td>RPM 包格式兼容 RHEL/CentOS 生态，可运行大量企业级软件；同时通过 Wine 兼容部分 Windows 应用</td></tr><tr><td><strong>政府采购优势</strong></td><td>在信创政府采购中占据最大市场份额（约 40%+），是政府/军队/国企首选</td></tr><tr><td><strong>中文支持完善</strong></td><td>原生中文输入法、字体、中文显示优化</td></tr><tr><td><strong>长期支持</strong></td><td>提供 5-10 年的长期维护服务</td></tr><tr><td><strong>桌面环境 UKUI</strong></td><td>类 Windows 操作风格，降低用户迁移成本</td></tr></tbody></table><h3 id="_4-4-缺点" tabindex="-1"><a class="header-anchor" href="#_4-4-缺点"><span>4.4 缺点</span></a></h3><table><thead><tr><th>缺点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>软件生态相对匮乏</strong></td><td>相比 Ubuntu/Debian，可用应用数量少；部分专业软件（如 Adobe 系列）无法运行</td></tr><tr><td><strong>更新节奏慢</strong></td><td>追求稳定性导致内核版本和软件版本较旧</td></tr><tr><td><strong>社区活跃度低</strong></td><td>社区版影响力有限，大部分开发由公司内部完成，开源贡献度不高</td></tr><tr><td><strong>兼容性仍有问题</strong></td><td>部分外设（打印机、扫描仪等）驱动缺失；部分 x86 Windows 应用兼容性不完美</td></tr><tr><td><strong>学习资源少</strong></td><td>相比 Ubuntu 等主流发行版，教程和问题解决方案少</td></tr><tr><td><strong>授权机制复杂</strong></td><td>商业版需要激活授权，管理不够灵活</td></tr><tr><td><strong>对非信创硬件的支持</strong></td><td>对普通 PC 硬件的支持不如 Ubuntu 完善</td></tr></tbody></table><hr><h2 id="_5-统信-uos" tabindex="-1"><a class="header-anchor" href="#_5-统信-uos"><span>5. 统信 UOS</span></a></h2><h3 id="_5-1-产品概述" tabindex="-1"><a class="header-anchor" href="#_5-1-产品概述"><span>5.1 产品概述</span></a></h3><p>统信 UOS（Uniontech OS）由<strong>统信软件技术有限公司</strong>开发，基于深度 Deepin 发展而来，是 Deepin 的商业化版本。</p><table><thead><tr><th>版本</th><th>定位</th><th>技术路线</th></tr></thead><tbody><tr><td><strong>统信 UOS 桌面版</strong></td><td>桌面办公</td><td>基于 Deepin，Debian 系</td></tr><tr><td><strong>统信 UOS 服务器版</strong></td><td>服务器</td><td>支持多内核</td></tr><tr><td><strong>统信 UOS 教育版</strong></td><td>教育行业</td><td>桌面版定制</td></tr><tr><td><strong>统信 UOS 专业版</strong></td><td>政企客户</td><td>桌面版增强</td></tr></tbody></table><h3 id="_5-2-技术架构" tabindex="-1"><a class="header-anchor" href="#_5-2-技术架构"><span>5.2 技术架构</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────────────────┐
│          DDE (Deepin Desktop Environment) │
│     基于 Qt 的自研桌面，UOS 精美设计      │
├─────────────────────────────────────────┤
│         统信应用商店 (Deepin Store)       │
├─────────────────────────────────────────┤
│         统信安全框架                      │
│     (应用签名验证 + 内核安全加固)         │
├─────────────────────────────────────────┤
│         DPKG/APT 包管理 (Debian 系)      │
├─────────────────────────────────────────┤
│         Linux Kernel + 国产芯片适配       │
├─────────────────────────────────────────┤
│   国产硬件适配层                          │
│   (飞腾/鲲鹏/龙芯/申威/海光/兆芯)         │
└─────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-3-优点" tabindex="-1"><a class="header-anchor" href="#_5-3-优点"><span>5.3 优点</span></a></h3><table><thead><tr><th>优点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>用户体验最佳</strong></td><td>DDE 桌面环境美观精致，动画流畅，被称为&quot;最漂亮的 Linux 桌面&quot;</td></tr><tr><td><strong>类 macOS 设计</strong></td><td>操作逻辑类似 macOS，对 Mac 用户友好；也有类 Windows 模式</td></tr><tr><td><strong>应用生态较好</strong></td><td>应用商店覆盖常用软件（WPS、微信、QQ、企业微信、钉钉、浏览器等）</td></tr><tr><td><strong>兼容性较强</strong></td><td>通过 Deepin-Wine 兼容大量 Windows 应用，体验优于普通 Wine</td></tr><tr><td><strong>硬件适配广</strong></td><td>支持主流国产芯片，对普通 PC 也有较好支持</td></tr><tr><td><strong>系统安装简便</strong></td><td>图形化安装向导，分区等操作对新手友好</td></tr><tr><td><strong>分区策略灵活</strong></td><td>支持全盘安装、手动分区、与 Windows 共存等</td></tr></tbody></table><h3 id="_5-4-缺点" tabindex="-1"><a class="header-anchor" href="#_5-4-缺点"><span>5.4 缺点</span></a></h3><table><thead><tr><th>缺点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>系统资源占用高</strong></td><td>DDE 桌面相对较重，低配机器可能卡顿</td></tr><tr><td><strong>稳定性待提升</strong></td><td>相比 RHEL/Debian 稳定性稍逊，偶有桌面崩溃</td></tr><tr><td><strong>Root 权限控制严</strong></td><td>默认禁用 root 账户，对开发者不够友好</td></tr><tr><td><strong>社区与商业版割裂</strong></td><td>Deepin 社区版和 UOS 商业版差异较大，社区贡献回流不够</td></tr><tr><td><strong>国际化不足</strong></td><td>主要面向国内市场，英文文档和国际化支持弱</td></tr><tr><td><strong>云服务绑定</strong></td><td>部分功能需要统信账号登录</td></tr></tbody></table><hr><h2 id="_6-深度-deepin" tabindex="-1"><a class="header-anchor" href="#_6-深度-deepin"><span>6. 深度 Deepin</span></a></h2><h3 id="_6-1-概述" tabindex="-1"><a class="header-anchor" href="#_6-1-概述"><span>6.1 概述</span></a></h3><p>Deepin（深度操作系统）是统信 UOS 的上游社区版本，由武汉深之度科技有限公司开发，是中国最成功的开源桌面 Linux 发行版。</p><h3 id="_6-2-与统信-uos-的关系" tabindex="-1"><a class="header-anchor" href="#_6-2-与统信-uos-的关系"><span>6.2 与统信 UOS 的关系</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>Deepin (社区版) ──商业化──▶ 统信 UOS (商业版)
    │                           │
    ├─ 免费                       ├─ 付费
    ├─ 社区支持                   ├─ 商业技术支持
    ├─ 更新激进                   ├─ 更新保守
    ├─ 面向个人/开发者            ├─ 面向政企客户
    └─ 国际化                     └─ 国产化定制
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-3-优点" tabindex="-1"><a class="header-anchor" href="#_6-3-优点"><span>6.3 优点</span></a></h3><table><thead><tr><th>优点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>开源免费</strong></td><td>完全免费，社区驱动</td></tr><tr><td><strong>创新性强</strong></td><td>很多技术创新（Deepin-Wine、DDE 等）</td></tr><tr><td><strong>国际化程度高</strong></td><td>在 DistroWatch 排名前列，国际用户较多</td></tr><tr><td><strong>更新活跃</strong></td><td>社区版更新频繁，新特性多</td></tr><tr><td><strong>应用生态独特</strong></td><td>Deepin-Wine 对 Windows 应用的兼容性做了大量优化</td></tr></tbody></table><h3 id="_6-4-缺点" tabindex="-1"><a class="header-anchor" href="#_6-4-缺点"><span>6.4 缺点</span></a></h3><table><thead><tr><th>缺点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>稳定性不如商业版</strong></td><td>更新激进导致偶有 bug</td></tr><tr><td><strong>缺乏商业支持</strong></td><td>无官方技术支持服务</td></tr><tr><td><strong>与 UOS 的差异</strong></td><td>部分 UOS 专有功能在社区版不可用</td></tr></tbody></table><hr><h2 id="_7-华为-openeuler" tabindex="-1"><a class="header-anchor" href="#_7-华为-openeuler"><span>7. 华为 openEuler</span></a></h2><h3 id="_7-1-概述" tabindex="-1"><a class="header-anchor" href="#_7-1-概述"><span>7.1 概述</span></a></h3><p>openEuler（欧拉）是华为推出的开源操作系统，主要面向服务器、云计算和边缘计算场景。2021 年华为将 openEuler 捐赠给开放原子开源基金会。</p><h3 id="_7-2-技术架构" tabindex="-1"><a class="header-anchor" href="#_7-2-技术架构"><span>7.2 技术架构</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────────────────┐
│             应用层                         │
│     (数据库、中间件、容器、AI 框架)         │
├─────────────────────────────────────────┤
│         openEuler 增强特性                 │
│     (A-Tune 智能调优, secGear 机密计算)   │
│     (iSula 容器引擎, StratoVirt 虚拟化)   │
├─────────────────────────────────────────┤
│         RPM/DNF 包管理 (兼容 RHEL)        │
├─────────────────────────────────────────┤
│         Linux Kernel (优化定制)            │
│     (针对鲲鹏/昇腾芯片深度优化)            │
├─────────────────────────────────────────┤
│   硬件适配：鲲鹏(ARM) / 昇腾(AI) / x86     │
└─────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-3-优点" tabindex="-1"><a class="header-anchor" href="#_7-3-优点"><span>7.3 优点</span></a></h3><table><thead><tr><th>优点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>鲲鹏芯片深度优化</strong></td><td>针对华为鲲鹏 ARM 处理器深度优化，性能领先</td></tr><tr><td><strong>AI/大数据优化</strong></td><td>对昇腾 AI 芯片和 AI 框架（MindSpore 等）优化良好</td></tr><tr><td><strong>云原生支持</strong></td><td>内置容器引擎 iSula、虚拟化 StratoVirt，轻量高效</td></tr><tr><td><strong>社区活跃</strong></td><td>贡献者众多，社区治理成熟</td></tr><tr><td><strong>RHEL 兼容</strong></td><td>二进制兼容 RHEL/CentOS 生态</td></tr><tr><td><strong>A-Tune 智能调优</strong></td><td>基于 AI 的系统自动调优引擎</td></tr></tbody></table><h3 id="_7-4-缺点" tabindex="-1"><a class="header-anchor" href="#_7-4-缺点"><span>7.4 缺点</span></a></h3><table><thead><tr><th>缺点</th><th>详细说明</th></tr></thead><tbody><tr><td><strong>无桌面版</strong></td><td>主要面向服务器，没有官方桌面版本</td></tr><tr><td><strong>硬件偏向性</strong></td><td>对非华为硬件优化一般</td></tr><tr><td><strong>生态偏服务器</strong></td><td>桌面应用生态缺失</td></tr><tr><td><strong>华为绑定感</strong></td><td>虽然开源，但与华为技术栈绑定较深</td></tr></tbody></table><hr><h2 id="_8-国产操作系统对比总结" tabindex="-1"><a class="header-anchor" href="#_8-国产操作系统对比总结"><span>8. 国产操作系统对比总结</span></a></h2><h3 id="_8-1-核心维度对比" tabindex="-1"><a class="header-anchor" href="#_8-1-核心维度对比"><span>8.1 核心维度对比</span></a></h3><table><thead><tr><th>维度</th><th style="text-align:center;">银河麒麟 V10</th><th style="text-align:center;">统信 UOS</th><th style="text-align:center;">Deepin</th><th style="text-align:center;">openEuler</th><th style="text-align:center;">Ubuntu</th><th style="text-align:center;">RHEL</th></tr></thead><tbody><tr><td><strong>桌面体验</strong></td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">❌</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td></tr><tr><td><strong>服务器能力</strong></td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td></tr><tr><td><strong>安全性</strong></td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td></tr><tr><td><strong>国产芯片适配</strong></td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐</td><td style="text-align:center;">⭐⭐</td></tr><tr><td><strong>应用生态</strong></td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td></tr><tr><td><strong>社区活跃度</strong></td><td style="text-align:center;">⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td></tr><tr><td><strong>文档完善度</strong></td><td style="text-align:center;">⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td></tr><tr><td><strong>商业支持</strong></td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td><td style="text-align:center;">⭐⭐⭐⭐⭐</td></tr><tr><td><strong>成本</strong></td><td style="text-align:center;">付费</td><td style="text-align:center;">付费</td><td style="text-align:center;">免费</td><td style="text-align:center;">免费</td><td style="text-align:center;">免费</td><td style="text-align:center;">付费</td></tr></tbody></table><h3 id="_8-2-适用场景推荐" tabindex="-1"><a class="header-anchor" href="#_8-2-适用场景推荐"><span>8.2 适用场景推荐</span></a></h3><table><thead><tr><th>场景</th><th>推荐方案</th><th>原因</th></tr></thead><tbody><tr><td><strong>政府/军队/国企办公</strong></td><td>银河麒麟 V10 或统信 UOS</td><td>信创合规，安全认证齐全</td></tr><tr><td><strong>企业服务器</strong></td><td>openEuler 或银河麒麟服务器版</td><td>生态兼容，性能优化好</td></tr><tr><td><strong>个人开发者桌面</strong></td><td>Deepin 或 Ubuntu</td><td>免费，应用丰富，社区活跃</td></tr><tr><td><strong>云原生/K8s</strong></td><td>openEuler 或 Ubuntu</td><td>容器优化好，云原生生态</td></tr><tr><td><strong>AI/大数据</strong></td><td>openEuler</td><td>华为昇腾/MindSpore 深度优化</td></tr><tr><td><strong>金融核心系统</strong></td><td>银河麒麟 V10 或 RHEL</td><td>安全认证级别高</td></tr><tr><td><strong>国际业务</strong></td><td>Ubuntu 或 RHEL</td><td>全球化生态完善</td></tr></tbody></table><h3 id="_8-3-国产操作系统的共性挑战" tabindex="-1"><a class="header-anchor" href="#_8-3-国产操作系统的共性挑战"><span>8.3 国产操作系统的共性挑战</span></a></h3><ol><li><p><strong>软件生态问题</strong></p><ul><li>大量专业软件（Adobe、AutoCAD、Oracle 等）无原生 Linux 版本</li><li>虽然有 Wine 兼容方案，但体验不如原生</li></ul></li><li><p><strong>驱动兼容性</strong></p><ul><li>外设（打印机、扫描仪、指纹识别）驱动缺乏</li><li>显卡驱动性能不如 Windows</li></ul></li><li><p><strong>人才生态</strong></p><ul><li>Linux 运维人才相对 Windows 较少</li><li>国产系统特定技能人才更稀缺</li></ul></li><li><p><strong>标准不统一</strong></p><ul><li>不同国产系统包管理格式不同（RPM vs DEB）</li><li>缺少统一的国产操作系统标准</li></ul></li><li><p><strong>国际化</strong></p><ul><li>主要面向国内市场，国际影响力有限</li></ul></li></ol><hr><h2 id="_9-常用操作-demo" tabindex="-1"><a class="header-anchor" href="#_9-常用操作-demo"><span>9. 常用操作 Demo</span></a></h2><h3 id="_9-1-麒麟操作系统常用操作" tabindex="-1"><a class="header-anchor" href="#_9-1-麒麟操作系统常用操作"><span>9.1 麒麟操作系统常用操作</span></a></h3><h4 id="系统信息查看" tabindex="-1"><a class="header-anchor" href="#系统信息查看"><span>系统信息查看</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看系统版本</span>
<span class="token function">cat</span> /etc/kylin-release
<span class="token comment"># Kylin Linux release V10 (Tercel)</span>

<span class="token comment"># 查看内核版本</span>
<span class="token function">uname</span> <span class="token parameter variable">-r</span>
<span class="token comment"># 4.19.90-52.40.v2207.ky10.x86_64</span>

<span class="token comment"># 查看 CPU 信息</span>
lscpu
<span class="token comment"># 或</span>
<span class="token function">cat</span> /proc/cpuinfo <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;model name&quot;</span> <span class="token operator">|</span> <span class="token function">uniq</span>

<span class="token comment"># 查看内存</span>
<span class="token function">free</span> <span class="token parameter variable">-h</span>

<span class="token comment"># 查看磁盘</span>
<span class="token function">df</span> <span class="token parameter variable">-h</span>
lsblk
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="包管理-rpm-yum-dnf" tabindex="-1"><a class="header-anchor" href="#包管理-rpm-yum-dnf"><span>包管理 (RPM/YUM/DNF)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 麒麟 V10 使用 DNF/YUM（兼容 RHEL 生态）</span>

<span class="token comment"># 更新系统</span>
<span class="token function">sudo</span> dnf update
<span class="token comment"># 或</span>
<span class="token function">sudo</span> yum update

<span class="token comment"># 搜索软件包</span>
<span class="token function">sudo</span> dnf search nginx

<span class="token comment"># 安装软件</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> nginx <span class="token parameter variable">-y</span>
<span class="token comment"># 或</span>
<span class="token function">sudo</span> yum <span class="token function">install</span> nginx <span class="token parameter variable">-y</span>

<span class="token comment"># 卸载软件</span>
<span class="token function">sudo</span> dnf remove nginx

<span class="token comment"># 查看已安装的包</span>
<span class="token function">rpm</span> <span class="token parameter variable">-qa</span> <span class="token operator">|</span> <span class="token function">grep</span> nginx

<span class="token comment"># 查看包信息</span>
<span class="token function">rpm</span> <span class="token parameter variable">-qi</span> nginx

<span class="token comment"># 清理缓存</span>
<span class="token function">sudo</span> dnf clean all
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="服务管理-systemd" tabindex="-1"><a class="header-anchor" href="#服务管理-systemd"><span>服务管理 (systemd)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 启动服务</span>
<span class="token function">sudo</span> systemctl start nginx

<span class="token comment"># 停止服务</span>
<span class="token function">sudo</span> systemctl stop nginx

<span class="token comment"># 重启服务</span>
<span class="token function">sudo</span> systemctl restart nginx

<span class="token comment"># 查看服务状态</span>
<span class="token function">sudo</span> systemctl status nginx

<span class="token comment"># 设置开机自启</span>
<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> nginx

<span class="token comment"># 禁用开机自启</span>
<span class="token function">sudo</span> systemctl disable nginx

<span class="token comment"># 查看所有服务</span>
<span class="token function">sudo</span> systemctl list-units <span class="token parameter variable">--type</span><span class="token operator">=</span>service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="用户与权限管理" tabindex="-1"><a class="header-anchor" href="#用户与权限管理"><span>用户与权限管理</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 添加用户</span>
<span class="token function">sudo</span> <span class="token function">useradd</span> <span class="token parameter variable">-m</span> <span class="token parameter variable">-s</span> /bin/bash zhangsan

<span class="token comment"># 设置密码</span>
<span class="token function">sudo</span> <span class="token function">passwd</span> zhangsan

<span class="token comment"># 添加到 sudo 组</span>
<span class="token function">sudo</span> <span class="token function">usermod</span> <span class="token parameter variable">-aG</span> wheel zhangsan

<span class="token comment"># 查看用户信息</span>
<span class="token function">id</span> zhangsan

<span class="token comment"># 删除用户</span>
<span class="token function">sudo</span> <span class="token function">userdel</span> <span class="token parameter variable">-r</span> zhangsan

<span class="token comment"># 修改文件权限</span>
<span class="token function">chmod</span> <span class="token number">755</span> filename
<span class="token function">chown</span> zhangsan:zhangsan filename
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="防火墙管理-firewalld" tabindex="-1"><a class="header-anchor" href="#防火墙管理-firewalld"><span>防火墙管理 (firewalld)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看防火墙状态</span>
<span class="token function">sudo</span> systemctl status firewalld

<span class="token comment"># 开放端口</span>
<span class="token function">sudo</span> firewall-cmd <span class="token parameter variable">--zone</span><span class="token operator">=</span>public --add-port<span class="token operator">=</span><span class="token number">8080</span>/tcp <span class="token parameter variable">--permanent</span>
<span class="token function">sudo</span> firewall-cmd <span class="token parameter variable">--reload</span>

<span class="token comment"># 查看已开放端口</span>
<span class="token function">sudo</span> firewall-cmd --list-ports

<span class="token comment"># 关闭防火墙（开发环境）</span>
<span class="token function">sudo</span> systemctl stop firewalld
<span class="token function">sudo</span> systemctl disable firewalld
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="selinux-管理" tabindex="-1"><a class="header-anchor" href="#selinux-管理"><span>SELinux 管理</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看 SELinux 状态</span>
getenforce

<span class="token comment"># 临时关闭</span>
<span class="token function">sudo</span> setenforce <span class="token number">0</span>

<span class="token comment"># 永久关闭（编辑 /etc/selinux/config）</span>
<span class="token function">sudo</span> <span class="token function">sed</span> <span class="token parameter variable">-i</span> <span class="token string">&#39;s/SELINUX=enforcing/SELINUX=disabled/g&#39;</span> /etc/selinux/config
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_9-2-统信-uos-deepin-常用操作" tabindex="-1"><a class="header-anchor" href="#_9-2-统信-uos-deepin-常用操作"><span>9.2 统信 UOS / Deepin 常用操作</span></a></h3><h4 id="系统信息查看-1" tabindex="-1"><a class="header-anchor" href="#系统信息查看-1"><span>系统信息查看</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看系统版本</span>
<span class="token function">cat</span> /etc/os-release
<span class="token comment"># 或</span>
<span class="token function">cat</span> /etc/deepin-version

<span class="token comment"># 查看内核版本</span>
<span class="token function">uname</span> <span class="token parameter variable">-r</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="包管理-apt-dpkg" tabindex="-1"><a class="header-anchor" href="#包管理-apt-dpkg"><span>包管理 (APT/DPKG)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># UOS/Deepin 使用 APT/DPKG（兼容 Debian 生态）</span>

<span class="token comment"># 更新软件源</span>
<span class="token function">sudo</span> <span class="token function">apt</span> update

<span class="token comment"># 升级系统</span>
<span class="token function">sudo</span> <span class="token function">apt</span> upgrade <span class="token parameter variable">-y</span>
<span class="token function">sudo</span> <span class="token function">apt</span> dist-upgrade <span class="token parameter variable">-y</span>

<span class="token comment"># 搜索软件包</span>
<span class="token function">sudo</span> <span class="token function">apt</span> search nginx

<span class="token comment"># 安装软件</span>
<span class="token function">sudo</span> <span class="token function">apt</span> <span class="token function">install</span> nginx <span class="token parameter variable">-y</span>

<span class="token comment"># 卸载软件</span>
<span class="token function">sudo</span> <span class="token function">apt</span> remove nginx
<span class="token function">sudo</span> <span class="token function">apt</span> purge nginx  <span class="token comment"># 连同配置文件一起删除</span>

<span class="token comment"># 查看已安装的包</span>
dpkg <span class="token parameter variable">-l</span> <span class="token operator">|</span> <span class="token function">grep</span> nginx

<span class="token comment"># 查看包信息</span>
<span class="token function">apt</span> show nginx

<span class="token comment"># 清理缓存</span>
<span class="token function">sudo</span> <span class="token function">apt</span> autoremove
<span class="token function">sudo</span> <span class="token function">apt</span> autoclean
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="软件源管理" tabindex="-1"><a class="header-anchor" href="#软件源管理"><span>软件源管理</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># UOS/Deepin 的软件源配置文件</span>
<span class="token function">sudo</span> <span class="token function">vim</span> /etc/apt/sources.list

<span class="token comment"># 典型的 Deepin V23 源配置：</span>
<span class="token comment"># deb [by-hash=force] https://community-packages.deepin.com/deepin/ apricot main contrib non-free</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="图形化操作-与-linux-通用" tabindex="-1"><a class="header-anchor" href="#图形化操作-与-linux-通用"><span>图形化操作（与 Linux 通用）</span></a></h4><ul><li><strong>系统设置</strong>：类似 macOS 的系统偏好设置，集中在控制中心</li><li><strong>应用商店</strong>：搜索安装常用应用</li><li><strong>文件管理器</strong>：类 macOS Finder 的文件管理体验</li><li><strong>终端</strong>：快捷键 <code>Ctrl+Alt+T</code></li></ul><h3 id="_9-3-openeuler-常用操作" tabindex="-1"><a class="header-anchor" href="#_9-3-openeuler-常用操作"><span>9.3 openEuler 常用操作</span></a></h3><h4 id="系统信息" tabindex="-1"><a class="header-anchor" href="#系统信息"><span>系统信息</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看系统版本</span>
<span class="token function">cat</span> /etc/openEuler-release
<span class="token comment"># openEuler release 22.03 LTS</span>

<span class="token comment"># 查看内核</span>
<span class="token function">uname</span> <span class="token parameter variable">-r</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="包管理-dnf" tabindex="-1"><a class="header-anchor" href="#包管理-dnf"><span>包管理 (DNF)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># openEuler 使用 DNF</span>

<span class="token comment"># 更新系统</span>
<span class="token function">sudo</span> dnf update <span class="token parameter variable">-y</span>

<span class="token comment"># 安装软件</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> nginx <span class="token parameter variable">-y</span>

<span class="token comment"># 搜索软件</span>
<span class="token function">sudo</span> dnf search <span class="token function">docker</span>

<span class="token comment"># 配置软件源</span>
<span class="token function">sudo</span> <span class="token function">vim</span> /etc/yum.repos.d/openEuler.repo
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="a-tune-智能调优-openeuler-特色" tabindex="-1"><a class="header-anchor" href="#a-tune-智能调优-openeuler-特色"><span>A-Tune 智能调优（openEuler 特色）</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 安装 A-Tune</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> atune <span class="token parameter variable">-y</span>

<span class="token comment"># 启动服务</span>
<span class="token function">sudo</span> systemctl start atuned
<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> atuned

<span class="token comment"># 查看调优 profile</span>
atune-adm list

<span class="token comment"># 应用调优方案（如针对 Web 服务器）</span>
atune-adm analysis <span class="token parameter variable">--characterization</span> web-server
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="isula-容器-openeuler-特色" tabindex="-1"><a class="header-anchor" href="#isula-容器-openeuler-特色"><span>iSula 容器（openEuler 特色）</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 安装 iSula</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> iSulad <span class="token parameter variable">-y</span>

<span class="token comment"># 启动 iSula</span>
<span class="token function">sudo</span> systemctl start isulad

<span class="token comment"># 拉取镜像</span>
<span class="token function">sudo</span> isula pull nginx:latest

<span class="token comment"># 运行容器</span>
<span class="token function">sudo</span> isula run <span class="token parameter variable">-d</span> <span class="token parameter variable">-p</span> <span class="token number">8080</span>:80 <span class="token parameter variable">--name</span> my-nginx nginx

<span class="token comment"># 查看容器</span>
<span class="token function">sudo</span> isula <span class="token function">ps</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_9-4-国产操作系统通用操作技巧" tabindex="-1"><a class="header-anchor" href="#_9-4-国产操作系统通用操作技巧"><span>9.4 国产操作系统通用操作技巧</span></a></h3><h4 id="国产芯片识别" tabindex="-1"><a class="header-anchor" href="#国产芯片识别"><span>国产芯片识别</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看 CPU 架构</span>
<span class="token function">uname</span> <span class="token parameter variable">-m</span>
<span class="token comment"># x86_64  → x86 架构（兆芯/海光/Intel/AMD）</span>
<span class="token comment"># aarch64 → ARM 架构（飞腾/鲲鹏）</span>
<span class="token comment"># loongarch64 → LoongArch 架构（龙芯）</span>
<span class="token comment"># sw_64   → SW64 架构（申威）</span>

<span class="token comment"># 查看 CPU 型号</span>
<span class="token function">cat</span> /proc/cpuinfo <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;model name\\|CPU name\\|cpu model&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="docker-安装-通用" tabindex="-1"><a class="header-anchor" href="#docker-安装-通用"><span>Docker 安装（通用）</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 麒麟/openEuler (RPM 系)</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> docker-ce <span class="token parameter variable">-y</span>
<span class="token function">sudo</span> systemctl start <span class="token function">docker</span>
<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span>

<span class="token comment"># UOS/Deepin (DEB 系)</span>
<span class="token function">sudo</span> <span class="token function">apt</span> <span class="token function">install</span> docker.io <span class="token parameter variable">-y</span>
<span class="token function">sudo</span> systemctl start <span class="token function">docker</span>
<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span>

<span class="token comment"># 配置镜像加速</span>
<span class="token function">sudo</span> <span class="token function">mkdir</span> <span class="token parameter variable">-p</span> /etc/docker
<span class="token function">sudo</span> <span class="token function">tee</span> /etc/docker/daemon.json <span class="token operator">&lt;&lt;-</span><span class="token string">&#39;EOF&#39;
{
  &quot;registry-mirrors&quot;: [&quot;https://mirror.ccs.tencentyun.com&quot;]
}
EOF</span>
<span class="token function">sudo</span> systemctl restart <span class="token function">docker</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="常用开发环境搭建" tabindex="-1"><a class="header-anchor" href="#常用开发环境搭建"><span>常用开发环境搭建</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># Node.js 安装 (使用 nvm，通用方案)</span>
<span class="token function">curl</span> -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh <span class="token operator">|</span> <span class="token function">bash</span>
<span class="token builtin class-name">source</span> ~/.bashrc
nvm <span class="token function">install</span> <span class="token number">20</span>
nvm use <span class="token number">20</span>

<span class="token comment"># Python 环境</span>
<span class="token comment"># 麒麟/openEuler</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> python3 python3-pip <span class="token parameter variable">-y</span>
<span class="token comment"># UOS/Deepin</span>
<span class="token function">sudo</span> <span class="token function">apt</span> <span class="token function">install</span> python3 python3-pip <span class="token parameter variable">-y</span>

<span class="token comment"># Git 配置</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> <span class="token function">git</span> <span class="token parameter variable">-y</span>   <span class="token comment"># 或 sudo apt install git -y</span>
<span class="token function">git</span> config <span class="token parameter variable">--global</span> user.name <span class="token string">&quot;Your Name&quot;</span>
<span class="token function">git</span> config <span class="token parameter variable">--global</span> user.email <span class="token string">&quot;your@email.com&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="ssh-配置" tabindex="-1"><a class="header-anchor" href="#ssh-配置"><span>SSH 配置</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 安装 SSH 服务</span>
<span class="token comment"># 麒麟/openEuler</span>
<span class="token function">sudo</span> dnf <span class="token function">install</span> openssh-server <span class="token parameter variable">-y</span>
<span class="token comment"># UOS/Deepin</span>
<span class="token function">sudo</span> <span class="token function">apt</span> <span class="token function">install</span> openssh-server <span class="token parameter variable">-y</span>

<span class="token comment"># 启动 SSH</span>
<span class="token function">sudo</span> systemctl start sshd
<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> sshd

<span class="token comment"># 配置 SSH</span>
<span class="token function">sudo</span> <span class="token function">vim</span> /etc/ssh/sshd_config
<span class="token comment"># Port 22</span>
<span class="token comment"># PermitRootLogin no  (麒麟默认禁止 root SSH)</span>
<span class="token comment"># PasswordAuthentication yes</span>

<span class="token comment"># 重启 SSH</span>
<span class="token function">sudo</span> systemctl restart sshd
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="日志查看" tabindex="-1"><a class="header-anchor" href="#日志查看"><span>日志查看</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># systemd 日志</span>
journalctl <span class="token parameter variable">-xe</span>           <span class="token comment"># 查看最新日志</span>
journalctl <span class="token parameter variable">-u</span> nginx      <span class="token comment"># 查看指定服务日志</span>
journalctl <span class="token parameter variable">-f</span>            <span class="token comment"># 实时跟踪日志</span>

<span class="token comment"># 传统日志文件</span>
<span class="token function">tail</span> <span class="token parameter variable">-f</span> /var/log/messages    <span class="token comment"># 系统日志（麒麟/RHEL 系）</span>
<span class="token function">tail</span> <span class="token parameter variable">-f</span> /var/log/syslog      <span class="token comment"># 系统日志（Debian 系）</span>
<span class="token function">tail</span> <span class="token parameter variable">-f</span> /var/log/secure      <span class="token comment"># 安全日志</span>
<span class="token function">dmesg</span> <span class="token operator">|</span> <span class="token function">tail</span> <span class="token parameter variable">-20</span>             <span class="token comment"># 内核日志</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="性能监控" tabindex="-1"><a class="header-anchor" href="#性能监控"><span>性能监控</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 综合监控</span>
<span class="token function">top</span>            <span class="token comment"># 实时进程监控</span>
<span class="token function">htop</span>           <span class="token comment"># top 增强版（需安装）</span>
<span class="token function">vmstat</span> <span class="token number">1</span>       <span class="token comment"># 虚拟内存统计</span>
iostat <span class="token parameter variable">-x</span> <span class="token number">1</span>    <span class="token comment"># 磁盘 I/O 统计</span>
sar <span class="token parameter variable">-u</span> <span class="token number">1</span> <span class="token number">5</span>     <span class="token comment"># CPU 使用率历史统计</span>

<span class="token comment"># 网络监控</span>
ss <span class="token parameter variable">-tlnp</span>       <span class="token comment"># 查看监听端口</span>
<span class="token function">netstat</span> <span class="token parameter variable">-anp</span>   <span class="token comment"># 查看所有网络连接</span>
iftop          <span class="token comment"># 实时网络流量（需安装）</span>

<span class="token comment"># 磁盘 I/O 监控</span>
iotop          <span class="token comment"># 磁盘 I/O top（需安装）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="_10-选型建议与趋势展望" tabindex="-1"><a class="header-anchor" href="#_10-选型建议与趋势展望"><span>10. 选型建议与趋势展望</span></a></h2><h3 id="_10-1-选型决策树" tabindex="-1"><a class="header-anchor" href="#_10-1-选型决策树"><span>10.1 选型决策树</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>需要桌面办公？
├── 是
│   ├── 信创合规要求？
│   │   ├── 是
│   │   │   ├── 政府/军队 → 银河麒麟 V10 桌面版
│   │   │   └── 国企/央企 → 统信 UOS 专业版
│   │   └── 否
│   │       ├── 追求美观易用 → Deepin
│   │       └── 追求稳定性 → Ubuntu LTS
│   └── 需要服务器？
│       ├── 信创合规要求？
│       │   ├── 是 + 华为生态 → openEuler
│       │   ├── 是 + 通用场景 → 银河麒麟 V10 服务器版
│       │   └── 否 → Ubuntu Server / RHEL
│       └── 特定场景
│           ├── AI/大数据 → openEuler
│           ├── 云原生/K8s → openEuler / Ubuntu
│           └── 金融核心 → 银河麒麟 V10 / RHEL
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_10-2-未来趋势" tabindex="-1"><a class="header-anchor" href="#_10-2-未来趋势"><span>10.2 未来趋势</span></a></h3><ol><li><strong>鸿蒙生态扩展</strong>：华为 HarmonyOS 可能向桌面领域扩展，形成 Linux + 鸿蒙双路线</li><li><strong>AI 深度融合</strong>：国产系统将深度集成 AI 能力（如麒麟的 AI 助手、openEuler 的 A-Tune）</li><li><strong>统一标准推进</strong>：国家可能推动国产操作系统统一接口标准，降低生态碎片化</li><li><strong>云桌面方案</strong>：国产系统 + 云桌面可能是解决应用兼容性的重要路径</li><li><strong>开源贡献增加</strong>：随着技术积累，国产系统对上游开源社区的贡献将显著提升</li><li><strong>RISC-V 支持</strong>：随着 RISC-V 芯片发展，国产系统将加大对 RISC-V 架构的支持</li></ol><h3 id="_10-3-总结" tabindex="-1"><a class="header-anchor" href="#_10-3-总结"><span>10.3 总结</span></a></h3><table><thead><tr><th>选择</th><th>一句话总结</th></tr></thead><tbody><tr><td><strong>银河麒麟 V10</strong></td><td>信创市场王者，安全认证最全，政府首选</td></tr><tr><td><strong>统信 UOS</strong></td><td>桌面体验最佳，类 macOS 设计，美观实用</td></tr><tr><td><strong>Deepin</strong></td><td>最优秀的国产开源桌面，个人开发者首选</td></tr><tr><td><strong>openEuler</strong></td><td>服务器和云原生最强，华为生态深度绑定</td></tr><tr><td><strong>Ubuntu</strong></td><td>全球化生态最佳，开发者和云平台首选</td></tr><tr><td><strong>RHEL</strong></td><td>企业级标杆，关键业务首选，需付费</td></tr></tbody></table><hr><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2><ul><li><a href="https://www.kylinos.cn/" target="_blank" rel="noopener noreferrer">麒麟软件官网</a></li><li><a href="https://www.uniontech.com/" target="_blank" rel="noopener noreferrer">统信软件官网</a></li><li><a href="https://www.deepin.org/" target="_blank" rel="noopener noreferrer">Deepin 社区</a></li><li><a href="https://www.openeuler.org/" target="_blank" rel="noopener noreferrer">openEuler 社区</a></li><li><a href="https://ubuntu.com/" target="_blank" rel="noopener noreferrer">Ubuntu 官网</a></li><li><a href="https://www.redhat.com/" target="_blank" rel="noopener noreferrer">Red Hat 官网</a></li><li><a href="https://www.gov.cn/" target="_blank" rel="noopener noreferrer">信创产业政策</a></li></ul>`,149),l=[i];function d(r,c){return e(),s("div",null,l)}const u=n(t,[["render",d],["__file","china-os-deep-analysis.html.vue"]]),v=JSON.parse('{"path":"/serve/linux/china-os-deep-analysis.html","title":"Linux 操作系统及国产化操作系统深度分析","lang":"zh-CN","frontmatter":{"description":"Linux 操作系统及国产化操作系统深度分析 目录 Linux 操作系统概述 主流 Linux 发行版分析 国产化操作系统深度分析 麒麟操作系统 (KylinOS) 统信 UOS 深度 Deepin 华为 openEuler 国产操作系统对比总结 常用操作 Demo 选型建议与趋势展望 1. Linux 操作系统概述 1.1 Linux 内核与发行版 ...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/serve/linux/china-os-deep-analysis.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Linux 操作系统及国产化操作系统深度分析"}],["meta",{"property":"og:description","content":"Linux 操作系统及国产化操作系统深度分析 目录 Linux 操作系统概述 主流 Linux 发行版分析 国产化操作系统深度分析 麒麟操作系统 (KylinOS) 统信 UOS 深度 Deepin 华为 openEuler 国产操作系统对比总结 常用操作 Demo 选型建议与趋势展望 1. Linux 操作系统概述 1.1 Linux 内核与发行版 ..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-07-09T04:55:41.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:modified_time","content":"2026-07-09T04:55:41.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Linux 操作系统及国产化操作系统深度分析\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-07-09T04:55:41.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"目录","slug":"目录","link":"#目录","children":[]},{"level":2,"title":"1. Linux 操作系统概述","slug":"_1-linux-操作系统概述","link":"#_1-linux-操作系统概述","children":[{"level":3,"title":"1.1 Linux 内核与发行版","slug":"_1-1-linux-内核与发行版","link":"#_1-1-linux-内核与发行版","children":[]},{"level":3,"title":"1.2 Linux 发行版家族图谱","slug":"_1-2-linux-发行版家族图谱","link":"#_1-2-linux-发行版家族图谱","children":[]}]},{"level":2,"title":"2. 主流 Linux 发行版分析","slug":"_2-主流-linux-发行版分析","link":"#_2-主流-linux-发行版分析","children":[{"level":3,"title":"2.1 Debian 系","slug":"_2-1-debian-系","link":"#_2-1-debian-系","children":[]},{"level":3,"title":"2.2 Red Hat 系","slug":"_2-2-red-hat-系","link":"#_2-2-red-hat-系","children":[]}]},{"level":2,"title":"3. 国产化操作系统深度分析","slug":"_3-国产化操作系统深度分析","link":"#_3-国产化操作系统深度分析","children":[{"level":3,"title":"3.1 国产操作系统发展背景","slug":"_3-1-国产操作系统发展背景","link":"#_3-1-国产操作系统发展背景","children":[]},{"level":3,"title":"3.2 国产操作系统技术路线","slug":"_3-2-国产操作系统技术路线","link":"#_3-2-国产操作系统技术路线","children":[]}]},{"level":2,"title":"4. 麒麟操作系统 (KylinOS)","slug":"_4-麒麟操作系统-kylinos","link":"#_4-麒麟操作系统-kylinos","children":[{"level":3,"title":"4.1 产品谱系","slug":"_4-1-产品谱系","link":"#_4-1-产品谱系","children":[]},{"level":3,"title":"4.2 技术架构","slug":"_4-2-技术架构","link":"#_4-2-技术架构","children":[]},{"level":3,"title":"4.3 优点","slug":"_4-3-优点","link":"#_4-3-优点","children":[]},{"level":3,"title":"4.4 缺点","slug":"_4-4-缺点","link":"#_4-4-缺点","children":[]}]},{"level":2,"title":"5. 统信 UOS","slug":"_5-统信-uos","link":"#_5-统信-uos","children":[{"level":3,"title":"5.1 产品概述","slug":"_5-1-产品概述","link":"#_5-1-产品概述","children":[]},{"level":3,"title":"5.2 技术架构","slug":"_5-2-技术架构","link":"#_5-2-技术架构","children":[]},{"level":3,"title":"5.3 优点","slug":"_5-3-优点","link":"#_5-3-优点","children":[]},{"level":3,"title":"5.4 缺点","slug":"_5-4-缺点","link":"#_5-4-缺点","children":[]}]},{"level":2,"title":"6. 深度 Deepin","slug":"_6-深度-deepin","link":"#_6-深度-deepin","children":[{"level":3,"title":"6.1 概述","slug":"_6-1-概述","link":"#_6-1-概述","children":[]},{"level":3,"title":"6.2 与统信 UOS 的关系","slug":"_6-2-与统信-uos-的关系","link":"#_6-2-与统信-uos-的关系","children":[]},{"level":3,"title":"6.3 优点","slug":"_6-3-优点","link":"#_6-3-优点","children":[]},{"level":3,"title":"6.4 缺点","slug":"_6-4-缺点","link":"#_6-4-缺点","children":[]}]},{"level":2,"title":"7. 华为 openEuler","slug":"_7-华为-openeuler","link":"#_7-华为-openeuler","children":[{"level":3,"title":"7.1 概述","slug":"_7-1-概述","link":"#_7-1-概述","children":[]},{"level":3,"title":"7.2 技术架构","slug":"_7-2-技术架构","link":"#_7-2-技术架构","children":[]},{"level":3,"title":"7.3 优点","slug":"_7-3-优点","link":"#_7-3-优点","children":[]},{"level":3,"title":"7.4 缺点","slug":"_7-4-缺点","link":"#_7-4-缺点","children":[]}]},{"level":2,"title":"8. 国产操作系统对比总结","slug":"_8-国产操作系统对比总结","link":"#_8-国产操作系统对比总结","children":[{"level":3,"title":"8.1 核心维度对比","slug":"_8-1-核心维度对比","link":"#_8-1-核心维度对比","children":[]},{"level":3,"title":"8.2 适用场景推荐","slug":"_8-2-适用场景推荐","link":"#_8-2-适用场景推荐","children":[]},{"level":3,"title":"8.3 国产操作系统的共性挑战","slug":"_8-3-国产操作系统的共性挑战","link":"#_8-3-国产操作系统的共性挑战","children":[]}]},{"level":2,"title":"9. 常用操作 Demo","slug":"_9-常用操作-demo","link":"#_9-常用操作-demo","children":[{"level":3,"title":"9.1 麒麟操作系统常用操作","slug":"_9-1-麒麟操作系统常用操作","link":"#_9-1-麒麟操作系统常用操作","children":[]},{"level":3,"title":"9.2 统信 UOS / Deepin 常用操作","slug":"_9-2-统信-uos-deepin-常用操作","link":"#_9-2-统信-uos-deepin-常用操作","children":[]},{"level":3,"title":"9.3 openEuler 常用操作","slug":"_9-3-openeuler-常用操作","link":"#_9-3-openeuler-常用操作","children":[]},{"level":3,"title":"9.4 国产操作系统通用操作技巧","slug":"_9-4-国产操作系统通用操作技巧","link":"#_9-4-国产操作系统通用操作技巧","children":[]}]},{"level":2,"title":"10. 选型建议与趋势展望","slug":"_10-选型建议与趋势展望","link":"#_10-选型建议与趋势展望","children":[{"level":3,"title":"10.1 选型决策树","slug":"_10-1-选型决策树","link":"#_10-1-选型决策树","children":[]},{"level":3,"title":"10.2 未来趋势","slug":"_10-2-未来趋势","link":"#_10-2-未来趋势","children":[]},{"level":3,"title":"10.3 总结","slug":"_10-3-总结","link":"#_10-3-总结","children":[]}]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{"createdTime":1783572941000,"updatedTime":1783572941000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":17.2,"words":5159},"filePathRelative":"serve/linux/china-os-deep-analysis.md","localizedDate":"2026年7月9日","excerpt":"","autoDesc":true}');export{u as comp,v as data};
