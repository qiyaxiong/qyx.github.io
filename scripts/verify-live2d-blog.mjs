import { chromium } from 'playwright'

const blogUrl = process.env.LIVE2D_BLOG_URL || 'http://127.0.0.1:4321/'
const expectedText = process.env.LIVE2D_EXPECT_TEXT || 'Blog 内嵌自动烟测成功'
const prompt =
  process.env.LIVE2D_SMOKE_PROMPT ||
  `请先切换到 hearts 表情，再播放 Idle[0] 动作，最后只回复：${expectedText}`
const coreSourceUrl = process.env.LIVE2D_CORE_SOURCE_URL
const expectBff = process.env.LIVE2D_EXPECT_BFF === 'true'
const skipAgent = process.env.LIVE2D_SKIP_AGENT === 'true'

const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  if (coreSourceUrl) {
    const coreResponse = await fetch(coreSourceUrl)
    if (!coreResponse.ok) throw new Error(`Cubism Core download failed: ${coreResponse.status}`)
    const coreSource = await coreResponse.text()
    await context.route(/live2dcubismcore\.min\.js(?:\?.*)?$/, (route) =>
      route.fulfill({ contentType: 'text/javascript; charset=utf-8', body: coreSource })
    )
  }
  const page = await context.newPage()
  await page.goto(blogUrl, { waitUntil: 'domcontentloaded' })
  const root = page.locator('[data-live2d-agent]')
  await root.waitFor({ state: 'visible' })
  try {
    await page.locator('.live2d-status', { hasText: '在线' }).waitFor({ timeout: 30_000 })
  } catch {
    const diagnostics = await root.evaluate((element) => ({
      state: element.getAttribute('data-state'),
      status: element.querySelector('.live2d-status')?.textContent,
      speech: element.querySelector('.live2d-speech')?.textContent
    }))
    throw new Error(`Live2D component did not become ready: ${JSON.stringify(diagnostics)}`)
  }
  const canvasSize = await page.locator('.live2d-canvas').evaluate((canvas) => ({
    width: canvas.width,
    height: canvas.height
  }))
  if (canvasSize.width < 1 || canvasSize.height < 1) throw new Error('Live2D canvas is empty')

  const sessionId = await root.getAttribute('data-session-id')
  if (!sessionId) throw new Error('Live2D Session was not created')
  if (!skipAgent) {
    const promptInput = page.locator('.live2d-prompt')
    await promptInput.fill(prompt)
    await promptInput.press('Enter')
    const speech = page.locator('.live2d-speech', { hasText: expectedText })
    await speech.waitFor({ timeout: 30_000 })
    if ((await speech.textContent())?.trim() !== expectedText) {
      throw new Error('Agent response did not match the expected text')
    }
    if ((await root.getAttribute('data-expression')) !== 'hearts') {
      throw new Error('Expected hearts expression was not applied')
    }
    if ((await root.getAttribute('data-motion-group')) !== 'Idle') {
      throw new Error('Expected Idle motion was not applied')
    }
  }

  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.live2d-status', { hasText: '在线' }).waitFor()
  const restoredSessionId = await page
    .locator('[data-live2d-agent]')
    .getAttribute('data-session-id')
  if (restoredSessionId !== sessionId) throw new Error('Live2D Session was not restored')
  if (!skipAgent) await page.locator('.live2d-speech', { hasText: expectedText }).waitFor()

  if (expectBff) {
    const ownershipStatus = await page.evaluate(() =>
      fetch('/agent-api/api/v1/live2d/sessions/not-owned/snapshot').then(
        (response) => response.status
      )
    )
    if (ownershipStatus !== 403) throw new Error('Guest BFF did not enforce Session ownership')
    const oversizedStatus = await page.evaluate(
      (activeSession) =>
        fetch('/agent-api/api/v1/runs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: activeSession, prompt: 'x'.repeat(2_001) })
        }).then((response) => response.status),
      sessionId
    )
    if (oversizedStatus !== 413) throw new Error('Guest BFF did not enforce the Prompt limit')

    await page.evaluate(() => localStorage.clear())
    await context.clearCookies()
    await page.close()
    const [firstTab, secondTab] = await Promise.all([context.newPage(), context.newPage()])
    await Promise.all([
      firstTab.goto(blogUrl, { waitUntil: 'domcontentloaded' }),
      secondTab.goto(blogUrl, { waitUntil: 'domcontentloaded' })
    ])
    await Promise.all([
      firstTab.locator('.live2d-status', { hasText: '在线' }).waitFor({ timeout: 30_000 }),
      secondTab.locator('.live2d-status', { hasText: '在线' }).waitFor({ timeout: 30_000 })
    ])
    const [firstSession, secondSession] = await Promise.all([
      firstTab.locator('[data-live2d-agent]').getAttribute('data-session-id'),
      secondTab.locator('[data-live2d-agent]').getAttribute('data-session-id')
    ])
    if (!firstSession || firstSession !== secondSession) {
      throw new Error('Guest BFF multi-tab Session coordination failed')
    }
  }

  console.log(
    JSON.stringify({ valid: true, blogUrl, sessionId, canvasSize, guestBff: expectBff, skipAgent })
  )
} finally {
  await browser.close()
}
