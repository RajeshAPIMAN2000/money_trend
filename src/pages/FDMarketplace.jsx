import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ZigzagLineChart from '../components/charts/ZigzagLineChart.jsx'
import { api } from '../lib/api.js'
import {
  attachBankIds,
  filterByBankType,
  mapMarketRatesList,
  parseBanksList,
  parseMarketRatesResponse,
  parseMarketBanksTrend,
  formatRateTableRows,
} from '../lib/market.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const types = ['All', 'Public Sector', 'Private Sector']
const tenures = ['All', '3M', '6M', '1Y', '2Y', '3Y', '5Y']

function RateCard({ d, to }) {
  const logoContent = d.logoUrl ? (
    <img src={d.logoUrl} alt={d.bank} className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-100 shrink-0" />
  ) : (
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary grid place-items-center text-white font-bold shrink-0">
      {d.logo}
    </div>
  )

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {logoContent}
          <div className="min-w-0">
            <div className="font-semibold text-primary truncate">{d.bank}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge tone="slate">{d.type}</Badge>
              {d.live ? <Badge tone="green">Live</Badge> : <Badge tone="slate">Indicative</Badge>}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-display font-bold text-accent">{d.rate}%</div>
          <div className="text-xs text-slate-500">p.a.</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <div className="text-slate-500 text-xs">Tenure</div>
          <div className="font-semibold">{d.tenure}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">Senior Citizen</div>
          <div className="font-semibold">+{d.seniorCitizenExtra ?? 0}%</div>
        </div>
      </div>
      <Button className="w-full mt-4">{to ? 'View Details' : 'Invest Now'}</Button>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="block">
        <Card className="h-full hover:shadow-lift transition-shadow">{content}</Card>
      </Link>
    )
  }

  return <Card>{content}</Card>
}

function SnapshotBar({ snapshot, bankApiStatus }) {
  if (!snapshot) return null

  return (
    <Card hover={false} className="mb-8 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-white/70 text-xs">Rates as of</div>
          <div className="font-semibold">{snapshot.as_of}</div>
        </div>
        <div>
          <div className="text-white/70 text-xs">RBI Repo Rate</div>
          <div className="font-semibold">{snapshot.rbi_repo_rate}%</div>
        </div>
        <div>
          <div className="text-white/70 text-xs">Avg FD Rate (1Y)</div>
          <div className="font-semibold">{snapshot.avg_fd_rate_1yr}%</div>
        </div>
        <div>
          <div className="text-white/70 text-xs">Avg RD Rate (1Y)</div>
          <div className="font-semibold">{snapshot.avg_rd_rate_1yr}%</div>
        </div>
      </div>
      {bankApiStatus && (
        <p className="text-xs text-white/70 mt-4">
          {bankApiStatus.live_banks} live / {bankApiStatus.total_banks} banks • Updated {new Date(bankApiStatus.fetched_at).toLocaleString('en-IN')}
        </p>
      )}
    </Card>
  )
}

function MarketTrendChart({ trend, product, onProductChange }) {
  const { chartRows, bankSeries, periodLabel } = trend

  const domain = useMemo(() => {
    const values = chartRows.flatMap((row) =>
      bankSeries.map((b) => row[b.code]).filter((v) => Number.isFinite(v)),
    )
    if (!values.length) return [0, 8]
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max(0.2, (max - min) * 0.15)
    return [Math.max(0, min - pad), max + pad]
  }, [chartRows, bankSeries])

  const lines = useMemo(
    () => bankSeries.map((bank) => ({ dataKey: bank.code, name: bank.name, color: bank.color })),
    [bankSeries],
  )

  if (!chartRows.length || !bankSeries.length) {
    return (
      <div className="h-[320px] grid place-items-center text-sm text-slate-500">
        Rate trend data unavailable
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => onProductChange('fd')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${product === 'fd' ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}
        >
          FD Rates
        </button>
        <button
          type="button"
          onClick={() => onProductChange('rd')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${product === 'rd' ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}
        >
          RD Rates
        </button>
      </div>
      <ZigzagLineChart
        data={chartRows}
        lines={lines}
        yDomain={domain}
        tooltipFormatter={(value) => [value != null ? `${value}%` : '—', 'Rate']}
        emptyLabel="Rate trend data unavailable"
      />
      <p className="text-xs text-slate-500 mt-3">{periodLabel} — {product.toUpperCase()} (all banks)</p>
    </>
  )
}

export default function FDMarketplace() {
  const [type, setType] = useState('All')
  const [tenure, setTenure] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marketData, setMarketData] = useState(null)
  const [trendRaw, setTrendRaw] = useState(null)
  const [trendProduct, setTrendProduct] = useState('fd')

  const rateTrend = useMemo(
    () => (trendRaw ? parseMarketBanksTrend(trendRaw, trendProduct) : { chartRows: [], bankSeries: [], periodLabel: '' }),
    [trendRaw, trendProduct],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [ratesRes, banksRes, trendRes] = await Promise.all([
          api.getMarketRates(),
          api.getMarketBanks().catch(() => null),
          api.getMarketBanksHistoryTrend().catch(() => null),
        ])

        if (cancelled) return

        const bankList = banksRes ? parseBanksList(banksRes) : []
        const parsed = parseMarketRatesResponse(ratesRes)
        setMarketData({
          ...parsed,
          fdRates: attachBankIds(parsed.fdRates, bankList),
          rdRates: attachBankIds(parsed.rdRates, bankList),
        })
        if (trendRes) setTrendRaw(trendRes)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load FD & RD rates')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const fdCards = useMemo(() => {
    if (!marketData) return []
    const filtered = filterByBankType(marketData.fdRates, type)
    return mapMarketRatesList(filtered, tenure, 'fd')
  }, [marketData, type, tenure])

  const rdCards = useMemo(() => {
    if (!marketData) return []
    const filtered = filterByBankType(marketData.rdRates, type)
    return mapMarketRatesList(filtered, tenure, 'rd')
  }, [marketData, type, tenure])

  const topFdRows = useMemo(() => {
    if (!marketData) return []
    return formatRateTableRows(marketData.fdRates, 'fd')
  }, [marketData])

  return (
    <>
      <PageBanner {...getPageBanner('fd-rd')} />
      <PageSideLayout>
        <div>
          {loading && (
            <Card hover={false} className="mb-8">
              <div className="py-16 text-center text-sm text-slate-500">Loading FD & RD rates...</div>
            </Card>
          )}

          {!loading && error && (
            <Card hover={false} className="mb-8">
              <div className="py-12 text-center text-sm text-red-600">{error}</div>
            </Card>
          )}

          {!loading && !error && marketData && (
            <>
              <SnapshotBar snapshot={marketData.snapshot} bankApiStatus={marketData.bankApiStatus} />

              <Card hover={false} className="mb-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Bank Type</div>
                    <div className="flex flex-wrap gap-2">
                      {types.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${type === t ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Tenure</div>
                    <div className="flex flex-wrap gap-2">
                      {tenures.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTenure(t)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${tenure === t ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <h2 className="font-display font-bold text-2xl text-primary mb-4">Fixed Deposits ({fdCards.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {fdCards.map((f) => (
                  <RateCard key={f.id} d={f} to={f.bankId ? `/fd-rd/bank/${f.bankId}?product=fd` : undefined} />
                ))}
              </div>

              <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-4">Recurring Deposits ({rdCards.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rdCards.map((r) => (
                  <RateCard key={r.id} d={r} to={r.bankId ? `/fd-rd/bank/${r.bankId}?product=rd` : undefined} />
                ))}
              </div>

              <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-4">Top FDs Compared</h2>
              <Card hover={false} className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-3">Bank</th>
                      <th>1Y Rate</th>
                      <th>Type</th>
                      <th>2Y</th>
                      <th>5Y</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFdRows.map((f) => (
                      <tr key={f.bankCode || f.bankId} className="border-b border-slate-100">
                        <td className="py-3 font-semibold text-primary">
                          {f.bankId ? (
                            <Link to={`/fd-rd/bank/${f.bankId}?product=fd`} className="hover:text-secondary">
                              {f.bank}
                            </Link>
                          ) : f.bank}
                        </td>
                        <td className="text-accent font-semibold">{f.rates['1_year']}%</td>
                        <td>{f.type}</td>
                        <td>{f.rates['2_years']}%</td>
                        <td>{f.rates['5_years']}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <h2 className="font-display font-bold text-2xl text-primary mt-12 mb-4">
                {rateTrend.periodLabel || '12-Month Interest Rate Trend'}
              </h2>
              <Card hover={false}>
                <MarketTrendChart
                  trend={rateTrend}
                  product={trendProduct}
                  onProductChange={setTrendProduct}
                />
              </Card>

              {marketData.disclaimer && (
                <p className="mt-8 text-xs text-slate-500 leading-relaxed">{marketData.disclaimer}</p>
              )}
            </>
          )}
        </div>
      </PageSideLayout>
    </>
  )
}
