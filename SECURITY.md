# 安全策略

## 报告安全漏洞

Chronos Seal 重视每一个安全漏洞的发现和修复。如果你发现了安全漏洞，请按照以下流程报告：

### 报告渠道

**推荐渠道：GitHub Security Advisories**

1. 访问 [https://github.com/CLARE-XHL/Chronos-Seal/security/advisories/new](https://github.com/CLARE-XHL/Chronos-Seal/security/advisories/new)
2. 点击“Report a vulnerability”
3. 填写漏洞描述、影响版本、复现步骤等信息
4. 提交后，我会在看到后的 72 小时内响应并处理

**备选渠道：邮箱**

如果无法使用 GitHub Security Advisories，也可以通过邮箱联系。

- **邮箱**：[contact@crclare.top](mailto:contact@crclare.top)
- **GPG 公钥指纹**：`7360A9A8B36BCA6D73B26D38DC22E64108B24CD3`
- **公钥获取方式**：
  - 从公钥服务器导入：`gpg --keyserver keys.openpgp.org --recv-keys 7360A9A8B36BCA6D73B26D38DC22E64108B24CD3`
  - 或访问 [keys.openpgp.org](https://keys.openpgp.org) 搜索 `contact@crclare.top`

建议使用 GPG 加密敏感内容后发送，以确保通信安全。

### 报告时应提供的信息

为帮助尽快定位和修复问题，建议包含以下内容：

- 漏洞的简要描述
- 影响的版本范围
- 复现步骤（尽量详细，可附代码或 POC）
- 漏洞可能造成的影响
- 你的联系方式（可选）

### 处理流程

1. **确认**：收到报告后，我会在 72 小时内确认收到
2. **评估**：确认漏洞的有效性和影响范围
3. **修复**：根据漏洞严重程度，制定修复计划
4. **发布**：修复完成后，会发布新版本并在更新日志中注明

### 漏洞披露

- 修复完成后，会在 GitHub Security Advisories 中公开漏洞详情
- 如果你希望匿名，请在报告中说明
- 修复版本发布前，请勿公开披露漏洞细节

### 漏洞赏金

Chronos Seal 是一个开源项目，目前没有设置漏洞赏金计划。但我会在更新日志中致谢每一位报告漏洞的安全研究员。

## 安全更新

- 所有安全更新会发布在 [Releases](https://github.com/CLARE-XHL/Chronos-Seal/releases) 页面
- 建议始终使用最新稳定版本
- 旧版本的安全漏洞可能不会修复，请及时升级

## 联系方式

- 邮箱：[contact@crclare.top](mailto:contact@crclare.top)
- GitHub Security Advisories：优先使用
