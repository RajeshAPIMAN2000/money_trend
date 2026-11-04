const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's',
  'strong', 'sub', 'sup', 'u', 'ul',
])

const DROP_WITH_CONTENT = new Set([
  'embed', 'iframe', 'math', 'noscript', 'object', 'script', 'style',
  'svg', 'template',
])

const BULLET_PATTERN = /^\s*(?:[-*•▪◦‣]|\u2022)\s+(.+?)\s*$/
const NUMBER_PATTERN = /^\s*(?:\d+[.)]|[a-zA-Z][.)])\s+(.+?)\s*$/

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeText(value) {
  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .trim()
}

function normalizeInlineText(value) {
  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\f\v\r\n]+/g, ' ')
}

function isSafeUrl(value, isImage = false) {
  const url = String(value || '').trim()
  if (!url || /[\u0000-\u001f]/.test(url) || url.startsWith('\\')) return false
  if (/^(?:javascript|vbscript|data):/i.test(url)) return false
  if (/^(?:https?:|mailto:)/i.test(url)) return !isImage || /^https?:/i.test(url)
  return !/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('//')
}

function safeHref(value) {
  return isSafeUrl(value) ? String(value).trim() : ''
}

function readHtmlFragment(html) {
  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
    throw new Error('Article formatting is only available in a browser.')
  }

  const parsed = new DOMParser().parseFromString(String(html), 'text/html')
  const output = document.createElement('div')

  const copyNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(normalizeInlineText(node.nodeValue || ''))
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null

    const sourceTag = node.tagName.toLowerCase()
    if (DROP_WITH_CONTENT.has(sourceTag)) return null
    if (!ALLOWED_TAGS.has(sourceTag)) {
      const fragment = document.createDocumentFragment()
      Array.from(node.childNodes).forEach((child) => {
        const copied = copyNode(child)
        if (copied) fragment.appendChild(copied)
      })
      return fragment
    }

    const tag = sourceTag === 'h1' || sourceTag === 'h4' || sourceTag === 'h5' || sourceTag === 'h6'
      ? (sourceTag === 'h1' ? 'h2' : 'h3')
      : sourceTag
    const element = document.createElement(tag)

    if (sourceTag === 'a') {
      const href = safeHref(node.getAttribute('href'))
      if (href) element.setAttribute('href', href)
      const title = node.getAttribute('title')
      if (title) element.setAttribute('title', title.slice(0, 300))
      if (node.getAttribute('target') === '_blank' && href) {
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      }
    } else if (sourceTag === 'img') {
      const src = node.getAttribute('src')
      if (!isSafeUrl(src, true)) return null
      element.setAttribute('src', String(src).trim())
      element.setAttribute('alt', (node.getAttribute('alt') || '').slice(0, 500))
      const title = node.getAttribute('title')
      if (title) element.setAttribute('title', title.slice(0, 300))
      for (const dimension of ['width', 'height']) {
        const value = node.getAttribute(dimension)
        if (/^\d{1,4}$/.test(value || '')) element.setAttribute(dimension, value)
      }
      return element
    } else if (sourceTag === 'li') {
      const listType = node.getAttribute('data-list')
      if (listType === 'bullet' || listType === 'ordered') {
        element.setAttribute('data-list', listType)
      }
    }

    Array.from(node.childNodes).forEach((child) => {
      const copied = copyNode(child)
      if (copied) element.appendChild(copied)
    })
    return element
  }

  Array.from(parsed.body.childNodes).forEach((node) => {
    const copied = copyNode(node)
    if (copied && (copied.nodeType !== Node.TEXT_NODE || copied.nodeValue.trim())) {
      output.appendChild(copied)
    }
  })
  return output
}

function isEmptyBlock(node) {
  return ['p', 'h2', 'h3', 'blockquote'].includes(node.tagName.toLowerCase())
    && !node.textContent.trim()
    && !node.querySelector('img, table')
}

function normalizeLists(root) {
  Array.from(root.querySelectorAll('ol, ul')).forEach((list) => {
    const items = Array.from(list.children).filter((child) => child.tagName.toLowerCase() === 'li')
    if (!items.length) {
      list.remove()
      return
    }
    const replacement = document.createDocumentFragment()
    let group = null
    let groupType = null

    items.forEach((item) => {
      const type = item.getAttribute('data-list')
        || (list.tagName.toLowerCase() === 'ul' ? 'bullet' : 'ordered')
      const nextType = type === 'bullet' ? 'ul' : 'ol'
      if (!group || nextType !== groupType) {
        group = document.createElement(nextType)
        groupType = nextType
        replacement.appendChild(group)
      }
      item.removeAttribute('data-list')
      group.appendChild(item)
    })
    list.replaceWith(replacement)
  })
}

function sanitizeHtmlContent(html) {
  const root = readHtmlFragment(html)
  normalizeLists(root)
  Array.from(root.querySelectorAll('p')).forEach((paragraph) => {
    const nextText = paragraph.nextElementSibling?.textContent || ''
    if (!looksLikeHeading(paragraph.textContent, Boolean(nextText.trim()))) return
    const headingTag = /^(?:\d+\.\d+|section|chapter|part)\b/i.test(paragraph.textContent.trim())
      ? 'h3'
      : 'h2'
    const heading = document.createElement(headingTag)
    while (paragraph.firstChild) heading.appendChild(paragraph.firstChild)
    paragraph.replaceWith(heading)
  })
  Array.from(root.querySelectorAll('*')).forEach((node) => {
    if (isEmptyBlock(node)) node.remove()
  })
  return root.innerHTML.trim()
}

function looksLikeHeading(line, hasFollowingContent) {
  const text = normalizeText(line)
  if (!hasFollowingContent || !text || text.length > 100) return false
  if (/[.!?]$/.test(text) || BULLET_PATTERN.test(text) || NUMBER_PATTERN.test(text)) return false
  const wordCount = text.split(/\s+/).length
  if (wordCount > 12) return false
  const hasSectionMarker = /^(?:section|chapter|part)\s+\d+\b/i.test(text)
    || /^\d+(?:\.\d+)*[.)]?\s+\S/.test(text)
    || /:\s*$/.test(text)
  const isUppercase = /[A-Z]/.test(text) && text === text.toLocaleUpperCase()
  const words = text.split(/\s+/).filter((word) => /^[A-Za-z]/.test(word))
  const titleCase = words.length >= 2
    && words.filter((word) => /^[A-Z]/.test(word)).length / words.length >= 0.7
  return hasSectionMarker || isUppercase || titleCase
}

function formatPlainText(value) {
  const lines = String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map(normalizeText)
  const output = []
  let paragraph = []
  let listItems = []
  let listType = null

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`)
      paragraph = []
    }
  }
  const flushList = () => {
    if (listItems.length) {
      output.push(`<${listType}>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${listType}>`)
      listItems = []
      listType = null
    }
  }
  const flushAll = () => {
    flushParagraph()
    flushList()
  }

  lines.forEach((line, index) => {
    if (!line) {
      flushAll()
      return
    }
    const bullet = line.match(BULLET_PATTERN)
    const number = line.match(NUMBER_PATTERN)
    const item = bullet || number
    if (item) {
      flushParagraph()
      const nextType = bullet ? 'ul' : 'ol'
      if (listType && listType !== nextType) flushList()
      listType = nextType
      listItems.push(item[1])
      return
    }

    flushList()
    const hasFollowingContent = lines.slice(index + 1).some(Boolean)
    if (looksLikeHeading(line, hasFollowingContent)) {
      flushParagraph()
      const headingTag = /^(?:\d+\.\d+|section|chapter|part)\b/i.test(line) ? 'h3' : 'h2'
      output.push(`<${headingTag}>${escapeHtml(line.replace(/^\d+(?:\.\d+)*[.)]?\s*/, ''))}</${headingTag}>`)
      return
    }

    paragraph.push(line)
  })
  flushAll()

  if (!output.length) {
    throw new Error('There is no article text to format.')
  }
  return output.join('')
}

export function formatArticleForTemplate(value) {
  const source = String(value || '')
  if (!source.trim()) throw new Error('Add article content before applying the template.')

  const containsHtml = /<\/?(?:p|h[1-6]|ul|ol|li|div|section|article|br|a|strong|b|em|i|u|img|blockquote|table)\b/i.test(source)
  const formatted = containsHtml ? sanitizeHtmlContent(source) : formatPlainText(source)
  if (!formatted || !formatted.replace(/<[^>]*>/g, '').trim()) {
    throw new Error('No safe article content was found. Your original content was kept.')
  }
  return formatted
}
