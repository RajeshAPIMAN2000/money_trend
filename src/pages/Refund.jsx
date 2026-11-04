import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import LegalPage, { LegalH2, LegalP } from '../components/common/LegalPage.jsx'
import {
  COMPANY_NAME,
  SUPPORT_EMAIL,
} from '../lib/company.js'

const LAST_UPDATED = '6 September 2026'
const CUSTOMER_CARE_DISPLAY = '+91 9556686858'
const CUSTOMER_CARE_TEL = '+919556686858'

export default function Refund() {
  return (
    <>
      <PageBanner {...getPageBanner('refund')} breadcrumbs={[{ label: 'Refund Policy' }]} />
      <LegalPage
        title="Payment and Refund Policy"
        lastUpdated={LAST_UPDATED}
        showNotice={false}
        customerCareDisplay={CUSTOMER_CARE_DISPLAY}
        customerCareTel={CUSTOMER_CARE_TEL}
      >
        <LegalP>
          <strong>{COMPANY_NAME}</strong><br />
          Website: <a href="https://moneytrend.in" className="text-secondary hover:underline">moneytrend.in</a><br />
          Official Email:{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a><br />
          Customer Care:{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
        </LegalP>

        <LegalH2 id="purpose">1. Purpose of this policy</LegalH2>
        <LegalP>
          This Payment and Refund Policy explains how payments, failed transactions, cancellations and refunds are
          handled in connection with services accessed through MoneyTrend Private Limited (&quot;MoneyTrend&quot;) on
          moneytrend.in.
        </LegalP>

        <LegalH2 id="role">2. Nature of MoneyTrend&apos;s role</LegalH2>
        <LegalP>
          MoneyTrend is a technology and financial-information platform and is not a bank, NBFC, lender, payment system
          operator or deposit-taking institution unless separately authorised and expressly disclosed. MoneyTrend may
          provide technology interfaces or facilitate access to services offered by authorised third-party financial
          institutions and service providers.
        </LegalP>

        <LegalH2 id="fd-rd">3. FD and RD payments</LegalH2>
        <LegalP>
          For FD and RD products facilitated through the platform, payments shall be processed according to the
          procedures, payment channels and terms prescribed by the relevant bank or financial institution. MoneyTrend
          does not ordinarily hold customer deposit funds in its own name unless expressly permitted under applicable
          law and disclosed to the user.
        </LegalP>

        <LegalH2 id="third-party">4. Third-party payment terms</LegalH2>
        <LegalP>
          Payment processing may involve banks, payment gateways, payment aggregators or other authorised service
          providers. Users must comply with applicable third-party terms, product conditions and transaction
          instructions. MoneyTrend is not responsible for a third party&apos;s independent product decision, banking delay
          or settlement process except to the extent required by applicable law.
        </LegalP>

        <LegalH2 id="failed-pending">5. Failed or pending transactions</LegalH2>
        <LegalP>
          If a transaction fails, remains pending or funds are debited without successful completion, the transaction
          status, reversal or refund timeline will generally be governed by the relevant bank, payment system or payment
          service provider. MoneyTrend may provide reasonable assistance in raising or coordinating a support request
          but does not control third-party settlement timelines.
        </LegalP>

        <LegalH2 id="duplicate">6. Duplicate payments</LegalH2>
        <LegalP>
          Where a duplicate payment is identified, any reversal or refund shall be processed in accordance with the
          procedures and policies of the relevant bank, financial institution or payment service provider. Users should
          promptly report suspected duplicate payments with available transaction details.
        </LegalP>

        <LegalH2 id="cancellation">7. Cancellation</LegalH2>
        <LegalP>
          Cancellation rights, if any, for FD, RD or other financial products are governed primarily by the applicable
          product provider&apos;s terms and applicable law. Users should review the relevant product disclosures before
          completing a transaction.
        </LegalP>

        <LegalH2 id="refunds">8. Refunds and reversals</LegalH2>
        <LegalP>
          Any cancellation, reversal, refund, failed transaction, duplicate payment, premature closure or other
          payment-related request will be handled according to the applicable bank&apos;s, financial institution&apos;s or
          payment service provider&apos;s policies and procedures, subject to applicable law. Refund eligibility and
          timelines may depend on transaction status, product terms and the third party involved.
        </LegalP>

        <LegalH2 id="premature-closure">9. Premature closure of FD/RD</LegalH2>
        <LegalP>
          Premature closure, withdrawal, penalties, interest adjustments and related refunds for FD or RD products are
          determined by the issuing bank or financial institution and its applicable product terms. MoneyTrend does not
          determine these charges or benefits unless expressly disclosed.
        </LegalP>

        <LegalH2 id="fees">10. Fees and charges</LegalH2>
        <LegalP>
          Any applicable fees, charges, taxes, penalties or deductions associated with a product or transaction will be
          governed by the relevant product provider, payment service provider or applicable law. Users should review
          all applicable disclosures before proceeding.
        </LegalP>

        <LegalH2 id="fraud">11. Fraudulent or unauthorised transactions</LegalH2>
        <LegalP>
          Users must protect their login credentials, OTPs and authentication information. Suspected unauthorised
          activity should be reported immediately to the relevant bank or payment provider and to MoneyTrend through the
          contact details below. Liability and resolution may be governed by applicable law and the policies of the
          relevant service provider.
        </LegalP>

        <LegalH2 id="support">12. Support and grievance</LegalH2>
        <LegalP>
          For payment-related assistance concerning the MoneyTrend platform, contact{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a> or{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>.
          {' '}Where the matter concerns a bank, financial institution, credit information company or payment provider,
          MoneyTrend may direct the user to the relevant entity&apos;s support or grievance process. You may also use our{' '}
          <Link to="/support" className="text-secondary hover:underline">Support</Link> page.
        </LegalP>

        <LegalH2 id="changes">13. Changes to this policy</LegalH2>
        <LegalP>
          MoneyTrend may update this Payment and Refund Policy from time to time. The latest version will be published on
          moneytrend.in with an updated date.
        </LegalP>

        <LegalH2 id="law">14. Governing law</LegalH2>
        <LegalP>
          This Policy shall be governed by the laws of India, subject to mandatory statutory and regulatory provisions
          that may apply.
        </LegalP>
      </LegalPage>
    </>
  )
}
