# 构建工作

完成素材加密后，需要进行最后的整理和收尾工作。


## 第一步：确认文件结构

加密完成后，你的发行包目录应该包含以下文件：

```

发行包根目录/
├── www/
│   ├── data/
│   │   └── system.json          ← 明文（保持不变）
│   ├── img/
│   │   ├── face.png.enc         ← 已加密
│   │   └── battle.png.enc       ← 已加密
│   ├── audio/
│   │   ├── bgm/
│   │   │   └── title.ogg.enc    ← 已加密
│   │   └── se/
│   │       └── click.ogg.enc    ← 已加密
│   ├── js/
│   │   └── plugins/
│   │       └── auth_manager.js  ← 已放置
│   └── index.html               ← 待替换
├── decryptor.node               ← 从云端编译下载
└── Game.exe                     ← 原有文件

```


## 第二步：替换 `index.html`

将 Chronos Seal 发行包中的 `index.html` 替换 `www/` 目录中的同名文件。

> ⚠️ `index.html` 包含了素材加载劫持逻辑，**必须替换**，否则加密素材无法被正确解密。


## 第三步：删除敏感文件

加密完成后，确认以下文件已删除（**不要放进游戏包！**）：

- `encrypt_config.json`
- `encrypt_assets.bat`
- `encrypt_assets.js`

> ⚠️ 这些文件包含密钥派生参数，泄露后可能导致加密失效。


## 第四步：备份 `author_secret.txt`

在删除 Fork 仓库之前，请确认你已经**离线保存**了 `author_secret.txt`：

- 存入至少两个不同的物理设备（如本地硬盘 + U盘）
- 不要上传到任何云端存储（除非加密后）
- 绝对不要放进游戏发行包


## 第五步：打包发布

将整个发行包目录打包，上传到 Steam 或 itch.io 等平台。

**最终发行包内容：**

```

发行包目录/
├── www/
│   ├── data/
│   │   └── system.json          ← 明文
│   ├── img/
│   │   └── *.png.enc            ← 加密
│   ├── audio/
│   │   └── *.ogg.enc            ← 加密
│   ├── js/
│   │   └── plugins/
│   │       └── auth_manager.js  ← CS 插件
│   └── index.html               ← CS 版本
├── decryptor.node               ← CS 核心
└── Game.exe

```


## 验证清单

在打包发布前，建议逐项确认：

- [ ] `decryptor.node` 已放入发行包根目录
- [ ] `index.html` 已替换为 CS 版本
- [ ] `auth_manager.js` 已在 `www/js/plugins/` 目录中
- [ ] `encrypt_config.json` 已删除
- [ ] `encrypt_assets.bat` / `.js` 已删除
- [ ] `author_secret.txt` 已安全保存
- [ ] Fork 仓库已删除
- [ ] 游戏可以正常启动（快速测试）