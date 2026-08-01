const sentenceBoundary = /^([\s\S]*?[。！？!?；;\n]+)/

export class SpeechSegmenter {
  private buffer = ''
  private emitted = false
  private readonly maxLength: number

  constructor(maxLength = 120) {
    if (!Number.isInteger(maxLength) || maxLength < 1) {
      throw new RangeError('maxLength must be a positive integer')
    }
    this.maxLength = maxLength
  }

  push(delta: string): string[] {
    this.buffer += delta
    const segments: string[] = []
    let match = sentenceBoundary.exec(this.buffer)
    while (match || this.buffer.length >= this.maxLength) {
      const length = match && match[1].length <= this.maxLength ? match[1].length : this.maxLength
      const segment = this.buffer.slice(0, length).trim()
      this.buffer = this.buffer.slice(length)
      if (segment) {
        segments.push(segment)
        this.emitted = true
      }
      match = sentenceBoundary.exec(this.buffer)
    }
    return segments
  }

  finish(fallback = ''): string[] {
    const remainder = this.buffer.trim()
    const segments = remainder
      ? [remainder]
      : !this.emitted && fallback.trim()
        ? [fallback.trim()]
        : []
    this.buffer = ''
    this.emitted = false
    return segments
  }

  reset(): void {
    this.buffer = ''
    this.emitted = false
  }
}
