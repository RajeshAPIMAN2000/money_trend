import { createContentArticlesPage } from './ContentArticlesPage.jsx'
import {
  useAdminNews,
  useAdminNewsItem,
  useAdminNewsMutations,
  useAdminBlogs,
  useAdminBlog,
  useAdminBlogMutations,
} from '../../hooks/useAdminContent.js'

export default createContentArticlesPage({
  type: 'news',
  useList: useAdminNews,
  useItem: useAdminNewsItem,
  useMutations: useAdminNewsMutations,
})
