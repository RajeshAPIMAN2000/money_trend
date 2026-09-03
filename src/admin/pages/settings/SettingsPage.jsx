import { useForm } from 'react-hook-form'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminInput from '../../components/ui/AdminInput.jsx'
import AdminButton from '../../components/ui/AdminButton.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/AdminCard.jsx'

export default function SettingsPage() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm({
    defaultValues: {
      siteName: 'Money Trend',
      contactEmail: 'support@moneytrend.in',
      phone: '+91 1800-123-4567',
      website: 'https://moneytrend.in',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  })

  return (
    <PageShell
      title="General Settings"
      breadcrumb={['Home', 'Settings', 'General Settings']}
      description="Platform configuration and general settings."
      showExport={false}
      stats={[
        { label: 'Last Saved', value: 'Today' },
        { label: 'Modules', value: '32' },
        { label: 'Integrations', value: '8' },
        { label: 'Version', value: 'v1.0.0' },
      ]}
    >
      <Card className="max-w-3xl">
        <CardHeader><CardTitle>Site Configuration</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(() => {})} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Site Name</label>
                <AdminInput {...register('siteName')} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Contact Email</label>
                <AdminInput {...register('contactEmail')} type="email" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <AdminInput {...register('phone')} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Website URL</label>
                <AdminInput {...register('website')} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Currency</label>
                <select {...register('currency')} className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                  <option>INR</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Timezone</label>
                <select {...register('timezone')} className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
                  <option>Asia/Kolkata</option>
                  <option>UTC</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Logo</label>
              <div className="mt-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-sm text-slate-500">
                Drag & drop logo or click to upload
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AdminButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </AdminButton>
              {isSubmitSuccessful && <span className="text-sm text-emerald-600">Settings saved successfully!</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
