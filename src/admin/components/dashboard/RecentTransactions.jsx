import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'
import AdminAvatar from '../ui/AdminAvatar.jsx'
import { cn } from '../../../lib/utils.js'

export default function RecentTransactions({ data = [] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No recent transactions</p>
        ) : (
          data.map((tx) => (
            <div key={`${tx.user}-${tx.time}-${tx.amount}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <AdminAvatar name={tx.user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{tx.user}</div>
                <div className="text-[11px] text-slate-500 truncate">{tx.action}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{tx.amount}</div>
                <div className="text-[10px] text-slate-400">{tx.time}</div>
              </div>
              <div className={cn('p-1 rounded-full', tx.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500')}>
                {tx.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
