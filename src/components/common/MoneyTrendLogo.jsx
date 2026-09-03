import { cn } from '../../lib/utils.js'
import logoImg from '../../assets/images/money-trend-logo.png'

export const LOGO_SRC = logoImg

const variants = {
  /** Navbar — full logo scaled to header height with breathing room */
  navbar: 'block h-9 sm:h-10 w-auto max-w-[9rem] sm:max-w-[10.5rem] object-contain object-left shrink-0',
  /** Footer — larger crop, gold coin visible on dark background */
  footer: 'block h-16 sm:h-20 w-[11rem] sm:w-[12.5rem] object-cover object-[center_20%] shrink-0',
  /** Full logo for auth modals */
  auth: 'block h-36 sm:h-44 w-auto max-w-[min(100%,20rem)] object-contain mx-auto',
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

  return (
    <img
      src={logoImg}
      alt={alt}
      width={168}
      height={40}
      className={cn(styleClass, className)}
      draggable={false}
      loading="eager"
      decoding="async"
      {...props}
    />
  )
}
