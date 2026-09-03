# 使用 BAT 加密资源

完成云端编译后，你已经拿到了 `decryptor.node` 和 `encrypt_config.json`。接下来需要用 BAT 脚本加密游戏素材。


## 前置条件

在开始加密之前，请确认以下内容：

- ✅ 已安装 Node.js（[nodejs.org](https://nodejs.org) 下载 LTS 版本）
- ✅ 已完成 RPG Maker 部署（生成了包含 `www/` 目录的发行包）
- ✅ 已从云端编译下载 `encrypt_config.json`
- ✅ 已将 CS 发行包中的 `encrypt_assets.bat` 和 `encrypt_assets.js` 准备好


## 操作步骤

### 第一步：放置文件

将以下文件放入发行包根目录（与 `www/` 同级）：

- `decryptor.node`（从云端编译下载）
- `encrypt_config.json`（从云端编译下载）
- `encrypt_assets.bat`（从 CS 发行包获取）
- `encrypt_assets.js`（从 CS 发行包获取）

### 第二步：双击运行

双击 `encrypt_assets.bat`，脚本会自动执行以下操作：

1. 读取 `encrypt_config.json` 中的配置（版本号、日期、派生种子）
2. 派生与 C++ 层相同的 AES 密钥和 HMAC 密钥
3. 遍历 `www/` 目录下所有图片和音频文件
4. 对每个文件进行 AES-256-CBC 完整加密
5. 生成 `.enc` 文件并删除原文
6. 校验加密结果

### 第三步：清理敏感文件

加密完成后，**务必删除**以下文件：

- `encrypt_config.json`（已用完）
- `encrypt_assets.bat`（已用完）
- `encrypt_assets.js`（已用完）

> ⚠️ 这些文件包含密钥派生参数，**绝对不要随游戏发行包一起发布**。


## 加密格式说明

Chronos Seal V2.1 的加密格式为：

```

[MAGIC(8)] + [IV(16)] + [HMAC(32)] + [AES-256-CBC 密文]

```

- **MAGIC**：`CHRNSLSE`（8 字节魔数，用于识别加密文件）
- **IV**：16 字节随机初始化向量
- **HMAC**：32 字节 SHA-256 签名，用于完整性校验
- **密文**：AES-256-CBC 加密后的完整文件内容

与 RPG Maker 自带的“仅加密前 16 字节”不同，Chronos Seal 对整个文件进行完整加密，无法通过固定文件头反推密钥。


## 支持的素材格式

| 类型 | 格式 | 说明 |
|:---|:---|:---|
| 图片 | `.png` | 完整加密，生成 `.png.enc` |
| 音频 | `.ogg`、`.m4a` | 完整加密，生成 `.ogg.enc`、`.m4a.enc` |

其他格式（如地图数据、JSON 文件）保持明文，不受影响。


## 加密后的文件结构

加密前：

```

www/
├── img/
│   ├── face.png
│   └── battle.png
├── audio/
│   ├── bgm/
│   │   └── title.ogg
│   └── se/
│       └── click.ogg
└── data/
└── system.json   ← 明文

```

加密后：

```

www/
├── img/
│   ├── face.png.enc      ← 加密
│   └── battle.png.enc    ← 加密
├── audio/
│   ├── bgm/
│   │   └── title.ogg.enc ← 加密
│   └── se/
│       └── click.ogg.enc ← 加密
└── data/
└── system.json       ← 明文（保持不变）

```


## 常见问题

**Q: 双击 BAT 后提示“未找到 Node.js”？**

A: 请先安装 Node.js（从 nodejs.org 下载），安装时勾选“添加到 PATH”。

**Q: 提示“未找到 encrypt_config.json”？**

A: 请确认 `encrypt_config.json` 已放入发行包根目录（与 `www/` 同级），且文件名正确。

**Q: 加密过程中某个文件失败了怎么办？**

A: 加密脚本会在加密成功并校验通过后才删除原文，加密失败时原文保留。检查错误信息后可以重新运行 BAT。

**Q: 加密后游戏无法启动？**

A: 请确认：
1. `decryptor.node` 已放入发行包根目录
2. `index.html` 已替换为 CS 版本
3. `auth_manager.js` 已放入 `www/js/plugins/` 目录并在插件管理器中启用

**Q: 游戏运行时报错“文件魔数校验失败”？**

A: 说明加密文件格式不正确。请确认使用的是 Chronos Seal V2.1 版本的加密脚本，且 `encrypt_config.json` 与 `decryptor.node` 来自同一次云端编译。

---

接下来请前往 [构建工作](/guide/build-work)。
```