export interface Live2DModelInfo {
  id: string
  name: string
  manifest_url: string
  expressions: string[]
  motion_groups: Record<string, number>
  profile_url: string
  profile_fingerprint: string
}

export interface PerformanceTarget {
  label: string
  vad: { valence: number; arousal: number; dominance: number }
  intensity: number
  confidence: number
  transition_ms: number
  hold_ms: number
  seed: number
  source_sequence: number
}

export interface PerformanceCue {
  expression?: string
  motion_group?: string
  motion_index?: number
  priority: number
  blend_in_ms: number
  hold_ms: number
  blend_out_ms: number
}

export interface Live2DSnapshot {
  sequence: number
  state: string
  expression: string | null
  motion_group: string | null
  motion_index: number | null
  speech_text: string
  performance_target: PerformanceTarget | null
  active_cue: PerformanceCue | null
  performance_seed: number
  profile_fingerprint: string | null
}

export interface Live2DEvent {
  sequence: number
  type: string
  turn_id: string | null
  data: Record<string, unknown>
}

const live2dEventTypes = new Set([
  'live2d.state.changed',
  'live2d.command',
  'live2d.speech.delta',
  'live2d.speech.completed',
  'live2d.error',
  'live2d.web.action.intent',
  'live2d.performance.target',
  'live2d.performance.cue',
  'live2d.performance.reset'
])
const live2dStates = new Set([
  'idle',
  'listening',
  'thinking',
  'speaking',
  'working',
  'waiting_approval',
  'error'
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseLive2DEvent(value: unknown): Live2DEvent {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.sequence) ||
    (value.sequence as number) < 1 ||
    typeof value.type !== 'string'
  ) {
    throw new Error('Invalid Live2D event envelope')
  }
  if (!live2dEventTypes.has(value.type) || !isRecord(value.data)) {
    throw new Error(`Unsupported Live2D event: ${value.type}`)
  }
  const data = value.data
  if (value.type === 'live2d.command') {
    const allowed = new Set(['state', 'expression', 'motion_group', 'motion_index'])
    if (
      Object.keys(data).some((key) => !allowed.has(key)) ||
      !['state', 'expression', 'motion_group'].some((key) => key in data) ||
      (data.state !== undefined &&
        (typeof data.state !== 'string' || !live2dStates.has(data.state))) ||
      (data.expression !== undefined && typeof data.expression !== 'string') ||
      (data.motion_group !== undefined && typeof data.motion_group !== 'string') ||
      (data.motion_index !== undefined &&
        (!Number.isInteger(data.motion_index) || (data.motion_index as number) < 0)) ||
      (data.motion_index !== undefined && data.motion_group === undefined)
    ) {
      throw new Error('Invalid payload for live2d.command')
    }
  }
  if (value.type === 'live2d.web.action.intent') {
    const allowed = new Set([
      'id',
      'action',
      'href',
      'anchor',
      'title',
      'reason',
      'requires_confirmation'
    ])
    if (
      Object.keys(data).some((key) => !allowed.has(key)) ||
      typeof data.id !== 'string' ||
      (data.action !== 'navigate' && data.action !== 'scroll_to') ||
      typeof data.title !== 'string' ||
      typeof data.reason !== 'string' ||
      typeof data.requires_confirmation !== 'boolean' ||
      (data.action === 'navigate' && typeof data.href !== 'string') ||
      (data.action === 'scroll_to' && typeof data.anchor !== 'string')
    ) {
      throw new Error('Invalid payload for live2d.web.action.intent')
    }
  }
  if (
    (value.type === 'live2d.state.changed' &&
      (typeof data.state !== 'string' ||
        !live2dStates.has(data.state) ||
        typeof data.source !== 'string')) ||
    (value.type === 'live2d.speech.delta' && typeof data.delta !== 'string') ||
    (value.type === 'live2d.speech.completed' &&
      (typeof data.text !== 'string' || data.state !== 'idle')) ||
    (value.type === 'live2d.error' &&
      (typeof data.code !== 'string' || typeof data.message !== 'string' || data.state !== 'error'))
  ) {
    throw new Error(`Invalid payload for ${value.type}`)
  }
  return value as unknown as Live2DEvent
}

interface ApiEnvelope<T> {
  data: T
  error?: { message?: string }
}

interface AgentSession {
  id: string
}

interface AgentSessionDetail {
  id?: string
  header?: { id?: string }
}

function normalizeSession(value: AgentSessionDetail): AgentSession {
  const id = value.id || value.header?.id
  if (!id) throw new Error('Agent returned an invalid Session')
  return { id }
}

export class AgentApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'AgentApiError'
  }
}

export class BlogAgentApi {
  readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  url(path: string): string {
    if (/^https?:\/\//.test(path)) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${this.baseUrl}${normalized}`
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(this.url(path), {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    })
    const envelope = (await response.json()) as ApiEnvelope<T>
    if (!response.ok) {
      throw new AgentApiError(
        envelope.error?.message || `${response.status} ${response.statusText}`,
        response.status
      )
    }
    return envelope.data
  }

  async model(): Promise<Live2DModelInfo> {
    return this.request('/api/v2/live2d/model')
  }

  async performanceProfile<T>(path = '/api/v2/live2d/performance-profile'): Promise<T> {
    return this.request<T>(path)
  }

  async snapshot(sessionId: string): Promise<Live2DSnapshot> {
    return this.request(`/api/v2/live2d/sessions/${encodeURIComponent(sessionId)}/snapshot`)
  }

  async ensureSession(storage: Storage): Promise<AgentSession> {
    const lockName = `pi-blog-live2d-session-lock:${this.baseUrl}`
    if (globalThis.navigator?.locks) {
      return navigator.locks.request(lockName, () => this.ensureSessionUnlocked(storage))
    }
    return this.ensureSessionUnlocked(storage)
  }

  private async ensureSessionUnlocked(storage: Storage): Promise<AgentSession> {
    const storageKey = `pi-blog-live2d-session:${this.baseUrl}`
    const existing = storage.getItem(storageKey)
    if (existing) {
      try {
        const session = await this.request<AgentSessionDetail>(
          `/api/v2/sessions/${encodeURIComponent(existing)}`
        )
        return normalizeSession(session)
      } catch (error) {
        if (!(error instanceof AgentApiError) || ![401, 403, 404, 409].includes(error.status))
          throw error
        storage.removeItem(storageKey)
      }
    }
    const session = normalizeSession(await this.request<AgentSessionDetail>('/api/v2/sessions', {
      method: 'POST',
      body: JSON.stringify({ metadata: { client: 'astro-blog-live2d' } })
    }))
    storage.setItem(storageKey, session.id)
    return session
  }

  async run(
    sessionId: string,
    prompt: string,
    provider: string,
    model: string,
    pageContext?: PageContext
  ): Promise<{
    session_id: string
    turn_id: string
    input_id: string
    duplicate: boolean
  }> {
    return this.request('/api/v2/channels/web/messages', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        session_id: sessionId,
        text: prompt,
        model: { id: model, provider, display_name: model },
        request_context: pageContext ? { page_context: pageContext } : {}
      })
    })
  }

  async synthesizeSpeech(
    sessionId: string,
    text: string,
    signal?: AbortSignal,
    turnId?: string
  ): Promise<Response> {
    const response = await fetch(this.url('/api/v2/speech/synthesize'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, text, turn_id: turnId }),
      signal
    })
    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`
      try {
        const envelope = (await response.json()) as ApiEnvelope<never>
        message = envelope.error?.message || message
      } catch {
        // Audio errors are JSON in normal operation; retain the HTTP fallback otherwise.
      }
      throw new AgentApiError(message, response.status)
    }
    return response
  }

  events(sessionId: string, cursor: number): EventSource {
    const path = `/api/v2/live2d/sessions/${encodeURIComponent(sessionId)}/events?cursor=${cursor}`
    return new EventSource(this.url(path), { withCredentials: true })
  }

  stageEvents(sessionId: string, cursor: number, token: string): EventSource {
    const path = `/api/v2/live2d/stage/${encodeURIComponent(sessionId)}/events?cursor=${cursor}&token=${encodeURIComponent(token)}`
    return new EventSource(this.url(path))
  }

  async stageSnapshot(sessionId: string, token: string): Promise<Live2DSnapshot> {
    return this.request(
      `/api/v2/live2d/stage/${encodeURIComponent(sessionId)}/snapshot?token=${encodeURIComponent(token)}`
    )
  }

  async stageModel(sessionId: string, token: string): Promise<Live2DModelInfo> {
    return this.request(
      `/api/v2/live2d/stage/${encodeURIComponent(sessionId)}/${encodeURIComponent(token)}/model`
    )
  }

  async stageSpeech(
    sessionId: string,
    token: string,
    text: string,
    turnId?: string | null
  ): Promise<Response> {
    const response = await fetch(
      this.url(
        `/api/v2/live2d/stage/${encodeURIComponent(sessionId)}/speech?token=${encodeURIComponent(token)}`
      ),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, turn_id: turnId || null })
      }
    )
    if (!response.ok) throw new AgentApiError(`Stage speech failed: ${response.status}`, response.status)
    return response
  }
}

export interface PageContext {
  href: string
  title: string
  language: string
}
