import { cn } from '../../lib/utils.js'

export const LOGO_SRC = '/assets/images/money-trend-logo.png'

const variants = {
  /** Navbar — 85×85 brand mark */
  navbar: 'block h-[85px] w-[85px] object-contain object-left shrink-0',
  /** Footer — larger crop, gold coin visible on dark background */
  footer: 'block h-16 sm:h-20 w-[11rem] sm:w-[12.5rem] object-cover object-[center_20%] shrink-0',
  /** Full logo for auth modals — crop lifts mark so it does not sit low in the box */
  auth: 'block h-28 sm:h-32 w-auto max-w-[min(100%,16rem)] object-contain object-[center_22%] mx-auto',
  /** Compact icon crop */
  icon: 'block h-10 w-10 object-cover object-[center_18%] rounded-full shrink-0',
  md: 'block h-14 w-36 object-cover object-[center_22%]',
  sm: 'block h-12 w-32 object-cover object-[center_22%]',
}

/** Money Trend brand logo */
export default function MoneyTrendLogo({
  variant = 'md',
  size,
  className,
  alt = 'Money Trend — Grow Smart. Live Better.',
  ...props
}) {
  const styleClass = size ? variants[size] || size : variants[variant] || variants.md
  const imageVariant = variants[variant] ? variant : variants[size] ? size : 'md'
  const imageSizes = {
    navbar: '85px',
    footer: '200px',
    auth: '320px',
    icon: '40px',
    md: '144px',
    sm: '128px',
  }

  return (
    <picture className="block shrink-0">
      <source
        type="image/webp"
        srcSet="/assets/optimized/money-trend-logo-v1-128.webp 128w, /assets/optimized/money-trend-logo-v1-256.webp 256w, /assets/optimized/money-trend-logo-v1-384.webp 384w"
        sizes={imageSizes[imageVariant]}
      />
      <img
        src={LOGO_SRC}
        alt={alt}
        width={500}
        height={500}
        className={cn(styleClass, className)}
        draggable={false}
        loading="eager"
        decoding="async"
        {...props}
      />
    </picture>
  )
}
