# Chronos Seal

**时序为封印 · 行为作密钥 · 岁月守护原创**

---

[![Platform](https://img.shields.io/badge/platform-NW.js%20%7C%20RPG%20Maker%20MV%2FMZ-blue)](https://nwjs.io/)
[![C++](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1-red.svg)](CHANGELOG.md)

> **📢 V1.1 更新说明**：本版本已移除独立的 PDF 白皮书，所有设计原理、架构、工作流、部署指南等均完整整合于此 README，方便一站式阅读。

**Chronos Seal** 是一套专为 RPG Maker MV / MZ（NW.js）设计的**无服务器运行时完整性保护方案**。通过 C++ Native 层实现身份锚定、时间炸弹、行为检查点与看门狗守护，将批量盗版与简易破解的成本提升至远超游戏本身价值。

---

## 📖 设计哲学

> “时序为封印，行为作密钥，岁月守护原创。”

Chronos Seal **不追求绝对不可破解**——那在客户端环境中不存在。它追求的是：**让破解的成本（时间、技术门槛、维护负担）远超游戏本身的价值**，从而在经济学层面阻止盗版传播。

| 核心理念 | 阐述 |
| :--- | :--- |
| **无服务器依赖** | 不依赖任何云端服务，彻底规避后端运维与宕机风险 |
| **原生层信任根** | 核心解密逻辑下沉至 C++ 编译二进制，JS 层零敏感密钥 |
| **时间即武器** | 硬编码时间炸弹使旧版泄露包自动失效，压缩盗版生命周期 |
| **行为即密钥** | 检查点与游戏逻辑深度耦合，无法通过简单补丁绕过 |
| **成本即防御** | 不防高手，只让小白觉得“不如花 12 块省事” |

---

## ✨ 特性

| 特性 | 说明 |
| :--- | :--- |
| **🔐 原生层信任根** | 核心解密逻辑下沉至 C++ 编译二进制（`.node`），JS 层零敏感密钥，杜绝 F12 控制台捞密钥 |
| **🆔 Steam 身份锚定** | 通过 Steam SDK 读取 UID，HMAC-SHA256 签名绑定，多采样抗 Hook（C++ 层异步多次取值比对） |
| **💣 时间自毁机制** | 硬编码截止时间戳（编译期固化）+ 双存储防回拨（注册表 + NTFS ADS），旧版泄露包自动失效 |
| **🧩 行为检查点矩阵** | 7~12 个 HMAC 单向哈希链检查点，与游戏剧情/流程深度耦合，失败时触发“优雅降级”（虚空传送、清背包等）而非崩溃，使破解者难以定位 |
| **🐕 看门狗守护线程** | 独立系统级线程，10 秒超时，连续 2 次无心跳即强制 `std::exit(0)`，封堵 CE 挂起调试 |
| **🔒 资源加密锁** | AES-256-CBC 加密 `system.json`，随机 IV，密钥永不出现在 JS 内存（仅 C++ 内存） |
| **🛡️ 双存储防篡改（V1.1 新增）** | 时间哈希同时存入注册表和 `auth.key` 的 NTFS 备用数据流（ADS），任一被删可自动修复，任一被篡改即触发 `ERR_TIME_TAMPER` |

---

## 🧭 整体架构

系统分为三层，层层递进，密钥完全隔离于 JavaScript 层之外：

```

┌──────────────────────────────────────────────────────────────┐
│  L3：行为验证层（RM 公共事件 & 脚本）                         │
│  散落检查点调用 → AuthManager.checkpointVerify("context")    │
│  失败时触发优雅降级（虚空传送、清背包、关键NPC消失）           │
└───────────────────────────┬──────────────────────────────────┘
│
┌───────────────────────────▼──────────────────────────────────┐
│  L2：JS 胶水层（auth_manager.js）                            │
│  暴露 API 给游戏引擎，管理心跳响应与错误码转发                │
│  不含任何敏感密钥                                             │
└───────────────────────────┬──────────────────────────────────┘
│
┌───────────────────────────▼──────────────────────────────────┐
│  L1：原生信任根（decryptor.node）                            │
│  持有硬编码密钥 & 时间阈值；负责加解密、身份校验、看门狗线程   │
│  —— 密钥藏于 C++ 二进制，IDA 无法直接字符串提取              │
└──────────────────────────────────────────────────────────────┘

```

### 核心组件详解

#### 1. 身份锚定（Steam UID + HMAC 防篡改签名）
通过 Steam SDK 读取当前设备的 Steam User ID 作为主身份锚点。首次启动时，C++ 层将 UID 与时间戳组合，使用硬编码于二进制映像中的 256 位随机盐进行 HMAC-SHA256 签名，生成 `auth.key` 文件。

**防篡改机制**：每次启动重新计算签名并与本地文件比对。破解者若修改 UID、时间字段或盐值，签名立即失效。

**抗 Hook 增强**：C++ 层在启动流程中多次、异步、不同时机读取 Steam UID，将多次取值做哈希比对。单点伪造很容易暴露，增加驱动级 Hook 的稳定成本。

**隐私合规**：不读取主板/硬盘完整序列号，仅以 Steam UID 为主锚点，避免硬件更换导致正版用户锁死。

#### 2. 时间自毁机制（硬编码时间炸弹 + 双存储防回拨）
- **硬截止**：在 C++ 源码中硬编码一个绝对 Unix 时间戳（如 `2027-01-01`），随二进制编译固化。该值无法通过外部 INI 或注册表修改。
- **反时间回拨**：每次启动检测系统时间是否早于上次成功启动记录的时间。上次启动时间同时写入两处独立位置：
  - `auth.key`（带 HMAC 签名）
  - 注册表 + NTFS ADS（V1.1 升级为双存储）
- **交叉校验**：两处存储交叉比对。攻击者若单改一处，另一处校验失败即触发防篡改逻辑。

#### 3. 资源加密锁（AES-256-CBC + 随机 IV）
首次启动时，原生的 `system.json` 被使用 AES-256-CBC 加密为 `system.json.enc`。解密后的明文仅存在于 C++ 内存空间，不下盘。

**随机 IV 策略**：每次加密使用随机生成的初始化向量（IV），存入 `auth.key` 头部。每条密文拥有独立 IV，抵抗重放攻击与分组模式分析。

**解密前置条件（缺一不可）**：
1. Steam UID 比对通过
2. HMAC 签名有效
3. 当前时间未超硬截止
4. 注册表 / ADS 双存储时间校验一致
5. 加密密钥永不出现在 JS 层，浏览器控制台捞密钥完全失效

#### 4. 行为检查点矩阵（单向 HMAC 哈希链）
这是整套方案的战术精髓，使验证逻辑与游戏玩法深度耦合，破解者无法通过简单删除或替换某一处校验来绕过。

**植入方式**：在游戏关键节点（地图转场、Boss 战、存档、获得关键道具、剧情分支点）插入单行脚本调用。

**调用签名**：`AuthManager.checkpointVerify("上下文标签")`，JS 层自动附加随机盐值（防返回值冻结）。

**C++ 层验证逻辑**：
1. 校验该标签是否存在于硬编码的白名单哈希表中
2. 单向 HMAC 哈希链迭代：每轮验证通过后，将（上下文 + 盐值）混入 HMAC 迭代，生成新的链值。破解者若内存清零该值，哈希链断裂，后续校验全部失败
3. 验证失败时触发强制副作用（修改 JS 层游戏变量如金钱、位置、开关），而非仅返回 `false`——即使破解者忽略返回值，游戏逻辑本身已被破坏

**失败惩罚（JS 层执行）**：触发“优雅降级”而非显式崩溃——如传送至虚空地图、清空背包、关键 NPC 消失、怪物数值膨胀。逆向者无法通过报错堆栈定位校验触发点。

**检查点数量建议**：建议控制在 7~12 个。过少则校验覆盖不足，破解者可通过少量尝试定位并跳过所有检查点；过多则会增加剧情迭代时维护标签顺序的工作量，且每个检查点的调用开销会累积影响性能。

#### 5. 看门狗守护线程（反调试 / 反挂起）
游戏启动后，C++ 插件创建一个独立于 JavaScript 事件循环的系统级线程。

**心跳协议**：该线程每隔 10 秒检查一次“心跳标记”。JS 主线程须通过公共事件定时调用 `heartbeatReply` 置位。

**阶梯阈值（防误杀）**：
- 首次超时 → 仅标记警告，不动作
- 连续两次超时（即 > 20 秒无心跳）→ 强制调用 `std::exit(0)` 闪退

**退出标记**：游戏正常关闭时通过 `beforeunload` 事件调用 `stopWatchdog`，线程平稳退出，无后台残留进程。

破解者若使用 Cheat Engine 挂起游戏主线程以分析代码，看门狗线程依然独立运行；收不到心跳即终止进程，封堵动态分析路径。

---

## 🔄 标准工作流

### 首次启动（激活）
1. 游戏加载 `decryptor.node`
2. C++ 检测本地无 `auth.key` → 调用 SteamAPI 获取当前登录 UID（含 5 次重试 × 100ms 容错）
3. 生成 HMAC 签名，构建 `auth.key`（内含 UID、生成时间、IV 和签名）
4. 读取 `system.json`，使用 AES-256-CBC（随机 IV）加密，输出 `system.json.enc`
5. **安全落盘**：
   - 写入 `.enc` 文件并校验哈希正确
   - 覆写原 `system.json` 全字节为 0，强制刷盘
   - 覆写后读取校验：逐字节确认全部为 0。若任一字节不为 0，写入 `.overwrite_failed` 标记文件
   - 确认校验通过后删除原文件
6. 将当前时间的 SHA256 哈希写入注册表 + NTFS ADS（V1.1 双写）
7. 初始化检查点哈希链为 0
8. 进入游戏

### 常规启动（验证）
1. 调用 `verifyAndDecrypt`
2. 校验 1（身份）：比对 UID + HMAC 验签
3. 校验 2（时间）：判断 `now > HARD_EXPIRE` 或 `now < last_seen_time - 60`（交叉校验注册表与 ADS）
4. 校验 3（文件完整性）：检查 `auth.key` 自身签名是否被外部篡改
5. 全部通过 → 用随机 IV 解密 `system.json.enc` → 返回明文 JSON 给引擎（仅内存）

### 运行时（持续防御）
1. 公共事件每 3~5 秒发送心跳（维持看门狗）
2. 玩家触发展转场 / 存档 / 关键操作时，触发检查点验证
3. 任一检查点返回 `false` → C++ 触发强制副作用 + JS 层执行优雅降级

---

## 🚀 快速开始

### 环境依赖
- **Node.js** (含 npm)
- **node-gyp** (用于编译 C++ 插件)
- **OpenSSL 1.1.1+** (开发库)
- **Steamworks SDK 1.5+** (需申请 Steam 合作伙伴账号)

### 1. 克隆仓库
```bash
git clone https://github.com/yourname/Chronos-Seal.git
cd Chronos-Seal
```

2. 安装依赖

```bash
npm install
```

3. 配置常量（⚠️ 发版前必须全部替换）

编辑 native/src/decryptor.cc，找到 namespace Config，按下方命令生成并替换：

常量 生成命令 说明
HMAC_SALT openssl rand -base64 32 256 位随机盐
AES_KEY openssl rand -hex 32 32 字节 AES 密钥
HARD_EXPIRE date -d "2027-01-01" +%s 硬截止时间戳（建议发版日 + 2~3 个月）
REGISTRY_KEY_PATH 手动填写 如 SOFTWARE\YourGameName\ChronosSeal
CHECKPOINT_WHITELIST 手动填写 7~12 个游戏关键节点标签（顺序即触发顺序）

4. 设置 Steamworks SDK 路径

编辑 native/binding.gyp，修改 include_dirs 中的路径指向你的 SDK：

```json
"include_dirs": [
  "<!@(node -p \"require('node-addon-api').include\")",
  "D:/dev/steamworks_sdk/public"   // ← 你的实际路径
]
```

5. 编译 Native 插件

```bash
cd native
node-gyp configure
node-gyp build --release
```

编译产物位于 native/build/Release/decryptor.node。

---

🎮 集成到游戏

目录结构

```
游戏根目录/
├── native/
│   ├── binding.gyp
│   ├── build/Release/decryptor.node
│   └── src/decryptor.cc
├── www/
│   ├── index.html
│   └── js/
│       └── auth_manager.js
└── auth/                        ← 运行时自动生成
    ├── auth.key
    ├── auth.key:timestamp       ← ADS 流（dir /r 可见）
    └── system.json.enc
```

步骤 1：引入 JS 胶水层

在 www/index.html 的 <head> 或 <body> 末尾加入：

```html
<script src="js/auth_manager.js"></script>
```

步骤 2：启动验证（标题画面前）

在游戏启动的公共事件中调用：

```js
var result = AuthManager.verifyAndDecrypt();
if (!result.success) {
    // 根据 result.errorCode 弹窗或退出
    alert('授权失败，错误码：' + result.errorCode);
    SceneManager.exit();
}
```

步骤 3：启动看门狗（自动）

auth_manager.js 已在 load 事件中自动启动看门狗，无需额外操作。

步骤 4：定期心跳（公共事件）

在并行处理的公共事件中，每 3~5 秒调用：

```js
AuthManager.heartbeatReply();
```

步骤 5：植入检查点（游戏关键节点）

在地图转场、Boss 战前、存档、获得关键道具等位置插入：

```js
if (!AuthManager.checkpointVerify('boss_battle_start')) {
    // 验证失败，执行惩罚（或依赖 C++ 自动惩罚）
    $gamePlayer.reserveTransfer(999, 0, 0, 0);  // 传送至虚空
}
```

---

📊 错误码速查

错误码 宏定义 触发条件 玩家建议操作
0 SUCCESS 验证通过 —
10 ERR_EXPIRED 超过硬编码截止日期 前往 Steam 更新游戏
20 ERR_ID_MISMATCH Steam UID 比对失败或采样不一致 确保登录购买账号
30 ERR_SIGNATURE HMAC 签名无效 / 文件被篡改 重装游戏 / 删除 auth.key 重新激活
31 ERR_TIME_TAMPER 时间回拨检测触发（注册表 / ADS 校验失败） 同步系统时间后重试
40 ERR_NO_RES system.json.enc 缺失 重装游戏
50 ERR_NO_STEAM Steam 客户端未运行或 SDK 初始化失败（含 5 次重试） 启动 Steam 后重试
-1 ERR_UNKNOWN 未知异常 联系开发者

---

🧪 测试建议

本地验证

测试场景 预期结果
首次启动 生成 auth.key 和 system.json.enc，原 system.json 被安全覆写为 0 并删除
删除注册表 启动后自动补回注册表（V1.1 自修复）
删除 ADS（echo > auth\auth.key:timestamp） 启动后自动重建 ADS（V1.1 自修复）
同时篡改注册表与 ADS 时间哈希 报 ERR_TIME_TAMPER（31）闪退
暂停游戏主线程 20 秒以上 看门狗强制退出进程
换电脑拷贝游戏 Steam UID 不同 → ERR_ID_MISMATCH（20）闪退
强制改系统时间绕过 硬截止 + 双存储防回拨 → ERR_TIME_TAMPER（31）
CE 冻结检查点返回值 盐值验算失败 → 触发惩罚（虚空传送 / 清背包）

---

🛠 开发者部署 Checklist

阶段一：环境配置

☐ 安装 Node.js、node-gyp、OpenSSL 开发库
☐ 配置 Steamworks SDK 路径（binding.gyp 中填写绝对路径）
☐ 将 C++ 源码中的 HMAC_SALT 替换为 openssl rand -base64 32 生成的随机字符串
☐ 将 AES_KEY 替换为 openssl rand -hex 32 生成的 32 字节随机密钥
☐ 设置 HARD_EXPIRE 为发版日期 + 2~3 个月的 Unix 时间戳
☐ 将 REGISTRY_KEY_PATH 中的 YourGameName 替换为实际游戏名

阶段二：检查点定义

☐ 确定 7~12 个核心节点（地图切换、Boss 战、存档、读档、获得关键道具、剧情分支点）
☐ 将上下文标签填入 C++ 源码 CHECKPOINT_WHITELIST 数组
☐ 确保白名单顺序即为期望的触发顺序

阶段三：代码植入

☐ 在 index.html 中引入 auth_manager.js
☐ 在启动公共事件（标题画面前）调用 AuthManager.verifyAndDecrypt 并处理 errorCode
☐ 在并行处理或定时器中设置每 3~5 秒调用 AuthManager.heartbeatReply
☐ 在窗口 beforeunload 事件中调用 AuthManager.stopWatchdog（已自动处理）
☐ 在检查点位置插入 AuthManager.checkpointVerify("context_name")
☐ 验证失败时使用非显式报错的惩罚逻辑（虚空传送、背包清空、数值膨胀等）

阶段四：安全加固（⚠️ 强烈建议）

☐ 关闭 NW.js 远程调试端口（发布版禁止携带 --remote-debugging 参数）
☐ Release 模式编译 decryptor.node：关闭调试符号（-g），开启 O3 优化
☐ 错误码仅返回数字，错误文本不打包进二进制
☐ 移除所有 console.log 及 if (DEBUG) 测试代码
☐ 关闭 WATCHDOG_LOGGING 编译宏（Release 版）
☐ （推荐） 对编译后的 .node 模块使用 VMProtect / Themida 进行虚拟化加壳，进一步提升静态逆向难度（注意：混淆可能影响模块加载稳定性，发布前需充分测试）

阶段五：打包与发布

☐ 编译 decryptor.node（Release 模式）
☐ 将 .node 打包进加密资源包或使用 Enigma Virtual Box 等工具封装进主程序
☐ 测试三轮：正向流程 / 顺序篡改 / 看门狗超时
☐ 通过 Steam 推送更新

---

⚠️ 局限性声明

本系统的设计目标不涵盖以下专业级攻击路径，此类攻击超出本项目防护目标与技术预算边界：

· 专业 x86/x64 静态反汇编与动态调试（如 IDA Pro + x64dbg 深度分析）
· 内存转储（Dump）攻击——高手可在解密瞬间抓取 V8 堆内存
· 硬件级 HOOK 或内核驱动级注入
· SSD 磨损均衡下的物理扇区数据残留（应用层无法彻底擦除）

原生模块部署风险：NW.js 打包若 .node 直接暴露在文件目录，逆向者可单独提取二进制进行静态分析。推荐方案：将 .node 打包进 NW.js 的加密资源包（如使用 nwjc 编译），或使用 Enigma Virtual Box 等打包工具将 .node 封装进主程序壳内，使二进制模块不以独立文件形式暴露于文件系统。

适用场景定位：本方案专为低定价（¥12~¥60）、为爱发电的独立游戏设计。核心价值在于劝退小白、提高门槛，确保文件夹复制传播与简易打包补丁在短时间内自动失效（时间炸弹），保护开发者初期的销售窗口期。

---

📋 更新日志

V1.1（2026-08-29）—— ADS 双存储防篡改增强

类型 变更内容
新增 引入 NTFS 备用数据流（ADS） 作为第三隐性存储介质，时间哈希同步写入 auth.key:timestamp
增强 verify_time 升级为严格双源交叉校验模式（注册表 + ADS）：任一存储非空且错误即触发 ERR_TIME_TAMPER（31），空值放过以兼容意外清理
修复 调整 GenerateFirstTimeAuth 执行顺序：先写 auth.key 宿主文件，再写入 ADS，确保首次激活时 ADS 流正确挂载
优化 save_current_time_to_registry 内部同时处理注册表与 ADS 写入，保持双写一致性
安全 时间存储从“单点可删”升级为“双存储自修复”：删注册表或删 ADS 均可由另一方自动补回
文档 移除独立的 PDF 白皮书，所有设计原理、架构、工作流、部署指南等全部整合进此 README

---

V1.0（2026-08-28）—— 初始稳定版

类型 变更内容
新增 完成整体架构设计：三层防御体系（L1 C++ 信任根 + L2 JS 胶水层 + L3 行为验证层）
新增 Steam 身份锚定：HMAC-SHA256 签名绑定 UID，多采样抗 Hook
新增 时间自毁机制：硬编码截止时间戳 + 注册表防回拨
新增 资源加密锁：AES-256-CBC 加密 system.json，随机 IV，C++ 内存解密
新增 行为检查点矩阵：单向 HMAC 哈希链，7~12 个检查点与游戏逻辑深度耦合
新增 看门狗守护线程：独立系统级线程，10 秒超时，连续 2 次无心跳强制退出
新增 安全落盘机制：覆写原文件为全 0 并校验，确认无误后删除
修复 ending_trigger → ending_credits 命名统一
修复 检查点失败时 C++ 层主动注入游戏状态惩罚（清金钱、传送原点、破坏开关），不再仅返回布尔值
修复 移除 verify_time 中 last_seen_time > 0 的多余判断
优化 哈希链由 XOR 迭代升级为单向 HMAC-SHA256 迭代
优化 Steam 初始化重试提升至 5 次、间隔 100ms；g_last_salt 提升为全局原子变量
安全 新增 .overwrite_failed 覆写失败持久化标记与启动重试逻辑
安全 新增看门狗日志编译宏 WATCHDOG_LOGGING，Release 模式默认关闭

---

🤝 贡献指南

我们欢迎 Issue 和 Pull Request。如果你发现漏洞或改进点，请：

1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/amazing-feature)
3. 提交更改 (git commit -m 'Add some amazing feature')
4. 推送到分支 (git push origin feature/amazing-feature)
5. 打开一个 Pull Request

---

📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

注意：本方案仅提供技术框架，使用者需自行确保遵循 Steam 平台及各国法律合规要求。

---

🙏 致谢

· node-addon-api
· OpenSSL
· Steamworks SDK

---

📬 联系方式

· 作者：CLARE-XHL
· 项目地址：https://github.com/CLARE-XHL/Chronos-Seal

---

⭐ 如果这个项目对你有帮助，请给一个 Star，让更多独立开发者看到！
