# CC Switch ZL

> 官方仓库（上游）：https://github.com/farion1231/cc-switch
>
> 本仓库是非官方定制构建，基于上游 `farion1231/cc-switch`，与官方团队无关。

CC Switch 是一个统一管理 AI 编码工具供应商配置的桌面应用。本仓库在官方版本基础上加入了几项个人定制功能，供自己使用和分发。

## 版本号

对外版本与内部 semver 一致，都是三位版本。为表明基于哪个官方版本，patch 按「官方 patch × 100 + ZL 构建序号」编码：

- `v4.0.24`、`v4.0.25`、`v4.0.2501`：旧编号
- `v4.0.2701`：基于官方 v4.0.27 的第 1 次 ZL 构建
- `v4.0.2801`：基于官方 v4.0.28 的第 1 次 ZL 构建
- `v4.0.3101`：基于官方 v4.0.31 的第 1 次 ZL 构建
- 官方升到 v4.1.0 后，ZL 从 `v4.1.1` 重新编号

发布标签、安装包文件名和界面都用这个版本；不使用 `-z` 或四段版本号。

发布产物只在本仓库的 Releases 提供。

## 相对官方的改动

### 尚未合并

- **Claude Desktop 模型映射增强**（上游 PR #8663）：支持直通、按档位停用、最大强度 `maxEffort`
- **xAI 托管搜索修复**（上游 PR #8664）：修复托管搜索选择器
- **xAI Priority 开关**：Claude Desktop 的 xAI 卡片可开启优先档，按 xAI 优先档计费
- **用量统计自动汇率**（上游 PR #8716）：默认手动，开启后每天自动获取；手填汇率可随时切回

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
