import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import { RequireAuth } from '../../components/auth/ProtectedRoute.jsx'

export default function RegistrationSuccessPage() {
  return (
    <RequireAuth>
      <AuthLayout title="Registration Successful!" subtitle="Welcome to MoneyTrend">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-600 mb-2">
            Your KYC is under review. You'll be notified once verified.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Investment features will remain locked until your KYC is approved.
          </p>
          <Link to="/dashboard" className="block w-full">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </AuthLayout>
    </RequireAuth>
  )
}
