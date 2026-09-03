# 更新日志


## V2.1（2026-09-02）—— 素材解密下沉，彻底修复原生素材漏洞

> **版本状态**：当前最新稳定版本，推荐所有新项目使用。V2.0 用户建议升级。

**适用场景**：定价 ¥12~¥60 的独立游戏，保护首发销售窗口期。无论你的游戏是否上架 Steam，均可使用。

### 核心改进

- **素材解密完整下沉至 C++ 层**：彻底解决 RPG Maker 自带素材加密（仅加密前 16 字节）的致命漏洞，JS 层不再接触任何密钥
- **素材完整加密**：不再是 RM 那种只加密前 16 字节的方式，而是对整个文件进行 AES-256-CBC 加密
- **加密格式升级**：MAGIC(8) + IV(16) + HMAC(32) + AES-256-CBC 密文，带魔数校验和完整性校验
- **密钥由 C++ 运行时派生**：密钥 = HMAC-SHA256(派生种子, 版本号 + 发行日期)，不在任何文件中存储
- **密钥分离派生**：AES 密钥和 HMAC 密钥分开派生，防止同一密钥用于两个密码学目的
- **system.json 改为明文**：密钥不再存放在 JSON 文件中，`system.json` 退化为纯配置文件
- **检查点已移除**：V2.1 不再包含检查点逻辑，相关代码已全部清理
- **看门狗改为状态上报**：不再直接 `std::exit(0)` 杀死进程，改为 JS 层查询状态后决定如何处理
- **时间回拨只告警不杀进程**：结合单调时钟检测系统时间异常，只返回 `timeTamperDetected: true`，不拒绝启动
- **HMAC 完整性校验**：每个加密素材自带 HMAC-SHA256 签名，解密前先校验完整性，防止篡改
- **固定时间 HMAC 比较**：使用常量时间比较函数，防止计时攻击
- **OpenSSL 初始化统一管理**：使用 `std::call_once` 保证只初始化一次，Windows 上调用 `RAND_poll()` 补充熵源

### 新增

- **素材加密脚本（encrypt_assets.js / .bat）**：开发者本地双击运行，自动遍历 `www/` 目录下所有图片和音频文件，完整加密并删除原文
- **魔数标识（CHRNSLSE）**：加密素材文件头包含 8 字节魔数，JS 层可快速判断是否加密文件
- **看门狗状态查询接口**：`getWatchdogState()` 返回触发状态、错过心跳次数等，供 JS 层决策
- **OpenSSL 错误队列清理**：每次解密失败后清理错误队列，避免旧错误污染后续调用
- **素材大小上限**：限制单个素材文件不超过 200MB，防止恶意超大 Buffer 耗尽内存

### 移除

- **彻底移除检查点逻辑**：`checkpointVerify()`、哈希链、惩罚触发等全部移除
- **移除 config.h 依赖**：不再需要外部配置文件，所有编译参数通过 `-D` 宏传入
- **移除 system.json 解密**：改为明文读取，不再需要 `verifyAndDecrypt()` 解密
- **移除 Base64 死代码**：Base64 编解码函数用 `#ifdef ENABLE_DEBUG_BASE64` 包裹，Release 构建不编译

### 变更

- **密钥派生方式**：
  - V2.0：单一密钥用于所有解密
  - V2.1：AES 密钥和 HMAC 密钥分离派生（`AES:` 和 `HMAC:` 前缀）
- **auth_manager.js**：
  - 移除 `verifyAndDecrypt()`、`checkpointVerify()`、`applyPenalty()`
  - 新增 `decryptAsset()`、`getWatchdogState()`
  - `initialize()` 替代 `verifyAndDecrypt()`，只做初始化和时间炸弹检查
- **index.html**：
  - 不再解密 `system.json`
  - 新增 `StorageManager.loadFromFile` 劫持，拦截 `.enc` 文件并调用 C++ 解密
- **binding.gyp**：移除 Steam SDK 相关配置，只保留 OpenSSL 依赖

### 安全增强

- **加密算法升级**：AES-256-CBC 完整文件加密，不再是 RM 的“仅前 16 字节 XOR”
- **HMAC 完整性校验**：防止密文被篡改，解密前先验 HMAC
- **固定时间 HMAC 比较**：消除计时攻击风险
- **密钥从 JS 层彻底移除**：JS 层只传输数据，不接触任何密钥
- **派生种子不在仓库中**：每次云端编译由 GitHub Actions 随机生成，不硬编码进仓库
- **加密格式自带魔数**：JS 层可快速识别加密文件，兼容未加密素材（MOD 开发友好）

### 升级指南（从 V2.0 升级）

⚠️ V2.1 与 V2.0 的素材加密格式不兼容，旧版本的加密素材无法直接使用。升级需要重新加密所有素材。

1. 替换 `auth_manager.js`（放到 `js/plugins/` 目录，在插件管理器中启用）
2. 替换 `index.html`（放到发行包 `www/` 目录）
3. 新增 `encrypt_assets.bat` 和 `encrypt_assets.js`（放到发行包根目录）
4. 重新触发 GitHub Actions 云端编译，获取新的 `decryptor.node` 和 `encrypt_config.json`
5. 运行 `encrypt_assets.bat` 重新加密所有素材
6. 已发布的 V2.0 游戏不受影响，可继续正常运行

### 致谢

- Project 1 的 Singular_Photon —— 指出 RM 原生素材加密（仅加密前 16 字节）的致命漏洞，并提供了详细的技术分析，直接推动 V2.1 的素材解密下沉方案
- Project 1 的 fux2 —— 指出 V1.x 版本的核心误区，促使 V2.0 彻底重构
- @JiuGeGe520 —— 帮忙发现初期漏洞，推动 V1.1 的 ADS 双存储方案落地


## V2.0（2026-09-01）—— 彻底重构，面向所有 RM 开发者

> **版本状态**：V2.1 已发布，建议升级。

### 源码迁移说明

V2.0 的核心源码（`decryptor.cc`、`binding.gyp`、`auth_manager.js`、`build.yml`）已迁移至专用模板仓库 [Chronos-Builder-Template](https://github.com/CLARE-XHL/Chronos-Builder-Template)。

### 核心理念

- **经济学博弈**：让破解成本远超游戏售价，保护独立游戏首发的“黄金两周”
- **版本迭代即“时间炸弹”**：利用版本差压缩盗版传播窗口
- **零信任、零知识**：工具作者不接触、不存储任何用户密钥
- **完全可逆**：只加密发行包，工程文件零修改

### 新增

- **云端编译（GitHub Actions）**：用户 Fork 模板仓库 → 填写参数 → 自动编译 → 下载成品，无需本地编译环境
- **零知识设计**：Salt 和 IV 只在用户自己的 GitHub Actions 中生成，作者不接触、不存储

### 移除

- **彻底移除 Steam SDK 依赖**：不再需要 Steam 账号、Steamworks SDK、Steam API
- **彻底移除本地编译环境**：不再需要安装 Node.js、Python、MSVC、OpenSSL
- **移除本地编译脚本**：`build.bat` 和 `encrypt.bat` 不再需要
- **移除机器绑定和双存储**：不再需要硬件指纹、注册表、NTFS ADS
- **移除 Steam 相关错误码**：`ERR_ID_MISMATCH`（20）、`ERR_TIME_TAMPER`（31）、`ERR_NO_STEAM`（50）已移除

### 变更

- **工作流程精简**：
  - 旧：放置文件 → 修改 binding.gyp → 运行 build.bat → 部署 → 运行 encrypt.bat
  - 新：运行 ChronosScan.bat → 植入检查点 → 部署 → 云端编译 → 替换文件
- **auth_manager.js**：精简路径探测，移除 Steam 相关逻辑，版本号更新为 2.0
- **index.html**：精简错误码，更新版本号，保留启动劫持和 StorageManager 拦截
- **binding.gyp**：移除 Steam SDK 路径和注释，只保留 OpenSSL 依赖

### 安全增强

- **零知识设计**：Salt 和 IV 只在用户自己的 GitHub Actions 中生成，作者和平台无法接触
- **私有仓库强制要求**：用户必须 Fork 为私有仓库，防止日志泄露
- **用完即焚**：编译完成后删除 Fork 仓库，日志同步销毁

### 致谢

- Project 1 的 fux2 —— 指出 V1.x 版本的核心误区，促使 V2.0 彻底重构


## V1.2.1（2026-08-30）—— 补丁发布

> **版本状态**：建议所有使用 V1.2 的开发者升级。

### 修复

- **encrypt.bat 脚本目录自动创建**：修复因 `scripts\` 目录不存在导致加密中断的问题
- **首次激活原子性加固**：采用“先备份 → 写入 auth.key → 覆写加密文件 → 失败回滚”流程

### 新增

- **build.bat 支持自定义截止日期**：运行时可输入 `HARD_EXPIRE`

### 优化

- **encrypt.bat 保留配置备份**：不再强制删除 `encrypt_config.json`

### 升级指南（从 V1.2 升级）

1. 替换 `encrypt.bat`
2. 替换 `decryptor.cc`
3. 重新运行 `build.bat`


## V1.2（2026-08-30）—— 预加密 + 一机一密 + 自动化构建

### 核心改进

- **发行包预加密**：打包前加密 system.json，发行包内无明文
- **一机一密**：每位玩家首次启动后，system.json 用其专属密钥重新加密
- **自动化构建**：`build.bat` 一键完成扫描地图、生成检查点、编译 .node
- **自动加密**：`encrypt.bat` 部署后自动加密 system.json

### 新增

- `build.bat` 打包前自动化构建工具
- `encrypt.bat` 部署后 system.json 加密工具
- `index.html` 启动劫持，引擎读取文件前完成解密

### 已知限制

- 仅支持 Windows 平台（NW.js 环境）
- 需要 Steamworks SDK 编译
- 需要 Node.js 环境构建


## V1.1（2026-08-29）—— ADS 双存储防篡改增强

### 新增

- NTFS 备用数据流（ADS）作为第三隐性存储
- 注册表 + ADS 双存储交叉校验

### 优化

- `save_current_time_to_registry` 内部同时处理注册表与 ADS 写入

### 安全

- 时间存储从“单点可删”升级为“双存储自修复”


## V1.0（2026-08-28）—— 初始稳定版

### 新增

- 三层防御体系（L1 C++ 信任根 + L2 JS 胶水层 + L3 行为验证层）
- Steam 身份锚定，HMAC-SHA256 签名绑定 UID，多采样抗 Hook
- 时间自毁机制，硬编码截止时间戳 + 注册表防回拨
- 资源加密锁，AES-256-CBC 加密 system.json，C++ 内存解密
- 行为检查点矩阵，单向 HMAC 哈希链
- 看门狗守护线程，独立系统级线程
- 安全落盘机制，覆写原文件为全 0 并校验

### 安全

- 新增 `.overwrite_failed` 覆写失败持久化标记
- 新增看门狗日志编译宏 `WATCHDOG_LOGGING`
