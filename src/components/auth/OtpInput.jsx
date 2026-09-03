import { useRef, useEffect, useState } from 'react'

export default function OtpInput({ length = 6, value, onChange, disabled }) {
  const inputs = useRef([])
  const [digits, setDigits] = useState(() => Array(length).fill(''))

  useEffect(() => {
    if (value === '') setDigits(Array(length).fill(''))
  }, [value, length])

  const update = (next) => {
    setDigits(next)
    onChange(next.join(''))
  }

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[idx] = val
    update(next)
    if (val && idx < length - 1) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = Array(length).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    update(next)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-semibold border border-slate-300 rounded-btn focus:border-secondary focus:outline-none disabled:bg-slate-50"
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}
