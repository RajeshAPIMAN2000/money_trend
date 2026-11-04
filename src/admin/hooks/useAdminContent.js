import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api.js'
import { parseAdminArticleList, parseAdminArticleDetail } from '../../lib/adminContent.js'

function newsQueryKey(suffix = []) {
  return ['admin', 'news', ...suffix]
}

function blogsQueryKey(suffix = []) {
  return ['admin', 'blogs', ...suffix]
}

async function refreshAdminArticles(queryClient, type, id) {
  const key = type === 'blog' ? blogsQueryKey() : newsQueryKey()
  await queryClient.invalidateQueries({ queryKey: key })
  await queryClient.refetchQueries({ queryKey: key, type: 'active' })
  if (id != null) {
    await queryClient.invalidateQueries({
      queryKey: type === 'blog' ? blogsQueryKey([id]) : newsQueryKey([id]),
    })
  }
  await queryClient.invalidateQueries({ queryKey: ['articles'] })
}

export function useAdminNews(params = {}) {
  return useQuery({
    queryKey: newsQueryKey(['list', params]),
    queryFn: async () => parseAdminArticleList(await api.getAdminNews(params), 'news'),
    refetchOnMount: 'always',
    staleTime: 0,
  })
}

export function useAdminNewsItem(id) {
  return useQuery({
    queryKey: newsQueryKey([id]),
    queryFn: async () => parseAdminArticleDetail(await api.getAdminNewsItem(id), 'news'),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useAdminNewsMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (formData) => api.createAdminNews(formData),
    onSuccess: async () => {
      await refreshAdminArticles(queryClient, 'news')
    },
  })

  const update = useMutation({
    mutationFn: ({ id, formData }) => api.updateAdminNews(id, formData),
    onSuccess: async (_data, vars) => {
      await refreshAdminArticles(queryClient, 'news', vars?.id)
    },
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminNews(id),
    onSuccess: async (_data, id) => {
      await refreshAdminArticles(queryClient, 'news', id)
    },
  })

  const approve = useMutation({
    mutationFn: (id) => api.approveAdminNews(id),
    onSuccess: async (_data, id) => {
      await refreshAdminArticles(queryClient, 'news', id)
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.rejectAdminNews(id, { reason }),
    onSuccess: async (_data, vars) => {
      await refreshAdminArticles(queryClient, 'news', vars?.id)
    },
  })

  return { create, update, remove, approve, reject }
}

export function useAdminBlogs(params = {}) {
  return useQuery({
    queryKey: blogsQueryKey(['list', params]),
    queryFn: async () => parseAdminArticleList(await api.getAdminBlogs(params), 'blog'),
    refetchOnMount: 'always',
    staleTime: 0,
  })
}

export function useAdminBlog(id) {
  return useQuery({
    queryKey: blogsQueryKey([id]),
    queryFn: async () => parseAdminArticleDetail(await api.getAdminBlog(id), 'blog'),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useAdminBlogMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (formData) => api.createAdminBlog(formData),
    onSuccess: async () => {
      await refreshAdminArticles(queryClient, 'blog')
    },
  })

  const update = useMutation({
    mutationFn: ({ id, formData }) => api.updateAdminBlog(id, formData),
    onSuccess: async (_data, vars) => {
      await refreshAdminArticles(queryClient, 'blog', vars?.id)
    },
  })

  const remove = useMutation({
    mutationFn: (id) => api.deleteAdminBlog(id),
    onSuccess: async (_data, id) => {
      await refreshAdminArticles(queryClient, 'blog', id)
    },
  })

  const approve = useMutation({
    mutationFn: (id) => api.approveAdminBlog(id),
    onSuccess: async (_data, id) => {
      await refreshAdminArticles(queryClient, 'blog', id)
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.rejectAdminBlog(id, { reason }),
    onSuccess: async (_data, vars) => {
      await refreshAdminArticles(queryClient, 'blog', vars?.id)
    },
  })

  return { create, update, remove, approve, reject }
}
