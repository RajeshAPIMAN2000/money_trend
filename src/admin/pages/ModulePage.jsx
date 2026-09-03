import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Eye, Pencil } from 'lucide-react'
import PageShell from '../components/shared/PageShell.jsx'
import DataTable from '../components/shared/DataTable.jsx'
import { ModuleChart } from '../components/shared/ModuleChart.jsx'
import AdminModal, { ModalFooter } from '../components/shared/AdminModal.jsx'
import AdminInput from '../components/ui/AdminInput.jsx'
import { moduleRegistry } from '../data/moduleRegistry.js'
import { useForm } from 'react-hook-form'

export default function ModulePage() {
  const { pathname } = useLocation()
  const slug = pathname.replace('/admin/', '')
  const config = moduleRegistry[slug]
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  if (!config) {
    return (
      <PageShell title="Not Found" breadcrumb={['Home', '404']} showExport={false}>
        <p className="text-slate-500">Page not found.</p>
      </PageShell>
    )
  }

  const onSubmit = () => {
    setTimeout(() => { setModalOpen(false); reset() }, 500)
  }

  return (
    <PageShell
      title={config.title}
      breadcrumb={config.breadcrumb}
      description={config.description}
      stats={config.stats}
      statCols={4}
    >
      {config.chart && config.chart !== 'none' && (
        <div className="mb-6">
          <ModuleChart type={config.chart} />
        </div>
      )}
      <DataTable
        columns={config.columns}
        rows={config.rows}
        statusColumn="status"
        filters={config.filters || ['Active', 'Pending', 'Success']}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
        onAdd={() => setModalOpen(true)}
        addLabel={`Add ${config.title.split(' ')[0]}`}
        actions={() => (
          <>
            <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Eye className="w-4 h-4" /></button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Pencil className="w-4 h-4" /></button>
          </>
        )}
      />
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add ${config.title.split(' ')[0]}`}
        description={`Create a new entry in ${config.title}.`}
        footer={<ModalFooter onCancel={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} loading={isSubmitting} submitLabel="Create" />}
      >
        <form className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Name / Title</label>
            <AdminInput {...register('name', { required: true })} placeholder="Enter name" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
            <AdminInput {...register('description')} placeholder="Optional description" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Status</label>
            <select {...register('status')} className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
              <option>Active</option>
              <option>Pending</option>
              <option>Draft</option>
            </select>
          </div>
        </form>
      </AdminModal>
    </PageShell>
  )
}
