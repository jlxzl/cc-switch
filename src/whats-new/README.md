# 更新摘要（应用内弹窗）

用户升级后第一次打开 CC Switch，会弹一个窗口，列出从上次看过的版本到当前版本之间每一版的几条摘要。数据就是这个目录下的文件，构建时打进安装包（`src/lib/whatsNew.ts`），弹窗不联网。

详细内容仍在 `docs/release-notes/`。弹窗里每个版本的「详情」链到本仓库发布页 `https://github.com/jlxzl/cc-switch/releases/tag/<version>`，发版后确认对应的 Release 已生成。`src/lib/whatsNew.ts` 只把带 `"channel": "zl"` 的条目纳入 Z 版的「近期更新」。

## 每个版本一个文件

文件名是版本号，例如 `4.0.2.json`：

```json
{
  "version": "4.0.2",
  "items": [
    {
      "type": "new",
      "zh": "OpenCode 可以选择思考档位",
      "zh-TW": "OpenCode 可以選擇思考檔位",
      "en": "OpenCode can now pick a thinking level",
      "ja": "OpenCode で思考レベルを選べるように"
    }
  ]
}
```

- `type`：`new`（新增）、`fix`（修复）、`improve`（改进）。
- ZL 自己的发布用对外版本命名文件（如 `4.0.23.1.json`），并在 JSON 里加 `"channel": "zl"`；上游版本的条目保持三段版本号、不加这个字段。
- 每版最多 4 条，每条一句话：中文、繁中不超过 40 字，日文不超过 50 字，英文不超过 100 个字符。四种语言都要写。
- 写用户能感知到的变化，按影响大小排序。从中文发布说明里挑最重要的几条，不要照搬原文。
- `"items": []` 表示这一版不弹窗，适合纯构建、CI 之类的版本。文件仍然要有。

规则由 `tests/config/whatsNewEntries.test.ts` 检查。

## 什么时候写

和发布说明一起写，放进打 tag 之前的提交。每次发布都必须有这一版的摘要；Fork Release 在打标签时会检查 `<对外版本>.json` 存在且 `channel` 为 `zl`，缺了直接失败，不会白跑构建。
