import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminArticleList, parseAdminArticleDetail } from '../../lib/adminContent.js'

function newsQueryKey(suffix = []) {
  return ['admin', 'news', ...suffix]
}

function blogsQueryKey(suffix = []) {
  return ['admin', 'blogs', ...suffix]
}

export function useAdminNews(params = {}) {
  return useQuery({
    queryKey: newsQueryKey(['list', params]),
    queryFn: async () => parseAdminArticleList(await api.getAdminNews(params), 'news'),
  })
}

export function useAdminNewsItem(id) {
  return useQuery({
    queryKey: newsQueryKey([id]),
    queryFn: async () => parseAdminArticleDetail(await api.getAdminNewsItem(id), 'news'),
    enabled: Boolean(id),
  })
}

export function useAdminNewsMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: newsQueryKey() })

  const create = useMutation({
    mutationFn: (formData) => api.createAdminNews(formData),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, formData }) => api.updateAdminNews(id, formData),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminNews(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useAdminBlogs(params = {}) {
  return useQuery({
    queryKey: blogsQueryKey(['list', params]),
    queryFn: async () => parseAdminArticleList(await api.getAdminBlogs(params), 'blog'),
  })
}

export function useAdminBlog(id) {
  return useQuery({
    queryKey: blogsQueryKey([id]),
    queryFn: async () => parseAdminArticleDetail(await api.getAdminBlog(id), 'blog'),
    enabled: Boolean(id),
  })
}

export function useAdminBlogMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: blogsQueryKey() })

  const create = useMutation({
    mutationFn: (formData) => api.createAdminBlog(formData),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, formData }) => api.updateAdminBlog(id, formData),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminBlog(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
