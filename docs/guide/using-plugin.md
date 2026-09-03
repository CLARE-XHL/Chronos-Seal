# 使用 JS 插件与布入事件


## 放置插件文件

将解压后得到的 `auth_manager.js` 放入你的游戏工程目录下的 `js/plugins/` 文件夹中。

> 如果 `js/plugins/` 文件夹不存在，请手动创建。


## 在 RPG Maker 中启用插件

1. 打开 RPG Maker 编辑器，加载你的游戏工程
2. 点击菜单栏的 **工具 → 插件管理**
3. 在插件列表中找到 `auth_manager.js`
4. **双击**该插件，或勾选左侧的复选框将其启用
5. 点击 **确定** 保存设置

> ⚠️ 如果未在插件列表中看到 `auth_manager.js`，请确认文件已正确放入 `js/plugins/` 目录，并尝试重启 RPG Maker 编辑器。


## 布入启动验证事件

在游戏启动时，需要先调用 Chronos Seal 的初始化方法，确认环境正常后再进入游戏。

### 创建公共事件

1. 在 RPG Maker 编辑器中，打开 **公共事件** 面板
2. 新建一个公共事件，命名为 `Auth_Init`
3. 将触发条件设置为 **自动执行**
4. 在事件列表中插入 **脚本** 指令，输入以下代码：

```javascript
// 初始化 Chronos Seal
var init = AuthManager.initialize();

// 检查初始化是否成功
if (!init.success) {
    alert('游戏授权验证失败，请重新安装或联系开发者。');
    SceneManager.exit();
    return;
}

// 检测系统时钟异常（仅告警，不阻止启动）
if (init.timeTamperDetected) {
    console.warn('[Chronos Seal] 检测到系统时钟异常，请确保系统时间准确。');
}
```

5. 将该公共事件设置为在游戏启动时最先执行（在事件列表中调整顺序，确保它在标题画面之前运行）。

启动看门狗

看门狗用于监控游戏主线程是否被挂起或调试，需要在游戏启动后立即启动。

在上述公共事件中，在 initialize() 之后插入以下脚本：

```javascript
// 启动看门狗
AuthManager.startWatchdog();
```

完整的 Auth_Init 公共事件脚本如下：

```javascript
// 初始化 Chronos Seal
var init = AuthManager.initialize();

if (!init.success) {
    alert('游戏授权验证失败，请重新安装或联系开发者。');
    SceneManager.exit();
    return;
}

if (init.timeTamperDetected) {
    console.warn('[Chronos Seal] 检测到系统时钟异常，请确保系统时间准确。');
}

// 启动看门狗
AuthManager.startWatchdog();
```

配置定时心跳

看门狗启动后，需要游戏主线程定期发送“心跳”信号，证明主线程仍在正常运行。如果超过设定时间未收到心跳，看门狗会触发告警。

创建并行事件

1. 在 RPG Maker 编辑器中，新建一个公共事件，命名为 Auth_Heartbeat
2. 将触发条件设置为 并行处理
3. 在事件列表中插入 脚本 指令，输入以下代码：

```javascript
// 发送心跳
AuthManager.heartbeatReply();

// 检查看门狗状态
var state = AuthManager.getWatchdogState();

// 如果看门狗触发告警，说明主线程可能被挂起或调试器附加
if (state.triggered) {
    alert('游戏环境异常，请重新启动游戏。');
    SceneManager.exit();
}
```

4. 在该事件的右下角“执行条件”区域，将 间隔 设置为 3 帧 或 5 帧（约每 0.05~0.08 秒执行一次，对应 C++ 层 10 秒超时阈值，可确保在 10 秒内至少能发送多次心跳），并将 并行处理 勾选保持启用。

⚠️ 建议将该公共事件设置为在进入地图后自动运行（例如在游戏开始时的第一个地图中触发），确保看门狗在游戏运行期间持续监控。如果游戏全程不需要心跳检测（比如某些纯标题菜单场景），也可以在该场景结束后再启动。

验证插件是否正常工作

完成上述步骤后，运行游戏进行测试：

1. 正常启动：游戏应正常启动，无报错弹窗
2. 检查控制台：按 F12 打开开发者工具，在 Console 中应看到类似 [Chronos Seal] AuthManager V2.1 加载完成. 的日志输出
3. 看门狗测试：如果在游戏运行时，你长时间（超过 10-20 秒）暂停游戏主线程（例如通过调试器断点），看门狗应触发告警并退出游戏

常见问题

Q: 插件管理器中没有显示 auth_manager.js？

A: 请确认：

1. 文件是否放在 js/plugins/ 目录（不是 js/ 根目录）
2. 文件扩展名是否为 .js
3. 尝试重启 RPG Maker 编辑器

Q: 游戏启动时报错 AuthManager is not defined？

A: 说明插件未被正确加载。请检查：

1. auth_manager.js 是否已在插件管理器中启用
2. decryptor.node 是否已放置在游戏发行包根目录（加密阶段完成后的部署步骤）

Q: 看门狗在正常游戏过程中触发告警？

A: 可能是心跳间隔设置过长，或者游戏主线程在执行耗时操作时卡住。建议将心跳公共事件的间隔调整为 3 帧（约 0.05 秒），确保在 10 秒超时阈值前能及时发送心跳。

Q: 启动时提示 AuthManager.initialize() 失败？

A: 可能原因：

1. decryptor.node 文件缺失或版本不匹配
2. 时间炸弹截止日期已过（检查云端编译时填写的截止日期）
3. 游戏版本号与加密时不一致

---

接下来请前往 [Fork 仓库与 Action 工作流](/guide/fork-and-action)。