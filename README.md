# CC Switch ZL

> 官方仓库（上游）：https://github.com/farion1231/cc-switch
>
> 本仓库是非官方定制构建，基于上游 `farion1231/cc-switch`，与官方团队无关。

CC Switch 是一个统一管理 AI 编码工具供应商配置的桌面应用。本仓库在官方版本基础上加入了几项个人定制功能，供自己使用和分发。

## 版本号

对外版本与上游主版本一致，同一主版本下的 ZL 修订加序号：

- `v4.0.23`：基于上游 v4.0.23 的 ZL 主版本
- `v4.0.23.1`、`v4.0.23.2`：同一主版本下的第 1、2 个 ZL 修订

发布标签、安装包文件名和界面都用这套对外版本。应用内部的 semver 仍保留 `-z.N` 后缀（如 `4.0.23-z.2`），只用于自动更新的版本比较，不对外展示。

发布产物只在本仓库的 Releases 提供。

## 相对官方的改动

### 尚未合并

- **Claude Desktop 模型映射增强**（上游 PR #8663）：支持直通、按档位停用、最大强度 `maxEffort`
- **xAI 托管搜索修复**（上游 PR #8664）：修复托管搜索选择器，Claude Desktop 的 xAI 卡片增加 Priority 开关
- **用量统计自动汇率**（上游 PR #8716）：自动获取汇率，手填汇率可随时切回

### 已合并到上游

<details>
<summary>已在官方主线，本构建只是提前包含（1 项）</summary>

- **OpenCode Go 请求地址**（上游 PR #8720）：改用文档地址，Claude Desktop 下的凭据和额度查询恢复正常

</details>

未合并项会继续提交上游，合入后移入下方的已合并折叠区。

## 官方功能

上游 CC Switch 的功能全部保留：

- 供应商一键切换和配置管理，支持 Claude Code、Claude Desktop、Codex、Gemini CLI、Grok Build、OpenCode、OpenClaw、Hermes、Pi、MiniMax Code、Kimi Code、Oh My Pi
- 直连、本地路由与格式转换、故障转移、聚合模式
- MCP、Skills、Prompts 统一管理
- 用量统计、额度与余额查询
- 会话浏览与恢复
- 云端同步、CLI 工具管理

功能细节以上游仓库和官方文档为准。

## 构建

需要 Node.js 20+、pnpm、Rust 工具链和 Tauri 的系统依赖。

```bash
pnpm install
pnpm tauri build
```

Windows 安装包输出在 `src-tauri/target/release/bundle/`。

## 许可

MIT。原始项目版权归 Jason Young 及上游贡献者所有；本仓库的修改同样以 MIT 许可发布。完整许可见 [LICENSE](LICENSE)。

上游仓库：https://github.com/farion1231/cc-switch
