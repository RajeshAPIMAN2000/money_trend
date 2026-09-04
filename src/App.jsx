import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
import Home from './pages/Home.jsx'
import FDMarketplace from './pages/FDMarketplace.jsx'
import BankDetail from './pages/BankDetail.jsx'
// import MutualFunds from './pages/MutualFunds.jsx'
import Dashboard from './pages/Dashboard.jsx'
import News from './pages/News.jsx'
import Goals from './pages/Goals.jsx'
import Calculators from './pages/Calculators.jsx'
import Support from './pages/Support.jsx'
import KYC from './pages/KYC.jsx'
import Profile from './pages/Profile.jsx'
import Blog from './pages/Blog.jsx'
import BlogArticle from './pages/BlogArticle.jsx'
import NewsArticle from './pages/NewsArticle.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import Products from './pages/Products.jsx'
import ManualKYCPage from './pages/onboarding/ManualKYCPage.jsx'
import NomineePage from './pages/onboarding/NomineePage.jsx'
import DigiLockerCallbackPage from './pages/onboarding/DigiLockerCallbackPage.jsx'
import RegistrationSuccessPage from './pages/onboarding/RegistrationSuccessPage.jsx'
import AuthModalRedirect from './components/auth/AuthModalRedirect.jsx'
import AuthModal from './components/auth/AuthModal.jsx'
import CibilCheckModal from './components/cibil/CibilCheckModal.jsx'
import { RequireAuth as UserRequireAuth } from './components/auth/ProtectedRoute.jsx'
import AdminRoot from './admin/AdminRoot.jsx'
import AdminLayout from './admin/layout/AdminLayout.jsx'
import AdminRequireAuth, { RequireGuest as AdminRequireGuest } from './admin/components/shared/RequireAuth.jsx'
import AdminDashboard from './admin/pages/AdminDashboard.jsx'
import ModulePage from './admin/pages/ModulePage.jsx'
import { LoginPage as AdminLoginPage, ForgotPasswordPage as AdminForgotPasswordPage, ResetPasswordPage } from './admin/pages/auth/AuthPages.jsx'
import UsersPage from './admin/pages/users/UsersPage.jsx'
import AddUserPage from './admin/pages/users/AddUserPage.jsx'
import UserDetailsPage from './admin/pages/users/UserDetailsPage.jsx'
import EditUserPage from './admin/pages/users/EditUserPage.jsx'
import UserActivityPage from './admin/pages/users/UserActivityPage.jsx'
import UserDocumentsPage from './admin/pages/users/UserDocumentsPage.jsx'
import KYCPage from './admin/pages/kyc/KYCPage.jsx'
import KYCDetailPage from './admin/pages/kyc/KYCDetailPage.jsx'
import FixedDepositsPage from './admin/pages/investments/FixedDepositsPage.jsx'
import RecurringDepositsPage from './admin/pages/investments/RecurringDepositsPage.jsx'
import PortfolioPage from './admin/pages/portfolio/PortfolioPage.jsx'
import DepositsPage from './admin/pages/transactions/DepositsPage.jsx'
import OrdersPage from './admin/pages/transactions/OrdersPage.jsx'
import WithdrawalsPage from './admin/pages/transactions/WithdrawalsPage.jsx'
import TransactionsPage from './admin/pages/transactions/TransactionsPage.jsx'
import NewsPage from './admin/pages/content/NewsPage.jsx'
import BlogsPage from './admin/pages/content/BlogsPage.jsx'
import BannersPage from './admin/pages/content/BannersPage.jsx'
import AdminCreditChecksPage from './admin/pages/credit/AdminCreditChecksPage.jsx'
import SettingsPage from './admin/pages/settings/SettingsPage.jsx'
import CreditScorePage from './pages/CreditScorePage.jsx'
import CreditScoreHistoryPage from './pages/CreditScoreHistoryPage.jsx'
import { ProfilePage, ChangePasswordPage } from './admin/pages/profile/ProfilePages.jsx'
import { moduleRegistry } from './admin/data/moduleRegistry.js'

const moduleSlugs = Object.keys(moduleRegistry)

function PublicApp() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/fd-rd" element={<FDMarketplace />} />
          <Route path="/fd-rd/bank/:id" element={<BankDetail />} />
          <Route path="/fd-rd/fd/:id" element={<Navigate to="/fd-rd" replace />} />
          <Route path="/fd-rd/rd/:id" element={<Navigate to="/fd-rd" replace />} />
          {/* <Route path="/mutual-funds" element={<MutualFunds />} /> */}
          <Route path="/dashboard" element={<UserRequireAuth><Dashboard /></UserRequireAuth>} />
          <Route path="/credit-score" element={<CreditScorePage />} />
          <Route path="/credit-score/history" element={<UserRequireAuth><CreditScoreHistoryPage /></UserRequireAuth>} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsArticle />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/support" element={<Support />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/profile" element={<UserRequireAuth><Profile /></UserRequireAuth>} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/blog/article" element={<Navigate to="/blog" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
      <AuthModalRedirect />
      <AuthModal />
      <CibilCheckModal />
      <Routes>
      {/* Legacy auth URLs → handled by AuthModalRedirect in PublicApp */}
      <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
      <Route path="/register" element={<Navigate to="/?auth=register" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/?auth=forgot" replace />} />

      {/* Onboarding routes */}
      <Route path="/onboarding/kyc/manual" element={<ManualKYCPage />} />
      <Route path="/onboarding/kyc/digilocker" element={<DigiLockerCallbackPage />} />
      <Route path="/kyc/digilocker/callback" element={<DigiLockerCallbackPage />} />
      <Route path="/onboarding/nominee" element={<NomineePage />} />
      <Route path="/onboarding/success" element={<RegistrationSuccessPage />} />

      {/* Admin panel */}
      <Route path="/admin" element={<AdminRoot />}>
      {/* Auth routes (no sidebar) */}
        <Route element={<AdminRequireGuest />}>
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected routes (sidebar + content) */}
        <Route element={<AdminRequireAuth />}>
          <Route element={<AdminLayout />}>
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
            <Route path="credit-checks" element={<AdminCreditChecksPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            {moduleSlugs.map(slug => (
              <Route key={slug} path={slug} element={<ModulePage />} />
            ))}
          </Route>
        </Route>
      </Route>

      {/* Public site */}
      <Route path="*" element={<PublicApp />} />
      </Routes>
    </>
  )
}
