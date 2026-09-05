# 如何反馈

如果在使用 Chronos Seal 的过程中遇到问题，或者有改进建议，欢迎通过以下方式反馈。


## GitHub Issues（最推荐）

GitHub Issues 是跟踪问题和讨论最直接的渠道，建议优先使用。

**地址**：[https://github.com/CLARE-XHL/Chronos-Seal/issues](https://github.com/CLARE-XHL/Chronos-Seal/issues)

**提交前建议先做这几件事：**

1. 搜索已有的 Issue，看看是否有人遇到过相同的问题
2. 查看本文档的[常见问题](/guide/faq)，也许已经有解答
3. 确认你使用的 Chronos Seal 版本号

**提交 Issue 时请尽量包含以下信息：**

- Chronos Seal 版本号（如 V2.1、V2.0）
- RPG Maker 版本（MV 还是 MZ）
- 完整的错误信息（截图或文本）
- 重现问题的步骤
- 你的运行环境（Windows 版本、Node.js 版本等）

> ⚠️ 请不要在 Issue 中透露你的 `author_secret.txt` 内容或任何密钥信息。

### 安全漏洞报告（重要）

如果你发现的是**安全漏洞**，**请不要在 GitHub Issues 中公开提交**。

公开披露未修复的安全漏洞，可能会让攻击者利用已知漏洞影响未升级的用户。安全问题的报告应通过加密渠道私密提交。

**安全报告专用渠道**：请访问主仓库的 Security 标签页，查看完整的漏洞报告流程与 GPG 公钥信息。

> 安全报告入口：[CLARE-XHL/Chronos-Seal → Security](https://github.com/CLARE-XHL/Chronos-Seal?tab=security-ov-file)


## 邮箱

如果不方便使用 GitHub，也可以通过邮箱联系。

**邮箱地址**：[contact@crclare.top](mailto:contact@crclare.top)

### GPG 公钥验证

为保证通信安全，敏感内容（尤其是安全漏洞报告）建议使用 GPG 加密后发送。

- **公钥指纹**：`7360A9A8B36BCA6D73B26D38DC22E64108B24CD3`
- **导入公钥**：
  ```bash
  gpg --keyserver keys.openpgp.org --recv-keys 7360A9A8B36BCA6D73B26D38DC22E64108B24CD3

- 在线查看：访问 [keys.openpgp.org](keys.openpgp.org) 搜索 contact@crclare.top

我发出的安全相关邮件都会使用该 GPG 私钥签名，你可以通过验证签名确认邮件来源的真实性，防止邮件被伪造或篡改。


> 邮件会通过 Cloudflare 转发，所以回复时实际显示的可能是我的个人邮箱地址，但我会正常收到并回复，你可以通过验证签名来确认的确是由我本人发出。


## Project 1 论坛

你也可以在我发布的 Project 1 帖子下留言回复。

**个人空间**：[https://rpg.blue/?2766721](https://rpg.blue/?2766721)

**帖子地址**：[综合技术讨论区](https://rpg.blue/forum.php?mod=viewthread&tid=499244)


## 欢迎贡献代码

如果你修复了 Bug，或者想为 Chronos Seal 添加新功能，欢迎提交 Pull Request。

**流程很简单：**

1. Fork 主仓库
2. 在 `main` 分支上创建新分支进行修改
3. 提交 Pull Request 并描述改动内容
4. 我会尽快 review

代码风格与现有代码保持一致即可，不需要担心严格的代码规范审查。


## 致谢

每一位提交 Issue、PR 或提供反馈的人，都是在帮助 Chronos Seal 变得更好。

如果你的反馈被采纳，我会在[贡献者名单](/guide/contributors)中列出你的名字（除非你希望匿名）。
