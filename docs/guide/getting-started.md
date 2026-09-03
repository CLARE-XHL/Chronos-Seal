# 快速开始

> 📖 **在开始之前，建议你先读完「前言」部分，了解 Chronos Seal 的定位、缺陷与门槛，再决定它是否适合你的项目。**


## 准备工作

在开始部署 Chronos Seal 之前，你需要做好以下准备工作：

- **GitHub 账号**：前往 [github.com](https://github.com) 注册（如果无法访问或访问过慢，请查看 [网络环境](#网络环境)）
- **Node.js**：前往 [nodejs.org](https://nodejs.org) 下载 exe 文件并安装
- **完整已完成开发的 RPG Maker 工程文件**：这我帮不了你……


## 为什么要注册 GitHub 和安装 Node.js？

**GitHub**：你在使用 Actions 时，为了安全，需要将模板仓库 Fork 到自己的账户下并设为私有仓库，防止你的盐值与 IV 被他人盗取。而且 GitHub 上也有很多优秀开源项目，账号注册十分容易，不亏。

**Node.js**：Windows 批处理需要调用 Node.js 的 API 来执行加密操作，而且 RPG Maker 本身由 JS 驱动，后期调用插件也可能用上。

> 总比装一堆 Python、gyp、MSVC、OpenSSL、Notepad++ 方便多了吧！

准备完成后，你就可以前往 [Chronos Seal 的仓库](https://github.com/CLARE-XHL/Chronos-Seal) 下载发行包了。


## ⚠️ 重要提醒

虽然 Chronos Seal 以 MIT 许可证开源，允许所有 RM 作者在自己的 RM 游戏中集成 Chronos Seal 并进行商用，但**严禁直接售卖 Chronos Seal 本体**！

简单来说：**你卖用了 Chronos Seal 的游戏可以，但直接卖 Chronos Seal 绝对不行。**

各位 RM 游戏作者可以放心，这针对的不是你们，而是那些倒卖工具的。Chronos Seal 将会维护各位贡献者和 RM 游戏作者的权益。


## 解压后的文件

下载解压后，你会得到以下四个文件：

- `encrypt_assets.bat` —— 素材加密脚本（双击运行）
- `index.html` —— 启动入口文件（替换发行包中的同名文件）
- `auth_manager.js` —— JS 胶水层插件（放入 `js/plugins/` 目录）
- `encrypt_assets.js` —— 加密脚本（被 bat 调用）

接下来请前往 [使用 JS 插件与布入事件](#使用js插件与布入事件)。
