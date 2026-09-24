import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { isEmptyHtml, stripHtml } from '../../../lib/html.js'

export { isEmptyHtml, stripHtml }

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link'],
  ['clean'],
]

/** Lightweight Quill wrapper for admin article heading / description / content. */
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '',
  minHeight = 120,
  className = '',
}) {
  const modules = useMemo(() => ({
    toolbar: TOOLBAR,
    clipboard: { matchVisual: false },
  }), [])

  return (
    <div className={`admin-rich-text rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 ${className}`}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={(html) => onChange?.(html)}
        modules={modules}
        placeholder={placeholder}
        style={{ minHeight }}
      />
      <style>{`
        .admin-rich-text .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
        }
        .admin-rich-text .ql-container.ql-snow {
          border: 0;
          font-size: 0.875rem;
          min-height: ${minHeight}px;
        }
        .admin-rich-text .ql-editor {
          min-height: ${minHeight}px;
        }
        .admin-rich-text .ql-editor.ql-blank::before {
          color: rgb(148 163 184);
          font-style: normal;
        }
        .dark .admin-rich-text .ql-toolbar.ql-snow {
          border-bottom-color: rgb(51 65 85);
          background: rgb(15 23 42);
        }
        .dark .admin-rich-text .ql-stroke { stroke: rgb(203 213 225); }
        .dark .admin-rich-text .ql-fill { fill: rgb(203 213 225); }
        .dark .admin-rich-text .ql-picker { color: rgb(226 232 240); }
        .dark .admin-rich-text .ql-editor { color: rgb(241 245 249); }
      `}</style>
    </div>
  )
}
