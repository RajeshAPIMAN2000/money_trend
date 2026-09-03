import { useState, useEffect, useCallback } from 'react'

export function useOtpCountdown(active, defaultDuration = 600) {
  const [seconds, setSeconds] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)

  const start = useCallback((duration = defaultDuration) => {
    setSeconds(duration)
    setResendCooldown(60)
  }, [defaultDuration])

  useEffect(() => {
    if (!active) {
      setSeconds(0)
      setResendCooldown(0)
      return undefined
    }
    if (seconds <= 0) return undefined
    const id = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [active, seconds])

  useEffect(() => {
    if (!active || resendCooldown <= 0) return undefined
    const id = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [active, resendCooldown])

  return {
    seconds,
    resendCooldown,
    start,
    expired: active && seconds === 0,
    running: seconds > 0,
  }
}
