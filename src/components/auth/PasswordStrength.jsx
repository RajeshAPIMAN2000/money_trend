import { passwordStrength } from '../../lib/validators.js'

const COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-accent']

export default function PasswordStrength({ password }) {
  const { score, label, checks } = passwordStrength(password)
  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? COLORS[score - 1] : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">Strength: <span className="font-medium">{label}</span></p>
      <ul className="text-[11px] text-slate-400 space-y-0.5">
        <li className={checks.length ? 'text-accent' : ''}>✓ At least 8 characters</li>
        <li className={checks.upper ? 'text-accent' : ''}>✓ Uppercase letter</li>
        <li className={checks.lower ? 'text-accent' : ''}>✓ Lowercase letter</li>
        <li className={checks.number ? 'text-accent' : ''}>✓ Number</li>
        <li className={checks.special ? 'text-accent' : ''}>✓ Special character</li>
      </ul>
    </div>
  )
}
