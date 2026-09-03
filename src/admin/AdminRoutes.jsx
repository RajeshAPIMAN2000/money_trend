import AdminRoot from './AdminRoot.jsx'
import AdminLayout from './layout/AdminLayout.jsx'
import RequireAuth, { RequireGuest } from './components/shared/RequireAuth.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ModulePage from './pages/ModulePage.jsx'
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/AuthPages.jsx'
import UsersPage from './pages/users/UsersPage.jsx'
import AddUserPage from './pages/users/AddUserPage.jsx'
import UserDetailsPage from './pages/users/UserDetailsPage.jsx'
import EditUserPage from './pages/users/EditUserPage.jsx'
import UserActivityPage from './pages/users/UserActivityPage.jsx'
import UserDocumentsPage from './pages/users/UserDocumentsPage.jsx'
import KYCPage from './pages/kyc/KYCPage.jsx'
import KYCDetailPage from './pages/kyc/KYCDetailPage.jsx'
import FixedDepositsPage from './pages/investments/FixedDepositsPage.jsx'
import RecurringDepositsPage from './pages/investments/RecurringDepositsPage.jsx'
import PortfolioPage from './pages/portfolio/PortfolioPage.jsx'
import DepositsPage from './pages/transactions/DepositsPage.jsx'
import OrdersPage from './pages/transactions/OrdersPage.jsx'
import WithdrawalsPage from './pages/transactions/WithdrawalsPage.jsx'
import TransactionsPage from './pages/transactions/TransactionsPage.jsx'
import NewsPage from './pages/content/NewsPage.jsx'
import BlogsPage from './pages/content/BlogsPage.jsx'
import BannersPage from './pages/content/BannersPage.jsx'
import SettingsPage from './pages/settings/SettingsPage.jsx'
import { ProfilePage, ChangePasswordPage } from './pages/profile/ProfilePages.jsx'
import { moduleRegistry } from './data/moduleRegistry.js'
import { Route, Navigate } from 'react-router-dom'

const moduleRoutes = Object.keys(moduleRegistry)

/** Admin route tree — mount inside App.jsx <Routes> as child of path="/admin" */
export function AdminRouteTree() {
  return (
    <>
      <Route path="login" element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="forgot-password" element={<RequireGuest><ForgotPasswordPage /></RequireGuest>} />
      <Route path="reset-password" element={<RequireGuest><ResetPasswordPage /></RequireGuest>} />

      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/add" element={<AddUserPage />} />
        <Route path="users/:id" element={<UserDetailsPage />} />
        <Route path="users/:id/edit" element={<EditUserPage />} />
        {/* <Route path="user-activity" element={<UserActivityPage />} /> */}
        {/* <Route path="user-documents" element={<UserDocumentsPage />} /> */}
        <Route path="kyc" element={<KYCPage />} />
        <Route path="kyc/:userId" element={<KYCDetailPage />} />
        <Route path="fixed-deposits" element={<FixedDepositsPage />} />
        <Route path="recurring-deposits" element={<RecurringDepositsPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="deposits" element={<DepositsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        {moduleRoutes.map(slug => (
          <Route key={slug} path={slug} element={<ModulePage />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </>
  )
}

export { AdminRoot }
