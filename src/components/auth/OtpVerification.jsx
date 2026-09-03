import OtpInput from './OtpInput.jsx'
import Button from '../ui/Button.jsx'

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function OtpVerification({
  phoneMasked,
  otp,
  onOtpChange,
  seconds,
  resendCooldown,
  expired,
  running,
  error,
  loading,
  onSubmit,
  onResend,
  submitLabel = 'Verify OTP',
  loadingLabel = 'Verifying...',
  onBack,
  backLabel = '← Back',
  children,
}) {
  const canResend = !running && resendCooldown <= 0

  return (
    <div className="space-y-4">
      {phoneMasked && (
        <>
          <p className="text-sm text-slate-600 text-center">
            Enter the 6-digit OTP sent via SMS to
          </p>
          <p className="text-sm font-semibold text-primary text-center">{phoneMasked}</p>
        </>
      )}

      <OtpInput value={otp} onChange={onOtpChange} disabled={loading || expired} />

      <div className="text-center">
        {running ? (
          <p className="text-sm text-slate-500">
            OTP expires in{' '}
            <span className="font-semibold text-secondary tabular-nums">{formatCountdown(seconds)}</span>
          </p>
        ) : (
          <p className="text-sm text-red-500 font-medium">OTP expired</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {children}

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={loading || expired || otp.length !== 6}
      >
        {loading ? loadingLabel : submitLabel}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {canResend ? (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="text-secondary font-semibold hover:underline disabled:opacity-50"
          >
            Resend OTP
          </button>
        ) : resendCooldown > 0 ? (
          <>Resend OTP in <span className="font-semibold tabular-nums">{resendCooldown}s</span></>
        ) : (
          <>Resend available after OTP expires</>
        )}
      </p>

      {onBack && (
        <button type="button" onClick={onBack} className="w-full text-sm text-secondary hover:underline">
          {backLabel}
        </button>
      )}
    </div>
  )
}
