import { motion } from 'motion/react'
import { Calendar } from 'lucide-react'
import AdminTopbar from '../../layout/AdminTopbar.jsx'
import { Card, CardContent } from '../ui/AdminCard.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import ExportReportButton from './ExportReportButton.jsx'

export function StatGrid({ stats, cols = 4 }) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  }[cols] || 'grid-cols-2 md:grid-cols-4'

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              {stat.change && (
                <p className={`text-[10px] font-semibold mt-1 ${stat.up !== false ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default function PageShell({
  title,
  breadcrumb,
  description,
  stats,
  statCols = 4,
  actions,
  children,
  showExport = false,
  exportType,
  dateRangeLabel,
}) {
  return (
    <>
      <AdminTopbar
        title={title}
        breadcrumb={breadcrumb}
        showExport={showExport}
        exportType={exportType}
        dateRangeLabel={dateRangeLabel}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 space-y-6"
      >
        {(description || showExport || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
            <div className="flex items-center gap-2 ml-auto">
              {actions}
              {showExport && exportType && (
                <>
                  {dateRangeLabel && (
                    <AdminButton variant="outline" size="sm" className="hidden sm:inline-flex">
                      <Calendar className="w-4 h-4" /> {dateRangeLabel}
                    </AdminButton>
                  )}
                  <ExportReportButton exportType={exportType} />
                </>
              )}
            </div>
          </div>
        )}
        {stats?.length > 0 && <StatGrid stats={stats} cols={statCols} />}
        {children}
      </motion.div>
    </>
  )
}
