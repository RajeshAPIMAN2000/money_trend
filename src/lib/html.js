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
  return /pstrong\b|\/pp|\/strong|\/em|\/span|class="ql-|style="color:/i.test(value)
    || /(?:^|\n)\s*br\s*(?:\n|$)/i.test(value)
    || /(?:^|\n)(?:strong|em|h[1-6])[A-Z0-9]/m.test(value)
}

/**
 * Quill markup sometimes arrives without `<` and `>`, for example
 * `pstrong style="color: ..."Title` or `class="ql-align-center"br`.
 * Rebuild real tags so color, alignment, bold and breaks render.
 */
export function restoreStrippedHtmlTags(value) {
  const original = String(value || '')
  if (!looksLikeStrippedHtml(original)) return original

  let html = original

  html = html.replace(/class="(ql-align-[^"]*)"br/gi, '<p class="$1"><br></p>')
  html = html.replace(/class="(ql-align-[^"]*)"(strong|em|span|b|i|u|h[1-6])/gi, '<p class="$1"><$2>')
  html = html.replace(/class="([^"]*)"(strong|em|span|br|b|i|u|h[1-6]|p|li|div)/gi, '<$2 class="$1">')

  html = html.replace(/pstrong\s+style="([^"]*)"/gi, '<p><strong style="$1">')
  html = html.replace(/pstrong\s+class="([^"]*)"/gi, '<p><strong class="$1">')
  html = html.replace(/p(em|span|b|i|u|h[1-6])\s+style="([^"]*)"/gi, '<p><$1 style="$2">')
  html = html.replace(/(^|[\n>])(strong|em|span|h[1-6]|p)\s+style="([^"]*)"/gi, '$1<$2 style="$3">')

  html = html.replace(/(?<!<)\/pp/g, '</p><p>')
  html = html.replace(/(?<!<)\/strong/gi, '</strong>')
  html = html.replace(/(?<!<)\/em(?![a-z])/gi, '</em>')
  html = html.replace(/(?<!<)\/span(?![a-z])/gi, '</span>')
  html = html.replace(/(?<!<)\/h([1-6])/gi, '</h$1>')
  html = html.replace(/(?<!<)\/li(?![a-z])/gi, '</li>')
  html = html.replace(/(?<!<)\/ul(?![a-z])/gi, '</ul>')
  html = html.replace(/(?<!<)\/ol(?![a-z])/gi, '</ol>')
  html = html.replace(/(?<!<)\/br/gi, '<br>')
  html = html.replace(/(?<!<)\/p(?![a-z])/gi, '</p>')

  html = html.replace(/pstrong(?=[A-Z0-9₹•·])/g, '<p><strong>')
  html = html.replace(/(^|[\n>])(strong|em|h[1-6])(?=[A-Z0-9₹•·])/g, '$1<$2>')
  html = html.replace(/(^|[\n\s])(strong|em|h[1-6])(?=[A-Z0-9₹•·])/g, '$1<$2>')

  html = html.replace(/(^|\n)\s*br\s*(?=\n|$)/gi, '$1<br>')
  html = html.replace(/\n{2,}/g, '<br><br>')
  html = html.replace(/\n/g, '<br>')

  return html
}

function stripUnsafeMarkup(html) {
  return String(html || '')
    .replace(/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

/** HTML safe to pass to dangerouslySetInnerHTML. Plain text is returned unchanged. */
export function prepareRichHtml(value) {
  const decoded = decodeHtmlEntities(value)
  if (/<[a-z][\s\S]*>/i.test(decoded)) return stripUnsafeMarkup(decoded)
  return stripUnsafeMarkup(restoreStrippedHtmlTags(decoded))
}
