import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent } from '../../components/ui/AdminCard.jsx'

export default function AddUserPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  return (
    <PageShell
      title="Add User"
      breadcrumb={['Home', 'User Management', 'Users', 'Add User']}
      showExport={false}
    >
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(() => navigate('/admin/users'))} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Full Name</label>
                <AdminInput {...register('name', { required: true })} placeholder="Rajesh Kumar" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Email</label>
                <AdminInput {...register('email', { required: true })} type="email" placeholder="user@email.com" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <AdminInput {...register('phone', { required: true })} placeholder="+91 98765 43210" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select {...register('status')} className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <AdminButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create User'}</AdminButton>
              <Link to="/admin/users"><AdminButton variant="outline" type="button">Cancel</AdminButton></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
