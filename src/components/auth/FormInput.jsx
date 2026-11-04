import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const FormInput = forwardRef(function FormInput(
  { label, error, className = '', icon, type = 'text', ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={className}>
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <div className="relative mt-1">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`w-full px-3 py-2.5 border rounded-btn text-sm outline-none transition-colors
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-secondary'}
            ${props.disabled ? 'bg-slate-50' : ''}`}
          {...props}
          type={inputType}
          ref={ref}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Show password' : 'Hide password'}
          >
            {showPassword ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
})

export default FormInput
