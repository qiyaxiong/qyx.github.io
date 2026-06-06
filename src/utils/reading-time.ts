// CJK character ranges
const CJK_RANGES = [
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0x3400, 0x4dbf], // CJK Extension A
  [0x20000, 0x2a6df], // CJK Extension B
  [0x2a700, 0x2b73f], // CJK Extension C
  [0x2b740, 0x2b81f], // CJK Extension D
  [0x2b820, 0x2ceaf], // CJK Extension E
  [0xf900, 0xfaff], // CJK Compatibility Ideographs
  [0x2f800, 0x2fa1f] // CJK Compatibility Ideographs Supplement
]

// CJK punctuation ranges
const CJK_PUNCTUATION = /[\u3000-\u303F\uff00-\uffef]/

interface ReadingTimeResult {
  text: string
  minutes: number
  time: number
  words: number
}

function isCJK(char: string): boolean {
  const code = char.charCodeAt(0)
  return CJK_RANGES.some(([start, end]) => code >= start && code <= end)
}

function toReadableText(text: unknown): string {
  return typeof text === 'string' ? text : ''
}

function countWords(text: unknown = ''): number {
  const content = toReadableText(text)
  let words = 0
  let inWord = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (isCJK(char)) {
      // Each CJK character counts as a word
      words++
      // Skip following CJK punctuation
      while (i + 1 < content.length && CJK_PUNCTUATION.test(content[i + 1])) {
        i++
      }
      inWord = false
    } else if (/\S/.test(char)) {
      // Non-whitespace character in non-CJK text
      if (!inWord) {
        words++
        inWord = true
      }
    } else {
      // Whitespace character
      if (inWord && i + 1 < content.length && /\S/.test(content[i + 1])) {
        // If next character is non-whitespace, count as new word
        inWord = false
      }
    }
  }

  return words
}

export function getReadingTime(
  text: unknown,
  wordsPerMinute: number = 200
): ReadingTimeResult {
  const words = countWords(text)
  const minutes = words / wordsPerMinute
  const time = Math.round(minutes * 60 * 1000)
  const displayed = Math.ceil(minutes)

  return {
    text: `${displayed} min read`,
    minutes,
    time,
    words
  }
}

export default getReadingTime
