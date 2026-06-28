export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-card shadow-lift w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-display font-bold text-lg text-primary">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="p-5 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
