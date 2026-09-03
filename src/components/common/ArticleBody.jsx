function ArticleBody({ content, excerpt }) {
  if (!content) {
    return <p className="text-lg text-slate-600">{excerpt}</p>
  }

  if (/<[a-z][\s\S]*>/i.test(content)) {
    return (
      <div
        className="prose prose-slate max-w-none space-y-5 text-ink leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="prose prose-slate max-w-none space-y-5 text-ink leading-relaxed">
      {content.split(/\n\n+/).filter(Boolean).map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </div>
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

export { ArticleBody, authorInitials }
