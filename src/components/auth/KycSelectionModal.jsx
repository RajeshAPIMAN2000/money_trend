import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { Shield, FileText } from 'lucide-react'

export default function KycSelectionModal({ open, onManual, onDigiLocker, onLater }) {
  return (
    <Modal open={open} onClose={() => {}} title="Complete Your KYC" priority>
      <p className="text-sm text-slate-600 mb-6">
        Choose how you'd like to verify your identity. KYC is required to access investment features.
      </p>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onManual}
          className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 rounded-card hover:border-secondary hover:bg-secondary/5 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary grid place-items-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-primary">Manual KYC</div>
            <div className="text-xs text-slate-500">Upload Aadhaar & PAN documents</div>
          </div>
        </button>
        <button
          type="button"
          onClick={onDigiLocker}
          className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 rounded-card hover:border-accent hover:bg-accent/5 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent grid place-items-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-primary">DigiLocker KYC</div>
            <div className="text-xs text-slate-500">Fetch verified documents from DigiLocker</div>
          </div>
        </button>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <Button variant="ghost" size="sm" onClick={onLater}>
          Do it later
        </Button>
        <p className="text-[11px] text-slate-400 mt-2">Investment features will remain locked until KYC is complete</p>
      </div>
    </Modal>
  )
}
