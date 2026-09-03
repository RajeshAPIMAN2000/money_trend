import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import AdminButton from '../ui/AdminButton.jsx'

export default function AdminModal({ open, onClose, title, description, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800`}
          >
            <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">{title}</h2>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
              </div>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function ModalFooter({ onCancel, onSubmit, submitLabel = 'Save', loading }) {
  return (
    <>
      <AdminButton variant="outline" onClick={onCancel}>Cancel</AdminButton>
      <AdminButton onClick={onSubmit} disabled={loading}>{loading ? 'Saving...' : submitLabel}</AdminButton>
    </>
  )
}
