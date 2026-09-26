const TAG_PATTERN = 'blockquote|strong|strike|span|code|h1|h2|h3|h4|h5|h6|em|ul|ol|li|br|hr|pre|div|sub|sup|img|u|b|i|s|p'
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
  return /\/pp|\/strong|\/em|\/span|\/h[1-6]|\/li|\/br/i.test(value)
    || /(?:^|\n)(?:strong|em|h[1-6]|b|i|u)[A-Z0-9]/m.test(value)
    || /(?:strong|span|h[1-6]|p)\s+[a-z-]+=\s*"/i.test(value)
}

/**
 * Stored articles sometimes lose `<` and `>` and arrive as
 * `Title/ppBody strongBold/strong more`. Put the brackets back
 * so headings, bold, italics and paragraphs render.
 */
export function restoreStrippedHtmlTags(value) {
  const original = String(value || '')
  if (!looksLikeStrippedHtml(original)) return original

  let html = original
    .replace(/\/pp/g, '\u0000PP\u0000')
    .replace(/pbr\/p/g, '\u0000BR\u0000')

  html = html.replace(new RegExp(`/(${TAG_PATTERN})(?![a-z])`, 'g'), '</$1>')
  html = html
    .replace(/\u0000PP\u0000/g, '</p><p>')
    .replace(/\u0000BR\u0000/g, '<p><br></p>')

  const openWithAttrs = new RegExp(
    `(^|[\\n>])(${TAG_PATTERN})((?:\\s+[a-zA-Z_:][\\w:.-]*=(?:"[^"]*"|'[^']*'))+)`,
    'g',
  )
  html = html.replace(openWithAttrs, '$1<$2$3>')

  const openBeforeText = new RegExp(
    `(^|[\\n>])(${TAG_PATTERN})(?=[A-Z0-9₹•·])`,
    'g',
  )
  html = html.replace(openBeforeText, '$1<$2>')

  const openAfterSpace = /(^|[\n\s])(blockquote|strong|strike|span|h1|h2|h3|h4|h5|h6|em)(?=[A-Z0-9₹•·])/g
  html = html.replace(openAfterSpace, '$1<$2>')

  if (html.includes('</p>') && !html.trimStart().startsWith('<')) {
    html = `<p>${html}`
  }

  return html
}

/** HTML safe to pass to dangerouslySetInnerHTML. Plain text is returned unchanged. */
export function prepareRichHtml(value) {
  const decoded = decodeHtmlEntities(value)
  const restored = restoreStrippedHtmlTags(decoded)
  return restored
}
