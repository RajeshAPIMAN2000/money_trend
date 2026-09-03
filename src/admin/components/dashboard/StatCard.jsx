import { Users, TrendingUp, Wallet, ShieldCheck, ArrowLeftRight, IndianRupee } from 'lucide-react'
import { cn } from '../../../lib/utils.js'
import { Card, CardContent } from '../ui/AdminCard.jsx'

const iconMap = {
  users: Users,
  investors: TrendingUp,
  investments: Wallet,
  kyc: ShieldCheck,
  transactions: ArrowLeftRight,
  revenue: IndianRupee,
}

const colorMap = {
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
}

export default function StatCard({ label, value, change, up, icon, color }) {
  const Icon = iconMap[icon] || Users
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className={cn('p-2.5 rounded-xl', colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={cn('text-xs font-semibold', up ? 'text-emerald-600' : 'text-red-500')}>
            {change}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          <p className="text-[10px] text-slate-400 mt-1">from last month</p>
        </div>
      </CardContent>
    </Card>
  )
}
