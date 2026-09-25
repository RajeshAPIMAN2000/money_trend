import { isHtmlContent, prepareRichHtml } from '../../lib/html.js'

const RICH_CLASS = [
  'article-rich max-w-none text-ink leading-relaxed',
  '[&_h1]:text-2xl [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-primary [&_h1]:mb-3 [&_h1]:leading-tight',
  '[&_h2]:text-xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-6 [&_h2]:mb-2',
  '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-5 [&_h3]:mb-2',
  '[&_p]:mb-3 [&_p:last-child]:mb-0',
  '[&_strong]:font-semibold [&_b]:font-semibold',
  '[&_em]:italic [&_u]:underline',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3',
  '[&_li]:my-1',
  '[&_li[data-list=bullet]]:list-disc',
  '[&_a]:text-secondary [&_a]:underline',
  '[&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600',
].join(' ')

function pickRichHtml(content, excerpt) {
  const html = prepareRichHtml(content || '')
  const fallback = prepareRichHtml(excerpt || '')
  const count = (value) => (String(value).match(/<[a-z][^>]*>/gi) || []).length
  if (count(fallback) > count(html)) return fallback
  return html || fallback
}

function ArticleBody({ content, excerpt }) {
  const body = pickRichHtml(content, excerpt)
  if (!body) return null

  if (isHtmlContent(body)) {
    return (
      <div
        className={RICH_CLASS}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    )
  }

  return (
    <div className={RICH_CLASS}>
      {body.split(/\n\n+/).filter(Boolean).map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  )
}

/** Short card preview: formatting applies, tags stay hidden. */
function ArticlePreview({ content, excerpt, className = '' }) {
  const body = pickRichHtml(content, excerpt)
  if (!body) return null
  if (!isHtmlContent(body)) {
    return <p className={className}>{body}</p>
  }
  return (
    <div
      className={`${RICH_CLASS} ${className} [&_h1]:text-base [&_h1]:mb-1 [&_h2]:text-base [&_p]:mb-1`}
      dangerouslySetInnerHTML={{ __html: body }}
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

export { ArticleBody, ArticlePreview, authorInitials }
