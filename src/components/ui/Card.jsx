export default function Card({ className = '', children, hover = true, ...rest }) {
  return <div {...rest} className={`bg-white rounded-card shadow-card p-5 ${hover ? 'card-lift' : ''} ${className}`}>{children}</div>
}
