import type { APIRoute } from 'astro'

const encoder = new TextEncoder()

function getEnv(name: string) {
  return import.meta.env[name] || process.env[name]
}

function toHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false

  let mismatch = 0
  for (let index = 0; index < a.length; index++) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index)
  }

  return mismatch === 0
}

async function hmacSha256Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))

  return toHex(signature)
}

async function isTrustedRequest(request: Request, body: string, url: URL) {
  const verificationToken = getEnv('NOTION_WEBHOOK_VERIFICATION_TOKEN')

  if (verificationToken) {
    const signature = request.headers.get('x-notion-signature')
    if (!signature?.startsWith('sha256=')) return false

    const expectedSignature = `sha256=${await hmacSha256Hex(verificationToken, body)}`
    return constantTimeEqual(signature, expectedSignature)
  }

  const syncSecret = getEnv('NOTION_SYNC_SECRET')
  if (!syncSecret) return false

  const providedSecret = request.headers.get('x-sync-secret') || url.searchParams.get('secret')
  return providedSecret === syncSecret
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const body = await request.text()
  const payload = body ? JSON.parse(body) : {}

  if (typeof payload.verification_token === 'string') {
    return json({
      ok: true,
      verification_token: payload.verification_token
    })
  }

  if (!(await isTrustedRequest(request, body, url))) {
    return json({ ok: false, error: 'Unauthorized webhook request' }, 401)
  }

  const deployHookUrl =
    getEnv('VERCEL_DEPLOY_HOOK_URL') || getEnv('BUILD_HOOK_URL') || getEnv('DEPLOY_HOOK_URL')

  if (!deployHookUrl) {
    return json({ ok: false, error: 'Missing VERCEL_DEPLOY_HOOK_URL' }, 500)
  }

  const deployResponse = await fetch(deployHookUrl, {
    method: 'POST'
  })

  if (!deployResponse.ok) {
    return json(
      {
        ok: false,
        error: 'Deploy hook request failed',
        status: deployResponse.status
      },
      502
    )
  }

  return json({
    ok: true,
    event: payload.type || null
  })
}
