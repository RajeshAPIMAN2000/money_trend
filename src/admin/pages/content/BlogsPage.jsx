import { createContentArticlesPage } from './ContentArticlesPage.jsx'
import {
  useAdminBlogs,
  useAdminBlog,
  useAdminBlogMutations,
} from '../../hooks/useAdminContent.js'

export default createContentArticlesPage({
  type: 'blog',
  useList: useAdminBlogs,
  useItem: useAdminBlog,
  useMutations: useAdminBlogMutations,
})
