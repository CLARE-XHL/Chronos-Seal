# Chronos Seal

**时序为封印 · 行为作密钥 · 岁月守护原创**

---

[![Platform](https://img.shields.io/badge/platform-NW.js%20%7C%20RPG%20Maker%20MV%2FMZ-blue)](https://nwjs.io/)
[![C++](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1-red.svg)](CHANGELOG.md)
[![Docs](https://img.shields.io/badge/docs-docs.nookinc.org-blue)](https://docs.nookinc.org)

---

**适用场景**：定价 ¥12~¥60 的独立游戏，保护首发销售窗口期。

**核心哲学**：不追求绝对不可破解，而是让破解成本 > 游戏售价，从经济学层面阻止盗版传播。

**序言**：该项目完全开源免费（MIT License），欢迎各路 RM 作者直接拿去用，也欢迎各路破解者前来尝试并提交 Issue —— 你破得越深，我补得越快，这套系统就会越强，这也算是我给 RM 圈的一份 Liberty。


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


## 设计哲理

Chronos Seal 不追求绝对不可破解——那在客户端环境中不存在。它追求的是：让破解的成本（时间、技术门槛、维护负担）远超游戏本身的价值，从而在经济学层面阻止盗版传播。

- **经济学博弈**：本地不存在绝对不可破解的加密。本方案旨在将破解成本提升至远超游戏售价，保护独立游戏首发的“黄金两周”。
- **版本迭代即“时间炸弹”**：利用版本差压缩盗版传播窗口
- **零信任、零知识**：工具作者不接触、不存储任何用户密钥
- **完全可逆**：只加密发行包，工程文件零修改


## 特性

- **原生层信任根**：核心解密逻辑在 C++ 编译二进制（.node）中，JS 层无密钥，F12 控制台捞不到
- **素材完整加密（V2.1）**：加密整个素材文件，不再是 RM 自带的仅加密前 16 字节
- **密钥运行时派生**：密钥由版本号 + 发行日期 + 派生种子 → HMAC-SHA256 动态生成，不在任何文件中存储
- **素材格式带魔数**：文件头包含 CHRNSLSE 魔数，JS 层可快速判断是否加密文件
- **HMAC 完整性校验**：每个加密素材自带 HMAC-SHA256 签名，防止篡改
- **看门狗守护线程**：独立系统级线程监控 JS 主线程，状态上报模式，不直接杀死进程
- **时间炸弹 + 时钟回拨检测**：硬编码截止时间 + 单调时钟辅助检测，只告警不误杀
- **云端编译**：无需本地编译环境，[GitHub Actions](https://github.com/CLARE-XHL/Chronos-Builder-Template) 一键生成专属 .node
- **不依赖任何外部平台**：Steam 游戏能用，免费游戏也能用


## 快速链接

| 链接 | 说明 |
|:---|:---|
| [📖 完整文档](https://docs.nookinc.org) | VitePress 文档站（推荐先看） |
| [📦 主仓库](https://github.com/CLARE-XHL/Chronos-Seal) | 源码 & Releases |
| [☁️ 模板仓库](https://github.com/CLARE-XHL/Chronos-Builder-Template) | 云端编译入口 |
| [📋 Releases](https://github.com/CLARE-XHL/Chronos-Seal/releases) | 下载最新发行包 |


## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。


## 致谢

- [node-addon-api](https://github.com/nodejs/node-addon-api)
- [OpenSSL](https://www.openssl.org/)
- @JiuGeGe520 —— 帮忙发现初期漏洞，推动 V1.1 的 ADS 双存储方案落地
- Project 1 的 fux2 —— 指出 V1.x 版本的核心误区，促使 V2.0 彻底重构
- Project 1 的 Singular_Photon —— 指出 RM 原生素材加密的致命漏洞，推动 V2.1 素材解密下沉


## 联系方式

- 作者：CLARE-XHL
- 项目地址：[https://github.com/CLARE-XHL/Chronos-Seal](https://github.com/CLARE-XHL/Chronos-Seal)
- 文档站：[https://docs.nookinc.org](https://docs.nookinc.org)


⭐ 如果这个项目对你有帮助，请给主仓库一个 Star！
