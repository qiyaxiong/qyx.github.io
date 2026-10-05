# 漫画专区与图片存储

漫画专区的目录数据在 `src/data/manga/oregairu.json`，章节图片不进入 Git 仓库，也不放进 Notion。Notion 仍用于博客文章；漫画目录和阅读进度由本站处理。

## 本地归档

当前图片归档目录为 `/Users/qiluo/program/manga-archive/oregairu/`。每话一个三位数目录，例如 `001/001.webp`。`manifest.json` 记录页数、文件大小和 SHA-256。抓取中断后可重新运行，已完成的话会跳过。

```bash
node scripts/manga-crawl.mjs \
  --out=/Users/qiluo/program/manga-archive \
  --proxy=http://127.0.0.1:7897 \
  --start=1 --end=122
```

确认全部章节齐全后，生成站点使用的页码索引：

```bash
node scripts/manga-index.mjs --out=/Users/qiluo/program/manga-archive --strict
```

`--strict` 会在任意章节缺失时失败。不要把未完成的索引当作全量发布。

## Cloudflare Pages 图片站

R2 启用时要求绑定付款方式，因此图片改用独立的 Cloudflare Pages 静态站点。Pages 免费方案支持单站最多 20,000 个文件、单文件 25 MiB；纯静态资源请求免费且不限次数。归档脚本会检查这些限制，不把 `manifest.json` 上传。

全量抓取并生成索引后，创建一个空目录作为部署暂存区。脚本逐张检查大小和 SHA-256，同盘优先使用硬链接，避免复制整套图片：

```bash
node scripts/manga-index.mjs --out=/Users/qiluo/program/manga-archive --strict
node scripts/manga-stage-pages.mjs \
  --out=/Users/qiluo/program/manga-archive \
  --stage=/Users/qiluo/program/manga-pages-deploy \
  --strict=true
```

Pages 项目使用 **Direct Upload**，不能选 Git 集成。`qiqi-manga-assets` 已在 Cloudflare 控制台创建并完成首次部署；Wrangler 登录只需 Pages 写入及账户读取权限。后续更新图片时，重新上传暂存目录：

```bash
pnpm dlx wrangler login --scopes pages:write account:read user:read --use-keyring
pnpm dlx wrangler pages deploy /Users/qiluo/program/manga-pages-deploy \
  --project-name=qiqi-manga-assets --branch=main
```

首次部署已上传 3988 张图片和一个首页文件。`https://qiqi-manga-assets.pages.dev/oregairu/001/001.webp` 可公开访问；抽查第 1 话和第 122 话的首尾图片均返回 `image/webp`，SHA-256 与本地归档一致。博客默认使用这个 Pages 域名；如需改用自定义域名，可用 `PUBLIC_MANGA_ASSET_BASE_URL` 覆盖并重新构建博客。该变量只含公开域名，不含密钥。后续图片变化时，使用新的空暂存目录再次运行暂存脚本并重新部署。

参考：[Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[Pages 限额](https://developers.cloudflare.com/pages/platform/limits/)、[静态资源计费](https://developers.cloudflare.com/pages/functions/pricing/)。

## 本机预览

本地静态服务可直接读取归档，无需复制图片进仓库：

```bash
python3 -m http.server 8866 --bind 127.0.0.1 --directory /Users/qiluo/program/manga-archive
PUBLIC_MANGA_ASSET_BASE_URL=http://127.0.0.1:8866 pnpm dev
```

访问 `/manga`。目录只把有图片索引、且配置了图片地址的章节标为可读。每话阅读进度保存在访客浏览器的 `localStorage`。
