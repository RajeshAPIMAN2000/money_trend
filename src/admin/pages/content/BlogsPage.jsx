import { createContentArticlesPage } from './ContentArticlesPage.jsx'
import {
  useAdminBlogs,
  useAdminBlog,
  useAdminBlogMutations,
} from '../../hooks/useAdminContent.js'

const blogOpts = {
  type: 'blog',
  useList: useAdminBlogs,
  useItem: useAdminBlog,
  useMutations: useAdminBlogMutations,
}

export default createContentArticlesPage(blogOpts)

export const EmbeddedBlogsPanel = createContentArticlesPage({
  ...blogOpts,
  embedded: true,
})
