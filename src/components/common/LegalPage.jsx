import { Link } from 'react-router-dom'
import {
  CUSTOMER_CARE_DISPLAY,
  CUSTOMER_CARE_TEL,
  SUPPORT_EMAIL,
} from '../../lib/company.js'

export default function LegalPage({ title, lastUpdated, children }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <Link to="/" className="text-sm font-semibold text-secondary hover:underline">← Back to Home</Link>
      <header className="mt-6 pb-8 border-b border-slate-200">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        <div className="mt-5 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Important notice:</strong> MoneyTrend Private Limited is a technology and financial-information
          platform and is not a lender, loan provider, loan marketplace, loan referral platform or LSP unless separately
          authorised. Third-party bank, NBFC and credit-bureau products remain subject to their own terms and eligibility.
        </div>
      </header>
      <div className="prose prose-slate max-w-none mt-8 legal-content">{children}</div>
      <footer className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-600">
        <p>
          Questions? Contact{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary font-medium hover:underline">{SUPPORT_EMAIL}</a>
          {' '}or call{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary font-medium hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
          {' '}· <Link to="/support" className="text-secondary font-medium hover:underline">Support</Link>
        </p>
        <p className="mt-2">
          <Link to="/terms" className="text-secondary hover:underline">Terms &amp; Conditions</Link>
          {' · '}
          <Link to="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>
          {' · '}
          <Link to="/refund" className="text-secondary hover:underline">Refund Policy</Link>
        </p>
      </footer>
    </article>
  )
}

export function LegalH2({ id, children }) {
  return (
    <h2 id={id} className="font-display font-bold text-xl text-primary mt-10 mb-3 scroll-mt-24">
      {children}
    </h2>
  )
}

export function LegalH3({ children }) {
  return <h3 className="font-semibold text-primary mt-6 mb-2">{children}</h3>
}

export function LegalP({ children }) {
  return <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
}

export function LegalUl({ children }) {
  return <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-4">{children}</ul>
}
