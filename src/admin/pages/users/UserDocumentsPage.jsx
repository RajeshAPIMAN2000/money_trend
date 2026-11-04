import { useState } from 'react'
import { Eye } from 'lucide-react'
import PageShell from '../../components/shared/PageShell.jsx'
import DataTable from '../../components/shared/DataTable.jsx'
import AdminModal from '../../components/shared/AdminModal.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminBadge from '../../components/ui/AdminBadge.jsx'
import { documentsData } from '../../data/admin-users-data.js'

export default function UserDocumentsPage() {
  const [preview, setPreview] = useState(null)

  return (
    <PageShell
      title="User Documents"
      breadcrumb={['Home', 'User Management', 'User Documents']}
      description="View and verify user uploaded documents."
      stats={[
        { label: 'Total Documents', value: '1,842' },
        { label: 'Verified', value: '1,620' },
        { label: 'Pending', value: '186' },
        { label: 'Rejected', value: '36' },
      ]}
    >
      <DataTable
        columns={[
          { key: 'name', label: 'User' },
          { key: 'docType', label: 'Document Type' },
          { key: 'uploaded', label: 'Uploaded' },
          { key: 'size', label: 'Size' },
          { key: 'status', label: 'Status' },
        ]}
        rows={documentsData}
        avatarColumn="name"
        statusColumn="status"
        filters={['Verified', 'Pending', 'Rejected']}
        searchPlaceholder="Search documents..."
        actions={(row) => (
          <button type="button" onClick={() => setPreview(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
      <AdminModal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Document Preview"
        description={preview ? `${preview.name} — ${preview.docType}` : ''}
        footer={<AdminButton onClick={() => setPreview(null)}>Close</AdminButton>}
      >
        {preview && (
          <div className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="text-center p-6">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{preview.docType}</p>
              <p className="text-xs text-slate-500 mt-1">{preview.size} • {preview.uploaded}</p>
              <AdminBadge tone={preview.status === 'Verified' ? 'success' : preview.status === 'Pending' ? 'warning' : 'danger'} className="mt-3">{preview.status}</AdminBadge>
            </div>
          </div>
        )}
      </AdminModal>
    </PageShell>
  )
}
