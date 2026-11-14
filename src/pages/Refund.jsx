import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import LegalPage, { LegalH2, LegalP, LegalUl } from '../components/common/LegalPage.jsx'
import {
  COMPANY_NAME,
  SUPPORT_EMAIL,
} from '../lib/company.js'

const LAST_UPDATED = '14 November 2026'
const CUSTOMER_CARE_DISPLAY = '+91 9556686858'
const CUSTOMER_CARE_TEL = '+919556686858'

export default function Refund() {
  return (
    <>
      <PageBanner {...getPageBanner('refund')} breadcrumbs={[{ label: 'Payment and Refund Policy' }]} />
      <LegalPage
        title="Payment and Refund Policy"
        lastUpdated={LAST_UPDATED}
        showNotice={false}
        customerCareDisplay={CUSTOMER_CARE_DISPLAY}
        customerCareTel={CUSTOMER_CARE_TEL}
      >
        <LegalP>
          <strong>{COMPANY_NAME}</strong><br />
          Website:{' '}
          <a href="https://moneytrend.in/" className="text-secondary hover:underline">https://moneytrend.in/</a><br />
          Official Email:{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a><br />
          Customer Care:{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
        </LegalP>

        <LegalH2 id="purpose">1. Purpose of This Policy</LegalH2>
        <LegalP>
          This Payment and Refund Policy explains the payment methods, transaction processing, failed payments,
          duplicate transactions, cancellations and refund procedures applicable to services offered by MoneyTrend
          Private Limited (&quot;MoneyTrend&quot;) through{' '}
          <a href="https://moneytrend.in/" className="text-secondary hover:underline">https://moneytrend.in/</a>.
        </LegalP>
        <LegalP>
          By purchasing or accessing any paid service on our platform, customers agree to the terms outlined in this
          policy.
        </LegalP>

        <LegalH2 id="nature">2. Nature of Services</LegalH2>
        <LegalP>
          MoneyTrend is a technology and financial-information platform that provides users access to digital financial
          services, including credit score checks and credit report services.
        </LegalP>
        <LegalP>
          Customers may purchase eligible credit report services by making an online payment through the available
          payment options on our website.
        </LegalP>
        <LegalP>
          Upon successful payment and completion of the required processing, the purchased credit report will be made
          available to the customer for viewing or downloading through the platform, subject to applicable service
          availability and verification requirements.
        </LegalP>
        <LegalP>
          MoneyTrend does not operate as a bank, NBFC, credit bureau or lending institution unless separately authorised
          and expressly disclosed.
        </LegalP>

        <LegalH2 id="methods">3. Payment Methods</LegalH2>
        <LegalP>
          MoneyTrend accepts payments through its integrated payment gateway, Razorpay, and other payment methods made
          available during checkout.
        </LegalP>
        <LegalP>Available payment methods may include:</LegalP>
        <LegalUl>
          <li>UPI</li>
          <li>Debit Cards</li>
          <li>Credit Cards</li>
          <li>Net Banking</li>
          <li>Supported Wallets</li>
        </LegalUl>
        <LegalP>
          All payments must be completed through the authorised payment interface available on our website.
        </LegalP>
        <LegalP>
          The applicable service price will be displayed before the customer confirms the payment.
        </LegalP>

        <LegalH2 id="confirmation">4. Payment Confirmation and Service Delivery</LegalH2>
        <LegalP>
          After a successful payment, the transaction will be verified by our system.
        </LegalP>
        <LegalP>
          Once payment confirmation and the required processing are completed, the purchased credit report will be made
          available through the customer&apos;s MoneyTrend account or the applicable download interface.
        </LegalP>
        <LegalP>
          Customers should ensure that the required information submitted during the purchase process is accurate and
          complete.
        </LegalP>
        <LegalP>
          If the service is not delivered within the expected processing time, customers may contact our support team
          for assistance.
        </LegalP>

        <LegalH2 id="failed-pending">5. Failed or Pending Transactions</LegalH2>
        <LegalP>
          If a payment fails, remains pending or the amount is deducted from the customer&apos;s bank account without
          successful completion of the purchase, the following process will apply:
        </LegalP>
        <LegalUl>
          <li>The transaction status will be verified with the payment gateway.</li>
          <li>
            If the payment is unsuccessful, any applicable reversal will be processed according to the payment
            provider&apos;s procedures.
          </li>
          <li>
            If the payment is successful but the credit report is not generated or delivered due to a technical issue,
            MoneyTrend will investigate the issue.
          </li>
          <li>
            Depending on the outcome, MoneyTrend will either fulfil the purchased service or initiate an eligible
            refund.
          </li>
        </LegalUl>
        <LegalP>
          Customers are requested to contact our support team with the transaction ID and payment details for assistance.
        </LegalP>

        <LegalH2 id="duplicate">6. Duplicate Payments</LegalH2>
        <LegalP>
          If a customer makes multiple payments for the same credit report service due to a technical error or accidental
          repeated transaction, the duplicate payment will be investigated.
        </LegalP>
        <LegalP>
          After verification, the additional payment will be eligible for a refund.
        </LegalP>
        <LegalP>
          The refund will be initiated to the original payment method used for the duplicate transaction.
        </LegalP>

        <LegalH2 id="eligibility">7. Refund Eligibility</LegalH2>
        <LegalP>Customers may request a refund under the following circumstances:</LegalP>
        <LegalUl>
          <li>
            Payment has been successfully deducted, but the purchased credit report has not been generated or delivered
            due to a technical issue attributable to MoneyTrend.
          </li>
          <li>A duplicate payment has been made for the same service.</li>
          <li>
            The payment has been successfully processed, but the purchased service cannot be provided due to a technical
            or operational issue attributable to MoneyTrend.
          </li>
          <li>Any other refund situation where a refund is required under applicable law.</li>
        </LegalUl>
        <LegalP>
          Every refund request will be reviewed and verified before approval.
        </LegalP>

        <LegalH2 id="non-refundable">8. Non-Refundable Situations</LegalH2>
        <LegalP>Refunds will generally not be provided under the following circumstances:</LegalP>
        <LegalUl>
          <li>The credit report has been successfully generated and made available to the customer.</li>
          <li>The customer has successfully accessed or downloaded the purchased credit report.</li>
          <li>
            The customer has provided incorrect or incomplete information that prevents successful report generation,
            provided the issue is not attributable to MoneyTrend.
          </li>
          <li>The customer changes their mind after successful delivery of the digital service.</li>
          <li>
            The customer is dissatisfied with information contained in a credit report that has been accurately retrieved
            from the relevant credit bureau.
          </li>
        </LegalUl>
        <LegalP>
          However, these exclusions do not affect any refund rights available to customers under applicable law.
        </LegalP>

        <LegalH2 id="request">9. Refund Request Procedure</LegalH2>
        <LegalP>Customers who believe they are eligible for a refund may contact MoneyTrend through:</LegalP>
        <LegalP>
          <strong>Email:</strong>{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a><br />
          <strong>Customer Care:</strong>{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a><br />
          <strong>Support Page:</strong>{' '}
          <Link to="/support" className="text-secondary hover:underline">https://moneytrend.in/support</Link>
        </LegalP>
        <LegalP>Customers should provide the following information:</LegalP>
        <LegalUl>
          <li>Registered name.</li>
          <li>Registered email address or mobile number.</li>
          <li>Transaction ID or Razorpay Payment ID.</li>
          <li>Payment date and amount.</li>
          <li>Description of the issue.</li>
          <li>Supporting transaction details, if available.</li>
        </LegalUl>
        <LegalP>
          Our support team will review the request and communicate the outcome to the customer.
        </LegalP>

        <LegalH2 id="processing">10. Refund Processing Time</LegalH2>
        <LegalP>
          Once a refund request is approved, MoneyTrend will initiate the refund through the payment gateway to the
          original payment method, subject to applicable payment system requirements.
        </LegalP>
        <LegalP>
          Approved refunds will generally be initiated within 5–7 business days after approval.
        </LegalP>
        <LegalP>
          After initiation, the time required for the refund to reflect in the customer&apos;s bank account or payment
          instrument may depend on the bank, card issuer or payment service provider.
        </LegalP>
        <LegalP>
          Customers may contact our support team if an approved refund is not reflected within the expected period.
        </LegalP>

        <LegalH2 id="cancellation">11. Cancellation of Services</LegalH2>
        <LegalP>
          Customers may request cancellation before the credit report generation or processing has started.
        </LegalP>
        <LegalP>
          Once the report has been successfully generated and made available for access or download, cancellation will
          generally not be permitted, subject to applicable refund rights and the circumstances described in this policy.
        </LegalP>
        <LegalP>
          For further details, customers should refer to our{' '}
          <Link to="/cancellation-policy" className="text-secondary hover:underline">Cancellation Policy</Link> published
          on the website.
        </LegalP>

        <LegalH2 id="unauthorised">12. Unauthorised or Suspicious Transactions</LegalH2>
        <LegalP>
          Customers should immediately report any suspected unauthorised payment or suspicious transaction to their bank
          or payment service provider and inform MoneyTrend through the official support channels.
        </LegalP>
        <LegalP>
          MoneyTrend will reasonably assist with the investigation of transactions relating to services purchased through
          its platform.
        </LegalP>
        <LegalP>
          Customers should never share their passwords, OTPs, card PINs or other confidential authentication information
          with anyone.
        </LegalP>

        <LegalH2 id="support">13. Customer Support and Grievance Redressal</LegalH2>
        <LegalP>
          For payment-related queries, failed transactions, refund requests or service delivery issues, customers may
          contact:
        </LegalP>
        <LegalP>
          <strong>Company:</strong> {COMPANY_NAME}<br />
          <strong>Email:</strong>{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a><br />
          <strong>Customer Care:</strong>{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a><br />
          <strong>Website:</strong>{' '}
          <a href="https://moneytrend.in/" className="text-secondary hover:underline">https://moneytrend.in/</a><br />
          <strong>Support:</strong>{' '}
          <Link to="/support" className="text-secondary hover:underline">https://moneytrend.in/support</Link>
        </LegalP>
        <LegalP>
          Customers should include their transaction details when submitting a payment-related complaint to help us
          investigate and resolve the matter efficiently.
        </LegalP>

        <LegalH2 id="changes">14. Changes to This Policy</LegalH2>
        <LegalP>
          MoneyTrend reserves the right to modify or update this Payment and Refund Policy from time to time.
        </LegalP>
        <LegalP>
          Any revisions will be published on this page with an updated effective date.
        </LegalP>

        <LegalH2 id="law">15. Governing Law</LegalH2>
        <LegalP>
          This Policy shall be governed by the laws of India and shall be subject to applicable statutory and regulatory
          requirements.
        </LegalP>
      </LegalPage>
    </>
  )
}
