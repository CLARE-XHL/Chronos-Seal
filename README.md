# Chronos Seal

**时序为封印 · 行为作密钥 · 岁月守护原创**

---

[![Platform](https://img.shields.io/badge/platform-NW.js%20%7C%20RPG%20Maker%20MV%2FMZ-blue)](https://nwjs.io/)
[![C++](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0-red.svg)](CHANGELOG.md)

---

**适用场景**：定价 ¥12~¥60 的独立游戏，保护首发销售窗口期。

**核心哲学**：不追求绝对不可破解，而是让破解成本 > 游戏售价，从经济学层面阻止盗版传播。

**序言**：该项目完全开源免费（MIT License），欢迎各路 RM 作者直接拿去用，也欢迎各路破解者前来尝试并提交 Issue —— 你破得越深，我补得越快，这套系统就会越强，这也算是我给 RM 圈的一份 Liberty。

---

## 设计哲理

Chronos Seal 不追求绝对不可破解——那在客户端环境中不存在。它追求的是：让破解的成本（时间、技术门槛、维护负担）远超游戏本身的价值，从而在经济学层面阻止盗版传播。

- 经济学博弈：本地不存在绝对不可破解的加密。本方案旨在将破解成本（时间、技术门槛）提升至远超游戏售价，保护独立游戏首发的“黄金两周”。
- 版本迭代即“时间炸弹”：不硬编码时间戳，利用“玩家只需更新，破解者必须重逆”的版本差，直接耗尽盗版传播者的精力。
- 零信任、零知识：工具作者和平台不接触、不存储任何用户的密钥。彻底自证清白，杜绝“后门”嫌疑。
- 完全可逆（防误杀）：只加密发行包，绝不修改工程文件。开发者想卸载防破解，删几行代码即可，毫无残留。

---

## V2.0 已发布

V2.0 是一次彻底的重构，目标只有一个：让所有 RM 开发者都能用上，无论你的游戏是否上架 Steam。

V2.0 核心升级：
- 彻底移除 Steam SDK 依赖：不再强制要求 Steam 账号和 SDK，任何 RM 游戏都能用
- 彻底移除本地编译环境：不需要安装 Node.js、Python、MSVC、OpenSSL —— 一个都不需要
- 云端编译（GitHub Actions）：Fork 模板仓库 → 填写参数 → 自动编译 → 下载成品
- 零知识设计：密钥只在用户自己的 GitHub Actions 中生成，作者不接触、不存储
- 完全可逆：加密只针对发行包，工程文件零修改，一键脱壳

---

## 特性

- 原生层信任根：核心解密逻辑在 C++ 编译二进制（.node）中，JS 层无密钥，F12 控制台捞不到
- 行为检查点矩阵：7-12 个检查点与游戏剧情耦合，失败时触发优雅降级（金钱清零、传送虚空）
- 看门狗守护线程：独立系统级线程，10 秒超时，连续 2 次无心跳强制退出，封堵 CE 挂起调试
- 发行包预加密：打包前加密 system.json，发行包内无明文，彻底堵死解包即玩
- 云端编译（V2.0 新增）：无需本地编译环境，GitHub Actions 一键生成专属 .node
- 不依赖任何外部平台（V2.0 新增）：Steam 游戏能用，免费游戏也能用

---

## 快速开始

V2.0 的使用流程非常简单，全程不需要安装任何编译工具。

你需要准备：
- 一个 GitHub 账号
- 你的 RPG Maker 游戏工程

### 第一步：下载 Chronos Seal V2.0 发行包

从 [Releases](https://github.com/CLARE-XHL/Chronos-Seal/releases) 页面下载最新版，解压后得到：
- ChronosScan.bat（本地扫描器）
- auth_manager.js（JS 插件）
- index.html（启动劫持模板）

### 第二步：运行扫描器，植入检查点，启用插件

1. 将 ChronosScan.bat 放入你的游戏工程根目录
2. 双击运行，脚本会自动扫描所有地图，生成：
   - checkpoints_guide.txt —— 检查点植入说明书（给人看）
   - config.h —— 检查点白名单（给机器编译用）
3. 打开 checkpoints_guide.txt，在对应地图的转场事件中插入检查点代码
4. 将 auth_manager.js 放入 js/plugins/ 目录
5. 在 RPG Maker 插件管理器中启用 auth_manager.js

### 第三步：打包游戏，生成发行包，备份原文件

1. 在 RPG Maker 编辑器中点击 文件 → 部署
2. 选择目标平台（Windows），勾选对音频和图像加密并填写密钥，生成发行包
3. 打包完成后，你会得到一个包含 www/ 目录的发行包文件夹

> ⚠️ 在继续下一步之前，先备份发行包中的两个原始文件：
> - `www/index.html`（原始入口文件）
> - `data/system.json`（明文配置文件）
> 
> 在工程根目录下（注意不是在你的发行包根目录下，正常来说你的工程文件应该在文档的Games文件夹下，而发行包在你文档的Output文件夹下）新建 `_chronos_backup/` 文件夹，将这两个文件复制进去。这样调试或回退时可以直接恢复。

### 第四步：云端编译

1. Fork [Chronos-Builder-Template](https://github.com/CLARE-XHL/Chronos-Builder-Template) 到你的 GitHub 账户（必须设为私有）
2. 将 config.h 和游戏工程中的 data/system.json（明文）上传到仓库根目录
3. 在仓库页面点击 Actions → Build Chronos Seal → Run workflow
4. 填写参数：
   - 游戏名称（如 MyGame）
   - 游戏版本号（如 1.0.0）
   - 截止日期（留空则永不过期）
5. 等待 2-3 分钟，下载 chronos-seal-output.zip
6. 解压得到：decryptor.node、system.json.enc、author_secret.txt
7. 将 author_secret.txt 离线保存，绝对不要放进游戏包！
8. 删除你的 Fork 仓库（日志销毁，密钥不泄露）

### 第五步：部署加密文件到发行包

1. 将 decryptor.node 放入游戏发行包根目录
2. 将 system.json.enc 放入发行包 data/ 目录，替换原有的 system.json
3. 将 Chronos Seal 提供的 index.html 替换发行包 www/ 目录中的同名文件
4. 打包发布

> ⚠️ 替换前确认你已经备份了原始文件（在 `_chronos_backup/` 中）。如果还没有备份，请先回到第三步完成备份。

---

## ⚠️ author_secret.txt 的重要性

author_secret.txt 包含：
- 游戏名称和版本号
- 衍生种子（Salt）
- HMAC 盐值
- IV（初始化向量）
- 检查点白名单

这份文件是游戏加密的唯一凭证。

- 丢失后无法恢复，加密将永久失效
- 泄露后加密将完全失效
- 建议保存到至少两个不同的物理设备
- 绝对禁止随游戏发行包一起发布
- 绝对禁止上传到任何云端存储（除非加密后）

---

## 参数说明

游戏名称：你的游戏名称。示例：MyGame
游戏版本号：当前版本号。示例：1.0.0
截止日期：时间炸弹截止日期，留空则永不过期。示例：2027-01-01

---

## 错误码速查

错误码 10 — ERR_EXPIRED：游戏版本已过期，请联系开发者更新。
错误码 30 — ERR_SIGNATURE：授权文件损坏，请重新安装游戏。
错误码 40 — ERR_NO_RES：游戏文件缺失，请验证游戏完整性或重装。
错误码 -1 — ERR_UNKNOWN：授权失败，请联系开发者。

---

## 如何升级到新版本

当你需要发布游戏更新时，按以下步骤操作：

1. 在 RPG Maker 中修改游戏内容（地图、事件、数据等）
2. 如果地图文件有变化，重新运行 ChronosScan.bat，生成新的 config.h 和 checkpoints_guide.txt
3. 如果需要新增或调整检查点，按 checkpoints_guide.txt 的说明在事件中修改
4. 将新的 config.h 和新的 system.json（明文）上传到你的 Fork 仓库
5. 在 GitHub Actions 中重新运行 Build Chronos Seal，输入新的版本号
6. 下载新的 chronos-seal-output.zip，解压得到新的 decryptor.node 和 system.json.enc
7. 将新的 decryptor.node 和 system.json.enc 替换游戏发行包中的旧文件
8. 重新打包发布

重要说明：
- 每次更新版本号都会生成全新的密钥，旧版本的 decryptor.node 无法解密新版本的 system.json.enc
- 旧版本游戏仍然可以运行，但不会收到更新内容
- 建议每次更新时同步更新游戏内的版本号显示，方便玩家识别

---

## 如何卸载 / 脱壳（完全移除 Chronos Seal）

Chronos Seal V2.0 的设计原则是完全可逆的，但**剥离加密不能只从发行包下手**——因为检查点已经写死在游戏事件里了。如果你只是删掉发行包里的 `decryptor.node` 和 `system.json.enc`，游戏启动时会因为找不到 `AuthManager` 对象而报错。正确的卸载方式是：**回到工程文件，删掉检查点，然后重新打包一个纯净版发行包**。

**步骤：**

1. 打开 RPG Maker 编辑器，进入插件管理器
2. 禁用或删除 `auth_manager.js` 插件
3. 删除所有事件中插入的 `AuthManager.checkpointVerify()` 调用
4. 删除工程根目录下的 `ChronosScan.bat`、`config.h`、`checkpoints_guide.txt`（如果有）
5. 如果有备份文件（`_chronos_backup/` 中的 `system.json` 和 `index.html`），将其覆盖回工程目录的对应位置
6. 保存工程
7. **重新打包发行包**：在 RPG Maker 编辑器中重新执行 文件 → 部署，生成一个不含 Chronos Seal 残留的纯净发行包

**为什么不建议直接从发行包剥离？**

因为检查点代码已经写在了游戏事件中，即使删掉了 `.node` 和 `.enc`，游戏运行到地图转场、Boss 战这些节点时，仍然会尝试调用 `AuthManager.checkpointVerify()`，导致游戏直接报错卡死。

所以，如果你想彻底移除保护，唯一正确的方式就是回到工程文件，清理干净后再重新打包。这也是为什么 V2.0 强调“只加密发行包，不修改工程文件”——因为你始终可以回到工程文件，恢复一个干净的版本。

---

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

## 致谢

- node-addon-api
- OpenSSL
- @JiuGeGe520 —— 帮忙发现初期漏洞，推动 V1.1 的 ADS 双存储方案落地
- Project 1 的 fux2 —— 指出 V1.x 版本的核心误区，促使 V2.0 彻底重构

---

## 联系方式

作者：CLARE-XHL
项目地址：https://github.com/CLARE-XHL/Chronos-Seal


⭐ 如果这个项目对你有帮助，请给一个 Star，让更多独立开发者看到！
