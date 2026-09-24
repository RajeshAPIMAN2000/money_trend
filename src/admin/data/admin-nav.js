import {
  LayoutDashboard, Users, ShieldCheck, UserCog, Target,
  TrendingUp, Landmark, RefreshCw, Briefcase,
  ArrowDownToLine, ArrowUpFromLine, ShoppingCart, History,
  BarChart3,
  Newspaper, BookOpen, Image, FileText, Search, MessageSquareQuote, PenLine,
  Bell, Mail, MessageSquare, Ticket,
  FileBarChart, Download, Settings, CreditCard, ScrollText, Server,
} from 'lucide-react'

export const adminNav = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'User Management',
    icon: Users,
    children: [
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Goals', path: '/admin/goals', icon: Target },
      { label: 'Employees', path: '/admin/sub-admins', icon: UserCog },
      { label: 'KYC Verification', path: '/admin/kyc', icon: ShieldCheck },
    ],
  },
  {
    label: 'Investments',
    icon: TrendingUp,
    children: [
      { label: 'Fixed Deposits', path: '/admin/fixed-deposits', icon: Landmark },
      { label: 'Recurring Deposits', path: '/admin/recurring-deposits', icon: RefreshCw },
      { label: 'Portfolio', path: '/admin/portfolio', icon: Briefcase },
    ],
  },
  {
    label: 'Transactions',
    icon: ShoppingCart,
    children: [
      { label: 'Deposits', path: '/admin/deposits', icon: ArrowDownToLine },
      { label: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpFromLine },
      { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
      { label: 'Transaction History', path: '/admin/transactions', icon: History },
    ],
  },
  {
    label: 'Content Management',
    icon: FileText,
    children: [
      { label: 'News', path: '/admin/news', icon: Newspaper },
      { label: 'Blogs', path: '/admin/blogs', icon: BookOpen },
      { label: 'Content Creator', path: '/admin/content-creator', icon: PenLine },
      { label: 'SEO Management', path: '/admin/seo', icon: Search },
      { label: 'Banners', path: '/admin/banners', icon: Image },
      { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    ],
  },
  {
    label: 'Communication',
    icon: Bell,
    children: [
      { label: 'Ticket Raised', path: '/admin/support', icon: Ticket },
      { label: 'Notifications', path: '/admin/notifications', icon: Bell },
      { label: 'Email Templates', path: '/admin/email-templates', icon: Mail },
      { label: 'SMS / WhatsApp', path: '/admin/sms', icon: MessageSquare },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: FileBarChart,
    children: [
      { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Reports', path: '/admin/reports', icon: FileBarChart },
      { label: 'Credit Reports', path: '/admin/credit-checks', icon: CreditCard },
      { label: 'Export Data', path: '/admin/export', icon: Download },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Payment Gateways', path: '/admin/payment-gateways', icon: CreditCard },
      { label: 'General Settings', path: '/admin/settings', icon: Settings },
      { label: 'System Logs', path: '/admin/logs', icon: ScrollText },
      { label: 'API Monitor', path: '/admin/api-monitor', icon: Server },
    ],
  },
]

export function flattenNav(items = adminNav) {
  const flat = []
  for (const item of items) {
    if (item.path) flat.push(item)
    if (item.children) flat.push(...flattenNav(item.children))
  }
  return flat
}
