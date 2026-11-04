export const allocation = [
  { name: 'FD', value: 430000, color: '#2563EB' },
  { name: 'MF', value: 500000, color: '#10B981' },
  { name: 'RD', value: 190000, color: '#F59E0B' },
  { name: 'Cash', value: 125800, color: '#64748B' },
]

export const investments = [
  { name: 'HDFC Bank FD', type: 'FD', invested: 200000, current: 214300, status: 'Active' },
  { name: 'Mirae Asset Large Cap', type: 'MF', invested: 180000, current: 232450, status: 'Active' },
  { name: 'SBI RD', type: 'RD', invested: 60000, current: 64200, status: 'Active' },
  { name: 'Axis Bank FD', type: 'FD', invested: 230000, current: 247850, status: 'Active' },
  { name: 'Quant Small Cap', type: 'MF', invested: 150000, current: 198600, status: 'Active' },
]

export const expenses = [
  { m: 'Dec', Housing: 28000, Food: 12000, Transport: 6000, Entertainment: 4500 },
  { m: 'Jan', Housing: 28000, Food: 13500, Transport: 5800, Entertainment: 5200 },
  { m: 'Feb', Housing: 28000, Food: 12800, Transport: 7200, Entertainment: 3800 },
  { m: 'Mar', Housing: 28000, Food: 14000, Transport: 6500, Entertainment: 5600 },
  { m: 'Apr', Housing: 30000, Food: 13200, Transport: 6800, Entertainment: 4900 },
  { m: 'May', Housing: 30000, Food: 14500, Transport: 7000, Entertainment: 6100 },
]

export const txns = [
  { icon: '↓', desc: 'Salary Credit — Acme Corp', cat: 'Income', amt: 185000, date: 'May 30', credit: true },
  { icon: 'MF', desc: 'SIP — Mirae Large Cap', cat: 'Investment', amt: -15000, date: 'May 28', credit: false },
  { icon: 'FD', desc: 'HDFC FD Booking', cat: 'Investment', amt: -100000, date: 'May 25', credit: false },
  { icon: '🛒', desc: 'BigBasket Order', cat: 'Groceries', amt: -3450, date: 'May 22', credit: false },
  { icon: '⚡', desc: 'Electricity Bill', cat: 'Utilities', amt: -2280, date: 'May 20', credit: false },
  { icon: '↓', desc: 'FD Interest Credit', cat: 'Income', amt: 4200, date: 'May 15', credit: true },
  { icon: 'MF', desc: 'SIP — Quant Small Cap', cat: 'Investment', amt: -10000, date: 'May 10', credit: false },
  { icon: '🍽', desc: 'Restaurant — Indigo', cat: 'Dining', amt: -2800, date: 'May 08', credit: false },
]
