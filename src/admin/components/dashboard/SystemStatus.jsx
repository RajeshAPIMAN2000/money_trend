import { Card, CardContent, CardHeader, CardTitle } from '../ui/AdminCard.jsx'
import AdminBadge from '../ui/AdminBadge.jsx'

function statusTone(status) {
  const value = String(status).toLowerCase()
  if (value.includes('operational') || value.includes('active')) return 'success'
  if (value.includes('degraded') || value.includes('warning')) return 'warning'
  if (value.includes('down') || value.includes('error')) return 'danger'
  return 'default'
}

export default function SystemStatus({ data = [] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No system status data available</p>
        ) : (
          data.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
              <AdminBadge tone={statusTone(item.status)}>{item.status}</AdminBadge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
