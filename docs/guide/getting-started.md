# 快速开始

V2.0 的使用流程非常简单，全程不需要安装任何编译工具。

## 你需要准备

- 一个 GitHub 账号
- 你的 RPG Maker 游戏工程

## 第一步：下载 Chronos Seal V2.0 发行包

从 [Releases](https://github.com/CLARE-XHL/Chronos-Seal/releases) 页面下载最新版，解压后得到：

- `ChronosScan.bat`（本地扫描器）
- `auth_manager.js`（JS 插件）
- `index.html`（启动劫持模板）

## 第二步：运行扫描器，植入检查点，启用插件

1. 将 `ChronosScan.bat` 放入你的游戏工程根目录
2. 双击运行，脚本会自动扫描所有地图，生成：
   - `checkpoints_guide.txt` —— 检查点植入说明书（给人看）
   - `config.h` —— 检查点白名单（给机器编译用）
3. 打开 `checkpoints_guide.txt`，在对应地图的转场事件中插入检查点代码
4. 将 `auth_manager.js` 放入 `js/plugins/` 目录
5. 在 RPG Maker 插件管理器中启用 `auth_manager.js`

## 第三步：打包游戏，生成发行包，备份原文件

1. 在 RPG Maker 编辑器中点击 文件 → 部署
2. 选择目标平台（Windows），生成发行包
3. 打包完成后，你会得到一个包含 `www/` 目录的发行包文件夹

> ⚠️ 在继续下一步之前，先备份发行包中的两个原始文件：
> - `www/index.html`（原始入口文件）
> - `data/system.json`（明文配置文件）
> 
> 在工程根目录下新建 `_chronos_backup/` 文件夹，将这两个文件复制进去。这样调试或回退时可以直接恢复。

## 第四步：云端编译

1. Fork [Chronos-Builder-Template](https://github.com/CLARE-XHL/Chronos-Builder-Template) 到你的 GitHub 账户（必须设为私有）
2. 将 `config.h` 和游戏工程中的 `data/system.json`（明文）上传到仓库根目录
3. 在仓库页面点击 Actions → Build Chronos Seal → Run workflow
4. 填写参数：
   - 游戏名称（如 `MyGame`）
   - 游戏版本号（如 `1.0.0`）
   - 截止日期（留空则永不过期）
5. 等待 2-3 分钟，下载 `chronos-seal-output.zip`
6. 解压得到：`decryptor.node`、`system.json.enc`、`author_secret.txt`
7. 将 `author_secret.txt` 离线保存，绝对不要放进游戏包！
8. 删除你的 Fork 仓库（日志销毁，密钥不泄露）

## 第五步：部署加密文件到发行包

1. 将 `decryptor.node` 放入游戏发行包根目录
2. 将 `system.json.enc` 放入发行包 `data/` 目录，替换原有的 `system.json`
3. 将 Chronos Seal 提供的 `index.html` 替换发行包 `www/` 目录中的同名文件
4. 打包发布

> ⚠️ 替换前确认你已经备份了原始文件（在 `_chronos_backup/` 中）。如果还没有备份，请先回到第三步完成备份。
