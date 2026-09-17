import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, BookOpen, LogOut, Newspaper, Search } from 'lucide-react'
import PageShell from '../components/shared/PageShell.jsx'
import AdminButton from '../components/ui/AdminButton.jsx'
import { Card, CardContent } from '../components/ui/AdminCard.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import {
  adminDisplayName,
  adminRoleSummary,
  getAssignedSubAdminModules,
} from '../data/admin-roles.js'

const ICONS = {
  seo: Search,
  blogs: BookOpen,
  news: Newspaper,
}

/**
 * Dashboard for sub-admins: only assigned role modules + logout.
 */
export default function SubAdminDashboard() {
  const { adminUser, logout } = useAdmin()
  const navigate = useNavigate()
  const modules = getAssignedSubAdminModules(adminUser)
  const name = adminDisplayName(adminUser)
  const roleText = adminRoleSummary(adminUser)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <PageShell
      title="Dashboard"
      breadcrumb={['Home', 'Dashboard']}
      showExport={false}
      description={`Signed in as ${name} · ${roleText}`}
    >
      <Card className="mb-5">
        <CardContent className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5">
              {name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Your assigned modules: {roleText}</p>
          </div>
          <AdminButton type="button" variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </AdminButton>
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-600">
              No modules are assigned to your account yet. Ask a Super Admin to grant SEO, Blog, or News access.
            </p>
            <AdminButton type="button" className="mt-4" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </AdminButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => {
            const Icon = ICONS[mod.id] || ArrowUpRight
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={mod.path} className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="mt-4 font-display font-bold text-slate-900 dark:text-white">
                        {mod.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.description}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-4">Open module →</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
