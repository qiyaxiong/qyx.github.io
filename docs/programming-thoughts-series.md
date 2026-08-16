# 编程思想与设计模式 46 讲

## 定位

本系列对应 B 站 UP 主“老赵Net”的合集 [`BV1Xv4y1T7by`](https://www.bilibili.com/video/BV1Xv4y1T7by/)，以 B 站实际的 P1–P46 为唯一编号。原视频标题在中段出现重复课号，因此站内标题经过规范化，但每篇顶部仍保留原始标题、CID、时长和分 P 链接。

系列不是逐字稿。文章将视频中的原则和模式重构为可独立阅读的工程课程，并统一补充：

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
    └── 46 个独立课程页面

src/utils/programming-thoughts-sessions.ts       # 唯一分 P 元数据
src/components/pages/ProgrammingThoughts*.astro # 视频卡片与课程目录
src/scripts/generate-programming-thoughts-series.mjs
public/images/notes/programming-thoughts/diagrams/ # 46 张原创 SVG
```

专栏入口由 `src/content/collection/programming-thoughts-design-patterns.md` 提供。

## 内容生成与修改

运行：

```bash
node src/scripts/generate-programming-thoughts-series.mjs
```

生成脚本会覆盖 46 篇课程正文和 46 张图。需要永久修改正文结构、案例或图解时，应修改生成脚本及 `programming-thoughts-sessions.ts`，不要只改生成后的单篇文件。

## Notion 内容源

本系列的正文运行时走 Notion API，而不是依赖本地 Markdown：

```text
本地 Markdown（可复现的编辑种子）
  -> publish-notes
  -> Notion note 数据源（48 个 Published 页面）
  -> getNotionNotes / getNotionPageContent
  -> Astro /notes/programming-thoughts
```

发布或更新整套专题：

```bash
node src/scripts/index.js publish-notes \
  --dir src/content/notes/programming-thoughts \
  --update-published
```

`programming-thoughts` 和 `programming-thoughts/course` 是两个目录 Note，另外 46 个路径对应 P1–P46。站点合并本地与 Notion 笔记时，Notion 同路径优先；本地文件作为可复现的编辑种子，也可承载尚未注册到 Notion 的本地开发笔记。图解会被发布为 Notion 原生图片块，图片地址指向生产站点的 `/images/notes/programming-thoughts/diagrams/`。

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

- `/notes/programming-thoughts/course` 能展示 46 讲；
- P1、P17、P22、P29、P34、P46 的前后导航正确；
- B 站 iframe 的 `page` 和 `cid` 与元数据一致；
- 所有 SVG URL 均返回 200；
- `/collection/programming-thoughts-design-patterns` 能进入五个阶段。
