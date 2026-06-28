const GOLD = '#A68B5B'

const DEFAULT = {
  headline: "India's most trusted platform",
  subline: 'For Fixed Deposits · Recurring Deposits · Mutual Funds',
  footer: 'Zero commission · Full transparency',
}

function LaurelWreath({ className = '', flip = false, small = false }) {
  const leaves = [
    [22, 6, -18], [26, 14, -12], [20, 22, -28], [28, 30, -8],
    [18, 38, -32], [30, 46, -4], [20, 54, -22], [28, 62, -10],
    [22, 70, -16],
  ]
  return (
    <svg
      viewBox="0 0 36 76"
      className={`shrink-0 ${small ? 'w-5 h-10' : 'w-7 h-[3.75rem] md:w-9 md:h-[4.25rem]'} ${flip ? 'scale-x-[-1]' : ''} ${className}`}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18 2 Q18 38 18 74" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      {leaves.map(([cx, cy, rot], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="3.2" ry="6" transform={`rotate(${rot} ${cx} ${cy})`} />
      ))}
    </svg>
  )
}

/**
 * @param {'gold' | 'dark' | 'circular'} variant
 * @param {'left' | 'center' | 'right'} align
 */
export default function TrustedPlatformTagline({
  variant = 'gold',
  align = 'center',
  headline = DEFAULT.headline,
  subline = DEFAULT.subline,
  footer = DEFAULT.footer,
  className = '',
}) {
  if (variant === 'circular') {
    return (
      <div
        className={`relative shrink-0 mx-auto ${className}`}
        style={{ color: GOLD }}
      >
        <div
          className="relative w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] rounded-full bg-white shadow-lift flex flex-col items-center justify-center text-center px-6 py-8 border-2"
          style={{ borderColor: `${GOLD}55` }}
        >
          <LaurelWreath small className="absolute top-3 left-3 opacity-90" />
          <LaurelWreath small flip className="absolute top-3 right-3 opacity-90" />
          <LaurelWreath small className="absolute bottom-5 left-4 opacity-70 rotate-180" />
          <LaurelWreath small flip className="absolute bottom-5 right-4 opacity-70 rotate-180" />

          <p className="font-serif text-[15px] sm:text-base leading-snug tracking-tight font-medium max-w-[11rem] relative z-10">
            {headline}
          </p>
          <p className="mt-2 text-[7px] sm:text-[8px] font-sans font-medium uppercase tracking-[0.18em] leading-relaxed max-w-[10.5rem] relative z-10">
            {subline}
          </p>
          <p className="mt-1.5 text-[7px] sm:text-[8px] font-sans font-semibold uppercase tracking-[0.16em] opacity-90 max-w-[10.5rem] relative z-10">
            {footer}
          </p>
        </div>
        <div
          className="pointer-events-none absolute -inset-1 rounded-full border opacity-30"
          style={{ borderColor: GOLD }}
          aria-hidden
        />
      </div>
    )
  }

  const alignClass =
    align === 'left' ? 'text-left items-start' :
    align === 'right' ? 'text-right items-end' :
    'text-center items-center'

  const rowClass =
    align === 'left' ? 'flex-row' :
    align === 'right' ? 'flex-row-reverse' :
    'flex-row justify-center'

  if (variant === 'dark') {
    return (
      <div className={`flex flex-col ${alignClass} ${className}`}>
        <div className={`flex gap-2 md:gap-3 ${rowClass} ${align === 'center' ? 'justify-center' : ''}`}>
          {align !== 'right' && <LaurelWreath className="opacity-40 text-primary" />}
          <p className="font-serif text-xl md:text-2xl text-primary leading-snug tracking-tight font-medium max-w-xs">
            {headline}
          </p>
          {align !== 'left' && <LaurelWreath flip className="opacity-40 text-primary" />}
        </div>
        <p className={`mt-2 text-[10px] md:text-xs font-sans font-medium uppercase tracking-[0.2em] text-slate-600 max-w-xs ${align === 'right' ? 'ml-auto' : align === 'left' ? '' : 'mx-auto'}`}>
          {subline}
        </p>
        <p className={`mt-1.5 text-[10px] md:text-xs font-sans font-semibold uppercase tracking-[0.18em] text-ink max-w-xs ${align === 'right' ? 'ml-auto' : align === 'left' ? '' : 'mx-auto'}`}>
          {footer}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col ${alignClass} ${className}`}
      style={{ color: GOLD }}
    >
      <div className={`flex gap-2 md:gap-3 ${rowClass} ${align === 'center' ? 'justify-center' : ''}`}>
        <LaurelWreath />
        <p className="font-serif text-xl sm:text-2xl md:text-[1.65rem] leading-tight tracking-tight max-w-[14rem] sm:max-w-xs">
          {headline}
        </p>
        <LaurelWreath flip />
      </div>
      <p className={`mt-3 text-[9px] sm:text-[10px] font-sans font-medium uppercase tracking-[0.22em] sm:tracking-[0.28em] leading-relaxed max-w-[14rem] sm:max-w-xs ${align === 'right' ? 'ml-auto' : align === 'left' ? '' : 'mx-auto'}`}>
        {subline}
      </p>
      <p className={`mt-2 text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-[0.2em] sm:tracking-[0.24em] opacity-90 max-w-[14rem] sm:max-w-xs ${align === 'right' ? 'ml-auto' : align === 'left' ? '' : 'mx-auto'}`}>
        {footer}
      </p>
    </div>
  )
}

export { GOLD as TRUSTED_TAGLINE_GOLD, DEFAULT as TRUSTED_TAGLINE_DEFAULT }
