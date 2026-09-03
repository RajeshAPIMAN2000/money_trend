import { useEffect, useRef, useState } from 'react'
import AdminModal from '../shared/AdminModal.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import AdminInput from '../ui/AdminInput.jsx'
import { EMPTY_ARTICLE_FORM } from '../../../lib/adminContent.js'

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

export default function ArticleFormModal({
  open,
  onClose,
  title,
  description,
  initialValues = EMPTY_ARTICLE_FORM,
  onSubmit,
  submitting = false,
  error = '',
  resetKey,
}) {
  const [form, setForm] = useState(EMPTY_ARTICLE_FORM)
  const [localError, setLocalError] = useState('')
  const imageFileRef = useRef(null)

  useEffect(() => {
    if (!open) {
      imageFileRef.current = null
      return
    }

    setForm({
      ...EMPTY_ARTICLE_FORM,
      ...initialValues,
      image: imageFileRef.current,
    })
    setLocalError('')
  }, [open, resetKey])

  const update = (key, value) => {
    if (key === 'image') {
      imageFileRef.current = value instanceof File ? value : null
    }
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setLocalError('Title is required')
      return
    }
    setLocalError('')
    onSubmit({
      ...form,
      image: imageFileRef.current ?? form.image,
    })
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      wide
      footer={(
        <>
          <AdminButton variant="outline" onClick={onClose} disabled={submitting}>Cancel</AdminButton>
          <AdminButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </AdminButton>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(localError || error) && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {localError || error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
          <AdminInput
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Article title"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="Short description or summary"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            rows={8}
            placeholder="Full article content"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <AdminInput
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="e.g. Market News"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Image</label>
          {form.existingImage && !form.image && (
            <img
              src={form.existingImage}
              alt="Current"
              className="mb-2 h-24 w-auto rounded-lg border border-slate-200 object-cover"
            />
          )}
          {form.image instanceof File && (
            <p className="text-xs text-emerald-600 mb-2">Selected: {form.image.name}</p>
          )}
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => update('image', e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-slate-400 mt-1">Leave empty to keep the current image when editing.</p>
        </div>
      </form>
    </AdminModal>
  )
}
