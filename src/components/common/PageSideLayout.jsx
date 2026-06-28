/** Page content wrapper — side taglines removed; see Footer for trusted platform badge */
export default function PageSideLayout({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-10 ${className}`}>
      {children}
    </div>
  )
}
