const ticks = [
  { name: 'SENSEX', val: '73,420', chg: '+1.2%', up: true },
  { name: 'NIFTY', val: '22,180', chg: '+0.8%', up: true },
  { name: 'BANK NIFTY', val: '48,560', chg: '+0.5%', up: true },
  { name: 'GOLD', val: '₹6,240', chg: '-0.3%', up: false },
  { name: 'USD/INR', val: '83.42', chg: '+0.1%', up: true },
  { name: 'CRUDE', val: '$82.10', chg: '-0.6%', up: false },
]
export default function MarketTicker() {
  const row = [...ticks, ...ticks]
  return (
    <div className="bg-primary text-white overflow-hidden border-y border-white/10">
      <div className="flex gap-10 py-3 whitespace-nowrap animate-ticker">
        {row.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-white/60 font-medium">{t.name}</span>
            <span className="font-semibold">{t.val}</span>
            <span className={t.up ? 'text-accent' : 'text-red-400'}>{t.up ? '▲' : '▼'} {t.chg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
