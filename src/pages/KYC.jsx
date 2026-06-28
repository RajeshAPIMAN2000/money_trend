import { useState } from 'react'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import PageSideLayout from '../components/common/PageSideLayout.jsx'

const STEPS = ['PAN', 'Aadhaar', 'Documents', 'Review']

export default function KYC() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [pan, setPan] = useState('ABCDE1234F')
  const [dob, setDob] = useState('1992-08-15')
  const [adh, setAdh] = useState('XXXX-XXXX-3456')
  const [otp, setOtp] = useState('123456')

  if (done) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4 animate-scale-in">🎉</div>
      <h1 className="text-3xl font-display font-bold text-primary">KYC Submitted for Review</h1>
      <p className="text-slate-600 mt-3">Your KYC is being verified. We'll notify you within 24 hours.</p>
      <Button className="mt-6" onClick={() => { setDone(false); setStep(0) }}>Go to Dashboard</Button>
    </div>
  )

  return (
    <>
      <PageBanner {...getPageBanner('kyc')} breadcrumbs={[{ label: 'e-KYC' }]} />
    <PageSideLayout className="!max-w-4xl">
      <div className="max-w-2xl">

      <div><StepIndicator steps={STEPS} current={step} /></div>

      <Card hover={false} className="animate-fade-in">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-primary">PAN Verification</h3>
            <div><label className="text-xs font-semibold text-slate-500">PAN Number</label><input value={pan} onChange={e => setPan(e.target.value.toUpperCase())} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn uppercase" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Date of Birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn" /></div>
            <div className="bg-accent/10 border border-accent/30 rounded-btn p-3 text-sm flex items-center gap-2"><span className="text-accent text-lg">✓</span><span><strong>Rahul Sharma</strong> · DOB 15-Aug-1992 · Verified</span></div>
            <Button className="w-full" onClick={() => setStep(1)}>Continue</Button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-primary">Aadhaar Verification</h3>
            <div><label className="text-xs font-semibold text-slate-500">Aadhaar (masked)</label><input value={adh} onChange={e => setAdh(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn" /></div>
            <div><label className="text-xs font-semibold text-slate-500">OTP sent to +91-XXXXX-XX456</label><input value={otp} onChange={e => setOtp(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-btn tracking-widest" /></div>
            <div className="bg-accent/10 border border-accent/30 rounded-btn p-3 text-sm flex items-center gap-2"><span className="text-accent text-lg">✓</span>OTP verified successfully</div>
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button><Button className="flex-1" onClick={() => setStep(2)}>Continue</Button></div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-primary">Upload Documents</h3>
            {[['PAN Card photo', '📄'], ['Live selfie', '📸']].map(([l, i]) => (
              <div key={l} className="border-2 border-dashed border-slate-300 rounded-card p-8 text-center hover:border-secondary hover:bg-slate-50 cursor-pointer">
                <div className="text-4xl mb-2">{i}</div>
                <div className="font-semibold text-primary">{l}</div>
                <div className="text-xs text-slate-500 mt-1">Drag & drop or click to upload</div>
              </div>
            ))}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button><Button className="flex-1" onClick={() => setStep(3)}>Continue</Button></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-primary">Review & Submit</h3>
            <div className="bg-slate-50 rounded-card p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold">Rahul Sharma</span></div>
              <div className="flex justify-between"><span className="text-slate-500">PAN</span><span className="font-semibold">{pan}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">DOB</span><span className="font-semibold">{dob}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Aadhaar</span><span className="font-semibold">{adh}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Documents</span><span className="font-semibold text-accent">2 uploaded ✓</span></div>
            </div>
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button><Button variant="accent" className="flex-1" onClick={() => setDone(true)}>Submit KYC</Button></div>
          </div>
        )}
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
        {['🔒 256-bit SSL', 'RBI Guidelines', 'SEBI Registered', 'DPDP Compliant'].map(t => <span key={t} className="px-3 py-1.5 bg-white rounded-full shadow-card">{t}</span>)}
      </div>
      </div>
    </PageSideLayout>
    </>
  )
}
