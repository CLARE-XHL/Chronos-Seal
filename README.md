# Chronos Seal

**时序为封印 · 行为作密钥 · 岁月守护原创**

---

[![Platform](https://img.shields.io/badge/platform-NW.js%20%7C%20RPG%20Maker%20MV%2FMZ-blue)](https://nwjs.io/)
[![C++](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1-red.svg)](CHANGELOG.md)

---

**适用场景**：定价 ¥12~¥60 的独立游戏，保护首发销售窗口期。

**核心哲学**：不追求绝对不可破解，而是让破解成本 > 游戏售价，从经济学层面阻止盗版传播。

**序言**：该项目完全开源免费（MIT License），欢迎各路 RM 作者直接拿去用，也欢迎各路破解者前来尝试并提交 Issue —— 你破得越深，我补得越快，这套系统就会越强，这也算是我给 RM 圈的一份 Liberty。

---

## V2.1 核心改进

V2.1 彻底解决了 RPG Maker 自带素材加密（仅加密前16字节）的致命漏洞，将素材解密流程完整下沉到 C++ 层。

核心升级点：

- 移除 Steam SDK 依赖：不再需要 Steam 账号、Steamworks SDK
- 移除本地编译环境：不需要安装 Node.js、Python、MSVC、OpenSSL（加密阶段除外）
- system.json 改为明文：密钥不再存放在 JSON 文件中
- 素材完整加密：不再是 RM 那种只加密前 16 字节的方式，而是完整文件加密
- 密钥由 C++ 运行时派生：不在任何文件中存储，破解者无法通过分析图片反推密钥
- 加密格式升级：MAGIC(8) + IV(16) + HMAC(32) + AES-256-CBC 密文
- 看门狗状态上报：不再直接杀死进程，由 JS 层决定如何处理
- 云端编译（GitHub Actions）：开发者无需本地编译环境

---

## 设计哲理

Chronos Seal 不追求绝对不可破解——那在客户端环境中不存在。它追求的是：让破解的成本（时间、技术门槛、维护负担）远超游戏本身的价值，从而在经济学层面阻止盗版传播。

- 经济学博弈：本地不存在绝对不可破解的加密。本方案旨在将破解成本提升至远超游戏售价，保护独立游戏首发的“黄金两周”。
- 版本迭代即“时间炸弹”：利用版本差压缩盗版传播窗口
- 零信任、零知识：工具作者不接触、不存储任何用户密钥
- 完全可逆：只加密发行包，工程文件零修改

---

## 特性

- 原生层信任根：核心解密逻辑在 C++ 编译二进制（.node）中，JS 层无密钥，F12 控制台捞不到
- 素材完整加密（V2.1）：加密整个素材文件，不再是 RM 自带的仅加密前 16 字节
- 密钥运行时派生：密钥由版本号 + 发行日期 + 派生种子 → HMAC-SHA256 动态生成，不在任何文件中存储
- 素材格式带魔数：文件头包含 CHRNSLSE 魔数，JS 层可快速判断是否加密文件
- HMAC 完整性校验：每个加密素材自带 HMAC-SHA256 签名，防止篡改
- 看门狗守护线程：独立系统级线程监控 JS 主线程，状态上报模式，不直接杀死进程
- 时间炸弹 + 时钟回拨检测：硬编码截止时间 + 单调时钟辅助检测，只告警不误杀
- 云端编译：无需本地编译环境，[GitHub Actions](https://github.com/CLARE-XHL/Chronos-Builder-Template) 一键生成专属 .node
- 不依赖任何外部平台：Steam 游戏能用，免费游戏也能用

---

## 文件结构

下载 [Chronos Seal V2.1 发行包](https://github.com/CLARE-XHL/Chronos-Seal/releases) 后，你会在压缩包中得到以下文件：

- auth_manager.js —— 放入 js/plugins/ 目录，在 RPG Maker 插件管理器中启用
- index.html —— 替换发行包 www/ 目录中的同名文件
- encrypt_assets.js —— 素材加密脚本（配合 bat 使用）
- encrypt_assets.bat —— 素材加密脚本（双击运行）
- README.md —— 本文件

---

## 快速开始（完整流程）

V2.1 的使用流程分为以下几个阶段：

1. 开发阶段：放置文件，启用插件
2. 部署阶段：生成发行包
3. 云端编译：生成专属 .node 文件
4. 加密阶段：加密素材文件
5. 发布阶段：打包 Steam


### 阶段一：开发阶段

**1.1 放置 JS 插件**

将 auth_manager.js 放入 js/plugins/ 目录。

**1.2 启用插件**

1. 打开 RPG Maker 编辑器
2. 点击菜单栏的 工具 → 插件管理
3. 在插件列表中找到 auth_manager.js
4. 双击启用（勾选左侧复选框）
5. 点击 确定 保存

**1.3 配置启动验证（公共事件）**

创建一个公共事件（如命名为 Auth_Init），在游戏启动时执行：

```javascript
var init = AuthManager.initialize();
if (!init.success) {
    alert('游戏版本已过期，请联系开发者更新。');
    SceneManager.exit();
    return;
}
if (init.timeTamperDetected) {
    console.warn('[ChronosSeal] 检测到系统时钟异常');
}

AuthManager.startWatchdog();
```

1.4 配置定时心跳（并行处理事件）

在游戏的一个并行处理公共事件中，每隔 3-5 秒调用：

```javascript
AuthManager.heartbeatReply();

var state = AuthManager.getWatchdogState();
if (state.triggered) {
    alert('游戏环境异常，请重新启动。');
    SceneManager.exit();
}
```

阶段二：部署阶段

2.1 运行 RPG Maker 编辑器部署

1. 在 RPG Maker 编辑器中点击 文件 → 部署
2. 选择目标平台（Windows）
3. 不要输入素材加密密钥（不要勾选两个复选框，V2.1 不再依赖 RM 自带的素材加密）
4. 生成发行包

部署完成后，你会得到一个包含 www/ 目录的发行包文件夹。

2.2 备份原文件（可选但建议）

备份发行包中的原始 index.html，以便调试或回退。

阶段三：云端编译

V2.1 的 C++ 插件通过 GitHub Actions 云端编译，无需在本地安装任何编译工具。

3.1 Fork 模板仓库

Fork [Chronos-Builder-Template](https://github.com/CLARE-XHL/Chronos-Builder-Template) 到你的 GitHub 账户（必须设为私有）

3.2 上传文件

将以下文件上传到你的 Fork 仓库根目录：

· system.json（游戏工程中的 data/system.json，明文）

⚠️ V2.1 不再需要 config.h，只需要 system.json。

3.3 触发 GitHub Actions

1. 进入你的 Fork 仓库，点击 Actions 标签
2. 在左侧选择 Build Chronos Seal
3. 点击 Run workflow
4. 填写参数：
   · 游戏名称：你的游戏名称。示例：MyGame
   · 游戏版本号：当前版本号（用于派生密钥）。示例：1.0.0
   · 截止日期：时间炸弹截止日期，留空则永不过期。示例：2027-01-01
5. 点击 Run workflow，等待 2-3 分钟

3.4 下载产物

编译完成后，下载 chronos-seal-output.zip，解压得到：

· decryptor.node —— C++ 核心插件，放入发行包根目录
· encrypt_config.json —— 素材加密配置，用于加密阶段
· author_secret.txt —— 作者专属密钥（离线保存！）

3.5 删除 Fork 仓库

下载文件后，立即删除你的 Fork 仓库，确保日志和密钥不泄露。

阶段四：加密阶段

4.1 放置文件

将以下文件放入发行包根目录（与 www/ 同级）：

· decryptor.node（从云端编译下载）
· encrypt_config.json（从云端编译下载）
· encrypt_assets.bat（从 CS 发行包获取）
· encrypt_assets.js（从 CS 发行包获取）

4.2 安装 Node.js（仅加密阶段需要）

加密脚本需要 Node.js 环境。请从 nodejs.org 下载安装（LTS 版本即可）。

⚠️ Node.js 只在加密阶段使用，玩家运行游戏时不需要安装。

4.3 运行加密脚本

双击 encrypt_assets.bat，脚本会自动：

1. 读取 encrypt_config.json 中的配置
2. 派生与 C++ 层相同的密钥
3. 遍历 www/ 目录下所有图片（.png）和音频（.ogg / .m4a）文件
4. 对每个文件进行 AES-256-CBC 完整加密
5. 生成 .enc 文件并删除原文
6. 校验加密结果

4.4 清理敏感文件

加密完成后，删除以下文件：

· encrypt_config.json（已用完）
· encrypt_assets.bat（已用完）
· encrypt_assets.js（已用完）

⚠️ 这些文件包含密钥派生参数，绝对不要随游戏发行包一起发布。

阶段五：发布阶段

5.1 替换 index.html

将 CS 提供的 index.html 替换发行包 www/ 目录中的同名文件。

5.2 最终发行包结构

```
发行包目录/
├── www/
│   ├── data/
│   │   ├── system.json          ← 明文（不再加密）
│   │   └── Map*.json            ← 明文
│   ├── img/
│   │   ├── face.png.enc         ← 加密
│   │   ├── battle.png.enc       ← 加密
│   │   └── ...
│   ├── audio/
│   │   ├── bgm/
│   │   │   └── title.ogg.enc    ← 加密
│   │   └── se/
│   │       └── click.ogg.enc    ← 加密
│   ├── js/
│   │   └── plugins/
│   │       └── auth_manager.js  ← CS 插件
│   └── index.html               ← CS 版本
├── decryptor.node               ← CS 核心
└── Game.exe
```

5.3 打包发布

将整个发行包目录打包，上传到 Steam 或 itch.io 等平台。

⚠️ author_secret.txt 的重要性

author_secret.txt 包含：

· 游戏名称和版本号
· 派生种子（Salt）
· IV（初始化向量）

这份文件是游戏加密的唯一凭证。

· 丢失后无法恢复，加密将永久失效
· 泄露后加密将完全失效
· 建议保存到至少两个不同的物理设备
· 绝对禁止随游戏发行包一起发布
· 绝对禁止上传到任何云端存储（除非加密后）

encrypt_config.json

加密阶段完成后必须删除，包含密钥派生参数，泄露后攻击者可自行派生解密密钥。

Node.js

只在加密阶段使用，玩家运行游戏时不需要安装。

参数说明

游戏名称：你的游戏名称。示例：MyGame

游戏版本号：当前版本号（用于派生密钥）。示例：1.0.0

截止日期：时间炸弹截止日期，留空则永不过期。示例：2027-01-01

错误码速查

错误码 10 — ERR_EXPIRED：游戏版本已过期，请联系开发者更新。

错误码 30 — ERR_SIGNATURE：授权文件损坏，请重新安装游戏。

错误码 40 — ERR_NO_RES：游戏文件缺失，请验证游戏完整性或重装。

错误码 60 — ERR_DECRYPT_PADDING：解密填充错误（可能文件损坏或篡改）。

错误码 61 — ERR_DECRYPT_HMAC：HMAC 校验失败（文件被篡改）。

错误码 62 — ERR_ASSET_TOO_LARGE：素材文件过大（超过 200MB）。

错误码 63 — ERR_INVALID_FORMAT：无效的加密格式（魔数不匹配）。

错误码 -1 — ERR_UNKNOWN：未知异常，请联系开发者。

如何升级到新版本

当你需要发布游戏更新时：

1. 在 RPG Maker 中修改游戏内容
2. 重新运行 RPG Maker 编辑器部署（不要输入素材加密密钥）
3. 重新触发 GitHub Actions 云端编译，输入新的版本号
4. 下载新的 decryptor.node 和 encrypt_config.json
5. 重新运行 encrypt_assets.bat 加密素材
6. 替换发行包中的 decryptor.node、system.json.enc 和 index.html
7. 重新打包发布

重要说明：

· 每次更新版本号都会生成全新的密钥
· 旧版本游戏仍然可以运行，但不会收到更新内容
· 建议每次更新时同步更新游戏内的版本号显示

如何卸载 / 脱壳

V2.1 的设计原则是完全可逆的。卸载方法如下：

从工程文件中移除

1. 打开 RPG Maker 编辑器，进入插件管理器
2. 禁用或删除 auth_manager.js 插件
3. 删除公共事件中的 AuthManager.initialize()、AuthManager.startWatchdog() 和 AuthManager.heartbeatReply() 调用
4. 保存工程

从发行包中移除

1. 删除发行包根目录下的 decryptor.node
2. 删除所有 .enc 加密素材文件
3. 将原始素材文件放回对应目录
4. 恢复原始的 index.html
5. 重新打包发布

卸载完成后，游戏恢复为完全纯净的原始状态，没有任何加密残留。

常见问题

Q: V2.1 还需要输入 RPG Maker 的素材加密密钥吗？

A: 不需要。V2.1 不再依赖 RM 自带的素材加密，部署时直接跳过即可。

Q: 加密素材后，游戏会不会变卡？

A: 不会。解密运算量极小（仅前 16 字节 XOR + HMAC 校验），且引擎加载素材本身已是同步阻塞的，解密开销可以忽略。

Q: 为什么需要 Fork 私有仓库？

A: Actions 日志中可能包含密钥信息。私有仓库的日志只有你自己能看到，公开仓库的日志全世界都能看。

Q: 我不小心把 encrypt_config.json 删了怎么办？

A: 需要重新触发云端编译，重新下载新的 encrypt_config.json。注意版本号要跟之前一致，否则密钥会变化。

Q: V2.1 支持哪些素材格式？

A: 目前支持 .png（图片）和 .ogg、.m4a（音频）。其他格式（如地图数据、JSON 文件）保持明文。

Q: V2.1 和 V2.0 的加密格式兼容吗？

A: 不兼容。V2.1 使用了新的素材加密格式（魔数 + HMAC），升级需要重新加密所有素材。

Q: 我修改了游戏工程里的素材，需要重新加密吗？

A: 需要。每次修改素材后，重新运行 RPG Maker 编辑器部署，然后重新运行 encrypt_assets.bat。

Q: 如果加密失败，原始素材会被删除吗？

A: 不会。加密脚本会在加密成功并校验通过后才删除原文，加密失败时原文保留。

Q: 为什么时间炸弹检测到了时钟回拨，游戏还能运行？

A: V2.1 采用“只告警不误杀”的设计原则。时钟回拨可能是 NTP 校时或 Windows 休眠导致的，不应该直接封杀正版用户。

Q: 游戏运行时提示“decryptor.node 加载失败”？

A: 检查：

1. decryptor.node 是否在发行包根目录
2. auth_manager.js 是否在 js/plugins/ 目录
3. 插件是否在 RPG Maker 插件管理器中启用

致谢

· node-addon-api
· OpenSSL
· @JiuGeGe520 —— 帮忙发现初期漏洞，推动 V1.1 的 ADS 双存储方案落地
· Project 1 的 fux2 —— 指出 V1.x 版本的核心误区，促使 V2.0 彻底重构
· Project 1 的 Singular_Photon —— 指出 RM 原生素材加密的致命漏洞，推动 V2.1 素材解密下沉

许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

联系方式

作者：CLARE-XHL

项目地址：https://github.com/CLARE-XHL/Chronos-Seal

⭐ 如果这个项目对你有帮助，请给 GitHub 仓库 一个 Star ！
