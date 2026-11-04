import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { isEmptyHtml, stripHtml } from '../../../lib/html.js'
import { formatArticleForTemplate } from './articleTemplate.js'

export { isEmptyHtml, stripHtml }

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link'],
  ['clean'],
  ['onPageTemplate', 'undoTemplate'],
]

const FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'indent',
  'link', 'image',
]

/** Lightweight Quill wrapper for admin article heading / description / content. */
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '',
  minHeight = 120,
  className = '',
}) {
  const editorRef = useRef(null)
  const valueRef = useRef(value || '')
  const previousHtmlRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const applyTemplateRef = useRef(null)
  const undoTemplateRef = useRef(null)
  const [previousHtml, setPreviousHtml] = useState(null)
  const [templateMessage, setTemplateMessage] = useState(null)

  valueRef.current = value || ''
  onChangeRef.current = onChange

  const applyTemplate = useCallback((quill) => {
    const original = quill?.root?.innerHTML ?? valueRef.current
    try {
      const formatted = formatArticleForTemplate(original)
      if (formatted === original) {
        setTemplateMessage({ type: 'success', text: 'Content is already using the on-page format.' })
        return
      }
      previousHtmlRef.current = original
      setPreviousHtml(original)
      onChangeRef.current?.(formatted)
      setTemplateMessage({ type: 'success', text: 'On-page formatting applied. Review the content before saving.' })
    } catch (error) {
      setTemplateMessage({
        type: 'error',
        text: error.message || 'Could not format this content. Your original content was kept.',
      })
    }
  }, [])

  const undoTemplate = useCallback(() => {
    if (previousHtml == null) return
    previousHtmlRef.current = null
    onChangeRef.current?.(previousHtml)
    valueRef.current = previousHtml
    setPreviousHtml(null)
    setTemplateMessage({ type: 'success', text: 'Formatting changes undone.' })
  }, [previousHtml])

  applyTemplateRef.current = applyTemplate
  undoTemplateRef.current = undoTemplate

  const modules = useMemo(() => ({
    toolbar: {
      container: TOOLBAR,
      handlers: {
        onPageTemplate() {
          applyTemplateRef.current?.(this.quill)
        },
        undoTemplate() {
          undoTemplateRef.current?.()
        },
      },
    },
    clipboard: { matchVisual: false },
  }), [])

  useEffect(() => {
    const toolbar = editorRef.current?.getEditor()?.getModule('toolbar')?.container
    if (!toolbar) return
    const formatButton = toolbar.querySelector('.ql-onPageTemplate')
    const undoButton = toolbar.querySelector('.ql-undoTemplate')
    if (formatButton) {
      formatButton.setAttribute('type', 'button')
      formatButton.setAttribute('aria-label', 'On-page Template')
      formatButton.setAttribute('title', 'Format the current article')
    }
    if (undoButton) {
      undoButton.setAttribute('type', 'button')
      undoButton.setAttribute('aria-label', 'Undo on-page formatting')
      undoButton.setAttribute('title', 'Undo the last on-page formatting')
      undoButton.disabled = previousHtml == null
    }
  }, [previousHtml, modules])

  useEffect(() => {
    if (!templateMessage) return undefined
    const timeout = window.setTimeout(() => setTemplateMessage(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [templateMessage])

  return (
    <div className={`admin-rich-text rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 ${className}`}>
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value || ''}
        onChange={(html, _delta, source) => {
          if (source === 'user' && previousHtmlRef.current != null) {
            previousHtmlRef.current = null
            setPreviousHtml(null)
          }
          valueRef.current = html
          onChangeRef.current?.(html)
        }}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        style={{ minHeight }}
      />
      <style>{`
        .admin-rich-text .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        }
        .admin-rich-text .ql-container.ql-snow {
          border: 0;
          font-size: 0.875rem;
          min-height: ${minHeight}px;
        }
        .admin-rich-text .ql-editor {
          min-height: ${minHeight}px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        .admin-rich-text .ql-editor p { margin: 0 0 0.9em; }
        .admin-rich-text .ql-editor h2,
        .admin-rich-text .ql-editor h3 {
          font-weight: 700;
          line-height: 1.3;
          margin: 1.25em 0 0.5em;
        }
        .admin-rich-text .ql-editor h2 { font-size: 1.35em; }
        .admin-rich-text .ql-editor h3 { font-size: 1.15em; }
        .admin-rich-text .ql-editor ul,
        .admin-rich-text .ql-editor ol {
          margin: 0 0 0.9em;
          padding-left: 1.5em;
        }
        .admin-rich-text .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .admin-rich-text .ql-editor.ql-blank::before {
          color: rgb(148 163 184);
          font-style: normal;
        }
        .admin-rich-text .ql-toolbar .ql-onPageTemplate,
        .admin-rich-text .ql-toolbar .ql-undoTemplate {
          width: auto;
          padding: 0 8px;
          border: 1px solid rgb(203 213 225);
          border-radius: 6px;
          margin: 2px 4px 2px 0;
          color: rgb(51 65 85);
          font-size: 12px;
          font-weight: 600;
        }
        .admin-rich-text .ql-toolbar .ql-onPageTemplate::after { content: 'On-page Template'; }
        .admin-rich-text .ql-toolbar .ql-undoTemplate::after { content: 'Undo'; }
        .admin-rich-text .ql-toolbar .ql-undoTemplate:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }
        .dark .admin-rich-text .ql-toolbar.ql-snow {
          border-bottom-color: rgb(51 65 85);
          background: rgb(15 23 42);
        }
        .dark .admin-rich-text .ql-stroke { stroke: rgb(203 213 225); }
        .dark .admin-rich-text .ql-fill { fill: rgb(203 213 225); }
        .dark .admin-rich-text .ql-picker { color: rgb(226 232 240); }
        .dark .admin-rich-text .ql-editor { color: rgb(241 245 249); }
        .dark .admin-rich-text .ql-toolbar .ql-onPageTemplate,
        .dark .admin-rich-text .ql-toolbar .ql-undoTemplate {
          border-color: rgb(71 85 105);
          color: rgb(226 232 240);
        }
      `}</style>
      {templateMessage && (
        <p
          role={templateMessage.type === 'error' ? 'alert' : 'status'}
          className={`border-t px-3 py-2 text-xs ${
            templateMessage.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {templateMessage.text}
        </p>
      )}
    </div>
  )
}
