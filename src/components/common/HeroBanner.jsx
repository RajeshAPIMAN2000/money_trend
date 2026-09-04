import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'

const slides = [
  {
    image: '/assets/images/Grow Your Wealth Smarter.png',
    alt: 'Grow Your Wealth Smarter',
    badge: '🚀 New: 9.4% FD rates from Shriram Finance',
    cta: { primary: { to: '/kyc', label: 'Start Investing Free' }, secondary: { to: '/calculators', label: 'Try Calculators' } },
  },
  // Mutual Funds — hidden for now
  // {
  //   image: '/assets/images/Invest with Confidence SIP.png',
  //   alt: 'Invest with Confidence — SIP and mutual funds',
  //   badge: '📈 Top-rated mutual funds',
  //   cta: { primary: { to: '/mutual-funds', label: 'Explore Mutual Funds' }, secondary: { to: '/dashboard', label: 'View Dashboard' } },
  // },
  {
    image: '/assets/images/Secure Returns, Guaranteed.png',
    alt: 'Secure Returns, Guaranteed — FD and RD',
    badge: '🏦 Up to 9.5% p.a. on FDs',
    cta: { primary: { to: '/fd-rd', label: 'Browse FD & RD' }, secondary: { to: '/kyc', label: 'Complete KYC' } },
  },
]

const stats = [
  ['₹500Cr+', 'Assets invested'],
  ['2L+', 'Active users'],
  ['4.9★', 'Play Store rating'],
]

export default function HeroBanner() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((index) => {
    setDirection(index > active ? 1 : -1)
    setActive(index)
  }, [active])

  const next = useCallback(() => {
    setDirection(1)
    setActive((i) => (i + 1) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [paused, next])

  const slide = slides[active]

  return (
    <section
      className="relative overflow-hidden w-full aspect-banner max-h-[691.9px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured highlights"
    >
      {/* Background slides */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.alt}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            aria-hidden={i !== active}
          >
            <img
              src={encodeURI(s.image)}
              alt={s.alt}
              className={`absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-center ${i === active ? 'animate-ken-burns' : ''}`}
              fetchpriority={i === 0 ? 'high' : 'low'}
            />
            {/* Light bottom scrim for CTAs — keeps headline art in the image visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* CTAs & stats over banner (headlines are in the background images) */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-12 md:pb-14 pt-10">
        <div
          key={active}
          className={`${
            direction > 0 ? 'animate-banner-slide-in-right' : 'animate-banner-slide-in-left'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <Badge tone="green" className="mb-4 inline-block shadow-lg animate-banner-3d-in">{slide.badge}</Badge>
            <div className="flex flex-wrap justify-center gap-3 animate-banner-fade-up-delay">
              <Link to={slide.cta.primary.to}>
                <Button size="lg" variant="accent" className="shadow-lift hover:scale-105">{slide.cta.primary.label}</Button>
              </Link>
              <Link to={slide.cta.secondary.to}>
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-primary/30 backdrop-blur-sm hover:bg-white/15 hover:scale-105">
                  {slide.cta.secondary.label}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto w-full">
          {stats.map(([n, l], idx) => (
            <div
              key={l}
              className="group rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-2 py-3 md:px-4 md:py-4 animate-banner-stat-in hover:bg-white/15 transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${idx * 100 + 400}ms` }}
            >
              <div className="text-lg md:text-3xl font-display font-bold text-accent group-hover:scale-110 transition-transform">{n}</div>
              <div className="text-[9px] md:text-sm text-white/70 mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Banner slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? 'w-8 bg-accent' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === active}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          key={`${active}-${paused}`}
          className={`h-full bg-accent origin-left ${paused ? 'animate-none w-full' : 'animate-banner-progress'}`}
        />
      </div>
    </section>
  )
}
