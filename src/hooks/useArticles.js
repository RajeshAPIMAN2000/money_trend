import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { parseArticleDetail, parseArticleList } from '../lib/articles.js'

const PAGE_SIZE = 10

export function useArticleList(type) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const fetchList = useCallback(async (nextOffset = 0, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')

    try {
      const fetcher = type === 'blog' ? api.getBlogs : api.getNews
      const response = await fetcher({ limit: PAGE_SIZE, offset: nextOffset })
      const parsed = parseArticleList(response, type)

      setItems((prev) => (append ? [...prev, ...parsed.items] : parsed.items))
      setTotal(parsed.total)
      setOffset(nextOffset)
    } catch (err) {
      setError(err.message || 'Failed to load articles')
      if (!append) setItems([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [type])

  useEffect(() => {
    fetchList(0, false)
  }, [fetchList])

  const loadMore = () => {
    if (loadingMore || items.length >= total) return
    fetchList(offset + PAGE_SIZE, true)
  }

  const hasMore = items.length < total

  return { items, total, loading, loadingMore, error, loadMore, hasMore, refresh: () => fetchList(0, false) }
}

export function useArticleDetail(type, id) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('Article not found')
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const fetcher = type === 'blog' ? api.getBlog : api.getNewsArticle
        const response = await fetcher(id)
        if (!cancelled) setArticle(parseArticleDetail(response, type))
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load article')
          setArticle(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [type, id])

  return { article, loading, error }
}
