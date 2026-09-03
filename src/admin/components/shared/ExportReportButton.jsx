import { useState, useRef, useEffect } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import AdminButton from '../ui/AdminButton.jsx'
import { downloadAdminExport } from '../../../lib/adminExport.js'
import { ApiError } from '../../../lib/api.js'

export default function ExportReportButton({ exportType = 'dashboard', size = 'sm', className = '' }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const handleExport = async (format) => {
    setLoading(true)
    setError('')
    setOpen(false)
    try {
      await downloadAdminExport(exportType, format)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <AdminButton size={size} className={className} onClick={() => setOpen((prev) => !prev)} disabled={loading}>
        <Download className="w-4 h-4" />
        {loading ? 'Exporting...' : 'Export Report'}
      </AdminButton>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4" />
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel
          </button>
        </div>
      )}

      {error && (
        <p className="absolute right-0 top-full mt-1 text-xs text-red-500 whitespace-nowrap">{error}</p>
      )}
    </div>
  )
}
