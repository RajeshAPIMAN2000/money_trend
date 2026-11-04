/** Remove tags for labels, search text, and empty checks. Never use this on article HTML sent to the API. */
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
  return !stripHtml(html)
}

export function isHtmlContent(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ''))
}

/** Decode GET rows stored as &lt;h2&gt;... until they are saved again. */
export function unescapeApiHtml(value) {
  const s = String(value ?? '')
  if (!s.includes('&lt;') && !s.includes('&amp;lt;')) return s
  return s
    .replace(/&amp;lt;/gi, '<')
    .replace(/&amp;gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
}

/** HTML from GET: description and content are the same stored string. */
export function articleHtmlFromApi(item) {
  if (!item || typeof item !== 'object') return ''
  return restoreStrippedArticleMarkup(unescapeApiHtml(item.description || item.content || item.body || item.html_content || ''))
}

/** Recover paragraph breaks from legacy API rows where angle brackets were stripped. */
export function restoreStrippedArticleMarkup(value) {
  const text = String(value || '').trim()
  if (!text || /<\/?(?:p|h[1-6]|ul|ol|li|strong|em|br)\b/i.test(text)) return text
  if (!/(?:^|\/)\s*(?:p|h[1-6])(?=[A-Z0-9])/m.test(text)) return text

  // Escape original text before inserting a small, known set of safe tags.
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    // Restore heading boundaries first (for example `/p h2Start.../h2`).
    .replace(/\/p\s*h([1-6])(?=[A-Z0-9])/gi, '</p><h$1>')
    .replace(/\/h([1-6])\s*p(?=[A-Z0-9])/gi, '</h$1><p>')
    .replace(/\/h([1-6])\s*h([1-6])(?=[A-Z0-9])/gi, '</h$1><h$2>')
    .replace(/^h([1-6])(?=[A-Z0-9])/gim, '<h$1>')
    .replace(/\/h([1-6])(?=\s|$)/gi, '</h$1>')
    .replace(/\/p\s*p(?=[A-Z0-9])/g, '</p><p>')
    .replace(/^p(?=[A-Z0-9])/gm, '<p>')
    .replace(/\/p\s*$/g, '</p>')
}

/**
 * Light guard before render. The API should store sanitized HTML.
 * This only removes scripts, event handlers, and javascript: URLs.
 * It does not rebuild malformed tag text such as "h2Key Takeaways".
 */
export function sanitizeArticleHtml(html) {
  return String(html || '')
    .replace(/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, ' $1="#"')
}
