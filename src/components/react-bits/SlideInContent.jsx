import { motion } from 'motion/react'

const DIRECTIONS = {
  up: { y: 32, x: 0 },
  down: { y: -32, x: 0 },
  left: { y: 0, x: -48 },
  right: { y: 0, x: 48 },
}

export default function SlideInContent({
  children,
  delay = 0,
  duration = 0.65,
  direction = 'up',
  distance,
  className = '',
  once = true,
}) {
  const offset = DIRECTIONS[direction] ?? DIRECTIONS.up
  const initialY = distance && (direction === 'up' || direction === 'down') ? (direction === 'up' ? distance : -distance) : offset.y
  const initialX = distance && (direction === 'left' || direction === 'right') ? (direction === 'left' ? -distance : distance) : offset.x

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: initialY, x: initialX }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
