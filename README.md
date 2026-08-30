# Chronos Seal

**时序为封印 · 行为作密钥 · 岁月守护原创**

---

[![Platform](https://img.shields.io/badge/platform-NW.js%20%7C%20RPG%20Maker%20MV%2FMZ-blue)](https://nwjs.io/)
[![C++](https://img.shields.io/badge/C%2B%2B-11-blue.svg)](https://isocpp.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.2-red.svg)](CHANGELOG.md)

> **V1.2 核心改进：彻底消除 system.json 明文裸奔漏洞，发行包内只有加密文件，玩家首次启动时自动解密。**

**Chronos Seal** 是一套专为 RPG Maker MV / MZ（NW.js 环境）设计的**无服务器运行时完整性保护方案**。通过 C++ Native 层实现身份锚定、时间炸弹、行为检查点与看门狗守护，将批量盗版与简易破解的成本提升至远超游戏本身价值。

**适用场景**：定价 ¥12~¥60 的独立游戏，保护首发销售窗口期。

**核心哲学**：不追求绝对不可破解，而是让破解成本 > 游戏售价，从经济学层面阻止盗版传播。

---

## ✨ 特性

🔐 **原生层信任根**：核心解密逻辑在 C++ 编译二进制（.node）中，JS 层无密钥，F12 控制台捞不到

🆔 **Steam 身份锚定**：通过 Steam SDK 读取用户 UID，HMAC-SHA256 签名绑定，多采样抗 Hook

💣 **时间自毁机制**：硬编码截止时间戳 + 注册表与 NTFS ADS 双存储防回拨，旧版自动失效

🧩 **行为检查点矩阵**：7-12 个 HMAC 单向哈希链检查点，与游戏剧情耦合，失败时触发优雅降级

🐕 **看门狗守护线程**：独立系统级线程，10 秒超时，连续 2 次无心跳强制退出，封堵 CE 挂起调试

🔒 **发行包预加密（V1.2）**：打包前加密 system.json，发行包内无明文，彻底堵死解包即玩

🔑 **一机一密（V1.2）**：每位玩家首次启动后，system.json 用其专属密钥重新加密，破解无法泛化

🛡️ **双存储防篡改（V1.1）**：注册表 + NTFS ADS 双存储交叉校验，防时间回拨与关键数据清除


## 📁 文件结构

下载 Chronos Seal 后，你需要在游戏工程中放置以下文件：

```

你的游戏工程根目录/
├── data/                              ← RPG Maker 数据目录（已有）
│   ├── Map001.json                    ← 你的地图文件
│   ├── Map002.json                    ← 你的地图文件
│   └── system.json                    ← 明文（开发时保留，发行前加密）
│
├── js/                                ← RPG Maker 脚本目录（已有）
│   ├── plugins/                       ← RPG Maker 插件目录（已有）
│   │   └── auth_manager.js           ← 【需要放】Chronos Seal JS 胶水层
│   └── plugins.js                     ← 你的插件列表（已有）
│
├── native/                            ← 【需要创建】Chronos Seal C++ 源码目录
│   ├── src/
│   │   ├── decryptor.cc              ← C++ 核心源码
│   │   └── config.h                  ← 由 build.bat 自动生成
│   ├── build/Release/
│   │   └── decryptor.node            ← 编译产物
│   └── binding.gyp                   ← 编译配置文件
│
├── index.html                         ← 【部署后修改】游戏入口文件
├── game.rpgproject                    ← RPG Maker 工程文件
├── build.bat                         ← 【需要放】打包前运行
├── encrypt.bat                       ← 【需要放】部署后运行
└── encrypt_config.json               ← 由 build.bat 自动生成（加密后自动删除）

```

---

## 🚀 快速开始（小白版）

> **⚠️ 注意：以下步骤按顺序执行，不要跳步。**

### 准备工作

**你需要准备：**
1. **Steamworks SDK**（从 Valve 官网下载，需要 Steam 合作伙伴账号）
2. **Node.js**（从 nodejs.org 下载安装，用于编译 C++ 插件）
3. **OpenSSL 开发库**（编译时需要）

**时间预估：** 首次配置约 30-60 分钟，之后每次打包约 5 分钟。


### 第一步：放置文件

#### 1.1 创建 `native/` 目录

在你的游戏工程根目录下，新建一个 `native` 文件夹。

#### 1.2 放置 C++ 源文件

把以下文件放到 `native/src/` 目录下：
- `decryptor.cc`（Chronos Seal 核心源码）
- `binding.gyp`（编译配置文件）

> ⚠️ **注意：** 如果 `native/src/` 目录不存在，请手动创建。

#### 1.3 放置 JS 插件

把 `auth_manager.js` 放到 `js/plugins/` 目录下。

> ⚠️ **注意：**
> - `auth_manager.js` **必须**放在 `js/plugins/` 下，不能放在 `js/` 根目录或其他子文件夹中。
> - 如果 `js/plugins/` 文件夹不存在，请手动创建。

#### 1.4 在插件管理器中启用

1. 打开 RPG Maker 编辑器
2. 点击菜单栏的 **工具 → 插件管理**
3. 在插件列表中找到 `auth_manager.js`
4. **双击**它，或者勾选左侧的复选框，启用该插件
5. 点击 **确定** 保存

> ⚠️ **如果不启用插件，游戏运行时 `AuthManager` 会报“未定义”错误。**

#### 1.5 放置构建脚本

把以下文件放在游戏工程根目录：
- `build.bat`
- `encrypt.bat`


### 第二步：修改编译配置（必须）

打开 `native/binding.gyp`，找到这一行：

```json
"C:/path/to/steamworks/sdk/public"
```

把它改成你电脑上 Steamworks SDK 的实际路径：

```json
"D:/dev/steamworks_sdk/public"
```

⚠️ 如果路径不对，编译时会报错：fatal error: steam/steam_api.h: No such file or directory

如果编译时提示找不到 steam_api 库，取消 libraries 中对应行的注释：

```json
"libraries": [
    "-lssl",
    "-lcrypto",
    "-L D:/dev/steamworks_sdk/redistributable_bin/win64",
    "-lsteam_api64"
]
```

根据你的电脑系统选择：

· 64 位系统 → 用 win64 + -lsteam_api64
· 32 位系统 → 用 win32 + -lsteam_api

第三步：运行 build.bat（打包前）

3.1 双击 build.bat

在弹出的命令行窗口中，依次输入：

```
请输入游戏版本号（如 1.0.0）: 1.0.0
请输入发行日期（YYYY-MM-DD）: 2026-08-30
请输入游戏名称（用于注册表路径，如 MyGame）: MyGame
```

3.2 等待自动完成

脚本会自动完成以下工作：

1. 扫描 data/ 目录下的所有地图文件
2. 自动生成检查点列表
3. 生成 native/src/config.h
4. 编译 decryptor.node

3.3 查看 build_info.txt

编译完成后，根目录会生成一个 build_info.txt 文件。打开它，你会看到类似这样的内容：

```
============================================================
  Chronos Seal V1.2 - 检查点植入指南
============================================================

  [检查点植入位置]
  请在下述地图的转场事件中插入检查点调用：

  地图 Map005.json → AuthManager.checkpointVerify('map_transition_005')
  地图 Map010.json → AuthManager.checkpointVerify('map_transition_010')
  地图 Map015.json → AuthManager.checkpointVerify('map_transition_015')
  ...
```

这就是你需要植入检查点的位置清单。

第四步：植入检查点（手动操作）

根据 build_info.txt 的提示，在对应地图的转场事件中插入检查点调用。

4.1 打开 RPG Maker 编辑器

打开你的游戏工程。

4.2 找到对应地图

比如 build_info.txt 提示你需要在地图 Map005.json 中植入检查点。

4.3 在转场事件中插入脚本

在地图切换的事件中，插入一个脚本指令，内容为：

```javascript
if (!AuthManager.checkpointVerify('map_transition_005')) {
    // 验证失败 → 优雅降级
    $gamePlayer.reserveTransfer(999, 0, 0, 0);  // 传送至虚空
    $gameParty._gold = 0;                       // 清空金钱
    $gameSwitches.setValue(1, false);           // 破坏关键开关
}
```

4.4 重复操作

对 build_info.txt 中列出的每个地图，重复以上操作。

💡 提示： 检查点不需要植入太多，7-12 个就足够。植入太多反而会增加你的工作量。

第五步：在公共事件中配置启动验证

5.1 创建一个公共事件

在 RPG Maker 编辑器中，新建一个公共事件，命名为 Auth_Init。

5.2 插入启动验证脚本

在事件中插入一个脚本指令，内容为：

```javascript
var result = AuthManager.verifyAndDecrypt();

if (result.success) {
    // 验证通过，继续游戏
    $gameSystem._authPassed = true;
    $gameVariables.setValue(1, result.systemJson);
} else {
    var code = result.errorCode;
    var msg = '';
    if (code === 10) msg = '游戏版本已过期，请到Steam更新。';
    else if (code === 20) msg = 'Steam账号不匹配，请使用购买游戏的账号登录。';
    else if (code === 30) msg = '授权文件损坏，请重新安装游戏。';
    else if (code === 31) msg = '系统时间异常，请同步时间后重试。';
    else if (code === 40) msg = '游戏文件缺失，请验证游戏完整性或重装。';
    else if (code === 50) msg = '请先启动Steam客户端。';
    else msg = '授权失败，错误码: ' + code;

    alert(msg);
    SceneManager.exit();
}
```

5.3 设置自动执行

将这个公共事件设置为在游戏启动时自动执行（在 RPG Maker 的事件列表中，将其放在标题画面之前）。

5.4 配置定时心跳

在游戏的一个并行处理公共事件中，每隔 3-5 秒调用：

```javascript
AuthManager.heartbeatReply();
```

这个心跳用于维持看门狗，防止游戏被调试器挂起分析。

第六步：运行 RPG Maker 编辑器部署

在 RPG Maker 编辑器中，点击文件 → 部署，选择目标平台（Windows），输入素材加密密钥（随便填，RPG Maker 自己的加密），生成发行版。

部署完成后，你会得到一个包含 www/ 目录的发行包文件夹。

第七步：修改发行包中的 index.html（必须）

⚠️ 重要：index.html 的修改必须在 RPG Maker 编辑器部署完成后，在发行包目录中进行！不要在工程文件里修改！

7.1 找到发行包中的 index.html

在部署生成的发行包目录中（在 www/ 文件夹中），找到 index.html。

⚠️ 不要修改工程根目录的 index.html，那个会在部署时被覆盖。

7.2 删除原有 index.html

删除发行包目录中自带的 index.html 文件。

7.3 使用 Chronos Seal 提供的 index.html 替换

将 Chronos Seal 提供的 index.html 文件复制到发行包目录（与 www/ 同级），覆盖原有的文件。

7.4 用文本编辑器打开

用 Notepad++、VS Code 或任意文本编辑器打开 index.html。

7.5 修改 <title> 标签

找到这一行：

```html
<title>改这里！</title>
```

改成你的游戏名称：

```html
<title>你的游戏名称</title>
```

7.6 保存文件

保存后关闭编辑器。

第八步：复制文件到发行包目录

将以下两个文件复制到发行包根目录（与 www/ 同级）：

1. decryptor.node（从 native/build/Release/ 复制）
2. encrypt_config.json（从工程根目录复制）

第九步：运行 encrypt.bat（部署后）

在发行包目录中，双击 encrypt.bat。

脚本会自动：

1. 读取 encrypt_config.json 中的配置
2. 加密 www/data/system.json → system.json.enc
3. 校验加密文件是否成功生成
4. 自动删除明文 system.json
5. 自动删除 encrypt_config.json（用完即焚）

⚠️ 重要： 加密完成后，发行包中只有 system.json.enc，没有明文 system.json。

9.1 删除 encrypt.bat

加密完成后，手动删除发行包目录中的 encrypt.bat 文件，该文件仅在加密阶段使用，无需随游戏分发。

第十步：打包 Steam

将整个发行包目录打包，上传到 Steam。

最终发行包内容：

```
发行包目录/
├── www/
│   ├── data/
│   │   ├── system.json.enc      ← 加密文件（Chronos Seal 保护）
│   │   └── Map*.json            ← 地图文件（明文，不影响）
│   ├── js/
│   │   ├── plugins/
│   │   │   └── auth_manager.js  ← Chronos Seal 插件（已启用）
│   │   └── plugins.js           ← 插件列表（已包含 auth_manager）
│   └── index.html               ← 已修改标题
├── decryptor.node               ← Chronos Seal C++ 核心
└── Game.exe
```

🔧 参数说明

build.bat 输入参数

· 游戏版本号：游戏当前版本，用于派生发行密钥。示例：1.0.0
· 发行日期：游戏发行日期，用于派生发行密钥。示例：2026-08-30
· 游戏名称：用于生成注册表路径。示例：MyGame

注册表路径规则：SOFTWARE\游戏名称\ChronosSeal

binding.gyp 修改项

· Steamworks SDK 路径：你电脑上 Steamworks SDK 的 public 目录路径。示例：D:/dev/steamworks_sdk/public
· 库路径（可选）：Steam API 库文件路径，编译报错时再改。示例：-L D:/dev/steamworks_sdk/redistributable_bin/win64

index.html 修改项（部署后修改）

· <title> 标签：改为你的游戏名称。修改时机：部署完成后，在发行包目录中修改。

config.h 参数（由 build.bat 自动生成，一般不需要手动修改）

· HARD_EXPIRE：时间炸弹截止时间戳，默认值 1767225600（2027-01-01）

如需修改截止日期，在 native/src/config.h 中修改 HARD_EXPIRE 的值。

⚠️ 注意： build.bat 每次运行都会重新生成 config.h，如果你手动修改了 HARD_EXPIRE，下次运行 build.bat 会被覆盖。如需永久修改，请在运行 build.bat 后手动改回，或修改 build.bat 中的默认值。

📊 错误码速查

错误码 10 — ERR_EXPIRED
游戏版本已过期，请到 Steam 更新。

错误码 20 — ERR_ID_MISMATCH
Steam 账号不匹配，请使用购买游戏的账号登录。

错误码 30 — ERR_SIGNATURE
授权文件损坏，请重新安装游戏。

错误码 31 — ERR_TIME_TAMPER
系统时间异常，请同步时间后重试。

错误码 40 — ERR_NO_RES
游戏文件缺失，请验证游戏完整性或重装。

错误码 50 — ERR_NO_STEAM
请先启动 Steam 客户端。

错误码 -1 — ERR_UNKNOWN
授权失败，请联系开发者（错误码: -1）。

📋 开发者部署检查清单

阶段一：环境配置

☐ 已安装 Node.js
☐ 已安装 OpenSSL 开发库
☐ 已下载 Steamworks SDK
☐ binding.gyp 中的 Steamworks SDK 路径已修改

阶段二：文件放置

☐ auth_manager.js 已放入 js/plugins/ 目录
☐ 已在 RPG Maker 插件管理器中启用 auth_manager.js
☐ decryptor.cc 已放入 native/src/
☐ binding.gyp 已放入 native/
☐ build.bat 已放入工程根目录
☐ encrypt.bat 已放入工程根目录

阶段三：配置与编译

☐ 运行 build.bat 输入了正确的版本号、日期、游戏名
☐ decryptor.node 编译成功
☐ build_info.txt 已生成

阶段四：代码植入

☐ 已根据 build_info.txt 在对应地图的转场事件中植入检查点
☐ 已在公共事件中配置启动验证
☐ 已配置定时心跳（每 3-5 秒）

阶段五：部署与加密

☐ 已运行 RPG Maker 编辑器部署
☐ 已在发行包目录中修改 index.html 的 <title> 标签
☐ decryptor.node 已复制到发行包目录
☐ encrypt_config.json 已复制到发行包目录
☐ 已运行 encrypt.bat
☐ system.json.enc 已成功生成
☐ 明文 system.json 已自动删除
☐ encrypt_config.json 已自动删除（用完即焚）
☐ encrypt.bat 已从发行包目录删除

阶段六：打包

☐ 发行包中只有 system.json.enc，没有明文 system.json
☐ 已准备好打包 Steam 版本

📋 更新日志

V1.2（2026-08-30）—— 预加密 + 一机一密 + 自动化构建

· 新增：build.bat 打包前自动化构建工具
· 新增：encrypt.bat 部署后 system.json 加密工具
· 新增：index.html 启动劫持，引擎读取文件前完成解密
· 新增：预加密机制，发行包内无明文 system.json
· 新增：派生密钥机制，每位玩家专属密钥
· 新增：首次激活流程，发行密钥解密 → 用户密钥重加密
· 新增：encrypt_config.json 配置传递
· 优化：明文 system.json 用完即焚（内存中瞬态存在）
· 优化：StorageManager.loadFromFile 劫持，用完即焚
· 安全：encrypt_config.json 加密完成后自动删除（用完即焚）

V1.1（2026-08-29）—— ADS 双存储防篡改增强

· 新增：NTFS 备用数据流（ADS）作为第三隐性存储
· 增强：verify_time 升级为注册表 + ADS 双源交叉校验
· 修复：GenerateFirstTimeAuth 执行顺序
· 优化：save_current_time_to_registry 内部同时处理注册表与 ADS 写入
· 安全：时间存储从“单点可删”升级为“双存储自修复”

V1.0（2026-08-28）—— 初始稳定版

· 新增：三层防御体系（L1 C++ 信任根 + L2 JS 胶水层 + L3 行为验证层）
· 新增：Steam 身份锚定，HMAC-SHA256 签名绑定 UID，多采样抗 Hook
· 新增：时间自毁机制，硬编码截止时间戳 + 注册表防回拨
· 新增：资源加密锁，AES-256-CBC 加密 system.json，C++ 内存解密
· 新增：行为检查点矩阵，单向 HMAC 哈希链
· 新增：看门狗守护线程，独立系统级线程
· 新增：安全落盘机制，覆写原文件为全 0 并校验
· 安全：新增 .overwrite_failed 覆写失败持久化标记
· 安全：新增看门狗日志编译宏 WATCHDOG_LOGGING

⚠️ 常见问题

Q: 运行 build.bat 时提示“未找到 Node.js”？

A: 请先安装 Node.js（从 nodejs.org 下载），安装时勾选“添加到 PATH”。

Q: 编译 decryptor.node 时提示“fatal error: steam/steam_api.h: No such file or directory”？

A: binding.gyp 中的 Steamworks SDK 路径不正确，请修改为实际路径。

Q: 编译时提示“cannot find -lsteam_api”？

A: 需要在 binding.gyp 的 libraries 中添加库路径，取消对应注释并修改为实际路径。

Q: 运行游戏时提示“AuthManager 未定义”？

A: 可能的原因：

1. auth_manager.js 没有放在 js/plugins/ 目录下
2. 没有在 RPG Maker 插件管理器中启用 auth_manager.js
3. decryptor.node 没有被正确加载（检查是否在发行包目录中）

Q: 运行游戏时提示“授权失败，错误码: 50”？

A: Steam 客户端未运行。请先启动 Steam 并登录购买游戏的账号。

Q: 运行游戏时提示“游戏文件缺失，请验证游戏完整性或重装”（错误码 40）？

A: www/data/system.json.enc 不存在。请确保已运行 encrypt.bat。

Q: 修改游戏后需要重新加密吗？

A: 需要。每次修改游戏后，重新运行 RPG Maker 编辑器部署，然后在发行包目录重新运行 encrypt.bat。

Q: encrypt.bat 加密后，明文 system.json 去哪了？

A: 已自动删除。发行包中只保留 system.json.enc。

Q: 如果加密失败，明文 system.json 会不会被删？

A: 不会。encrypt.bat 会先校验 system.json.enc 是否成功生成且大小合理，确认无误后才删除明文。

Q: 检查点需要植入多少个？

A: 建议 7-12 个。build.bat 会根据地图数量自动计算推荐值。

Q: 植入检查点后，测试时自己触发检查点失败了怎么办？

A: 开发测试阶段可以临时注释掉检查点代码，或直接在 build.bat 中减少检查点数量。正式发行前再恢复。

Q: 我修改了工程里的 index.html，但部署后标题又变回“改这里！”了？

A: 因为工程里的 index.html 会在部署时被覆盖。请在部署完成后，修改发行包目录中的 index.html，而不是工程里的。

📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

注意： 本方案仅提供技术框架，使用者需自行确保遵循 Steam 平台及各国法律合规要求。

🙏 致谢

· node-addon-api
· OpenSSL
· Steamworks SDK

📬 联系方式

· 作者：CLARE-XHL
· 项目地址：https://github.com/CLARE-XHL/Chronos-Seal

---

⭐ 如果这个项目对你有帮助，请给一个 Star，让更多独立开发者看到！
