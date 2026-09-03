# 错误码

Chronos Seal 在运行过程中可能会返回以下错误码，用于帮助你快速定位问题原因。

> 💡 **提示**：电脑端用户可以使用 `Ctrl + F`（Mac 用户 `Cmd + F`）快速搜索关键词，快速定位你遇到的问题。

## 错误码列表

| 错误码 | 名称 | 含义 | 建议操作 |
|:---|:---|:---|:---|
| 0 | SUCCESS | 操作成功 | 无需操作 |
| 10 | ERR_EXPIRED | 游戏版本已过期 | 请联系开发者更新游戏 |
| 30 | ERR_SIGNATURE | 签名校验失败 | 请验证游戏文件完整性，重新安装游戏 |
| 40 | ERR_NO_RES | 游戏文件缺失 | 请验证游戏完整性或重装 |
| 60 | ERR_DECRYPT_PADDING | 解密填充错误 | 文件可能损坏或被篡改 |
| 61 | ERR_DECRYPT_HMAC | HMAC 校验失败 | 文件已被篡改或损坏 |
| 62 | ERR_ASSET_TOO_LARGE | 素材文件过大（超过 200MB） | 请压缩素材文件后重新加密 |
| 63 | ERR_INVALID_FORMAT | 无效的加密格式（魔数不匹配） | 请确认文件是 Chronos Seal V2.1 加密的素材 |
| -1 | ERR_UNKNOWN | 未知异常 | 请联系开发者并提供错误日志 |


## 错误码详解

### 0 — SUCCESS
一切正常，无需任何操作。

### 10 — ERR_EXPIRED
游戏版本已超过开发者设定的截止日期。需要联系开发者更新游戏版本。

### 30 — ERR_SIGNATURE
HMAC 签名校验失败，游戏核心文件或加密素材被篡改、损坏。V2.1 不再使用 `auth.key` 文件。

### 40 — ERR_NO_RES
游戏文件缺失，通常是加密素材文件缺失或 `system.json` 文件丢失。请验证游戏完整性或重新安装。

### 60 — ERR_DECRYPT_PADDING
AES 解密时出现填充错误。可能是文件在传输过程中损坏，或被恶意篡改。建议重新获取游戏文件。

### 61 — ERR_DECRYPT_HMAC
HMAC 完整性校验失败。说明加密素材已被篡改或损坏。建议重新获取游戏文件。

### 62 — ERR_ASSET_TOO_LARGE
单个素材文件超过 200MB 限制。请在加密前压缩素材，或将其拆分为多个文件。

### 63 — ERR_INVALID_FORMAT
文件魔数不匹配（不是 `CHRNSLSE` 开头）。可能是：
- 文件不是 Chronos Seal 加密的素材
- 文件损坏
- 使用了旧版本（V2.0 及以下）的加密格式

### -1 — ERR_UNKNOWN
未知错误。建议开发者检查控制台日志，并将错误信息提交到 GitHub Issues。


## 如何查看错误码

### 在游戏中
你可以在公共事件中捕获 `AuthManager.initialize()` 或 `AuthManager.decryptAsset()` 的返回值：

```javascript
var result = AuthManager.initialize();
if (!result.success) {
    console.error('初始化失败，错误码：' + result.errorCode);
}
```

在浏览器控制台

按 F12 打开开发者工具 → Console 面板，查看 [Chronos Seal] 开头的日志输出。

---

如果遇到无法解决的错误，请前往 [如何反馈](/guide/feedback) 提交 Issue。
