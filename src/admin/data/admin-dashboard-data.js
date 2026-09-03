export const kpiStats = [
  { label: 'Total Users', value: '28,540', change: '+12.5%', up: true, icon: 'users', color: 'violet' },
  { label: 'Active Investors', value: '18,230', change: '+8.2%', up: true, icon: 'investors', color: 'emerald' },
  { label: 'Total Investments', value: '₹128.75 Cr', change: '+15.3%', up: true, icon: 'investments', color: 'blue' },
  { label: 'Pending KYC', value: '142', change: '-4.1%', up: false, icon: 'kyc', color: 'amber' },
  { label: 'Total Transactions', value: '45,820', change: '+22.7%', up: true, icon: 'transactions', color: 'cyan' },
  { label: 'Revenue Generated', value: '₹2.45 Cr', change: '+18.9%', up: true, icon: 'revenue', color: 'rose' },
]

export const investmentTrend = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 48 },
  { day: 'Wed', value: 45 },
  { day: 'Thu', value: 58 },
  { day: 'Fri', value: 62 },
  { day: 'Sat', value: 71 },
  { day: 'Sun', value: 78 },
]

export const userGrowth = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1850 },
  { month: 'Mar', users: 2400 },
  { month: 'Apr', users: 3100 },
  { month: 'May', users: 3800 },
  { month: 'Jun', users: 4520 },
]

export const topInvestments = [
  { name: 'Nippon India Growth Fund', return: 24.5 },
  { name: 'HDFC Top 100 Fund', return: 21.8 },
  { name: 'Axis Bluechip Fund', return: 19.2 },
  { name: 'SBI Small Cap Fund', return: 17.6 },
  { name: 'ICICI Prudential Tech', return: 15.4 },
]

export const assetAllocation = [
  { name: 'Equity', value: 65, color: '#2563EB' },
  { name: 'Mutual Funds', value: 20, color: '#10B981' },
  { name: 'Fixed Deposits', value: 10, color: '#8B5CF6' },
  { name: 'Others', value: 5, color: '#F59E0B' },
]

export const marketIndices = [
  { name: 'NIFTY 50', value: '24,968.40', change: '+0.82%', up: true, spark: [40, 42, 41, 44, 46, 45, 48] },
  { name: 'SENSEX', value: '82,145.30', change: '+0.75%', up: true, spark: [38, 39, 41, 43, 42, 44, 46] },
  { name: 'BANK NIFTY', value: '52,340.15', change: '-0.34%', up: false, spark: [46, 45, 44, 43, 42, 41, 40] },
  { name: 'GOLD', value: '₹72,450', change: '+1.12%', up: true, spark: [35, 36, 38, 39, 41, 42, 44] },
  { name: 'SILVER', value: '₹84,120', change: '+0.95%', up: true, spark: [32, 33, 34, 36, 37, 38, 39] },
  { name: 'USD/INR', value: '83.42', change: '-0.08%', up: false, spark: [44, 43, 43, 42, 42, 41, 41] },
]

export const recentTransactions = [
  { user: 'Rajesh Kumar', action: 'Investment in HDFC Top 100 Fund', amount: '₹25,000', time: '2 min ago', up: true, avatar: 'RK' },
  { user: 'Priya Sharma', action: 'FD Booking - Shriram Finance', amount: '₹1,00,000', time: '8 min ago', up: true, avatar: 'PS' },
  { user: 'Amit Patel', action: 'SIP - Axis Bluechip Fund', amount: '₹5,000', time: '15 min ago', up: true, avatar: 'AP' },
  { user: 'Sneha Reddy', action: 'Withdrawal Request', amount: '₹12,500', time: '22 min ago', up: false, avatar: 'SR' },
]

export const kycSummary = [
  { name: 'Pending', value: 142, color: '#F59E0B' },
  { name: 'Approved', value: 268, color: '#10B981' },
  { name: 'Rejected', value: 28, color: '#EF4444' },
]

export const deviceBreakdown = [
  { name: 'Mobile', value: 54, color: '#2563EB' },
  { name: 'Desktop', value: 38, color: '#10B981' },
  { name: 'Tablet', value: 8, color: '#8B5CF6' },
]

export const topPages = [
  { name: 'Dashboard', visits: 8420 },
  { name: 'Mutual Funds', visits: 6240 },
  { name: 'FD Marketplace', visits: 5180 },
  { name: 'Calculators', visits: 4320 },
  { name: 'Portfolio', visits: 3890 },
]

export const systemStatus = [
  { name: 'NSE API', status: 'Operational' },
  { name: 'BSE API', status: 'Operational' },
  { name: 'Payment Gateway', status: 'Operational' },
  { name: 'KYC Provider', status: 'Operational' },
  { name: 'SMS Gateway', status: 'Operational' },
  { name: 'Email Service', status: 'Operational' },
]
