import { Menu, Sun, Moon, Bell, Calendar } from 'lucide-react'
import { useAdmin } from '../context/AdminContext.jsx'
import AdminInput from '../components/ui/AdminInput.jsx'
import AdminButton from '../components/ui/AdminButton.jsx'
import ProfileDropdown from '../components/shared/ProfileDropdown.jsx'
import ExportReportButton from '../components/shared/ExportReportButton.jsx'

export default function AdminTopbar({
  title = 'Dashboard',
  breadcrumb = ['Home', 'Dashboard'],
  dateRangeLabel,
  exportType,
  showExport = false,
}) {
  const { toggleSidebar, setMobileOpen, darkMode, toggleDark } = useAdmin()

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center gap-4 px-4 sm:px-6 h-16">
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) setMobileOpen(true)
            else toggleSidebar()
          }}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:block flex-1 max-w-md">
          <AdminInput icon placeholder="Search anything..." />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            onClick={toggleDark}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            type="button"
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">5</span>
          </button>

          <ProfileDropdown />
        </div>
      </div>

      {/* Page header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">{title}</h1>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            {breadcrumb.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-slate-700 dark:text-slate-300' : ''}>{item}</span>
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {dateRangeLabel && (
            <AdminButton variant="outline" size="sm" className="hidden sm:inline-flex">
              <Calendar className="w-4 h-4" />
              {dateRangeLabel}
            </AdminButton>
          )}
          {showExport && exportType && <ExportReportButton exportType={exportType} />}
        </div>
      </div>
    </header>
  )
}
