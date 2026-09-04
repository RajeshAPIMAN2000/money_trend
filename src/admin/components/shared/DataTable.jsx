import { useState } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { motion } from 'motion/react'
import AdminInput from '../ui/AdminInput.jsx'
import AdminButton from '../ui/AdminButton.jsx'
import AdminBadge from '../ui/AdminBadge.jsx'
import AdminAvatar from '../ui/AdminAvatar.jsx'
import {
  AdminTable, AdminTableHead, AdminTableHeader, AdminTableBody, AdminTableRow, AdminTableCell,
} from '../ui/AdminTable.jsx'
import Pagination from './Pagination.jsx'
import EmptyState from './EmptyState.jsx'
import TableSkeleton from './TableSkeleton.jsx'
import { useAdminQuery, paginateRows } from '../../hooks/useAdminQuery.js'
import { cn } from '../../../lib/utils.js'

function statusTone(status) {
  const s = String(status || '').toLowerCase().replace(/[\s-]+/g, '_')
  if (s === 'fixed' || s === 'in_process' || ['active', 'success', 'verified', 'approved', 'published', 'operational', 'delivered', 'executed', 'ready', 'live', 'completed'].some(k => s.includes(k))) {
    if (s === 'in_process' || s.includes('process')) return 'info'
    return 'success'
  }
  if (['pending', 'processing', 'draft', 'review', 'scheduled'].some(k => s.includes(k))) return 'warning'
  if (['rejected', 'failed', 'suspended', 'error', 'cancelled', 'inactive'].some(k => s.includes(k))) return 'danger'
  return 'default'
}

export default function DataTable({
  columns,
  rows: allRows,
  statusColumn,
  avatarColumn,
  actions,
  searchPlaceholder = 'Search...',
  filters = [],
  onAdd,
  addLabel = 'Add New',
  pageSize = 8,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useAdminQuery(
    ['table', allRows.length, search, page, filter],
    () => {
      let rows = allRows
      if (filter !== 'all' && filters.length) {
        rows = rows.filter(r => String(r.status || r[statusColumn] || '').toLowerCase() === filter.toLowerCase())
      }
      return paginateRows(rows, page, pageSize, search)
    },
    { placeholderData: prev => prev },
  )

  const showLoading = loading || isLoading
  const { rows = [], total = 0, totalPages = 1, page: currentPage = 1 } = data || {}

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <AdminInput
          icon={<Search className="w-4 h-4" />}
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {filters.length > 0 && (
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1) }}
              className="h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Status</option>
              {filters.map(f => <option key={f} value={f.toLowerCase()}>{f}</option>)}
            </select>
          )}
          <AdminButton variant="outline" size="sm"><Filter className="w-4 h-4" /> Filters</AdminButton>
          {onAdd && (
            <AdminButton size="sm" onClick={onAdd}><Plus className="w-4 h-4" /> {addLabel}</AdminButton>
          )}
        </div>
      </div>

      {showLoading ? (
        <TableSkeleton rows={pageSize} cols={columns.length} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={onAdd ? addLabel : undefined}
          onAction={onAdd}
        />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              {columns.map(col => (
                <AdminTableHeader key={col.key || col}>{typeof col === 'string' ? col : col.label}</AdminTableHeader>
              ))}
              {actions && <AdminTableHeader>Actions</AdminTableHeader>}
            </AdminTableHead>
            <AdminTableBody>
              {rows.map((row, i) => (
                <AdminTableRow key={row.id || i}>
                  {columns.map(col => {
                    const key = typeof col === 'string' ? col : col.key
                    const label = typeof col === 'string' ? col : col.label
                    const val = row[key] ?? row[label]
                    return (
                      <AdminTableCell key={key || label}>
                        {key === avatarColumn || label === avatarColumn ? (
                          <div className="flex items-center gap-2.5">
                            <AdminAvatar name={row.name || val} size="sm" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{row.name || val}</div>
                              {row.email && <div className="text-[11px] text-slate-500">{row.email}</div>}
                            </div>
                          </div>
                        ) : (key === statusColumn || label === statusColumn || label === 'Status' || label === 'KYC Status') ? (
                          <AdminBadge tone={statusTone(val)}>{val}</AdminBadge>
                        ) : (
                          val
                        )}
                      </AdminTableCell>
                    )
                  })}
                  {actions && (
                    <AdminTableCell>
                      <div className="flex gap-1">{actions(row)}</div>
                    </AdminTableCell>
                  )}
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
          <Pagination page={currentPage} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}
    </motion.div>
  )
}

export { statusTone }
