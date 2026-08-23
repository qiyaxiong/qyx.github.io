# 编程思想与设计模式 46 讲

## 定位

本系列对应 B 站 UP 主“老赵Net”的合集 [`BV1Xv4y1T7by`](https://www.bilibili.com/video/BV1Xv4y1T7by/)，以 B 站实际的 P1–P46 为唯一编号。原视频标题在中段出现重复课号，因此站内标题经过规范化，但每篇顶部仍保留原始标题、CID、时长和分 P 链接。

系列不是逐字稿。46 个分 P 按连续问题合并为 15 篇渐进式主题长文，并统一补充：

- 真实变化场景；
- 设计前后的依赖方向；
- Python 3 最小可运行代码；
- SVG 决策图；
- 适用条件、代价和反例；
- 可执行的课后练习。

## 代码结构

```text
src/content/notes/programming-thoughts/
├── index.md
└── course/
    ├── index.md
    └── 15 个渐进式主题页面

src/utils/programming-thoughts-sessions.ts       # 46 分 P 元数据 + 15 主题映射
src/components/pages/ProgrammingThoughts*.astro # 视频卡片与课程目录
src/scripts/generate-programming-thoughts-series.mjs
docs/diagrams/programming-thoughts/              # 15 张可编辑 Excalidraw UML 源文件
public/images/notes/programming-thoughts/diagrams/ # 46 张分 P 图 + 45 张章节图
```

专栏入口由 `src/content/collection/programming-thoughts-design-patterns.md` 提供。

## 内容生成与修改

运行：

```bash
node src/scripts/generate-programming-thoughts-series.mjs
```

生成脚本会覆盖 15 篇主题正文、15 张需求演进图、15 张重构前后图、15 张 UML 图及其 Excalidraw 源文件，并保留 46 张分 P 素材图。需要永久修改正文结构、案例或图解时，应修改生成脚本、章节样例、UML 规格和 `programming-thoughts-sessions.ts`，不要只改生成后的单篇文件。

## Notion 内容源

本系列的正文运行时走 Notion API，而不是依赖本地 Markdown：

```text
本地 Markdown（可复现的编辑种子）
  -> publish-notes
  -> Notion note 数据源（17 个 Published 页面）
  -> getNotionNotes / getNotionPageContent
  -> Astro /notes/programming-thoughts
```

发布或更新整套专题：

```bash
node src/scripts/index.js publish-notes \
  --dir src/content/notes/programming-thoughts \
  --update-published \
  --unpublish-missing
```

`programming-thoughts` 和 `programming-thoughts/course` 是两个目录 Note，另外 15 个路径对应主题文章。每篇内部保留 P 范围、原视频链接和逐步推导。站点合并本地与 Notion 笔记时，Notion 同路径优先；本地文件是可复现的编辑种子。图解会被发布为 Notion 原生图片块。

`--unpublish-missing` 只在目录内所有新页面都发布成功后执行，而且退役集合被限制为代码中明确列出的 46 个旧 slug。它不会碰同目录下仅存在于 Notion 的其他人工页面；旧页只会改为 Draft，不会删除，仍可恢复。旧 URL 由 Astro 永久重定向到对应主题长文。

## 素材与转写

音频和 Whisper JSON 只用于本地内容核对，不进入 Git，也不随网站发布。站内只嵌入 B 站播放器并链接原视频；正文、代码和图解均为重新组织和原创表达。

转写检查应至少覆盖：

1. 分 P、CID、时长和文件名是否一一对应；
2. 视频实际主题是否与上传标题一致；
3. 专有名词是否被 ASR 误识别；
4. 文章是否补充了模式代价，而不是只复述课堂实现；
5. 示例是否使用站内统一的业务语言。

## 发布前检查

```bash
node src/scripts/generate-programming-thoughts-series.mjs
node --test tests/programming-thoughts-series.test.mjs
npm run check
npm run build
```

另外检查：

- `/notes/programming-thoughts/course` 能展示 15 篇主题并覆盖 P1–P46；
- 第一篇、中间篇与最后一篇的前后导航正确；
- B 站 iframe 的 `page` 和 `cid` 与元数据一致；
- 所有 SVG URL 均返回 200；
- `/collection/programming-thoughts-design-patterns` 能进入五个阶段。
