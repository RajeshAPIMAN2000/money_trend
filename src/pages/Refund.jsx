import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import LegalPage, { LegalH2, LegalP, LegalUl } from '../components/common/LegalPage.jsx'
import {
  COMPANY_NAME,
  CUSTOMER_CARE_DISPLAY,
  CUSTOMER_CARE_TEL,
  SUPPORT_EMAIL,
} from '../lib/company.js'

const LAST_UPDATED = '6 September 2026'

export default function Refund() {
  return (
    <>
      <PageBanner {...getPageBanner('refund')} breadcrumbs={[{ label: 'Refund Policy' }]} />
      <LegalPage title="Payment, Cancellation and Refund Policy" lastUpdated={LAST_UPDATED}>
        <LegalP>
          This Payment, Cancellation and Refund Policy forms part of the Terms of Use of{' '}
          <strong>{COMPANY_NAME}</strong> (&quot;MoneyTrend&quot;) for moneytrend.in and related platforms. It should be
          read with our <Link to="/terms" className="text-secondary hover:underline">Terms of Use</Link> and{' '}
          <Link to="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>.
        </LegalP>

        <LegalH2 id="payments">1. Payments for FD and RD products</LegalH2>
        <LegalP>
          For FD and RD products facilitated through the platform, payments shall be processed in accordance with the
          procedures, payment channels and terms prescribed by the relevant bank or financial institution. MoneyTrend
          may provide technology interfaces or facilitate access to such processes but does not ordinarily hold customer
          deposit funds in its own name unless expressly permitted under applicable law and disclosed to the user.
        </LegalP>

        <LegalH2 id="cancellation">2. Cancellation, reversal and refunds</LegalH2>
        <LegalP>
          Any cancellation, reversal, refund, failed transaction, duplicate payment, premature closure or other
          payment-related request shall be handled according to the applicable bank&apos;s or financial
          institution&apos;s policies and procedures, subject to the payment gateway, banking system and applicable law.
        </LegalP>

        <LegalH2 id="failed">3. Failed transactions</LegalH2>
        <LegalP>
          Where a transaction fails and funds are debited, the reversal or refund timeline shall be governed by the
          relevant bank, payment system or payment service provider. MoneyTrend may provide reasonable assistance in
          coordinating a support request but does not control settlement timelines of third-party financial institutions
          or payment systems.
        </LegalP>

        <LegalH2 id="support">4. How to raise a payment request</LegalH2>
        <LegalUl>
          <li>
            Email:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a>
          </li>
          <li>
            Customer Care:{' '}
            <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
          </li>
          <li>
            Or use our <Link to="/support" className="text-secondary hover:underline">Support</Link> page to submit a
            ticket.
          </li>
        </LegalUl>
        <LegalP>
          Please include your registered details, transaction reference, amount, date and a brief description of the
          issue to help us coordinate with the relevant partner.
        </LegalP>
      </LegalPage>
    </>
  )
}
