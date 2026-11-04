import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent } from '../../components/ui/AdminCard.jsx'
import { usersData } from '../../data/admin-users-data.js'

export default function EditUserPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = usersData.find(u => u.id === id) || usersData[0]
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user.name, email: user.email, phone: user.phone, status: user.status },
  })

  return (
    <PageShell title="Edit User" breadcrumb={['Home', 'User Management', 'Users', 'Edit']} showExport={false}>
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(() => navigate(`/admin/users/${id}`))} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Full Name</label>
                <AdminInput {...register('name')} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Email</label>
                <AdminInput {...register('email')} type="email" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <AdminInput {...register('phone')} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select {...register('status')} className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <AdminButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</AdminButton>
              <Link to={`/admin/users/${id}`}><AdminButton variant="outline" type="button">Cancel</AdminButton></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
