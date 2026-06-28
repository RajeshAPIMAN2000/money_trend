import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { scoreFactors, scoreRanges } from '../../data/products-data.js'
import BlurText from '../react-bits/BlurText.jsx'
import CountUp from '../react-bits/CountUp.jsx'
import FadeInContent from '../react-bits/FadeInContent.jsx'
import ShinyText from '../react-bits/ShinyText.jsx'
import SpotlightCard from '../react-bits/SpotlightCard.jsx'

export const SCORE = 750
export const MAX_SCORE = 900
export const MIN_SCORE = 300

export const checklistItems = [
  'PAN Linked',
  'Credit History',
  'Repayment Behaviour',
  'Credit Utilization',
]

export function getScoreLabel(score) {
  if (score >= 750) return 'Very Good'
  if (score >= 650) return 'Good'
  if (score >= 550) return 'Fair'
  return 'Needs Work'
}

export function ScoreGauge({ score, size = 'md', gradientId = 'civilGaugeGrad', animated = false, showNeedle = true }) {
  const pct = (score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
  const radius = 72
  const cx = 100
  const cy = 88
  const needleAngle = Math.PI - pct * Math.PI
  const needleLen = 52
  const needleX = cx + needleLen * Math.cos(needleAngle)
  const needleY = cy - needleLen * Math.sin(needleAngle)

  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`
  const activeLen = pct * Math.PI * radius
  const totalLen = Math.PI * radius

  const sizeClass = size === 'lg' ? 'w-[220px]' : size === 'sm' ? 'w-[110px]' : 'w-[150px]'
  const scoreText = size === 'lg' ? 'text-[3.25rem]' : size === 'sm' ? 'text-2xl' : 'text-[2.35rem]'
  const labelClass = size === 'lg' ? 'text-white/70' : 'text-slate-500'

  return (
    <div className={`flex flex-col items-center ${sizeClass} shrink-0`}>
      <svg viewBox="0 0 200 96" className="w-full h-auto block" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id={`gaugeGlow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0056D2" floodOpacity="0.12" />
          </filter>
        </defs>
        <path d={arcPath} fill="none" stroke="#EEF2F7" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d={arcPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${totalLen} ${totalLen}`}
          initial={{ strokeDashoffset: totalLen }}
          whileInView={{ strokeDashoffset: totalLen - activeLen }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          filter={`url(#gaugeGlow-${gradientId})`}
        />
        {showNeedle && (
          <motion.circle
            cx={needleX}
            cy={needleY}
            r="5"
            fill="#0F172A"
            stroke="white"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
        )}
      </svg>
      <div className="text-center w-full mt-2">
        <div className={`${scoreText} font-display font-bold leading-none tracking-tight ${size === 'lg' ? 'text-white' : 'text-[#0F172A]'}`}>
          {animated ? (
            <CountUp to={score} duration={1.6} delay={0.3} className="inline-block" />
          ) : (
            score
          )}
        </div>
        <div className={`font-medium mt-1.5 ${size === 'lg' ? 'text-base' : 'text-sm'} ${labelClass}`}>
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={`shrink-0 text-emerald-500 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function CompactCard({ ctaTo = '/products#civil-score' }) {
  return (
    <SpotlightCard
      spotlightColor="rgba(245, 158, 11, 0.22)"
      className="rounded-3xl border-2 border-amber-200/60 bg-gradient-to-br from-white via-amber-50/20 to-slate-50 shadow-[0_20px_50px_rgba(180,83,9,0.15)] h-full flex flex-col group hover:shadow-[0_25px_60px_rgba(180,83,9,0.25)] transition-all duration-300"
    >
      <aside className="relative overflow-hidden h-full flex flex-col">
        {/* Premium gradient top accent */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        {/* Decorative corner elements */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-200/10 to-amber-100/5 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-gradient-to-tr from-amber-300/8 to-transparent blur-3xl" aria-hidden />

        {/* Subtle side accent line */}
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-amber-300/40 to-transparent" aria-hidden />

        <div className="relative p-8 flex flex-col flex-1">
          {/* Score gauge card — top priority */}
          <FadeInContent duration={0.6} y={12} className="flex justify-center mb-7">
            <div className="relative p-7 rounded-2xl bg-gradient-to-br from-white to-amber-50/40 border-2 border-amber-200/40 shadow-[0_8px_24px_rgba(180,83,9,0.08)] group-hover:border-amber-300/60 transition-all duration-300 w-full max-w-[220px]">
              <ScoreGauge score={SCORE} gradientId="civilGaugeGradCompact" animated showNeedle={false} />
              <div className="mt-5 flex justify-center gap-3">
                <div className="text-center px-2">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1.5 bg-red-500" />
                  <div className="text-xs text-slate-500 font-bold">Poor</div>
                </div>
                <div className="text-center px-2">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1.5 bg-amber-500" />
                  <div className="text-xs text-slate-500 font-bold">Fair</div>
                </div>
                <div className="text-center px-2">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1.5 bg-emerald-500" />
                  <div className="text-xs text-slate-500 font-bold">Good</div>
                </div>
              </div>
            </div>
          </FadeInContent>

          {/* Header with premium styling */}
          <FadeInContent delay={0.15} duration={0.5} y={10}>
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex-1">
                <h3 className="font-display font-bold text-[#1F2937] text-xl leading-snug tracking-tight">
                  Check Your{' '}
                  <ShinyText
                    text="Civil Score"
                    color="#D97706"
                    shineColor="#FDE68A"
                    speed={3}
                    spread={100}
                    className="font-display font-bold"
                  />
                </h3>
                <BlurText
                  text="Premium Credit Analysis"
                  delay={80}
                  stepDuration={0.3}
                  className="text-xs text-slate-500 font-semibold mt-1.5 uppercase tracking-widest block"
                />
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4, type: 'spring', stiffness: 260 }}
                className="shrink-0 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-2 border-amber-300/60 shadow-[0_4px_12px_rgba(180,83,9,0.15)]"
              >
                ✨ New
              </motion.span>
            </div>
          </FadeInContent>

          {/* Premium checklist — stacked below score */}
          <ul className="space-y-3.5 mb-8">
            {checklistItems.map((item, idx) => (
              <FadeInContent key={item} delay={0.25 + idx * 0.08} duration={0.45} y={8}>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-100 border border-amber-300/60 shadow-[0_2px_8px_rgba(180,83,9,0.15)] shrink-0 group-hover:scale-110 transition-transform">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-slate-700 leading-tight">{item}</span>
                </li>
              </FadeInContent>
            ))}
          </ul>

          {/* Premium CTA Button */}
          <FadeInContent delay={0.55} duration={0.5} y={10}>
            <Link
              to={ctaTo}
              className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 text-white text-sm font-bold shadow-[0_10px_30px_rgba(180,83,9,0.35)] hover:shadow-[0_15px_40px_rgba(180,83,9,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Check Your Score Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </FadeInContent>

          {/* Trust indicators */}
          <FadeInContent delay={0.65} duration={0.5} y={8}>
            <div className="mt-5 pt-5 border-t-2 border-amber-200/40 flex items-center justify-between">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                <ShinyText
                  text="50K+"
                  color="#D97706"
                  shineColor="#FBBF24"
                  speed={4}
                  spread={90}
                  className="font-bold"
                />{' '}
                <span className="text-slate-500">Users This Month</span>
              </p>
              <span className="text-xs text-slate-400 font-medium">RBI Compliant</span>
            </div>
          </FadeInContent>
        </div>
      </aside>
    </SpotlightCard>
  )
}

function FeaturedSection() {
  return (
    <section id="civil-score" className="scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-[0_30px_80px_rgba(15,23,42,0.6)] border border-slate-700/50">
        {/* Premium decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/15 to-amber-400/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-slate-600/20 to-slate-700/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.08]" />
          {/* Gold accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>

        <div className="relative p-10 md:p-14 lg:p-20">
          {/* Premium Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-400/20 border border-amber-400/50 text-amber-200 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_4px_12px_rgba(217,119,6,0.2)]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
                Premium Feature
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight tracking-tight mb-6">
                Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100">Civil Score</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md font-medium">
                Advanced credit analysis powered by RBI-compliant technology. Understand your financial health instantly with zero impact on your score.
              </p>
            </div>
            
            {/* Premium tags */}
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {['RBI Compliant', 'Zero Cost', 'Instant Report'] .map(tag => (
                <span key={tag} className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-white/12 to-white/5 border border-white/25 text-sm font-bold text-white/85 backdrop-blur-md hover:bg-white/15 hover:border-white/35 transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-[auto_1fr_1fr] gap-12 lg:gap-14 items-start">
            {/* Premium Gauge */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white/[0.12] to-white/[0.05] border border-white/20 backdrop-blur-md shadow-[0_8px_32px_rgba(255,255,255,0.1)] hover:border-white/30 hover:shadow-[0_12px_40px_rgba(255,255,255,0.15)] transition-all duration-300">
                <ScoreGauge score={SCORE} size="lg" gradientId="civilGaugeGradFeatured" showNeedle={false} animated />
                <div className="mt-8 flex justify-center gap-5">
                  <div className="text-center px-3">
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-red-400" />
                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest">Poor</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-amber-400" />
                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest">Fair</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-emerald-400" />
                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest">Good</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" aria-hidden />
                  <h4 className="font-display font-bold text-2xl text-white/95">Verification Checklist</h4>
                </div>
                <ul className="grid sm:grid-cols-2 gap-5">
                  {checklistItems.map((item, idx) => (
                    <li key={item} className="group flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/[0.08] border border-white/15 hover:bg-gradient-to-br hover:from-amber-500/15 hover:to-white/[0.08] hover:border-amber-400/40 transition-all duration-300 cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/30 to-emerald-500/20 border border-emerald-400/40 group-hover:scale-110 group-hover:shadow-[0_8px_16px_rgba(16,185,129,0.3)] transition-all">
                        <CheckIcon className="w-5 h-5" />
                      </span>
                      <span className="text-base font-bold text-white/85 group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Score Breakdown */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" aria-hidden />
                <h4 className="font-display font-bold text-2xl text-white/95">Score Breakdown</h4>
              </div>
              <div className="space-y-6">
                {scoreFactors.map((f, idx) => (
                  <div key={f.label} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-white/80 group-hover:text-white transition-colors">{f.label}</span>
                      <span className="text-sm font-bold text-emerald-300 bg-gradient-to-r from-emerald-500/30 to-emerald-500/20 px-4 py-1.5 rounded-lg border border-emerald-400/30 group-hover:border-emerald-400/60 group-hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all">{f.status}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 transition-all duration-700 shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium CTA Section */}
          <div className="mt-14 pt-12 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-center sm:text-left">
              <p className="text-lg text-white/70 font-medium">
                Join <span className="text-white font-bold text-xl">50,000+</span> users who improved their finances
              </p>
              <p className="text-sm text-white/50 mt-2 font-medium">This month alone</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/kyc"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 text-white font-bold shadow-[0_12px_36px_rgba(217,119,6,0.4)] hover:shadow-[0_16px_48px_rgba(217,119,6,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
              >
                Check My Score Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 hover:border-white/40 text-white font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)]"
              >
                View Sample Report
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CivilScoreChecker({ variant = 'compact', ctaTo }) {
  if (variant === 'featured') return <FeaturedSection />
  return <CompactCard ctaTo={ctaTo} />
}

export { FeaturedSection as CivilScoreFeatured }
