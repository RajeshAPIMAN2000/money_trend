export const usersData = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', kyc: 'Verified', joined: '12 Jan 2026', status: 'Active', portfolio: '₹12.45 L', investments: 8 },
  { id: '2', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 87654 32109', kyc: 'Verified', joined: '18 Jan 2026', status: 'Active', portfolio: '₹8.90 L', investments: 5 },
  { id: '3', name: 'Amit Patel', email: 'amit@email.com', phone: '+91 76543 21098', kyc: 'Pending', joined: '02 Feb 2026', status: 'Active', portfolio: '₹2.10 L', investments: 2 },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@email.com', phone: '+91 65432 10987', kyc: 'Verified', joined: '15 Feb 2026', status: 'Active', portfolio: '₹15.20 L', investments: 12 },
  { id: '5', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 54321 09876', kyc: 'Rejected', joined: '20 Feb 2026', status: 'Suspended', portfolio: '₹0', investments: 0 },
  { id: '6', name: 'Neha Gupta', email: 'neha@email.com', phone: '+91 43210 98765', kyc: 'Pending', joined: '05 Mar 2026', status: 'Active', portfolio: '₹1.50 L', investments: 1 },
  { id: '7', name: 'Rahul Mehta', email: 'rahul@email.com', phone: '+91 32109 87654', kyc: 'Verified', joined: '10 Mar 2026', status: 'Active', portfolio: '₹6.80 L', investments: 4 },
  { id: '8', name: 'Kavita Joshi', email: 'kavita@email.com', phone: '+91 21098 76543', kyc: 'Verified', joined: '22 Mar 2026', status: 'Active', portfolio: '₹4.25 L', investments: 3 },
  { id: '9', name: 'Arjun Nair', email: 'arjun@email.com', phone: '+91 10987 65432', kyc: 'Pending', joined: '01 Apr 2026', status: 'Active', portfolio: '₹0.80 L', investments: 1 },
  { id: '10', name: 'Divya Iyer', email: 'divya@email.com', phone: '+91 99887 76655', kyc: 'Verified', joined: '15 Apr 2026', status: 'Active', portfolio: '₹9.60 L', investments: 6 },
]

export const kycData = {
  pending: [
    { id: 'k1', name: 'Amit Patel', email: 'amit@email.com', docType: 'Aadhaar + PAN', submitted: '19 Jul 2026', status: 'Pending' },
    { id: 'k2', name: 'Neha Gupta', email: 'neha@email.com', docType: 'Passport', submitted: '18 Jul 2026', status: 'Pending' },
    { id: 'k3', name: 'Arjun Nair', email: 'arjun@email.com', docType: 'Aadhaar + PAN', submitted: '17 Jul 2026', status: 'Pending' },
  ],
  approved: [
    { id: 'k4', name: 'Rajesh Kumar', email: 'rajesh@email.com', docType: 'Aadhaar + PAN', submitted: '12 Jan 2026', status: 'Approved', reviewer: 'Admin' },
    { id: 'k5', name: 'Priya Sharma', email: 'priya@email.com', docType: 'Aadhaar + PAN', submitted: '18 Jan 2026', status: 'Approved', reviewer: 'Admin' },
    { id: 'k6', name: 'Rahul Mehta', email: 'rahul@email.com', docType: 'Aadhaar + PAN', submitted: '10 Mar 2026', status: 'Approved', reviewer: 'Admin' },
  ],
  rejected: [
    { id: 'k7', name: 'Vikram Singh', email: 'vikram@email.com', docType: 'Driving License', submitted: '20 Feb 2026', status: 'Rejected', reason: 'Document unclear' },
    { id: 'k8', name: 'Kavita Joshi', email: 'kavita@email.com', docType: 'Passport', submitted: '16 Jul 2026', status: 'Rejected', reason: 'Name mismatch' },
  ],
}

export const activityData = [
  { id: 'a1', name: 'Rajesh Kumar', action: 'Login', page: '/dashboard', device: 'Mobile', ip: '103.24.x.x', time: '2 min ago' },
  { id: 'a2', name: 'Priya Sharma', action: 'SIP Created', page: '/mutual-funds', device: 'Desktop', ip: '49.36.x.x', time: '5 min ago' },
  { id: 'a3', name: 'Amit Patel', action: 'KYC Upload', page: '/kyc', device: 'Mobile', ip: '117.58.x.x', time: '12 min ago' },
  { id: 'a4', name: 'Sneha Reddy', action: 'Withdrawal Request', page: '/dashboard', device: 'Tablet', ip: '182.72.x.x', time: '18 min ago' },
  { id: 'a5', name: 'Rajesh Kumar', action: 'FD Booking', page: '/fd-rd', device: 'Mobile', ip: '103.24.x.x', time: '25 min ago' },
  { id: 'a6', name: 'Neha Gupta', action: 'Profile Update', page: '/profile', device: 'Desktop', ip: '152.58.x.x', time: '32 min ago' },
]

export const documentsData = [
  { id: 'd1', name: 'Rajesh Kumar', docType: 'Aadhaar Card', uploaded: '12 Jan 2026', status: 'Verified', size: '1.2 MB' },
  { id: 'd2', name: 'Rajesh Kumar', docType: 'PAN Card', uploaded: '12 Jan 2026', status: 'Verified', size: '0.8 MB' },
  { id: 'd3', name: 'Amit Patel', docType: 'Aadhaar Card', uploaded: '19 Jul 2026', status: 'Pending', size: '1.4 MB' },
  { id: 'd4', name: 'Amit Patel', docType: 'PAN Card', uploaded: '19 Jul 2026', status: 'Pending', size: '0.9 MB' },
  { id: 'd5', name: 'Vikram Singh', docType: 'Driving License', uploaded: '20 Feb 2026', status: 'Rejected', size: '2.1 MB' },
]

export const revenueTrend = [
  { month: 'Jan', revenue: 1.2, investment: 42 },
  { month: 'Feb', revenue: 1.5, investment: 48 },
  { month: 'Mar', revenue: 1.8, investment: 52 },
  { month: 'Apr', revenue: 2.0, investment: 58 },
  { month: 'May', revenue: 2.2, investment: 65 },
  { month: 'Jun', revenue: 2.4, investment: 71 },
  { month: 'Jul', revenue: 2.45, investment: 78 },
]

export const quickActions = [
  { label: 'Add User', path: '/admin/users/add', color: 'blue' },
  { label: 'Review KYC', path: '/admin/kyc', color: 'amber' },
  { label: 'Export Report', path: '/admin/reports', color: 'emerald' },
  { label: 'API Monitor', path: '/admin/api-monitor', color: 'violet' },
]
