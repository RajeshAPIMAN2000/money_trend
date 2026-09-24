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
  return !stripHtml(html)
}

export function isHtmlContent(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ''))
}
