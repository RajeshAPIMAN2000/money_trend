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
  let decoded = String(value ?? '')
  // Some API rows have been HTML-escaped more than once. Decode a few layers
  // so `&amp;nbsp;` and `&amp;lt;p&amp;gt;` reach their intended form.
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decoded
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&copy;/gi, '©')
      .replace(/&reg;/gi, '®')
      .replace(/&trade;/gi, '™')
      .replace(/&euro;/gi, '€')
      .replace(/&pound;/gi, '£')
      .replace(/&yen;/gi, '¥')
      .replace(/&mdash;/gi, '—')
      .replace(/&ndash;/gi, '–')
      .replace(/&hellip;/gi, '…')
    if (next === decoded) break
    decoded = next
  }
  return decoded
}

/** HTML from GET: description and content are the same stored string. */
export function articleHtmlFromApi(item) {
  if (!item || typeof item !== 'object') return ''
  return restoreStrippedArticleMarkup(unescapeApiHtml(item.description || item.content || item.body || item.html_content || ''))
}

/** Recover paragraph breaks from legacy API rows where angle brackets were stripped. */
export function restoreStrippedArticleMarkup(value) {
  const text = unescapeApiHtml(value).trim()
  if (!text || /<\/?(?:p|h[1-6]|ul|ol|li|strong|em|br)\b/i.test(text)) return text
  const hasBlockMarkers = /(?:^|\/)\s*(?:p|h[1-6])(?=[A-Z0-9])/im.test(text)
    || /\/ppbr\b/i.test(text)
  if (!hasBlockMarkers) return text

  // Escape original text before inserting a small, known set of safe tags.
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    // Paragraph + break markers commonly survive as `/ppbr`.
    .replace(/\/ppbr\b/gi, '<br><br>')
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

const ARTICLE_TAGS = new Set([
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'bdi', 'bdo', 'blockquote',
  'br', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'dd', 'del',
  'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'footer',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'img', 'ins', 'kbd',
  'li', 'main', 'mark', 'nav', 'ol', 'p', 'picture', 'pre', 'q', 's', 'samp',
  'section', 'small', 'source', 'span', 'strong', 'sub', 'summary', 'sup', 'track',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul',
  'var', 'video', 'audio', 'wbr', 'canvas', 'map', 'area',
])

const DROP_CONTENT_TAGS = new Set([
  'embed', 'iframe', 'math', 'object', 'script', 'style', 'svg', 'template',
])

const VOID_TAGS = new Set(['area', 'br', 'col', 'hr', 'img', 'input', 'param', 'source', 'track', 'wbr'])

function safeArticleUrl(value) {
  const url = String(value || '').trim()
  if (!url || /[\u0000-\u001f]/.test(url) || url.startsWith('//')) return false
  if (/^(https?:|mailto:|tel:)/i.test(url)) return true
  return !/^[a-z][a-z\d+.-]*:/i.test(url)
}

function safeArticleStyle(value) {
  const allowed = new Set([
    'background-color', 'color', 'font-size', 'font-style', 'font-weight',
    'text-align', 'text-decoration', 'vertical-align', 'width', 'height',
  ])
  return String(value || '').split(';').flatMap((declaration) => {
    const separator = declaration.indexOf(':')
    if (separator < 1) return []
    const property = declaration.slice(0, separator).trim().toLowerCase()
    const content = declaration.slice(separator + 1).trim()
    if (!allowed.has(property) || !content || /url\s*\(|expression\s*\(|[{}<>]/i.test(content)) return []
    if (!/^[#(),.%\w\s+-]+$/.test(content)) return []
    return [`${property}: ${content}`]
  }).join('; ')
}

/** Keep article markup and safe presentation attributes; drop executable page content. */
export function sanitizeArticleHtml(html) {
  const source = String(html || '')
  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
    return source
      .replace(/<\s*(script|style|iframe|object|embed|svg|math|template)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data):[^'"]*\2/gi, ' $1="#"')
  }

  const parsed = new DOMParser().parseFromString(source, 'text/html')
  const output = document.createElement('div')

  const copyNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.nodeValue || ''))
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const tag = node.tagName.toLowerCase()
    if (DROP_CONTENT_TAGS.has(tag)) return
    if (!ARTICLE_TAGS.has(tag)) {
      Array.from(node.childNodes).forEach((child) => copyNode(child, parent))
      return
    }

    const element = document.createElement(tag)
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value
      if (name.startsWith('on') || name === 'srcdoc') continue
      if (name === 'style') {
        const style = safeArticleStyle(value)
        if (style) element.setAttribute('style', style)
        continue
      }
      if (name === 'class') {
        const safeClasses = value.split(/\s+/).filter((token) => /^ql-(?:align-(?:center|right|justify)|indent-\d+)$/.test(token))
        if (safeClasses.length) element.setAttribute('class', safeClasses.join(' '))
        continue
      }
      if (name === 'href' || name === 'src' || name === 'poster') {
        if (safeArticleUrl(value)) element.setAttribute(name, value)
        continue
      }
      if (/^(?:alt|title|lang|dir|role|width|height|colspan|rowspan|scope|datetime|value|cite|start|reversed|controls|loop|muted|preload|open|download|target|shape|coords|kind|label)$/.test(name)
        || name.startsWith('aria-') || name.startsWith('data-')) {
        element.setAttribute(name, value)
      }
    }
    if (tag === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer')
    }
    parent.appendChild(element)
    if (!VOID_TAGS.has(tag)) {
      Array.from(node.childNodes).forEach((child) => copyNode(child, element))
    }
  }

  Array.from(parsed.body.childNodes).forEach((node) => copyNode(node, output))
  return output.innerHTML
}
