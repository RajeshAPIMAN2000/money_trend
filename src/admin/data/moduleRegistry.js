import { usersData, activityData, documentsData, kycData } from './admin-users-data.js'

const mkRows = (items, mapper) => items.map(mapper)

export const moduleRegistry = {
  /* roles: {
    title: 'Roles & Permissions',
    breadcrumb: ['Home', 'User Management', 'Roles & Permissions'],
    description: 'Configure admin roles and access permissions.',
    stats: [
      { label: 'Total Roles', value: '6' }, { label: 'Admin Users', value: '14' },
      { label: 'Permissions', value: '48' }, { label: 'Last Updated', value: 'Today' },
    ],
    columns: [{ key: 'role', label: 'Role' }, { key: 'users', label: 'Users' }, { key: 'permissions', label: 'Permissions' }, { key: 'created', label: 'Created' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Super Admin', '2', 'Full Access', '01 Jan 2026', 'Active'],
      ['Operations', '4', 'Transactions, KYC', '05 Jan 2026', 'Active'],
      ['Content Manager', '3', 'News, Blogs, CMS', '10 Jan 2026', 'Active'],
      ['Support', '5', 'Users, Tickets', '12 Jan 2026', 'Active'],
      ['Analyst', '2', 'Reports, Analytics', '15 Jan 2026', 'Active'],
      ['Finance', '3', 'Deposits, Withdrawals', '20 Jan 2026', 'Active'],
    ], ([role, users, permissions, created, status], i) => ({ id: i, role, users, permissions, created, status })),
    filters: ['Active'],
    chart: 'none',
  }, */
  /* stocks: {
    title: 'Stocks Management',
    breadcrumb: ['Home', 'Investments', 'Stocks'],
    description: 'Manage stock listings, orders, and market data.',
    stats: [
      { label: 'Listed Stocks', value: '2,450', change: '+24 new', up: true },
      { label: 'Orders Today', value: '1,842', change: '+12%', up: true },
      { label: 'Volume', value: '₹45.2 Cr', change: '+8%', up: true },
      { label: 'Active Traders', value: '6,280', change: '+5%', up: true },
    ],
    columns: [{ key: 'symbol', label: 'Symbol' }, { key: 'company', label: 'Company' }, { key: 'price', label: 'Price' }, { key: 'change', label: 'Change' }, { key: 'volume', label: 'Volume' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['RELIANCE', 'Reliance Industries', '₹2,845.30', '+1.2%', '12.4L', 'Active'],
      ['TCS', 'Tata Consultancy', '₹4,120.50', '+0.8%', '8.2L', 'Active'],
      ['INFY', 'Infosys Ltd', '₹1,890.20', '-0.3%', '15.1L', 'Active'],
      ['HDFCBANK', 'HDFC Bank', '₹1,720.40', '+0.5%', '22.3L', 'Active'],
      ['ITC', 'ITC Limited', '₹485.60', '+0.2%', '18.7L', 'Active'],
      ['SBIN', 'State Bank of India', '₹825.30', '-0.1%', '31.2L', 'Active'],
      ['BHARTIARTL', 'Bharti Airtel', '₹1,560.80', '+1.5%', '9.8L', 'Active'],
      ['WIPRO', 'Wipro Ltd', '₹485.20', '-0.4%', '11.5L', 'Active'],
    ], ([symbol, company, price, change, volume, status], i) => ({ id: i, symbol, company, price, change, volume, status })),
    chart: 'market',
  }, */
  /* 'mutual-funds': {
    title: 'Mutual Funds Management',
    breadcrumb: ['Home', 'Investments', 'Mutual Funds'],
    description: 'Manage mutual fund schemes, NAV, and SIP plans.',
    stats: [
      { label: 'Total Schemes', value: '320' }, { label: 'SIP Active', value: '12,840' },
      { label: 'AUM', value: '₹85.4 Cr' }, { label: 'Redemptions', value: '₹2.1 Cr' },
    ],
    columns: [{ key: 'fund', label: 'Fund Name' }, { key: 'category', label: 'Category' }, { key: 'nav', label: 'NAV' }, { key: 'return1y', label: '1Y Return' }, { key: 'aum', label: 'AUM' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['HDFC Top 100 Fund', 'Large Cap', '₹892.45', '+21.8%', '₹18.2 Cr', 'Active'],
      ['Axis Bluechip Fund', 'Large Cap', '₹56.30', '+19.2%', '₹12.5 Cr', 'Active'],
      ['SBI Small Cap Fund', 'Small Cap', '₹142.80', '+17.6%', '₹8.4 Cr', 'Active'],
      ['Nippon India Growth', 'Mid Cap', '₹3,245.60', '+24.5%', '₹15.8 Cr', 'Active'],
      ['ICICI Prudential Tech', 'Sectoral', '₹178.40', '+15.4%', '₹6.2 Cr', 'Active'],
      ['Parag Parikh Flexi Cap', 'Flexi Cap', '₹78.90', '+22.1%', '₹10.4 Cr', 'Active'],
    ], ([fund, category, nav, return1y, aum, status], i) => ({ id: i, fund, category, nav, return1y, aum, status })),
    chart: 'performance',
  }, */
  /* 'fixed-deposits': {
    title: 'Fixed Deposits',
    breadcrumb: ['Home', 'Investments', 'Fixed Deposits'],
    description: 'Manage FD products, rates, and bookings.',
    stats: [
      { label: 'Active FDs', value: '4,280' }, { label: 'Total Value', value: '₹32.5 Cr' },
      { label: 'Avg. Rate', value: '8.2%' }, { label: 'Maturing Soon', value: '186' },
    ],
    columns: [{ key: 'user', label: 'User' }, { key: 'provider', label: 'Bank/NBFC' }, { key: 'amount', label: 'Amount' }, { key: 'rate', label: 'Rate' }, { key: 'tenure', label: 'Tenure' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Priya Sharma', 'Shriram Finance', '₹1,00,000', '9.4%', '3 Years', 'Active'],
      ['Rajesh Kumar', 'Bajaj Finance', '₹2,50,000', '8.8%', '5 Years', 'Active'],
      ['Amit Patel', 'HDFC Bank', '₹50,000', '7.2%', '1 Year', 'Active'],
      ['Sneha Reddy', 'ICICI Bank', '₹5,00,000', '7.5%', '3 Years', 'Active'],
      ['Rahul Mehta', 'Mahindra Finance', '₹1,50,000', '9.1%', '2 Years', 'Active'],
    ], ([user, provider, amount, rate, tenure, status], i) => ({ id: i, user, provider, amount, rate, tenure, status })),
    chart: 'allocation',
  }, */
  /* 'recurring-deposits': {
    title: 'Recurring Deposits',
    breadcrumb: ['Home', 'Investments', 'Recurring Deposits'],
    description: 'Manage RD plans and monthly contributions.',
    stats: [
      { label: 'Active RDs', value: '2,140' }, { label: 'Monthly Inflow', value: '₹1.8 Cr' },
      { label: 'Avg. Tenure', value: '3.2 yrs' }, { label: 'Completion Rate', value: '78%' },
    ],
    columns: [{ key: 'user', label: 'User' }, { key: 'bank', label: 'Bank' }, { key: 'monthly', label: 'Monthly' }, { key: 'rate', label: 'Rate' }, { key: 'tenure', label: 'Tenure' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Sneha Reddy', 'SBI', '₹5,000', '7.0%', '5 Years', 'Active'],
      ['Vikram Singh', 'ICICI', '₹10,000', '7.2%', '3 Years', 'Active'],
      ['Neha Gupta', 'HDFC', '₹3,000', '6.8%', '2 Years', 'Active'],
      ['Arjun Nair', 'Axis', '₹7,500', '7.1%', '4 Years', 'Active'],
    ], ([user, bank, monthly, rate, tenure, status], i) => ({ id: i, user, bank, monthly, rate, tenure, status })),
  }, */
  /* sip: {
    title: 'SIP Investments',
    breadcrumb: ['Home', 'Investments', 'SIP Investments'],
    description: 'Track and manage systematic investment plans.',
    stats: [
      { label: 'Active SIPs', value: '12,840' }, { label: 'Monthly Volume', value: '₹4.2 Cr' },
      { label: 'New SIPs', value: '428' }, { label: 'Paused', value: '86' },
    ],
    columns: [{ key: 'user', label: 'User' }, { key: 'fund', label: 'Fund' }, { key: 'amount', label: 'Amount' }, { key: 'frequency', label: 'Frequency' }, { key: 'nextDate', label: 'Next Date' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Amit Patel', 'Axis Bluechip', '₹5,000', 'Monthly', '01 Aug 2026', 'Active'],
      ['Rajesh Kumar', 'HDFC Top 100', '₹10,000', 'Monthly', '05 Aug 2026', 'Active'],
      ['Priya Sharma', 'Nippon Growth', '₹3,000', 'Monthly', '10 Aug 2026', 'Active'],
      ['Divya Iyer', 'Parag Parikh', '₹7,500', 'Monthly', '15 Aug 2026', 'Active'],
      ['Rahul Mehta', 'SBI Small Cap', '₹2,000', 'Monthly', '20 Aug 2026', 'Paused'],
    ], ([user, fund, amount, frequency, nextDate, status], i) => ({ id: i, user, fund, amount, frequency, nextDate, status })),
    filters: ['Active', 'Paused'],
  }, */
  /* deposits: {
    title: 'Deposits',
    breadcrumb: ['Home', 'Transactions', 'Deposits'],
    description: 'Track all incoming deposit transactions.',
    stats: [
      { label: 'Today', value: '₹2.4 Cr' }, { label: 'This Week', value: '₹12.8 Cr' },
      { label: 'Pending', value: '24' }, { label: 'Failed', value: '3' },
    ],
    columns: [{ key: 'id', label: 'ID' }, { key: 'user', label: 'User' }, { key: 'amount', label: 'Amount' }, { key: 'method', label: 'Method' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' }],
    rows: mkRows([
      ['DEP-8842', 'Rajesh Kumar', '₹25,000', 'UPI', 'Success', '19 Jul 2026'],
      ['DEP-8841', 'Priya Sharma', '₹1,00,000', 'Net Banking', 'Success', '19 Jul 2026'],
      ['DEP-8840', 'Amit Patel', '₹5,000', 'UPI', 'Pending', '19 Jul 2026'],
      ['DEP-8839', 'Sneha Reddy', '₹50,000', 'Card', 'Success', '18 Jul 2026'],
      ['DEP-8838', 'Neha Gupta', '₹15,000', 'UPI', 'Failed', '18 Jul 2026'],
    ], ([id, user, amount, method, status, date]) => ({ id, user, amount, method, status, date })),
    filters: ['Success', 'Pending', 'Failed'],
    chart: 'revenue',
  },
  withdrawals: {
    title: 'Withdrawals',
    breadcrumb: ['Home', 'Transactions', 'Withdrawals'],
    description: 'Manage withdrawal requests and payouts.',
    stats: [
      { label: 'Pending', value: '18' }, { label: 'Processed Today', value: '₹45 L' },
      { label: 'Avg. Time', value: '2.4 hrs' }, { label: 'Rejected', value: '2' },
    ],
    columns: [{ key: 'id', label: 'ID' }, { key: 'user', label: 'User' }, { key: 'amount', label: 'Amount' }, { key: 'bank', label: 'Bank' }, { key: 'status', label: 'Status' }, { key: 'requested', label: 'Requested' }],
    rows: mkRows([
      ['WTH-4421', 'Sneha Reddy', '₹12,500', 'HDFC ****4521', 'Pending', '19 Jul 2026'],
      ['WTH-4420', 'Vikram Singh', '₹50,000', 'SBI ****8832', 'Processing', '18 Jul 2026'],
      ['WTH-4419', 'Rajesh Kumar', '₹25,000', 'ICICI ****2241', 'Success', '18 Jul 2026'],
      ['WTH-4418', 'Priya Sharma', '₹1,00,000', 'Axis ****6678', 'Success', '17 Jul 2026'],
    ], ([id, user, amount, bank, status, requested]) => ({ id, user, amount, bank, status, requested })),
    filters: ['Pending', 'Processing', 'Success'],
  },
  orders: {
    title: 'Orders',
    breadcrumb: ['Home', 'Transactions', 'Orders'],
    description: 'View and manage all investment orders.',
    stats: [
      { label: 'Orders Today', value: '842' }, { label: 'Buy Orders', value: '624' },
      { label: 'Sell Orders', value: '218' }, { label: 'Cancelled', value: '14' },
    ],
    columns: [{ key: 'id', label: 'Order ID' }, { key: 'user', label: 'User' }, { key: 'type', label: 'Type' }, { key: 'instrument', label: 'Instrument' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['ORD-98241', 'Rajesh Kumar', 'Buy', 'HDFC Top 100', '₹25,000', 'Executed'],
      ['ORD-98240', 'Priya Sharma', 'Buy', 'Shriram FD', '₹1,00,000', 'Executed'],
      ['ORD-98239', 'Amit Patel', 'Buy', 'Axis Bluechip SIP', '₹5,000', 'Pending'],
      ['ORD-98238', 'Sneha Reddy', 'Sell', 'Nippon Growth', '₹15,000', 'Executed'],
    ], ([id, user, type, instrument, amount, status]) => ({ id, user, type, instrument, amount, status })),
    filters: ['Executed', 'Pending'],
  },
  transactions: {
    title: 'Transaction History',
    breadcrumb: ['Home', 'Transactions', 'Transaction History'],
    description: 'Complete transaction log across all modules.',
    stats: [
      { label: 'Total', value: '45,820' }, { label: 'Today', value: '1,240' },
      { label: 'Volume', value: '₹18.4 Cr' }, { label: 'Success Rate', value: '99.2%' },
    ],
    columns: [{ key: 'id', label: 'TXN ID' }, { key: 'user', label: 'User' }, { key: 'type', label: 'Type' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' }],
    rows: mkRows([
      ['TXN-128842', 'Rajesh Kumar', 'Investment', '₹25,000', 'Success', '19 Jul 2026 14:32'],
      ['TXN-128841', 'Priya Sharma', 'Deposit', '₹1,00,000', 'Success', '19 Jul 2026 14:28'],
      ['TXN-128840', 'Amit Patel', 'SIP', '₹5,000', 'Success', '19 Jul 2026 14:15'],
      ['TXN-128839', 'Sneha Reddy', 'Withdrawal', '₹12,500', 'Pending', '19 Jul 2026 13:58'],
      ['TXN-128838', 'Neha Gupta', 'Deposit', '₹15,000', 'Failed', '19 Jul 2026 13:42'],
    ], ([id, user, type, amount, status, date]) => ({ id, user, type, amount, status, date })),
    filters: ['Success', 'Pending', 'Failed'],
  }, */
  /* market: {
    title: 'Market Overview',
    breadcrumb: ['Home', 'Market & Data', 'Market Overview'],
    description: 'Real-time market indices and performance data.',
    stats: [
      { label: 'NIFTY 50', value: '24,968.40', change: '+0.82%', up: true },
      { label: 'SENSEX', value: '82,145.30', change: '+0.75%', up: true },
      { label: 'Market Cap', value: '₹412 T' }, { label: 'Advances', value: '28 / 22' },
    ],
    columns: [{ key: 'index', label: 'Index' }, { key: 'value', label: 'Value' }, { key: 'change', label: 'Change' }, { key: 'changePct', label: 'Change %' }, { key: 'volume', label: 'Volume' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['NIFTY 50', '24,968.40', '+203.50', '+0.82%', '245 Cr', 'Live'],
      ['SENSEX', '82,145.30', '+612.80', '+0.75%', '180 Cr', 'Live'],
      ['BANK NIFTY', '52,340.15', '-178.20', '-0.34%', '98 Cr', 'Live'],
      ['NIFTY IT', '38,420.50', '+458.30', '+1.21%', '42 Cr', 'Live'],
    ], ([index, value, change, changePct, volume, status], i) => ({ id: i, index, value, change, changePct, volume, status })),
    chart: 'market',
  },
  indices: {
    title: 'Indices',
    breadcrumb: ['Home', 'Market & Data', 'Indices'],
    description: 'Track major market indices and sector performance.',
    stats: [
      { label: 'Tracked', value: '24' }, { label: 'Gainers', value: '16' },
      { label: 'Losers', value: '8' }, { label: '52W High', value: '4' },
    ],
    columns: [{ key: 'index', label: 'Index' }, { key: 'value', label: 'Value' }, { key: 'dayChange', label: 'Day Change' }, { key: 'weekChange', label: 'Week Change' }, { key: 'ytd', label: 'YTD' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['NIFTY IT', '38,420.50', '+1.2%', '+3.4%', '+18.5%', 'Live'],
      ['NIFTY Pharma', '21,840.30', '+0.6%', '+1.8%', '+12.2%', 'Live'],
      ['NIFTY Auto', '24,120.80', '-0.3%', '+2.1%', '+15.8%', 'Live'],
      ['NIFTY FMCG', '58,420.15', '+0.4%', '+0.9%', '+8.4%', 'Live'],
    ], ([index, value, dayChange, weekChange, ytd, status], i) => ({ id: i, index, value, dayChange, weekChange, ytd, status })),
    chart: 'market',
  },
  commodities: {
    title: 'Commodities',
    breadcrumb: ['Home', 'Market & Data', 'Commodities'],
    description: 'Gold, silver, and commodity price tracking.',
    stats: [
      { label: 'Gold (10g)', value: '₹72,450', change: '+1.12%', up: true },
      { label: 'Silver (kg)', value: '₹84,120', change: '+0.95%', up: true },
      { label: 'Crude Oil', value: '$78.40' }, { label: 'Updated', value: 'Live' },
    ],
    columns: [{ key: 'commodity', label: 'Commodity' }, { key: 'price', label: 'Price' }, { key: 'change', label: 'Change' }, { key: 'changePct', label: 'Change %' }, { key: 'unit', label: 'Unit' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Gold', '₹72,450', '+₹820', '+1.12%', '10g', 'Live'],
      ['Silver', '₹84,120', '+₹780', '+0.95%', '1 kg', 'Live'],
      ['Crude Oil', '$78.40', '-$0.52', '-0.66%', 'barrel', 'Live'],
      ['Natural Gas', '$2.84', '+$0.08', '+2.89%', 'MMBtu', 'Live'],
    ], ([commodity, price, change, changePct, unit, status], i) => ({ id: i, commodity, price, change, changePct, unit, status })),
  },
  crypto: {
    title: 'Crypto Currency',
    breadcrumb: ['Home', 'Market & Data', 'Crypto'],
    description: 'Cryptocurrency prices and trading data.',
    stats: [
      { label: 'BTC', value: '$67,420', change: '+2.4%', up: true },
      { label: 'ETH', value: '$3,842', change: '+1.8%', up: true },
      { label: 'Market Cap', value: '$2.4 T' }, { label: '24h Volume', value: '$89 B' },
    ],
    columns: [{ key: 'coin', label: 'Coin' }, { key: 'price', label: 'Price' }, { key: 'change24h', label: '24h Change' }, { key: 'marketCap', label: 'Market Cap' }, { key: 'volume', label: 'Volume' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Bitcoin', '$67,420', '+2.4%', '$1.32 T', '$28 B', 'Live'],
      ['Ethereum', '$3,842', '+1.8%', '$462 B', '$15 B', 'Live'],
      ['Solana', '$178.50', '+4.2%', '$82 B', '$3.2 B', 'Live'],
      ['Ripple', '$0.62', '-0.8%', '$34 B', '$1.8 B', 'Live'],
    ], ([coin, price, change24h, marketCap, volume, status], i) => ({ id: i, coin, price, change24h, marketCap, volume, status })),
    chart: 'market',
  }, */
  /* news: {
    title: 'News Management',
    breadcrumb: ['Home', 'Content Management', 'News'],
    description: 'Manage financial news articles and market updates.',
    stats: [
      { label: 'Published', value: '142' }, { label: 'Drafts', value: '8' },
      { label: 'Views Today', value: '12,840' }, { label: 'Trending', value: '3' },
    ],
    columns: [{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'author', label: 'Author' }, { key: 'views', label: 'Views' }, { key: 'published', label: 'Published' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['RBI Holds Repo Rate at 6.5%', 'Markets', 'Editor', '4,280', '19 Jul 2026', 'Published'],
      ['NIFTY Hits New All-Time High', 'Markets', 'Editor', '3,120', '18 Jul 2026', 'Published'],
      ['Gold Prices Surge on Global Uncertainty', 'Commodities', 'Editor', '2,840', '17 Jul 2026', 'Published'],
      ['New Tax Saving FD Launched', 'Products', 'Editor', '1,420', '16 Jul 2026', 'Draft'],
    ], ([title, category, author, views, published, status], i) => ({ id: i, title, category, author, views, published, status })),
    filters: ['Published', 'Draft'],
  },
  blogs: {
    title: 'Blog Management',
    breadcrumb: ['Home', 'Content Management', 'Blogs'],
    description: 'Manage educational blog posts and articles.',
    stats: [
      { label: 'Published', value: '86' }, { label: 'Drafts', value: '12' },
      { label: 'Views', value: '28,420' }, { label: 'Avg. Read Time', value: '4.2 min' },
    ],
    columns: [{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'author', label: 'Author' }, { key: 'views', label: 'Views' }, { key: 'published', label: 'Published' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['How to Start SIP Investing', 'Mutual Funds', 'Team', '8,420', '15 Jul 2026', 'Published'],
      ['Understanding Fixed Deposits', 'FD & RD', 'Team', '6,180', '10 Jul 2026', 'Published'],
      ['Tax Saving Investment Guide 2026', 'Tax', 'Team', '5,240', '05 Jul 2026', 'Published'],
    ], ([title, category, author, views, published, status], i) => ({ id: i, title, category, author, views, published, status })),
    filters: ['Published', 'Draft'],
  }, */
  /* banners: {
    title: 'Banner Management',
    breadcrumb: ['Home', 'Content Management', 'Banners'],
    description: 'Manage homepage and page banners.',
    stats: [
      { label: 'Active', value: '12' }, { label: 'Scheduled', value: '3' },
      { label: 'Expired', value: '8' }, { label: 'CTR Avg.', value: '4.2%' },
    ],
    columns: [{ key: 'banner', label: 'Banner' }, { key: 'page', label: 'Page' }, { key: 'position', label: 'Position' }, { key: 'clicks', label: 'Clicks' }, { key: 'status', label: 'Status' }, { key: 'expires', label: 'Expires' }],
    rows: mkRows([
      ['Grow Your Wealth Smarter', 'Home', 'Hero', '12,840', 'Active', '31 Aug 2026'],
      ['All Your Financial Products', 'Products', 'Header', '4,280', 'Active', '—'],
      ['FD & RD Marketplace', 'FD & RD', 'Header', '3,120', 'Active', '—'],
      ['Summer Promo', 'Home', 'Secondary', '842', 'Scheduled', '01 Aug 2026'],
    ], ([banner, page, position, clicks, status, expires], i) => ({ id: i, banner, page, position, clicks, status, expires })),
    filters: ['Active', 'Scheduled'],
  }, */
  /* cms: {
    title: 'CMS Pages',
    breadcrumb: ['Home', 'Content Management', 'CMS Pages'],
    description: 'Manage static pages like Terms, Privacy, and About.',
    stats: [
      { label: 'Pages', value: '14' }, { label: 'Published', value: '12' },
      { label: 'Drafts', value: '2' }, { label: 'Last Edit', value: 'Today' },
    ],
    columns: [{ key: 'page', label: 'Page' }, { key: 'slug', label: 'Slug' }, { key: 'author', label: 'Author' }, { key: 'updated', label: 'Last Updated' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Terms of Service', '/terms', 'Admin', '01 Jul 2026', 'Published'],
      ['Privacy Policy', '/privacy', 'Admin', '01 Jul 2026', 'Published'],
      ['About Us', '/about', 'Admin', '15 Jun 2026', 'Published'],
      ['FAQ', '/faq', 'Admin', '20 Jun 2026', 'Draft'],
    ], ([page, slug, author, updated, status], i) => ({ id: i, page, slug, author, updated, status })),
  }, */
  notifications: {
    title: 'Notifications',
    breadcrumb: ['Home', 'Communication', 'Notifications'],
    description: 'Send and manage push and in-app notifications.',
    stats: [
      { label: 'Sent Today', value: '2,840' }, { label: 'Open Rate', value: '42%' },
      { label: 'Scheduled', value: '6' }, { label: 'Templates', value: '18' },
    ],
    columns: [{ key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'audience', label: 'Audience' }, { key: 'sent', label: 'Sent' }, { key: 'openRate', label: 'Open Rate' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Market Update: NIFTY ATH', 'Push', 'All Users', '12,840', '45%', 'Sent'],
      ['KYC Reminder', 'In-App', 'Pending KYC', '142', '68%', 'Sent'],
      ['SIP Due Reminder', 'Push', 'SIP Users', '12,840', '52%', 'Scheduled'],
    ], ([title, type, audience, sent, openRate, status], i) => ({ id: i, title, type, audience, sent, openRate, status })),
    filters: ['Sent', 'Scheduled'],
  },
  'email-templates': {
    title: 'Email Templates',
    breadcrumb: ['Home', 'Communication', 'Email Templates'],
    description: 'Manage transactional and marketing email templates.',
    stats: [
      { label: 'Templates', value: '24' }, { label: 'Sent Today', value: '1,420' },
      { label: 'Open Rate', value: '38%' }, { label: 'Bounce Rate', value: '1.2%' },
    ],
    columns: [{ key: 'template', label: 'Template' }, { key: 'type', label: 'Type' }, { key: 'subject', label: 'Subject' }, { key: 'lastUsed', label: 'Last Used' }, { key: 'openRate', label: 'Open Rate' }],
    rows: mkRows([
      ['Welcome Email', 'Transactional', 'Welcome to Money Trend!', '19 Jul 2026', '62%'],
      ['KYC Approved', 'Transactional', 'Your KYC is verified', '18 Jul 2026', '78%'],
      ['Monthly Statement', 'Marketing', 'Your July 2026 Statement', '01 Jul 2026', '34%'],
    ], ([template, type, subject, lastUsed, openRate], i) => ({ id: i, template, type, subject, lastUsed, openRate })),
  },
  sms: {
    title: 'SMS & WhatsApp',
    breadcrumb: ['Home', 'Communication', 'SMS & WhatsApp'],
    description: 'Manage SMS and WhatsApp message campaigns.',
    stats: [
      { label: 'SMS Sent', value: '842' }, { label: 'WhatsApp', value: '428' },
      { label: 'Delivery Rate', value: '98.5%' }, { label: 'Failed', value: '12' },
    ],
    columns: [{ key: 'message', label: 'Message' }, { key: 'channel', label: 'Channel' }, { key: 'audience', label: 'Audience' }, { key: 'sent', label: 'Sent' }, { key: 'delivered', label: 'Delivered' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['OTP Verification', 'SMS', 'Individual', '420', '418', 'Delivered'],
      ['SIP Reminder', 'WhatsApp', 'SIP Users', '428', '425', 'Delivered'],
      ['KYC Pending Alert', 'SMS', 'Pending KYC', '142', '140', 'Delivered'],
    ], ([message, channel, audience, sent, delivered, status], i) => ({ id: i, message, channel, audience, sent, delivered, status })),
  },
  analytics: {
    title: 'Reports & Analytics',
    breadcrumb: ['Home', 'Reports & Analytics', 'Analytics'],
    description: 'Platform analytics, user behavior, and conversion metrics.',
    stats: [
      { label: 'Visitors', value: '42,180' }, { label: 'Conversion', value: '8.4%' },
      { label: 'Avg. Session', value: '6.4 min' }, { label: 'Bounce Rate', value: '24.5%' },
    ],
    columns: [{ key: 'metric', label: 'Metric' }, { key: 'today', label: 'Today' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'change', label: 'Change' }],
    rows: mkRows([
      ['Page Views', '12,840', '84,200', '342,000', '+12%'],
      ['Sign Ups', '428', '2,840', '11,200', '+18%'],
      ['Investments', '842', '5,420', '22,400', '+15%'],
      ['Deposits', '624', '4,180', '16,800', '+10%'],
    ], ([metric, today, week, month, change], i) => ({ id: i, metric, today, week, month, change })),
    chart: 'analytics',
  },
  reports: {
    title: 'Reports',
    breadcrumb: ['Home', 'Reports & Analytics', 'Reports'],
    description: 'Generate and download platform reports.',
    stats: [
      { label: 'Generated', value: '48' }, { label: 'Scheduled', value: '6' },
      { label: 'Downloads', value: '142' }, { label: 'Last Run', value: '2 hrs ago' },
    ],
    columns: [{ key: 'report', label: 'Report' }, { key: 'type', label: 'Type' }, { key: 'period', label: 'Period' }, { key: 'generated', label: 'Generated' }, { key: 'format', label: 'Format' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Investment Summary', 'Financial', 'Jul 2026', '19 Jul 2026', 'PDF', 'Ready'],
      ['User Growth', 'Analytics', 'Q2 2026', '18 Jul 2026', 'CSV', 'Ready'],
      ['KYC Compliance', 'Compliance', 'Jul 2026', '17 Jul 2026', 'PDF', 'Ready'],
      ['Transaction Audit', 'Financial', 'Jun 2026', '01 Jul 2026', 'XLSX', 'Ready'],
    ], ([report, type, period, generated, format, status], i) => ({ id: i, report, type, period, generated, format, status })),
    chart: 'analytics',
  },
  export: {
    title: 'Export Data',
    breadcrumb: ['Home', 'Reports & Analytics', 'Export Data'],
    description: 'Export platform data in various formats.',
    stats: [
      { label: 'Exports Today', value: '24' }, { label: 'Total Records', value: '1.2M' },
      { label: 'Formats', value: 'CSV, PDF, XLSX' }, { label: 'Last Export', value: '1 hr ago' },
    ],
    columns: [{ key: 'dataset', label: 'Dataset' }, { key: 'records', label: 'Records' }, { key: 'format', label: 'Format' }, { key: 'requestedBy', label: 'Requested By' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Users', '28,540', 'CSV', 'Admin', '19 Jul 2026', 'Ready'],
      ['Transactions', '45,820', 'XLSX', 'Admin', '19 Jul 2026', 'Processing'],
      ['Investments', '18,230', 'PDF', 'Admin', '18 Jul 2026', 'Ready'],
    ], ([dataset, records, format, requestedBy, date, status], i) => ({ id: i, dataset, records, format, requestedBy, date, status })),
    filters: ['Ready', 'Processing'],
  },
  'payment-gateways': {
    title: 'Payment Gateway',
    breadcrumb: ['Home', 'Settings', 'Payment Gateways'],
    description: 'Configure and monitor payment gateway integrations.',
    stats: [
      { label: 'Active', value: '3' }, { label: 'Success Rate', value: '99.2%' },
      { label: 'Volume Today', value: '₹2.4 Cr' }, { label: 'Failed', value: '3' },
    ],
    columns: [{ key: 'gateway', label: 'Gateway' }, { key: 'type', label: 'Type' }, { key: 'successRate', label: 'Success Rate' }, { key: 'volume', label: 'Volume' }, { key: 'status', label: 'Status' }],
    rows: mkRows([
      ['Razorpay', 'UPI, Cards, NetBanking', '99.4%', '₹1.8 Cr', 'Active'],
      ['PayU', 'Cards, Wallets', '98.8%', '₹42 L', 'Active'],
      ['Cashfree', 'UPI', '99.1%', '₹18 L', 'Active'],
    ], ([gateway, type, successRate, volume, status], i) => ({ id: i, gateway, type, successRate, volume, status })),
  },
  logs: {
    title: 'System Logs',
    breadcrumb: ['Home', 'Settings', 'System Logs'],
    description: 'View system logs, errors, and audit trails.',
    stats: [
      { label: 'Logs Today', value: '12,840' }, { label: 'Errors', value: '4' },
      { label: 'Warnings', value: '28' }, { label: 'Retention', value: '90 days' },
    ],
    columns: [{ key: 'level', label: 'Level' }, { key: 'module', label: 'Module' }, { key: 'message', label: 'Message' }, { key: 'user', label: 'User' }, { key: 'timestamp', label: 'Timestamp' }],
    rows: mkRows([
      ['INFO', 'Auth', 'User login successful', 'rajesh@email.com', '19 Jul 2026 14:32'],
      ['WARN', 'Payment', 'Gateway timeout retry', 'system', '19 Jul 2026 14:28'],
      ['ERROR', 'KYC', 'Document upload failed', 'amit@email.com', '19 Jul 2026 14:15'],
      ['INFO', 'Investment', 'SIP created successfully', 'priya@email.com', '19 Jul 2026 14:10'],
    ], ([level, module, message, user, timestamp], i) => ({ id: i, level, module, message, user, timestamp })),
  },
  'api-monitor': {
    title: 'API Monitor',
    breadcrumb: ['Home', 'Settings', 'API Monitor'],
    description: 'Monitor API health, latency, and uptime.',
    stats: [
      { label: 'Uptime', value: '99.98%' }, { label: 'Avg. Latency', value: '124 ms' },
      { label: 'Requests/min', value: '842' }, { label: 'Errors', value: '2' },
    ],
    columns: [{ key: 'api', label: 'API' }, { key: 'status', label: 'Status' }, { key: 'latency', label: 'Latency' }, { key: 'uptime', label: 'Uptime' }, { key: 'requests', label: 'Requests' }, { key: 'lastCheck', label: 'Last Check' }],
    rows: mkRows([
      ['NSE API', 'Operational', '98 ms', '99.99%', '12,840/min', 'Live'],
      ['BSE API', 'Operational', '112 ms', '99.98%', '8,420/min', 'Live'],
      ['Payment Gateway', 'Operational', '156 ms', '99.95%', '420/min', 'Live'],
      ['KYC Provider', 'Operational', '842 ms', '99.90%', '28/min', 'Live'],
      ['SMS Gateway', 'Operational', '245 ms', '99.97%', '180/min', 'Live'],
    ], ([api, status, latency, uptime, requests, lastCheck], i) => ({ id: i, api, status, latency, uptime, requests, lastCheck })),
    chart: 'api',
  },
}

export { usersData, activityData, documentsData, kycData }
