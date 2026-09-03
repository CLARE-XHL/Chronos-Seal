---
layout: home

hero:
  name: "Chronos Seal"
  text: "时序为封印 · 行为作密钥 · 岁月守护原创"
  tagline: 为 RPG Maker MV/MZ 设计的无服务器运行时完整性保护方案
  image:
    src: /logo.png
    alt: Chronos Seal
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/CLARE-XHL/Chronos-Seal

features:
  - title: 原生层信任根
    details: 核心解密逻辑在 C++ 编译二进制中，JS 层无密钥，F12 控制台捞不到
    icon: 🔐
  - title: 素材完整加密
    details: AES-256-CBC 完整文件加密，HMAC 完整性校验，防止篡改
    icon: 🔒
  - title: 云端编译
    details: 无需本地编译环境，GitHub Actions 一键生成专属 .node 文件
    icon: ☁️
  - title: 完全可逆
    details: 加密只针对发行包，工程文件零修改，一键脱壳
    icon: ↩️
  - title: 不依赖外部平台
    details: Steam 游戏能用，免费游戏也能用，没有任何外部平台依赖
    icon: 🎮
  - title: MIT 开源
    details: 代码完全公开，任何人都可以审查、修改、使用
    icon: 📄
---
