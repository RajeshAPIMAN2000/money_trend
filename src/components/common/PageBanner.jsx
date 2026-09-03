import { Link } from 'react-router-dom'

const ACCENTS = {
  blue: {
    glow: 'from-[#0056D2]/20 to-transparent',
    glow2: 'bg-[#0056D2]/10',
    highlight: 'from-[#60A5FA] to-emerald-400',
    line: 'from-[#0056D2] via-[#60A5FA] to-emerald-500',
  },
  emerald: {
    glow: 'from-emerald-500/20 to-transparent',
    glow2: 'bg-emerald-500/10',
    highlight: 'from-emerald-400 to-teal-300',
    line: 'from-emerald-500 via-teal-400 to-[#0056D2]',
  },
  violet: {
    glow: 'from-violet-500/20 to-transparent',
    glow2: 'bg-violet-500/10',
    highlight: 'from-violet-400 to-indigo-300',
    line: 'from-violet-500 via-indigo-400 to-[#0056D2]',
  },
  amber: {
    glow: 'from-amber-500/20 to-transparent',
    glow2: 'bg-amber-500/10',
    highlight: 'from-amber-400 to-orange-300',
    line: 'from-amber-500 via-orange-400 to-emerald-500',
  },
  gold: {
    glow: 'from-[#A68B5B]/25 to-transparent',
    glow2: 'bg-[#A68B5B]/10',
    highlight: 'from-[#C9A962] to-[#E8D5A3]',
    line: 'from-[#A68B5B] via-[#C9A962] to-emerald-500',
  },
}

function Breadcrumbs({ items }) {
  if (!items?.length) return null
  return (
    <nav className="flex items-center gap-2 text-xs text-white/45 mb-4" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          <span aria-hidden>/</span>
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} className="hover:text-white/80 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-white/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/**
 * Premium page banner — classic MoneyTrend styling with navy gradient, gold accents & glass stats.
 */
export default function PageBanner({
  eyebrow,
  title,
  highlight,
  subtitle,
  image,
  stats = [],
  badges = [],
  breadcrumbs,
  ctas = [],
  variant = 'default',
  accent = 'blue',
  className = '',
}) {
  const theme = ACCENTS[accent] || ACCENTS.blue
  const isCentered = variant === 'centered'
  const isCompact = variant === 'compact'

  return (
    <section
      className={`relative overflow-hidden text-white ${image ? '' : 'bg-gradient-to-br from-[#0B1F3A] via-[#0F2744] to-[#0B1F3A]'} ${className}`}
    >
      {image && (
        <>
          <img
            src={encodeURI(image)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/92 via-[#0B1F3A]/78 to-[#0B1F3A]/55" aria-hidden />
        </>
      )}
      {/* Gold accent line */}
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${theme.line}`} />

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className={`absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br ${theme.glow} blur-3xl`} />
        <div className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full ${theme.glow2} blur-3xl`} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
      </div>

      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 ${isCompact ? 'py-10 md:py-12' : 'py-14 md:py-16 lg:py-18'}`}>
        <div className={`${isCentered ? 'text-center max-w-3xl mx-auto' : 'grid lg:grid-cols-[1fr_auto] gap-10 items-end'}`}>
          {/* Text block */}
          <div className={isCentered ? '' : 'max-w-2xl'}>
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C9A962] mb-3">
                {eyebrow}
              </p>
            )}

            <h1 className={`font-display font-bold tracking-tight leading-[1.1] ${isCompact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-[3.25rem]'}`}>
              {title}{' '}
              {highlight && (
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.highlight}`}>
                  {highlight}
                </span>
              )}
            </h1>

            {subtitle && (
              <p className={`mt-4 text-white/60 leading-relaxed ${isCompact ? 'text-sm md:text-base' : 'text-base md:text-lg'} ${isCentered ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>
                {subtitle}
              </p>
            )}

            {badges.length > 0 && (
              <div className={`mt-5 flex flex-wrap gap-2 ${isCentered ? 'justify-center' : ''}`}>
                {badges.map(b => (
                  <span
                    key={b}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.07] border border-white/10 text-white/75 backdrop-blur-sm"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            {ctas.length > 0 && (
              <div className={`mt-6 flex flex-wrap gap-3 ${isCentered ? 'justify-center' : ''}`}>
                {ctas.map(c => (
                  <Link
                    key={c.label}
                    to={c.to}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      c.variant === 'outline'
                        ? 'bg-white/10 hover:bg-white/15 border border-white/20 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
                    }`}
                  >
                    {c.label}
                    <span aria-hidden>→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className={`grid grid-cols-2 gap-3 ${isCentered ? 'mt-8 max-w-lg mx-auto w-full' : 'lg:min-w-[280px]'}`}>
              {stats.map(([value, label]) => (
                <div
                  key={label}
                  className="group px-4 py-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm hover:bg-white/[0.09] hover:border-white/15 transition-all"
                >
                  <div className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {value}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/50 mt-0.5 font-medium uppercase tracking-wide">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade into page content */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  )
}
