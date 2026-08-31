import type { APIRoute } from 'astro'

export const prerender = false

type RouteMatch =
  | { kind: 'model' | 'profile' | 'asset' | 'stage' | 'session-create' }
  | { kind: 'session-read' | 'snapshot' | 'events'; sessionId: string }
  | { kind: 'channel-message' | 'speech' }

interface RateCounter {
  count: number
  resetAt: number
}

const guestCookie = 'pi_live2d_guest'
const rateCounters = new Map<string, RateCounter>()

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ data: null, error: { code, message } }, { status })
}

function matchRoute(method: string, path: string): RouteMatch | undefined {
  if (method === 'GET' && path === 'api/v2/live2d/model') return { kind: 'model' }
  if (method === 'GET' && path === 'api/v2/live2d/performance-profile')
    return { kind: 'profile' }
  if (method === 'GET' && /^api\/v1\/live2d\/assets\/.+$/.test(path)) return { kind: 'asset' }
  if (
    ['GET', 'POST'].includes(method) &&
    /^api\/v1\/live2d\/stage\/[^/]+\/(?:snapshot|events|speech|[^/]+\/(?:model|performance-profile|assets\/.+))$/.test(
      path
    )
  )
    return { kind: 'stage' }
  if (method === 'POST' && path === 'api/v2/sessions') return { kind: 'session-create' }
  if (method === 'POST' && path === 'api/v2/channels/web/messages')
    return { kind: 'channel-message' }
  if (method === 'POST' && path === 'api/v2/speech/synthesize') return { kind: 'speech' }
  const session = /^api\/v1\/sessions\/([^/]+)$/.exec(path)
  if (method === 'GET' && session) {
    return { kind: 'session-read', sessionId: session[1] }
  }
  const live2d = /^api\/v1\/live2d\/sessions\/([^/]+)\/(snapshot|events)$/.exec(path)
  if (method === 'GET' && live2d) {
    return {
      kind: live2d[2] === 'snapshot' ? 'snapshot' : 'events',
      sessionId: live2d[1]
    }
  }
  return undefined
}

function clientAddress(request: Request): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

function consumeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const current = rateCounters.get(key)
  if (!current || current.resetAt <= now) {
    rateCounters.set(key, { count: 1, resetAt: now + windowMs })
  } else if (current.count >= limit) return false
  else current.count += 1

  if (rateCounters.size > 10_000) {
    for (const [candidate, value] of rateCounters) {
      if (value.resetAt <= now) rateCounters.delete(candidate)
      if (rateCounters.size <= 8_000) break
    }
  }
  return true
}

function cookieValue(request: Request, name: string): string | undefined {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return undefined
}

async function signature(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function safeEqual(left: string, right: string): boolean {
  let difference = left.length ^ right.length
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
  }
  return difference === 0
}

const allowedPagePrefixes = [
  '/blog/',
  '/notes/',
  '/pages/',
  '/collection/',
  '/projects/',
  '/search',
  '/about',
  '/links',
  '/academic'
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizePageContext(value: unknown, sourceUrl: URL): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined
  const pageContext = value.page_context
  if (!isRecord(pageContext) || typeof pageContext.href !== 'string') return undefined
  try {
    const url = new URL(pageContext.href, sourceUrl.origin)
    if (url.origin !== sourceUrl.origin || !url.pathname.startsWith('/')) return undefined
    const decodedPath = decodeURIComponent(url.pathname)
    if (decodedPath.split('/').some((segment) => segment === '.' || segment === '..'))
      return undefined
    if (
      decodedPath !== '/' &&
      !allowedPagePrefixes.some(
        (prefix) =>
          decodedPath === prefix.replace(/\/$/, '') ||
          decodedPath.startsWith(`${prefix.replace(/\/$/, '')}/`)
      )
    )
      return undefined
    const title = typeof pageContext.title === 'string' ? pageContext.title.slice(0, 160) : ''
    const language =
      typeof pageContext.language === 'string' ? pageContext.language.slice(0, 16) : 'zh'
    return {
      href: `${url.pathname}${url.search}${url.hash}`,
      title,
      language
    }
  } catch {
    return undefined
  }
}

async function ownedSession(request: Request, secret: string): Promise<string | undefined> {
  const token = cookieValue(request, guestCookie)
  if (!token) return undefined
  const separator = token.lastIndexOf('.')
  if (separator < 1) return undefined
  const sessionId = token.slice(0, separator)
  const actual = token.slice(separator + 1)
  const expected = await signature(sessionId, secret)
  return safeEqual(actual, expected) ? sessionId : undefined
}

async function sessionCookie(sessionId: string, secret: string, secure: boolean): Promise<string> {
  const mac = await signature(sessionId, secret)
  return (
    `${guestCookie}=${encodeURIComponent(`${sessionId}.${mac}`)}; Path=/agent-api; ` +
    `Max-Age=604800; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`
  )
}

async function upstreamFetch(request: Request, path: string, body?: string): Promise<Response> {
  const serverUrl = import.meta.env.PI_AGENT_SERVER_URL
  if (!serverUrl) {
    return errorResponse(503, 'bff.not_configured', 'Agent server URL is not configured')
  }
  const sourceUrl = new URL(request.url)
  const upstreamUrl = new URL(`${path}${sourceUrl.search}`, `${serverUrl.replace(/\/$/, '')}/`)
  const headers = new Headers()
  headers.set('accept', request.headers.get('accept') || 'application/json')
  if (body !== undefined) headers.set('content-type', 'application/json')
  if (request.method === 'POST') {
    headers.set('idempotency-key', request.headers.get('idempotency-key') || crypto.randomUUID())
  }
  const lastEventId = request.headers.get('last-event-id')
  if (lastEventId) headers.set('last-event-id', lastEventId)
  const adminToken = import.meta.env.PI_AGENT_ADMIN_TOKEN
  if (adminToken) headers.set('authorization', `Bearer ${adminToken}`)

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      redirect: 'manual'
    })
    const responseHeaders = new Headers(upstream.headers)
    for (const name of ['connection', 'content-encoding', 'content-length', 'transfer-encoding']) {
      responseHeaders.delete(name)
    }
    let responseBody = upstream.body
    if (responseBody && responseHeaders.get('content-type')?.includes('text/event-stream')) {
      const reader = responseBody.getReader()
      responseBody = new ReadableStream<Uint8Array<ArrayBuffer>>({
        async pull(controller) {
          try {
            const { done, value } = await reader.read()
            if (done) controller.close()
            else controller.enqueue(new Uint8Array(value))
          } catch {
            // A long-lived SSE upstream may be terminated by the server runtime's
            // body timeout. Close cleanly so EventSource can reconnect with its cursor.
            controller.close()
          }
        },
        cancel(reason) {
          return reader.cancel(reason)
        }
      })
    }
    return new Response(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    })
  } catch {
    return errorResponse(502, 'bff.upstream_unavailable', 'Agent server is unavailable')
  }
}

export const ALL: APIRoute = async ({ params, request }) => {
  const path = params.path || ''
  if (path.split('/').some((segment) => segment === '.' || segment === '..')) {
    return errorResponse(404, 'bff.route_not_allowed', 'Agent route is not public')
  }
  const route = matchRoute(request.method.toUpperCase(), path)
  if (!route) return errorResponse(404, 'bff.route_not_allowed', 'Agent route is not public')

  const sourceUrl = new URL(request.url)
  if (
    !['GET', 'HEAD'].includes(request.method) &&
    request.headers.get('origin') &&
    request.headers.get('origin') !== sourceUrl.origin
  ) {
    return errorResponse(403, 'bff.origin_invalid', 'Cross-origin writes are not allowed')
  }

  if (
    route.kind === 'model' ||
    route.kind === 'profile' ||
    route.kind === 'asset' ||
    route.kind === 'stage'
  ) {
    return upstreamFetch(request, path)
  }

  const secret = import.meta.env.PI_AGENT_BFF_SECRET
  if (!secret || secret.length < 32) {
    return errorResponse(503, 'bff.secret_not_configured', 'Guest BFF is not configured')
  }

  if (route.kind === 'session-create') {
    if (!consumeRateLimit(`session:${clientAddress(request)}`, 10, 60 * 60 * 1_000)) {
      return errorResponse(429, 'bff.rate_limited', 'Too many Session requests')
    }
    const upstream = await upstreamFetch(
      request,
      path,
      JSON.stringify({ metadata: { client: 'astro-blog-live2d', access: 'guest' } })
    )
    if (!upstream.ok) return upstream
    const envelope = (await upstream.json()) as { data?: { id?: unknown } }
    const sessionId = envelope.data?.id
    if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(sessionId)) {
      return errorResponse(502, 'bff.invalid_upstream', 'Agent returned an invalid Session')
    }
    const headers = new Headers({ 'content-type': 'application/json' })
    headers.append(
      'set-cookie',
      await sessionCookie(sessionId, secret, sourceUrl.protocol === 'https:')
    )
    return new Response(JSON.stringify({ data: { id: sessionId } }), { status: 201, headers })
  }

  const owned = await ownedSession(request, secret)
  if (route.kind === 'channel-message') {
    if (!owned) return errorResponse(401, 'bff.session_required', 'Guest Session is required')
    if (
      !consumeRateLimit(`run-minute:${owned}`, 10, 60_000) ||
      !consumeRateLimit(`run-day:${owned}`, 200, 24 * 60 * 60 * 1_000)
    ) {
      return errorResponse(429, 'bff.rate_limited', 'Guest Agent quota exceeded')
    }
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > 16_384) {
      return errorResponse(413, 'bff.request_too_large', 'Prompt request is too large')
    }
    let value: unknown
    try {
      value = JSON.parse(raw)
    } catch {
      return errorResponse(400, 'bff.invalid_json', 'Prompt request must be JSON')
    }
    if (!value || typeof value !== 'object') {
      return errorResponse(400, 'bff.invalid_request', 'Prompt request is invalid')
    }
    const prompt = (value as Record<string, unknown>).text
    const requestedSession = (value as Record<string, unknown>).session_id
    if (requestedSession !== owned || typeof prompt !== 'string' || !prompt.trim()) {
      return errorResponse(403, 'bff.session_mismatch', 'Prompt Session is not owned')
    }
    if (prompt.length > 2_000) {
      return errorResponse(413, 'bff.prompt_too_long', 'Prompt exceeds 2000 characters')
    }
    const requestContext = sanitizePageContext(
      (value as Record<string, unknown>).request_context,
      sourceUrl
    )
    const provider = import.meta.env.PI_AGENT_GUEST_PROVIDER || 'dashscope'
    const model = import.meta.env.PI_AGENT_GUEST_MODEL || 'qwen-plus'
    return upstreamFetch(
      request,
      path,
      JSON.stringify({
        session_id: owned,
        text: prompt,
        message_id: request.headers.get('idempotency-key') || crypto.randomUUID(),
        account_id: 'astro-blog-guest',
        sender_id: 'live2d-user',
        surface: 'blog-live2d',
        modality: 'text',
        model: { id: model, provider, display_name: model },
        request_context: requestContext ? { page_context: requestContext } : {}
      })
    )
  }

  if (route.kind === 'speech') {
    if (!owned) return errorResponse(401, 'bff.session_required', 'Guest Session is required')
    if (
      !consumeRateLimit(`speech-minute:${owned}`, 10, 60_000) ||
      !consumeRateLimit(`speech-day:${owned}`, 200, 24 * 60 * 60 * 1_000)
    ) {
      return errorResponse(429, 'bff.rate_limited', 'Guest speech quota exceeded')
    }
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > 16_384) {
      return errorResponse(413, 'bff.request_too_large', 'Speech request is too large')
    }
    let value: unknown
    try {
      value = JSON.parse(raw)
    } catch {
      return errorResponse(400, 'bff.invalid_json', 'Speech request must be JSON')
    }
    if (!isRecord(value))
      return errorResponse(400, 'bff.invalid_request', 'Speech request is invalid')
    const text = value.text
    if (value.session_id !== owned || typeof text !== 'string' || !text.trim()) {
      return errorResponse(403, 'bff.session_mismatch', 'Speech Session is not owned')
    }
    if (text.length > 2_000) {
      return errorResponse(413, 'bff.speech_too_long', 'Speech text exceeds 2000 characters')
    }
    return upstreamFetch(request, path, JSON.stringify({ session_id: owned, text: text.trim() }))
  }

  if (!('sessionId' in route)) {
    return errorResponse(500, 'bff.invalid_route', 'Guest BFF route resolution failed')
  }
  if (!owned || owned !== route.sessionId) {
    return errorResponse(403, 'bff.session_mismatch', 'Session is not owned')
  }
  if (route.kind === 'session-read') {
    const upstream = await upstreamFetch(request, path)
    if (!upstream.ok) return upstream
    return Response.json({ data: { id: route.sessionId } })
  }
  return upstreamFetch(request, path)
}
