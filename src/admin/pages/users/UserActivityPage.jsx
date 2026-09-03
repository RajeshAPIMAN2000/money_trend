import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import { activityData } from '../../data/admin-users-data.js'

export default function UserActivityPage() {
  return (
    <PageShell
      title="User Activity"
      breadcrumb={['Home', 'User Management', 'User Activity']}
      description="Monitor user sessions, logins, and platform activity."
      stats={[
        { label: 'Sessions Today', value: '8,420' },
        { label: 'Avg. Session', value: '6.4 min' },
        { label: 'Page Views', value: '42,180' },
        { label: 'Bounce Rate', value: '24.5%' },
      ]}
    >
      <DataTable
        columns={[
          { key: 'name', label: 'User' },
          { key: 'action', label: 'Action' },
          { key: 'page', label: 'Page' },
          { key: 'device', label: 'Device' },
          { key: 'ip', label: 'IP' },
          { key: 'time', label: 'Time' },
        ]}
        rows={activityData}
        avatarColumn="name"
        searchPlaceholder="Search activity..."
      />
    </PageShell>
  )
}
