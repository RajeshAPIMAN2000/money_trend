import { useQuery } from '@tanstack/react-query'

export function useAdminQuery(key, fetcher, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 350 + Math.random() * 200))
      return fetcher()
    },
    ...options,
  })
}

export function paginateRows(rows, page, pageSize, search = '', searchKeys = []) {
  let filtered = rows
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = rows.filter(row =>
      searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
      || Object.values(row).some(v => String(v).toLowerCase().includes(q)),
    )
  }
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  return {
    rows: filtered.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
  }
}
