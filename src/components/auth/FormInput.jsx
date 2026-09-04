import { forwardRef } from 'react'

const FormInput = forwardRef(function FormInput({ label, error, className = '', icon, ...props }, ref) {
  return (
    <div className={className}>
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <div className="relative mt-1">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        )}
        <input
          className={`w-full px-3 py-2.5 border rounded-btn text-sm outline-none transition-colors
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-secondary'}
            ${props.disabled ? 'bg-slate-50' : ''}`}
          {...props}
          ref={ref}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
})

export default FormInput
