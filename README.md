# Chronos Seal

**时序为封印 · 行为作密钥 · 岁月守护原创**

---

[![Platform](https://img.shields.io/badge/platform-NW.js%20%7C%20RPG%20Maker%20MV%2FMZ-blue)](https://nwjs.io/)
[![C++](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Chronos Seal** 是一套专为 RPG Maker MV / MZ（NW.js）设计的**无服务器运行时完整性保护方案**。通过 C++ Native 层实现身份锚定、时间炸弹、行为检查点与看门狗守护，将批量盗版与简易破解的成本提升至远超游戏本身价值。

**核心哲学**：不追求绝对不可破解（客户端环境不存在），而是让**破解成本 > 游戏售价**，从而在经济学层面阻止盗版传播。

---

## 📦 特性

| 特性 | 说明 |
| :--- | :--- |
| **🔐 原生层信任根** | 核心解密逻辑下沉至 C++ 编译二进制，JS 层零敏感密钥，杜绝控制台捞密钥 |
| **🆔 Steam 身份锚定** | 通过 Steam SDK 读取 UID，HMAC-SHA256 签名绑定，多采样抗 Hook |
| **⏳ 时间自毁炸弹** | 硬编码截止时间戳随二进制固化，旧版泄露包到点自动死亡 |
| **🛡️ 双存储防回拨** | 时间记录同时写入文件 + 注册表，交叉校验，单点篡改失效 |
| **🔑 AES-256-CBC 加密** | 随机 IV，`system.json` 加密后明文仅存内存，永不下盘 |
| **🎯 行为检查点矩阵** | 单向 HMAC 哈希链，散布于剧情节点，失败触发强制副作用（清空金钱/传送原点） |
| **👁️ 看门狗守护线程** | 独立系统线程监控 JS 主线程活性，挂起调试超时自动 `exit` |
| **🔄 Steam 初始化容错** | 5 次重试 × 100ms 间隔，解决 NW.js 早于 Steam 启动导致的授权失效 |
| **📦 零服务器依赖** | 无需任何云端服务，彻底规避运维成本与宕机风险 |

---

## 🏗️ 架构概览

```

┌─────────────────────────────────────────────────────────────┐
│                    游戏层 (RPG Maker MV)                    │
│              公共事件 · 地图事件 · 脚本指令                  │
└─────────────────────────┬───────────────────────────────────┘
│ 调用
▼
┌─────────────────────────────────────────────────────────────┐
│                   JS 胶水层 (auth_manager.js)               │
│         暴露 API · 管理心跳 · 无任何敏感密钥                 │
└─────────────────────────┬───────────────────────────────────┘
│ N-API 调用
▼
┌─────────────────────────────────────────────────────────────┐
│                原生信任根 (decryptor.node)                   │
│   C++ 编译二进制 · 硬编码密钥 · HMAC 签名 · AES 加解密       │
│   时间炸弹 · 检查点哈希链 · 看门狗线程 · 多采样抗 Hook       │
└─────────────────────────────────────────────────────────────┘

```

---

## 🚀 快速开始

### 前置依赖

| 依赖 | 版本 | 说明 |
| :--- | :--- | :--- |
| [Node.js](https://nodejs.org/) | ≥ 12.x | 包含 npm / node-gyp |
| [node-gyp](https://github.com/nodejs/node-gyp) | ≥ 8.x | `npm install -g node-gyp` |
| [OpenSSL](https://www.openssl.org/) | 1.1.1+ | 开发库 (libssl-dev / libcrypto-dev) |
| [Steamworks SDK](https://partner.steamgames.com/) | 1.5+ | 需下载并配置路径 |

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/CLARE-XHL/Chronos-Seal.git
cd Chronos-Seal

# 2. 安装 node-addon-api
npm install node-addon-api

# 3. 修改 binding.gyp 中的 Steam SDK 路径
#    将 "C:/path/to/steamworks/sdk/public" 改为实际路径

# 4. 编译 Native 模块
cd native
node-gyp configure
node-gyp build --release

# 5. 将生成的文件放入游戏项目
#    - native/build/Release/decryptor.node  → 游戏 www/ 目录 (建议加密打包)
#    - auth_manager.js                      → 游戏 www/js/
#    - 在 index.html 中引入 auth_manager.js
```

在 RPG Maker MV 中使用

启动验证（公共事件，标题画面前执行）

```javascript
var result = AuthManager.verifyAndDecrypt();
if (!result.success) {
    alert('授权失败: ' + result.errorCode);
    SceneManager.exit();
}
```

检查点（地图转场 / Boss 战 / 存档等关键节点）

```javascript
if (!AuthManager.checkpointVerify('boss_battle_start')) {
    // 验证失败 → 优雅降级
    $gamePlayer.reserveTransfer(999, 0, 0, 0);
    $gameParty._gold = 0;
}
```

---

⚙️ 发版前配置清单

打开 decryptor.cc，替换以下硬编码常量：

常量 生成命令 说明
HMAC_SALT openssl rand -base64 32 256 位随机盐值
AES_KEY openssl rand -hex 32 32 字节 AES 密钥
HARD_EXPIRE date -d "2027-01-01" +%s Unix 时间戳截止日期
REGISTRY_KEY_PATH 手动填写 Windows 注册表路径，替换 YourGameName
CHECKPOINT_WHITELIST 手动填写 7–12 个剧情节点标签，顺序即期望触发顺序

⚠️ 警告：示例密钥 严禁 用于正式发布！必须全部替换为随机生成值。

---

📂 目录结构

```
Chronos-Seal/
├── native/                          # Native 模块源码
│   ├── binding.gyp                  # node-gyp 构建配置
│   └── src/
│       └── decryptor.cc             # C++ 核心源码（全部功能）
├── www/
│   └── js/
│       └── auth_manager.js          # JS 胶水层
├── docs/
│   └── Chronos_Seal_白皮书.md       # 完整技术白皮书
├── README.md                        # 本文件
└── LICENSE                          # MIT 许可证
```

---

🛡️ 反盗版防御矩阵

盗版手段 Chronos Seal 应对策略
直接复制文件夹 Steam UID 不匹配 → 拒绝解密 system.json
强制改系统时间 硬编码时间炸弹 + 注册表/文件双存储防回拨
替换 JS 做破解补丁 核心解密在 C++ 层，JS 无密钥，替换无效
CE 冻结内存返回值 动态随机盐值，冻结导致盐值验算失败
CE 挂起进程调试 独立看门狗线程，超时强制 exit
Hook Steam API 伪造 UID 多次异步采样比对，单点 Hook 难以一致
修改 auth.key 时间字段 注册表独立存储哈希，交叉校验失败

---

⚠️ 局限性声明

本系统 不尝试抵御 以下专业级攻击路径（超出本项目防护目标与技术预算边界）：

· 专业 x86/x64 静态反汇编与动态调试（IDA Pro + x64dbg 深度分析）
· 内存转储（Dump）攻击（解密瞬间抓取 V8 堆内存）
· 硬件级 HOOK 或内核驱动级注入
· SSD 磨损均衡下的物理扇区数据残留

适用场景：低定价（¥12）、为爱发电的独立游戏。核心目标是 劝退小白、提高门槛，而非对抗顶级逆向工程师。

---

🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/amazing-feature)
3. 提交你的改动 (git commit -m 'Add some amazing feature')
4. 推送到分支 (git push origin feature/amazing-feature)
5. 打开一个 Pull Request

---

📄 许可证

本项目基于 MIT 许可证 开源。详见 LICENSE 文件。

---

👤 作者

CLARE-XHL

· GitHub: @CLARE-XHL

---

Chronos Seal 1.0 · 2026 年 8 月

“时序为封印，行为作密钥，岁月守护原创。”
