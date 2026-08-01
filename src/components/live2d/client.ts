export interface Live2DModelInfo {
  id: string
  name: string
  manifest_url: string
  expressions: string[]
  motion_groups: Record<string, number>
}

export interface Live2DSnapshot {
  sequence: number
  state: string
  expression: string | null
  motion_group: string | null
  motion_index: number | null
  parameters: Record<string, number>
  speech_text: string
}

export interface Live2DEvent {
  sequence: number
  type: string
  data: Record<string, unknown>
}

const live2dEventTypes = new Set([
  'live2d.state.changed',
  'live2d.command',
  'live2d.speech.delta',
  'live2d.speech.completed',
  'live2d.error'
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
    const allowed = new Set(['state', 'expression', 'motion_group', 'motion_index', 'parameters'])
    if (
      Object.keys(data).some((key) => !allowed.has(key)) ||
      !['state', 'expression', 'motion_group', 'parameters'].some((key) => key in data) ||
      (data.state !== undefined &&
        (typeof data.state !== 'string' || !live2dStates.has(data.state))) ||
      (data.expression !== undefined && typeof data.expression !== 'string') ||
      (data.motion_group !== undefined && typeof data.motion_group !== 'string') ||
      (data.motion_index !== undefined &&
        (!Number.isInteger(data.motion_index) || (data.motion_index as number) < 0)) ||
      (data.motion_index !== undefined && data.motion_group === undefined) ||
      (data.parameters !== undefined &&
        (!isRecord(data.parameters) ||
          Object.values(data.parameters).some((entry) => typeof entry !== 'number')))
    ) {
      throw new Error('Invalid payload for live2d.command')
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
    return this.request('/api/v1/live2d/model')
  }

  async snapshot(sessionId: string): Promise<Live2DSnapshot> {
    return this.request(`/api/v1/live2d/sessions/${encodeURIComponent(sessionId)}/snapshot`)
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
        return await this.request(`/api/v1/sessions/${encodeURIComponent(existing)}`)
      } catch (error) {
        if (!(error instanceof AgentApiError) || ![401, 403, 404].includes(error.status))
          throw error
        storage.removeItem(storageKey)
      }
    }
    const session = await this.request<AgentSession>('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ metadata: { client: 'astro-blog-live2d' } })
    })
    storage.setItem(storageKey, session.id)
    return session
  }

  async run(
    sessionId: string,
    prompt: string,
    provider: string,
    model: string
  ): Promise<{ id: string }> {
    return this.request('/api/v1/runs', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        session_id: sessionId,
        prompt,
        model: { id: model, provider, display_name: model }
      })
    })
  }

  events(sessionId: string, cursor: number): EventSource {
    const path = `/api/v1/live2d/sessions/${encodeURIComponent(sessionId)}/events?cursor=${cursor}`
    return new EventSource(this.url(path), { withCredentials: true })
  }
}
