import { Link } from 'react-router-dom'

export default function LegalPage({ title, lastUpdated, children }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <Link to="/" className="text-sm font-semibold text-secondary hover:underline">← Back to Home</Link>
      <header className="mt-6 pb-8 border-b border-slate-200">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        <div className="mt-5 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Regulatory notice:</strong> Fintech Demo Pvt Ltd operates in alignment with applicable
          Reserve Bank of India (RBI) and Securities and Exchange Board of India (SEBI) norms, the Prevention of
          Money Laundering Act, 2002 (PMLA), and the Digital Personal Data Protection Act, 2023 (DPDP Act). This
          document is for transparency; it does not substitute personalised legal or investment advice.
        </div>
      </header>
      <div className="prose prose-slate max-w-none mt-8 legal-content">{children}</div>
      <footer className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-600">
        <p>
          Questions? Contact{' '}
          <a href="mailto:legal@fintechdemo.in" className="text-secondary font-medium hover:underline">legal@fintechdemo.in</a>
          {' '}or visit our <Link to="/support" className="text-secondary font-medium hover:underline">Support</Link> page.
        </p>
        <p className="mt-2">
          <Link to="/terms" className="text-secondary hover:underline">Terms &amp; Conditions</Link>
          {' · '}
          <Link to="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>
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
