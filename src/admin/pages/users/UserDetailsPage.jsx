import { Link, useParams } from 'react-router-dom'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminAvatar from '../../components/ui/AdminAvatar.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'
import { useAdminUser } from '../../hooks/useAdminUsers.js'
import { Pencil } from 'lucide-react'

const kycTone = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
}

export default function UserDetailsPage() {
  const { id } = useParams()
  const { data: user, isLoading, error } = useAdminUser(id)

  if (isLoading) {
    return (
      <PageShell title="User Details" breadcrumb={['Home', 'User Management', 'Users']} showExport={false}>
        <div className="p-8 text-center text-slate-500">Loading user details...</div>
      </PageShell>
    )
  }

  if (error || !user) {
    return (
      <PageShell title="User Details" breadcrumb={['Home', 'User Management', 'Users']} showExport={false}>
        <div className="p-8 text-center text-red-500">{error?.message || 'User not found'}</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="User Details"
      breadcrumb={['Home', 'User Management', 'Users', user.name]}
      showExport={false}
      actions={
        <Link to={`/admin/users/${id}/edit`}>
          <AdminButton size="sm"><Pencil className="w-4 h-4" /> Edit User</AdminButton>
        </Link>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <AdminAvatar name={user.name} size="lg" className="mx-auto" />
            <h3 className="text-lg font-display font-bold mt-4 text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex justify-center gap-2 mt-3">
              <AdminBadge tone="success">Active</AdminBadge>
              <AdminBadge tone={kycTone[user.kycStatusLabel] || 'default'}>{user.kycStatusLabel}</AdminBadge>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Phone', user.phone],
                ['Joined', user.joined],
                ['KYC Method', user.kycMethodLabel],
                ['KYC Status', user.kycStatusLabel],
                ['CIBIL Score', user.creditScoreLabel],
                ['Credit Band', user.creditBand],
                ['Credit Provider', user.creditProvider],
                ['Credit Checked', user.creditCheckedAt],
                ['Role', user.role],
                ['Last Updated', user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'],
              ].map(([label, val]) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{val}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2 mt-6">
              {/* User Activity and User Documents are temporarily disabled */}
              <Link to={`/admin/kyc/${user.id}`}><AdminButton variant="outline" size="sm">KYC Review</AdminButton></Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.kyc?.submitted && (
        <Card className="mt-6">
          <CardHeader><CardTitle>KYC Summary</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {[
                ['PAN Number', user.kyc.panNumber],
                ['Name on PAN', user.kyc.panFullName],
                ['Aadhaar Number', user.kyc.aadhaarNumber],
                ['Submitted On', user.kyc.createdAt ? new Date(user.kyc.createdAt).toLocaleString() : '—'],
              ].map(([label, val]) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{val || '—'}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
