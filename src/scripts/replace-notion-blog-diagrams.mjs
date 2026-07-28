import { readFileSync } from 'node:fs'
import path from 'node:path'

import { Client } from '@notionhq/client'

import { getNotionPosts } from '../lib/notion.ts'

const productionOrigin = 'https://qyxgithubio.vercel.app'

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env')
  const values = {}

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    values[trimmed.slice(0, separator).trim()] = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]+|['"]+$/g, '')
  }

  return values
}

const env = loadEnv()
const notion = new Client({
  auth: process.env.NOTION_API_KEY || env.NOTION_API_KEY
})

const richText = (content) => [
  {
    type: 'text',
    text: { content }
  }
]

async function listChildren(blockId) {
  const blocks = []
  let cursor

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor
    })
    blocks.push(...response.results)
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  return blocks
}

function getPlainText(block) {
  if (!('type' in block)) return ''
  const content = block[block.type]
  if (!content || !Array.isArray(content.rich_text)) return ''
  return content.rich_text.map((item) => item.plain_text).join('')
}

function getImageUrl(block) {
  if (!('type' in block) || block.type !== 'image') return ''
  if (block.image.type === 'external') return block.image.external.url
  if (block.image.type === 'file') return block.image.file.url
  return ''
}

async function updateImageCaption(block, caption) {
  await notion.blocks.update({
    block_id: block.id,
    image: {
      caption: richText(caption)
    }
  })
}

async function ensureImageAfterHeading(pageId, headingNeedle, url, caption) {
  const blocks = await listChildren(pageId)
  const existing = blocks.find((block) => getImageUrl(block) === url)

  if (existing) {
    await updateImageCaption(existing, caption)
    return 'updated existing caption'
  }

  const heading = blocks.find(
    (block) =>
      'type' in block &&
      ['heading_1', 'heading_2', 'heading_3'].includes(block.type) &&
      getPlainText(block).includes(headingNeedle)
  )

  if (!heading) {
    throw new Error(`Heading not found: ${headingNeedle}`)
  }

  await notion.blocks.children.append({
    block_id: pageId,
    after: heading.id,
    children: [
      {
        object: 'block',
        type: 'image',
        image: {
          type: 'external',
          external: { url },
          caption: richText(caption)
        }
      }
    ]
  })

  return 'inserted'
}

async function updateCaptionBySuffix(pageId, suffix, caption) {
  const blocks = await listChildren(pageId)
  const image = blocks.find((block) => getImageUrl(block).endsWith(suffix))

  if (!image) {
    throw new Error(`Image not found: ${suffix}`)
  }

  await updateImageCaption(image, caption)
  return 'caption updated'
}

const posts = await getNotionPosts()
const bySlug = new Map(posts.map((post) => [post.slug, post]))

function pageId(slug) {
  const post = bySlug.get(slug)
  if (!post) throw new Error(`Published Notion post not found: ${slug}`)
  return post.sourcePageId
}

const operations = [
  {
    label: 'Attention 教程：插入 QKV 图',
    run: () =>
      ensureImageAfterHeading(
        pageId('deep-learning-visual-06-attention-mechanism'),
        'softmax 变成权重',
        `${productionOrigin}/images/blog/generated/attention-qkv.png`,
        'Attention 的 Q/K/V、因果 mask、softmax 与 value 加权汇总（原生重绘）'
      )
  },
  {
    label: 'Attention/KV 长文：插入 QKV 图',
    run: () =>
      ensureImageAfterHeading(
        pageId('attention-kv-cache-context-cost'),
        'Causal mask',
        `${productionOrigin}/images/blog/generated/attention-qkv.png`,
        '从 Q/K/V 到因果 mask 和加权输出的完整张量形状（原生重绘）'
      )
  },
  {
    label: 'Attention/KV 长文：插入 KV cache 图',
    run: () =>
      ensureImageAfterHeading(
        pageId('attention-kv-cache-context-cost'),
        'KV cache 复用什么',
        `${productionOrigin}/images/blog/generated/kv-cache-prefill-decode.png`,
        'KV cache 在 prefill 与 decode 阶段分别写入、追加和复用什么（原生重绘）'
      )
  },
  {
    label: '反向传播上篇：更新链式法则图说明',
    run: () =>
      updateCaptionBySuffix(
        pageId('deep-learning-visual-03-backpropagation-part-1'),
        '/images/blog/deep-learning-visual/backprop-output-chain-rule.png',
        '输出层链式法则：前向缓存与反向局部导数相乘（原生重绘）'
      )
  },
  {
    label: '反向传播下篇：更新链式法则图说明',
    run: () =>
      updateCaptionBySuffix(
        pageId('deep-learning-visual-04-backpropagation-part-2'),
        '/images/blog/deep-learning-visual/backprop-output-chain-rule.png',
        '输出层权重的链式法则：从损失反推到权重（原生重绘）'
      )
  },
  {
    label: '反向传播下篇：更新隐藏层图说明',
    run: () =>
      updateCaptionBySuffix(
        pageId('deep-learning-visual-04-backpropagation-part-2'),
        '/images/blog/deep-learning-visual/backprop-hidden-activation-paths.png',
        '隐藏层梯度为什么需要汇总所有下游路径（原生重绘）'
      )
  },
  {
    label: 'GRPO：更新组内优势图说明',
    run: () =>
      updateCaptionBySuffix(
        pageId('grpo-rl-learning-path'),
        '/images/blog/grpo-video-grpo.jpg',
        'GRPO 用同一 prompt 的候选组奖励计算相对优势（原生重绘）'
      )
  }
]

for (const operation of operations) {
  const result = await operation.run()
  console.log(`${operation.label}: ${result}`)
}
