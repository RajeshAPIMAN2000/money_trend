import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminProvider } from '../context/AdminContext.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function AdminProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>{children}</AdminProvider>
    </QueryClientProvider>
  )
}
