import { Link, useParams } from 'react-router-dom'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminAvatar from '../../components/ui/AdminAvatar.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'
import { useAdminUser, useAdminUserGoals } from '../../hooks/useAdminUsers.js'
import { goalIconSrc } from '../../../lib/brandAssets.js'
import { Pencil } from 'lucide-react'

const kycTone = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
}

function GoalsSection({ userId, embeddedGoals = [] }) {
  const { data: fetchedGoals, isLoading, error } = useAdminUserGoals(userId)
  const goals = (fetchedGoals?.length ? fetchedGoals : embeddedGoals) ?? []

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>User Goals</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-slate-500 py-4 text-center">Loading goals…</p>
        )}
        {!isLoading && error && !(goals.length) && (
          <p className="text-sm text-slate-500 py-4 text-center">
            {error.message || 'Unable to load goals for this user.'}
          </p>
        )}
        {!isLoading && goals.length === 0 && (
          <p className="text-sm text-slate-500 py-4 text-center">
            This user has not set any goals yet.
          </p>
        )}
        {goals.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {goals.map((g) => {
              const icon = g.iconSrc || goalIconSrc(g.name)
              const pct = Math.min(100, Math.max(0, Number(g.pct) || 0))
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 grid place-items-center overflow-hidden shrink-0">
                      {icon ? (
                        <img src={icon} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-lg">{g.icon || '🎯'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{g.name}</h4>
                        <AdminBadge tone={pct >= 80 ? 'success' : pct >= 40 ? 'warning' : 'info'}>
                          {pct}%
                        </AdminBadge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Investing for: {g.goalTypeLabel || 'Goal'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {g.remainingTimeLabel || '—'}
                        {g.targetDateLabel ? ` · target ${g.targetDateLabel}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span><strong>{g.savedDisplay}</strong> invested</span>
                    <span>of {g.targetDisplay}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {g.sip != null && (
                    <p className="text-xs text-slate-500">
                      Monthly SIP: ₹{Number(g.sip).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
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
            {(user.kyc.panImage || user.kyc.aadhaarImage) && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {user.kyc.panImage && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">PAN image</p>
                    <img src={user.kyc.panImage} alt="PAN" className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-white" />
                  </div>
                )}
                {user.kyc.aadhaarImage && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Aadhaar image</p>
                    <img src={user.kyc.aadhaarImage} alt="Aadhaar" className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-white" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader><CardTitle>Nominee</CardTitle></CardHeader>
        <CardContent>
          {user.nominee?.added ? (
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {[
                ['Name', user.nominee.name],
                ['Relationship', user.nominee.relationship],
                ['Date of birth', user.nominee.dob],
                ['Mobile', user.nominee.phone],
                ['Email', user.nominee.email],
                ['Allocation %', user.nominee.allocationPercent],
                ['PAN', user.nominee.panNumber],
                ['Aadhaar', user.nominee.aadhaarNumber],
                ['Address', user.nominee.address],
                ...(user.nominee.isMinor || user.nominee.guardianName
                  ? [
                    ['Guardian', user.nominee.guardianName],
                    ['Guardian relationship', user.nominee.guardianRelationship],
                  ]
                  : []),
              ].map(([label, val]) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{val || '—'}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              {user.nominee?.message || 'Nominee not added'}
            </p>
          )}
        </CardContent>
      </Card>

      <GoalsSection userId={id} embeddedGoals={user.goals} />
    </PageShell>
  )
}
