import { useState } from 'react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import Button from '../components/ui/Button.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const TABS = ['FD', 'RD', 'SIP', 'EMI', 'Retirement', 'Tax']

function NumIn({ label, value, onChange, suffix }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <div className="relative mt-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(+e.target.value || 0)}
          className="w-full px-3 py-2 border border-slate-300 rounded-btn focus:outline-none focus:border-secondary"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  )
}

function Result({ rows }) {
  return (
    <div className="bg-primary text-white rounded-card p-6 space-y-3 animate-fade-in">
      {rows.map(([k, v], i) => (
        <div key={k} className={`flex justify-between ${i === 0 ? 'pb-3 border-b border-white/10' : ''}`}>
          <span className="text-white/70 text-sm">{k}</span>
          <span className={`font-display font-bold ${i === 0 ? 'text-2xl text-accent' : 'text-base'}`}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function ResultPlaceholder() {
  return (
    <div className="rounded-card border-2 border-dashed border-slate-200 bg-slate-50 p-8 flex items-center justify-center text-center min-h-[220px]">
      <p className="text-sm text-slate-400 font-medium">
        Enter your details and click <span className="text-[#0056D2] font-semibold">Calculate</span> to see results
      </p>
    </div>
  )
}

function CalcLayout({ inputs, onCalculate, result }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {inputs}
        <Button type="button" onClick={onCalculate} className="w-full mt-2" size="lg">
          Calculate
        </Button>
      </div>
      {result ? <Result rows={result} /> : <ResultPlaceholder />}
    </div>
  )
}

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

function FDCalc() {
  const [p, setP] = useState(100000)
  const [r, setR] = useState(7.5)
  const [y, setY] = useState(3)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const maturity = p * Math.pow(1 + r / 400, 4 * y)
    setResult([
      ['Maturity Amount', inr(maturity)],
      ['Interest Earned', inr(maturity - p)],
      ['Principal', inr(p)],
    ])
  }

  return (
    <CalcLayout
      onCalculate={calculate}
      result={result}
      inputs={
        <>
          <NumIn label="Principal" value={p} onChange={setP} suffix="₹" />
          <NumIn label="Rate (% p.a.)" value={r} onChange={setR} suffix="%" />
          <NumIn label="Tenure (years)" value={y} onChange={setY} suffix="yr" />
        </>
      }
    />
  )
}

function RDCalc() {
  const [m, setM] = useState(5000)
  const [r, setR] = useState(7)
  const [n, setN] = useState(36)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const i = r / 400
    const total = m * ((Math.pow(1 + i, n / 3) - 1) / (1 - Math.pow(1 + i, -1 / 3)))
    const inv = m * n
    setResult([
      ['Maturity Amount', inr(total)],
      ['Total Invested', inr(inv)],
      ['Interest', inr(total - inv)],
    ])
  }

  return (
    <CalcLayout
      onCalculate={calculate}
      result={result}
      inputs={
        <>
          <NumIn label="Monthly Deposit" value={m} onChange={setM} suffix="₹" />
          <NumIn label="Rate (% p.a.)" value={r} onChange={setR} suffix="%" />
          <NumIn label="Tenure (months)" value={n} onChange={setN} suffix="mo" />
        </>
      }
    />
  )
}

function SIPCalc() {
  const [m, setM] = useState(10000)
  const [r, setR] = useState(12)
  const [y, setY] = useState(10)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const i = r / 100 / 12
    const months = y * 12
    const fv = m * ((Math.pow(1 + i, months) - 1) / i) * (1 + i)
    const inv = m * months
    setResult([
      ['Projected Value', inr(fv)],
      ['Total Invested', inr(inv)],
      ['Wealth Gained', inr(fv - inv)],
    ])
  }

  return (
    <CalcLayout
      onCalculate={calculate}
      result={result}
      inputs={
        <>
          <NumIn label="Monthly SIP" value={m} onChange={setM} suffix="₹" />
          <NumIn label="Expected Return" value={r} onChange={setR} suffix="%" />
          <NumIn label="Years" value={y} onChange={setY} suffix="yr" />
        </>
      }
    />
  )
}

function EMICalc() {
  const [p, setP] = useState(2500000)
  const [r, setR] = useState(8.5)
  const [y, setY] = useState(20)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const i = r / 100 / 12
    const months = y * 12
    const emi = (p * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1)
    const total = emi * months
    setResult([
      ['Monthly EMI', inr(emi)],
      ['Total Interest', inr(total - p)],
      ['Total Payment', inr(total)],
    ])
  }

  return (
    <CalcLayout
      onCalculate={calculate}
      result={result}
      inputs={
        <>
          <NumIn label="Loan Amount" value={p} onChange={setP} suffix="₹" />
          <NumIn label="Rate (% p.a.)" value={r} onChange={setR} suffix="%" />
          <NumIn label="Tenure (years)" value={y} onChange={setY} suffix="yr" />
        </>
      }
    />
  )
}

function RetCalc() {
  const [age, setAge] = useState(30)
  const [ret, setRet] = useState(60)
  const [exp, setExp] = useState(50000)
  const [inf, setInf] = useState(6)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const yrs = ret - age
    const futureExp = exp * 12 * Math.pow(1 + inf / 100, yrs)
    const corpus = futureExp * 25
    setResult([
      ['Corpus Needed', inr(corpus)],
      ['Future Monthly Exp', inr(futureExp / 12)],
      ['Years to Retire', `${yrs} yr`],
    ])
  }

  return (
    <CalcLayout
      onCalculate={calculate}
      result={result}
      inputs={
        <>
          <NumIn label="Current Age" value={age} onChange={setAge} />
          <NumIn label="Retirement Age" value={ret} onChange={setRet} />
          <NumIn label="Monthly Expenses" value={exp} onChange={setExp} suffix="₹" />
          <NumIn label="Inflation %" value={inf} onChange={setInf} suffix="%" />
        </>
      }
    />
  )
}

function TaxCalc() {
  const [inc, setInc] = useState(1500000)
  const [ded, setDed] = useState(200000)
  const [result, setResult] = useState(null)

  const calculate = () => {
    const old = (() => {
      let t = inc - ded - 50000
      let x = 0
      if (t > 1000000) { x += (t - 1000000) * 0.3; t = 1000000 }
      if (t > 500000) { x += (t - 500000) * 0.2; t = 500000 }
      if (t > 250000) x += (t - 250000) * 0.05
      return Math.max(0, x)
    })()

    const nw = (() => {
      let t = inc - 75000
      let x = 0
      const sl = [[300000, 0], [700000, 0.05], [1000000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]]
      let prev = 0
      for (const [c, rate] of sl) {
        if (t <= c) { x += (t - prev) * rate; break }
        x += (c - prev) * rate
        prev = c
      }
      return Math.max(0, x)
    })()

    setResult({ old, nw, inc })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <NumIn label="Annual Income" value={inc} onChange={setInc} suffix="₹" />
        <NumIn label="80C Deductions" value={ded} onChange={setDed} suffix="₹" />
      </div>
      <Button type="button" onClick={calculate} className="w-full md:w-auto" size="lg">
        Calculate
      </Button>
      {result ? (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <Card hover={false} className="border-2 border-slate-200">
            <div className="text-xs font-semibold text-slate-500">OLD REGIME</div>
            <div className="text-2xl font-display font-bold text-primary mt-1">{inr(result.old)}</div>
            <div className="text-xs text-slate-500 mt-2">Take Home: {inr(result.inc - result.old)}</div>
          </Card>
          <Card hover={false} className={`border-2 ${result.nw < result.old ? 'border-accent bg-accent/5' : 'border-slate-200'}`}>
            <div className="text-xs font-semibold text-slate-500">
              NEW REGIME {result.nw < result.old && <span className="text-accent">✓ Best</span>}
            </div>
            <div className="text-2xl font-display font-bold text-primary mt-1">{inr(result.nw)}</div>
            <div className="text-xs text-slate-500 mt-2">Take Home: {inr(result.inc - result.nw)}</div>
          </Card>
        </div>
      ) : (
        <ResultPlaceholder />
      )}
    </div>
  )
}

const map = {
  FD: <FDCalc />,
  RD: <RDCalc />,
  SIP: <SIPCalc />,
  EMI: <EMICalc />,
  Retirement: <RetCalc />,
  Tax: <TaxCalc />,
}

export default function Calculators() {
  const [tab, setTab] = useState('FD')

  return (
    <>
      <PageBanner {...getPageBanner('calculators')} />
      <PageSideLayout>
        <div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card hover={false} className="mt-6 animate-fade-in" key={tab}>
            {map[tab]}
          </Card>
        </div>
      </PageSideLayout>
    </>
  )
}
