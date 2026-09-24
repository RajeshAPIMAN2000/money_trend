import { createContentArticlesPage } from './ContentArticlesPage.jsx'
import {
  useAdminNews,
  useAdminNewsItem,
  useAdminNewsMutations,
} from '../../hooks/useAdminContent.js'

const newsOpts = {
  type: 'news',
  useList: useAdminNews,
  useItem: useAdminNewsItem,
  useMutations: useAdminNewsMutations,
}

export default createContentArticlesPage(newsOpts)

export const EmbeddedNewsPanel = createContentArticlesPage({
  ...newsOpts,
  embedded: true,
})
