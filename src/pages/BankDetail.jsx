import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { api } from '../lib/api.js'
import { aggregateChartForBarGraph, normalizeHistory, parseBankDetail, parseBankGraphHistory } from '../lib/market.js'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const HISTORY_PERIODS = [
  { key: '1_year', label: '1 Year (Monthly)' },
  { key: '5_years', label: '5 Years (Yearly)' },
]

function HistoryBarChart({ data, product, period, emptyLabel }) {
  const domain = useMemo(() => {
    const values = data.flatMap((d) => [d.fdRate, d.rdRate].filter((v) => Number.isFinite(v)))
    if (!values.length) return [0, 8]
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max(0.25, (max - min) * 0.2)
    return [Math.max(0, min - pad), max + pad]
  }, [data])

  const hasData = data.some((d) => d.fdRate != null || d.rdRate != null)
  const showFd = product === 'fd'
  const showRd = product === 'rd'

  if (!hasData) {
    return (
      <div className="h-[320px] grid place-items-center text-sm text-slate-500">
        {emptyLabel || 'No history data available'}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barGap={4} barCategoryGap={period === '5_years' ? '18%' : '12%'}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="label" stroke="#64748B" tick={{ fontSize: 12 }} interval={0} angle={data.length > 6 ? -25 : 0} textAnchor={data.length > 6 ? 'end' : 'middle'} height={data.length > 6 ? 56 : 30} />
        <YAxis stroke="#64748B" domain={domain} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip
          formatter={(value, name) => [value != null ? `${value}%` : '—', name]}
          labelFormatter={(label) => (period === '5_years' && /^\d{4}$/.test(label) ? `Year ${label}` : label)}
        />
        <Legend />
        {showFd && (
          <Bar
            dataKey="fdRate"
            name="FD Rate"
            fill={product === 'fd' ? '#2563EB' : '#93C5FD'}
            radius={[6, 6, 0, 0]}
            maxBarSize={period === '5_years' ? 56 : 40}
          />
        )}
        {showRd && (
          <Bar
            dataKey="rdRate"
            name="RD Rate"
            fill={product === 'rd' ? '#16A34A' : '#86EFAC'}
            radius={[6, 6, 0, 0]}
            maxBarSize={period === '5_years' ? 56 : 40}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

function BankAvatar({ bank, className = 'w-12 h-12' }) {
  if (bank?.logo && String(bank.logo).startsWith('http')) {
    return (
      <img
        src={bank.logo}
        alt={bank.bankName}
        className={`${className} rounded-lg object-contain bg-white border border-slate-100`}
      />
    )
  }

  const initials = (bank?.shortName || bank?.bankName || 'BK').slice(0, 2).toUpperCase()
  return (
    <div className={`${className} rounded-lg bg-gradient-to-br from-secondary to-primary grid place-items-center text-white font-bold`}>
      {initials}
    </div>
  )
}

function RatesTable({ rows, product }) {
  if (!rows?.length) {
    return <p className="text-sm text-slate-500 py-4">No {product.toUpperCase()} rates available.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-3">Tenure</th>
            <th>General Rate</th>
            <th>Senior Citizen Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.tenureLabel || row.tenure} className="border-b border-slate-100">
              <td className="py-3 font-medium text-primary">{row.tenure}</td>
              <td className="text-accent font-semibold">
                {row.generalRate != null ? `${row.generalRate}%` : '—'}
              </td>
              <td className="font-semibold">
                {row.seniorCitizenRate != null ? `${row.seniorCitizenRate}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BankDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const product = searchParams.get('product') === 'rd' ? 'rd' : 'fd'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [historyPeriod, setHistoryPeriod] = useState('5_years')
  const [chartData, setChartData] = useState([])
  const [graphMeta, setGraphMeta] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [bankRes, ratesRes] = await Promise.all([
          api.getBank(id),
          api.getBankRates(id),
        ])

        if (cancelled) return

        setDetail(parseBankDetail(bankRes, ratesRes))
        setHistoryPeriod('5_years')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load bank details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadHistory() {
      try {
        const res = await api.getBankHistory(id, historyPeriod)
        if (cancelled) return
        const parsed = parseBankGraphHistory(res)
        const points = parsed.points.length ? parsed.points : normalizeHistory(res)
        setChartData(aggregateChartForBarGraph(points, historyPeriod))
        setGraphMeta(parsed)
      } catch {
        if (!cancelled) {
          setChartData([])
          setGraphMeta(null)
        }
      }
    }

    loadHistory()
    return () => { cancelled = true }
  }, [id, historyPeriod])

  const featuredRate = product === 'rd' ? detail?.featuredRdRate : detail?.featuredFdRate
  const productRates = product === 'rd' ? detail?.rates?.rd : detail?.rates?.fd
  const snapshot = graphMeta?.snapshot

  return (
    <>
      <PageBanner {...getPageBanner('fd-rd')} />
      <PageSideLayout>
        <div>
          <Link to="/fd-rd" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to FD & RD
          </Link>

          {loading && (
            <Card hover={false}>
              <div className="py-16 text-center text-sm text-slate-500">Loading bank details...</div>
            </Card>
          )}

          {!loading && error && (
            <Card hover={false}>
              <div className="py-12 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <Link to="/fd-rd" className="inline-block mt-4 text-sm font-semibold text-secondary hover:underline">
                  Return to FD & RD
                </Link>
              </div>
            </Card>
          )}

          {!loading && !error && detail && (
            <>
              <Card className="mb-8">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <BankAvatar bank={detail.bank} />
                    <div>
                      <h1 className="font-display font-bold text-2xl text-primary">{detail.bank.bankName}</h1>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge tone="slate">{detail.bank.type}</Badge>
                        {detail.bank.status && <Badge tone="green">{detail.bank.status}</Badge>}
                        <Badge tone="blue">{product === 'rd' ? 'Recurring Deposit' : 'Fixed Deposit'}</Badge>
                      </div>
                      {detail.bank.shortName && (
                        <p className="text-xs text-slate-500 mt-1 uppercase">{detail.bank.shortName}</p>
                      )}
                      {detail.bank.website && (
                        <a
                          href={detail.bank.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-secondary hover:underline mt-2"
                        >
                          Visit website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-display font-bold text-accent">
                      {featuredRate != null ? `${featuredRate}%` : '—'}
                    </div>
                    <div className="text-xs text-slate-500">1 Year p.a. ({product.toUpperCase()})</div>
                  </div>
                </div>
                {snapshot && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 text-sm border-t border-slate-100 pt-4">
                    <div>
                      <div className="text-slate-500 text-xs">FD Rate (latest)</div>
                      <div className="font-semibold text-accent">{snapshot.fd_rate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">RD Rate (latest)</div>
                      <div className="font-semibold text-accent">{snapshot.rd_rate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">FD Maturity (₹1L)</div>
                      <div className="font-semibold">₹{Number(snapshot.fd_maturity_value || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">RD Maturity (₹5K/mo)</div>
                      <div className="font-semibold">₹{Number(snapshot.rd_maturity_value || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                )}
                <Button className="mt-5">Invest Now</Button>
              </Card>

              <div className="flex gap-2 mb-4">
                <Link
                  to={`/fd-rd/bank/${id}?product=fd`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${product === 'fd' ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}
                >
                  FD Rates
                </Link>
                <Link
                  to={`/fd-rd/bank/${id}?product=rd`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${product === 'rd' ? 'bg-secondary text-white' : 'bg-slate-100 text-ink hover:bg-slate-200'}`}
                >
                  RD Rates
                </Link>
              </div>

              <h2 className="font-display font-bold text-2xl text-primary mb-4">
                {product === 'rd' ? 'Recurring Deposit' : 'Fixed Deposit'} Rates
              </h2>
              <Card hover={false} className="mb-8">
                <RatesTable rows={productRates} product={product} />
              </Card>

              <h2 className="font-display font-bold text-2xl text-primary mb-4">Rate History (Bar Graph)</h2>
              <Card hover={false}>
                <div className="flex flex-wrap gap-2 mb-5">
                  {HISTORY_PERIODS.map((period) => (
                    <button
                      key={period.key}
                      type="button"
                      onClick={() => setHistoryPeriod(period.key)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        historyPeriod === period.key
                          ? 'bg-secondary text-white'
                          : 'bg-slate-100 text-ink hover:bg-slate-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
                <HistoryBarChart
                  data={chartData}
                  product={product}
                  period={historyPeriod}
                  emptyLabel={`No ${historyPeriod.replace('_', ' ')} history available`}
                />
                {graphMeta?.disclaimer && (
                  <p className="mt-4 text-xs text-slate-500 leading-relaxed">{graphMeta.disclaimer}</p>
                )}
              </Card>
            </>
          )}
        </div>
      </PageSideLayout>
    </>
  )
}
