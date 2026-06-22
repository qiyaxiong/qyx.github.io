## Astro-Blog

主要使用 [Astro](https://astro.build/) 构建，并在此基础上借鉴 [NotionNext](https://github.com/tangly1024/NotionNext) 修改了获取数据源部分，改为在构建阶段通过 Notion API 拉取数据。

站点个性化配置请编辑 `src/site.config.ts`。

## GitHub 贡献日历

首页贡献日历默认只能读取 GitHub 公开贡献。如果你在 GitHub 登录状态下看到的数量更高，例如包含私有仓库贡献，需要在本地 `.env` 和部署平台环境变量里设置：

```bash
GITHUB_TOKEN="ghp_xxx"
```

也可以使用 `GH_TOKEN`。该 token 只在服务端构建/渲染时使用，不要使用 `PUBLIC_` 前缀。

## Notion 同步流程

博客文章以 Notion 为源头。把一篇文章显示到博客里，需要在 Notion 的内容数据库 `post` 视图新增一条记录，并填写这些字段：

- `Title`：博客文章标题
- `Status`：设为 `Published`
- `Lang`：中文文章设为 `zh`
- `Slug`：博客路由，例如 `ai-notion-publish-flow`
- `Description`：文章摘要，显示在标题下方；不填时会从正文自动截取
- `Source Page`：实际文章页面的 Notion 链接
- `Date`：发布日期
- `Tags` / `Category`：用于标签页和分类页
- `Image` / `Hero Image` / `Cover`：可选，文章头图；支持 URL 或 Notion files

也可以用脚本登记，脚本会先按 `Slug` 检查是否已有记录，避免重复创建：

```bash
node src/scripts/index.js register-post \
  --title "用 AI 代理把文章写到 Notion 并发布：一套可复用流程" \
  --slug ai-notion-publish-flow \
  --description "用 Notion 管理摘要，用 Source Page 编写正文。" \
  --source "https://www.notion.so/AI-Notion-377dc10b938a806191e2f70cee951365?source=copy_link" \
  --date 2026-06-06 \
  --tags "notion,ai-agent,publishing" \
  --category tech
```

Notion 内容更新后，博客需要重新构建才会把最新内容发布到线上。推荐使用 Notion webhook 触发部署平台的 build hook：

1. 在部署平台创建一个 Deploy Hook，例如 Vercel Deploy Hook。
2. 设置环境变量 `VERCEL_DEPLOY_HOOK_URL` 为 Deploy Hook URL。
3. 部署站点后，在 Notion connection 的 Webhooks 页面新增订阅，URL 填：

```txt
https://your-domain.com/api/notion-sync
```

4. Notion 会向该 URL 发送 `verification_token`，从接口响应或日志里取出 token，在 Notion Webhooks 页面完成验证。
5. 设置环境变量 `NOTION_WEBHOOK_VERIFICATION_TOKEN` 为第 4 步拿到的 token，并重新部署一次。
6. 订阅 `page.content_updated`、`page.properties_updated`、`data_source.content_updated` 等事件。之后 Notion 页面或数据源更新时，`/api/notion-sync` 会触发部署 hook，博客重新构建并同步最新内容。
