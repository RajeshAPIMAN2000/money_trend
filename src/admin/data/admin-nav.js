import {
  LayoutDashboard, Users, ShieldCheck, Activity, KeyRound,
  TrendingUp, PieChart, Landmark, RefreshCw, Repeat, Briefcase,
  ArrowDownToLine, ArrowUpFromLine, ShoppingCart, History,
  BarChart3, LineChart, Gem, Bitcoin,
  Newspaper, BookOpen, Image, FileText,
  Bell, Mail, MessageSquare,
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
      { label: 'KYC Verification', path: '/admin/kyc', icon: ShieldCheck },
      // { label: 'User Activity', path: '/admin/user-activity', icon: Activity },
      // { label: 'User Documents', path: '/admin/user-documents', icon: FileText },
      // { label: 'Roles & Permissions', path: '/admin/roles', icon: KeyRound },
    ],
  },
  {
    label: 'Investments',
    icon: TrendingUp,
    children: [
      // { label: 'Stocks', path: '/admin/stocks', icon: TrendingUp },
      // { label: 'Mutual Funds', path: '/admin/mutual-funds', icon: PieChart },
      { label: 'Fixed Deposits', path: '/admin/fixed-deposits', icon: Landmark },
      { label: 'Recurring Deposits', path: '/admin/recurring-deposits', icon: RefreshCw },
      // { label: 'SIP Investments', path: '/admin/sip', icon: Repeat },
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
  // {
  //   label: 'Market & Data',
  //   icon: BarChart3,
  //   children: [
  //     { label: 'Market Overview', path: '/admin/market', icon: BarChart3 },
  //     { label: 'Indices', path: '/admin/indices', icon: LineChart },
  //     { label: 'Commodities', path: '/admin/commodities', icon: Gem },
  //     { label: 'Crypto Currency', path: '/admin/crypto', icon: Bitcoin },
  //   ],
  // },
  {
    label: 'Content Management',
    icon: FileText,
    children: [
      { label: 'News', path: '/admin/news', icon: Newspaper },
      { label: 'Blogs', path: '/admin/blogs', icon: BookOpen },
      { label: 'Banners', path: '/admin/banners', icon: Image },
      // { label: 'CMS Pages', path: '/admin/cms', icon: FileText },
    ],
  },
  {
    label: 'Communication',
    icon: Bell,
    children: [
      { label: 'Support Tickets', path: '/admin/support', icon: MessageSquare },
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
