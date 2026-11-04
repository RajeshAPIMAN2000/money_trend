import { isHtmlContent, sanitizeArticleHtml, unescapeApiHtml } from '../../lib/html.js'
import '../../styles/blog-content.css'

function pickHtml(html, content, excerpt) {
  if (isHtmlContent(content)) return content
  if (isHtmlContent(html)) return html
  if (isHtmlContent(excerpt)) return excerpt
  return content || html || excerpt || ''
}

function ArticleBody({ html, content, excerpt, className = '' }) {
  const body = pickHtml(html, content, excerpt)
  const safe = sanitizeArticleHtml(unescapeApiHtml(body))
  if (!safe) return null

  if (!isHtmlContent(safe)) {
    return <div className={`blog-content whitespace-pre-wrap ${className}`}>{safe}</div>
  }

  return (
    <div
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

function authorInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'MT'
}

export { ArticleBody, ArticleBody as ArticlePreview, ArticleBody as BlogContent, authorInitials }
