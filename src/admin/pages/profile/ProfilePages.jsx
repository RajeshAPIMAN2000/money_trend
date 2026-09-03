import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import AdminAvatar from '../../components/ui/AdminAvatar.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'

export function ProfilePage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: 'Admin User',
      email: 'admin@moneytrend.in',
      phone: '+91 98765 43210',
      role: 'Super Admin',
      department: 'Operations',
    },
  })

  return (
    <PageShell title="Admin Profile" breadcrumb={['Home', 'Admin Profile']} showExport={false}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <AdminAvatar name="Admin User" size="lg" className="mx-auto" />
            <h3 className="font-display font-bold text-lg mt-4">Admin User</h3>
            <p className="text-sm text-slate-500">Super Admin</p>
            <Link to="/admin/change-password" className="block mt-4">
              <AdminButton variant="outline" size="sm" className="w-full">Change Password</AdminButton>
            </Link>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(() => {})} className="space-y-4">
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
                  <label className="text-xs font-medium text-slate-600">Department</label>
                  <AdminInput {...register('department')} className="mt-1" />
                </div>
              </div>
              <AdminButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Update Profile'}</AdminButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export function ChangePasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm()

  return (
    <PageShell title="Change Password" breadcrumb={['Home', 'Admin Profile', 'Change Password']} showExport={false}>
      <Card className="max-w-md">
        <CardHeader><CardTitle>Update Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(() => {})} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Current Password</label>
              <AdminInput {...register('current', { required: true })} type="password" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">New Password</label>
              <AdminInput {...register('newPassword', { required: true, minLength: 8 })} type="password" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Confirm Password</label>
              <AdminInput {...register('confirm', { required: true })} type="password" className="mt-1" />
            </div>
            <AdminButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Password'}</AdminButton>
            {isSubmitSuccessful && <p className="text-sm text-emerald-600">Password updated successfully!</p>}
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
