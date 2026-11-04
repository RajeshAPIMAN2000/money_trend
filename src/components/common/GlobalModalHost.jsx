import { lazy, Suspense } from 'react'
import { useAuthModal } from '../../context/AuthModalContext.jsx'
import { useCibilCheck } from '../../context/CibilCheckContext.jsx'
import { usePaymentModal } from '../../context/PaymentModalContext.jsx'
import { useWalletModal } from '../../context/WalletModalContext.jsx'

const AuthModal = lazy(() => import('../auth/AuthModal.jsx'))
const CibilCheckModal = lazy(() => import('../cibil/CibilCheckModal.jsx'))
const DummyPaymentModal = lazy(() => import('../payments/DummyPaymentModal.jsx'))
const WalletPopup = lazy(() => import('../wallet/WalletPopup.jsx'))

export default function GlobalModalHost() {
  const { isOpen: authOpen } = useAuthModal()
  const { open: cibilOpen } = useCibilCheck()
  const { isOpen: paymentOpen } = usePaymentModal()
  const { isOpen: walletOpen } = useWalletModal()

  return (
    <>
      {authOpen && <Suspense fallback={null}><AuthModal /></Suspense>}
      {cibilOpen && <Suspense fallback={null}><CibilCheckModal /></Suspense>}
      {paymentOpen && <Suspense fallback={null}><DummyPaymentModal /></Suspense>}
      {walletOpen && <Suspense fallback={null}><WalletPopup /></Suspense>}
    </>
  )
}