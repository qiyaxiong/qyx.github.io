const sentenceBoundary = /^([\s\S]*?[。！？!?；;\n]+)/
const speakableContent = /[\p{L}\p{N}]/u

function codePointLength(value: string): number {
  return Array.from(value).length
}

function codePointPrefix(value: string, length: number): string {
  return Array.from(value).slice(0, length).join('')
}

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
    while (match || codePointLength(this.buffer) >= this.maxLength) {
      const rawSegment =
        match && codePointLength(match[1]) <= this.maxLength
          ? match[1]
          : codePointPrefix(this.buffer, this.maxLength)
      const segment = rawSegment.trim()
      this.buffer = this.buffer.slice(rawSegment.length)
      if (segment && speakableContent.test(segment)) {
        segments.push(segment)
        this.emitted = true
      }
      match = sentenceBoundary.exec(this.buffer)
    }
    return segments
  }

  finish(fallback = ''): string[] {
    const remainder = this.buffer.trim()
    const segments = remainder && speakableContent.test(remainder)
      ? [remainder]
      : !this.emitted && fallback.trim() && speakableContent.test(fallback)
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
