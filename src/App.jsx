import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
const Home = lazy(() => import('./pages/Home.jsx'))
const FDMarketplace = lazy(() => import('./pages/FDMarketplace.jsx'))
const BankDetail = lazy(() => import('./pages/BankDetail.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const News = lazy(() => import('./pages/News.jsx'))
const Goals = lazy(() => import('./pages/Goals.jsx'))
const Calculators = lazy(() => import('./pages/Calculators.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const KYC = lazy(() => import('./pages/KYC.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const BlogArticle = lazy(() => import('./pages/BlogArticle.jsx'))
const NewsArticle = lazy(() => import('./pages/NewsArticle.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Refund = lazy(() => import('./pages/Refund.jsx'))
const Cancellation = lazy(() => import('./pages/Cancellation.jsx'))
const Products = lazy(() => import('./pages/Products.jsx'))
const ManualKYCPage = lazy(() => import('./pages/onboarding/ManualKYCPage.jsx'))
const NomineePage = lazy(() => import('./pages/onboarding/NomineePage.jsx'))
const DigiLockerCallbackPage = lazy(() => import('./pages/onboarding/DigiLockerCallbackPage.jsx'))
const RegistrationSuccessPage = lazy(() => import('./pages/onboarding/RegistrationSuccessPage.jsx'))
import AuthModalRedirect from './components/auth/AuthModalRedirect.jsx'
import GlobalModalHost from './components/common/GlobalModalHost.jsx'
import { RequireAuth as UserRequireAuth } from './components/auth/ProtectedRoute.jsx'
const AdminRoot = lazy(() => import('./admin/AdminRoot.jsx'))
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout.jsx'))
import AdminRequireAuth, { RequireGuest as AdminRequireGuest } from './admin/components/shared/RequireAuth.jsx'
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard.jsx'))
const ModulePage = lazy(() => import('./admin/pages/ModulePage.jsx'))
const AdminLoginPage = lazy(() => import('./admin/pages/auth/AuthPages.jsx').then((module) => ({ default: module.LoginPage })))
const AdminForgotPasswordPage = lazy(() => import('./admin/pages/auth/AuthPages.jsx').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./admin/pages/auth/AuthPages.jsx').then((module) => ({ default: module.ResetPasswordPage })))
const UsersPage = lazy(() => import('./admin/pages/users/UsersPage.jsx'))
const AddUserPage = lazy(() => import('./admin/pages/users/AddUserPage.jsx'))
const UserDetailsPage = lazy(() => import('./admin/pages/users/UserDetailsPage.jsx'))
const EditUserPage = lazy(() => import('./admin/pages/users/EditUserPage.jsx'))
const AdminGoalsPage = lazy(() => import('./admin/pages/users/AdminGoalsPage.jsx'))
const SubAdminsPage = lazy(() => import('./admin/pages/users/SubAdminsPage.jsx'))
const KYCPage = lazy(() => import('./admin/pages/kyc/KYCPage.jsx'))
const KYCDetailPage = lazy(() => import('./admin/pages/kyc/KYCDetailPage.jsx'))
const FixedDepositsPage = lazy(() => import('./admin/pages/investments/FixedDepositsPage.jsx'))
const RecurringDepositsPage = lazy(() => import('./admin/pages/investments/RecurringDepositsPage.jsx'))
const PortfolioPage = lazy(() => import('./admin/pages/portfolio/PortfolioPage.jsx'))
const DepositsPage = lazy(() => import('./admin/pages/transactions/DepositsPage.jsx'))
const OrdersPage = lazy(() => import('./admin/pages/transactions/OrdersPage.jsx'))
const WithdrawalsPage = lazy(() => import('./admin/pages/transactions/WithdrawalsPage.jsx'))
const TransactionsPage = lazy(() => import('./admin/pages/transactions/TransactionsPage.jsx'))
const NewsPage = lazy(() => import('./admin/pages/content/NewsPage.jsx'))
const BlogsPage = lazy(() => import('./admin/pages/content/BlogsPage.jsx'))
const BannersPage = lazy(() => import('./admin/pages/content/BannersPage.jsx'))
const AdminTestimonialsPage = lazy(() => import('./admin/pages/content/AdminTestimonialsPage.jsx'))
const SeoManagementPage = lazy(() => import('./admin/pages/seo/SeoManagementPage.jsx'))
const AdminCreditChecksPage = lazy(() => import('./admin/pages/credit/AdminCreditChecksPage.jsx'))
const AdminSupportPage = lazy(() => import('./admin/pages/support/AdminSupportPage.jsx'))
const ContentCreatorPage = lazy(() => import('./admin/pages/content/ContentCreatorPage.jsx'))
const AdminNotificationsPage = lazy(() => import('./admin/pages/notifications/AdminNotificationsPage.jsx'))
const SettingsPage = lazy(() => import('./admin/pages/settings/SettingsPage.jsx'))
const CreditScorePage = lazy(() => import('./pages/CreditScorePage.jsx'))
const CreditScoreHistoryPage = lazy(() => import('./pages/CreditScoreHistoryPage.jsx'))
const EquifaxDashboardPage = lazy(() => import('./pages/EquifaxDashboardPage.jsx'))
const ProfilePage = lazy(() => import('./admin/pages/profile/ProfilePages.jsx').then((module) => ({ default: module.ProfilePage })))
const ChangePasswordPage = lazy(() => import('./admin/pages/profile/ProfilePages.jsx').then((module) => ({ default: module.ChangePasswordPage })))
import { moduleRegistry } from './admin/data/moduleRegistry.js'
import RequirePermission from './admin/components/shared/RequirePermission.jsx'
import SeoHead from './components/common/SeoHead.jsx'
import SiteFloatingWidgets from './components/common/SiteFloatingWidgets.jsx'

const moduleSlugs = Object.keys(moduleRegistry)

function PublicApp() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SeoHead />
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
          <Route path="/equifax" element={<EquifaxDashboardPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsArticle />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/support" element={<Support />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/profile" element={<UserRequireAuth><Profile /></UserRequireAuth>} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/blog/article" element={<Navigate to="/blog" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/cancellation-policy" element={<Cancellation />} />
        </Routes>
      </main>
      <Footer />
      <SiteFloatingWidgets />
    </div>
  )
}

export default function App() {
  return (
    <>
      <AuthModalRedirect />
      <GlobalModalHost />
      <Suspense fallback={null}>
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
            <Route path="goals" element={<AdminGoalsPage />} />
            <Route path="sub-admins" element={<RequirePermission permission="sub_admins"><SubAdminsPage /></RequirePermission>} />
            <Route path="sub-admins/add" element={<Navigate to="/admin/sub-admins" replace />} />
            <Route path="sub-admins/:id/edit" element={<Navigate to="/admin/sub-admins" replace />} />
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
            <Route path="news" element={<RequirePermission permission="news"><NewsPage /></RequirePermission>} />
            <Route path="blogs" element={<RequirePermission permission="blogs"><BlogsPage /></RequirePermission>} />
            <Route path="content-creator" element={<RequirePermission permission="content_creator"><ContentCreatorPage /></RequirePermission>} />
            <Route path="seo" element={<RequirePermission permission="seo"><SeoManagementPage /></RequirePermission>} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="testimonials" element={<AdminTestimonialsPage />} />
            <Route path="credit-checks" element={<AdminCreditChecksPage />} />
            <Route path="support" element={<RequirePermission permission="support"><AdminSupportPage /></RequirePermission>} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
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
      </Suspense>
    </>
  )
}
