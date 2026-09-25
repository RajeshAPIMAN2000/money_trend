/** Longest tag names first so "strong" wins over "s". */
const TAG_NAMES = [
  'blockquote', 'strong', 'strike', 'span', 'code',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'em', 'ul', 'ol', 'li', 'br', 'hr', 'pre', 'div',
  'sub', 'sup', 'img', 'a', 'u', 'b', 'i', 's', 'p',
]

/** Strip HTML tags for plain-text display / validation */
export function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isEmptyHtml(html) {
  return !stripHtml(prepareRichHtml(html))
}

export function isHtmlContent(value) {
  return /<[a-z][\s\S]*>/i.test(String(prepareRichHtml(value) || ''))
}

/** Turn `&lt;h1&gt;` (and double-escaped) into real tags. */
export function decodeHtmlEntities(value) {
  let s = String(value || '')
  for (let i = 0; i < 3; i += 1) {
    const next = s
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;|&apos;/gi, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    if (next === s) break
    s = next
  }
  return s
}

function looksLikeStrippedHtml(value) {
  if (/<[a-z/!]/i.test(value)) return false
  return /\/(?:strong|span|em|li|h[1-6]|p)(?![a-z])/i.test(value)
    || /(?:h[1-6]|strong|span|p|div)\s+[a-z-]+=\s*"/i.test(value)
}

/**
 * Some stored descriptions lost `<` and `>` and show as
 * `h1strong style="..."Text/strong/h1pbr/p`. Put the brackets back
 * so the browser can render headings, bold, and paragraphs.
 */
export function restoreStrippedHtmlTags(value) {
  const s = String(value || '')
  if (!looksLikeStrippedHtml(s)) return s

  let i = 0
  let out = ''
  while (i < s.length) {
    const matched = matchStrippedTag(s, i)
    if (matched) {
      out += matched.close ? `</${matched.name}>` : `<${matched.name}${matched.attrs}>`
      i = matched.end
      continue
    }
    out += s[i]
    i += 1
  }
  return out
}

function matchStrippedTag(s, index, depth = 0) {
  if (depth > 12) return null
  const close = s[index] === '/'
  const start = close ? index + 1 : index
  if (start >= s.length) return null
  const lower = s.slice(start).toLowerCase()
  const name = TAG_NAMES.find((tag) => lower.startsWith(tag))
  if (!name) return null

  let end = start + name.length
  let attrs = ''
  if (!close) {
    while (s[end] === ' ') {
      const attr = s.slice(end).match(/^\s+[a-zA-Z_:][\w:.-]*=(?:"[^"]*"|'[^']*')/)
      if (!attr) break
      attrs += attr[0]
      end += attr[0].length
    }
  }

  const next = s[end] || ''
  const nextIsLetter = /[a-z0-9]/i.test(next)

  if (!attrs) {
    const followingIsTag = matchStrippedTag(s, end, depth + 1)
    if (!followingIsTag) {
      // Closing tags like `/strong` are safe when they are not the start of a word.
      if (!(close && !nextIsLetter)) return null
    }
  }

  return { name, attrs, end, close }
}

/** HTML safe to pass to dangerouslySetInnerHTML. Plain text is returned unchanged. */
export function prepareRichHtml(value) {
  const decoded = decodeHtmlEntities(value)
  const restored = restoreStrippedHtmlTags(decoded)
  return restored
}
