# Fork 仓库与 Action 工作流


## 为什么需要这一步？

Chronos Seal 的 C++ 核心代码需要通过 GitHub Actions 在云端编译，生成专属的 `decryptor.node` 文件。这一步不需要你在本地安装任何编译工具（不需要 Node.js、Python、MSVC、OpenSSL），所有编译工作由 GitHub 云端完成。

为了安全，你需要 **Fork 模板仓库到自己的 GitHub 账户** 并 **设为私有仓库**，防止你的盐值和 IV 被他人盗取。


## 第一步：Fork 模板仓库

1. 打开 [Chronos-Builder-Template](https://github.com/CLARE-XHL/Chronos-Builder-Template) 仓库页面
2. 点击右上角的 **Fork** 按钮
3. **重要：** 在 Fork 选项中，**必须将仓库设置为 Private（私有）**
4. 等待 Fork 完成，你会进入你自己账户下的模板仓库


## 第二步：上传 `system.json`

1. 在你的 Fork 仓库中，点击 **Add file** → **Upload files**
2. 将你的游戏工程中的 `data/system.json`（明文）文件拖入上传区域
3. 点击 **Commit changes** 提交

> ⚠️ Chronos Seal V2.1 只需要上传 `system.json`，不再需要 `config.h`。


## 第三步：触发 GitHub Actions

1. 在你的 Fork 仓库中，点击上方的 **Actions** 标签
2. 在左侧列表中找到 **Build Chronos Seal**
3. 点击右侧的 **Run workflow** 按钮（或下拉菜单中的对应项）
4. 在弹出的表单中填写以下参数：

| 参数 | 说明 | 示例 |
|:---|:---|:---|
| 游戏名称 | 你的游戏名称 | `MyGame` |
| 游戏版本号 | 当前版本号（用于派生密钥） | `1.0.0` |
| 截止日期 | 时间炸弹截止日期（留空则永不过期） | `2027-01-01` |

5. 点击 **Run workflow**，等待编译完成（约 2-3 分钟）


## 第四步：下载产物

编译完成后，在 Actions 页面底部会生成一个 **Artifacts** 压缩包：

- 文件名：`chronos-seal-output.zip`
- 点击下载

解压后，你会得到三个文件：

- `decryptor.node` —— C++ 核心插件，放入发行包根目录
- `encrypt_config.json` —— 素材加密配置（版本号、日期、派生种子），用于本地加密阶段
- `author_secret.txt` —— 作者专属密钥，**离线保存，绝对不要放进游戏包！**


## 第五步：删除 Fork 仓库（重要！）

下载文件后，**立即删除你的 Fork 仓库**，确保日志和密钥不泄露：

1. 进入你的 Fork 仓库页面
2. 点击 **Settings** → 滚动到底部 → **Delete this repository**
3. 输入仓库名称确认删除

> ⚠️ 删除仓库会同时删除所有 Actions 日志，确保密钥不会泄露。


## 注意事项

- **必须设为私有仓库**：Actions 日志中可能包含密钥信息。私有仓库的日志只有你自己能看到，公开仓库的日志全世界都能看。
- **每次更新版本号都会生成全新的密钥**：旧版本的 `decryptor.node` 将无法解密新版本加密的素材。
- **`author_secret.txt` 是唯一凭证**：丢失后无法恢复，请妥善保存。

---

接下来请前往 [使用 BAT 加密资源](/guide/encrypt-assets)。