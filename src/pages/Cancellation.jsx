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

export default function Cancellation() {
  return (
    <>
      <PageBanner {...getPageBanner('cancellation')} breadcrumbs={[{ label: 'Cancellation Policy' }]} />
      <LegalPage
        title="Cancellation Policy"
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

        <LegalH2 id="introduction">1. Introduction</LegalH2>
        <LegalP>
          MoneyTrend Private Limited (&quot;MoneyTrend&quot;) provides digital financial-information services through its
          website{' '}
          <a href="https://moneytrend.in/" className="text-secondary hover:underline">https://moneytrend.in/</a>,
          including credit score checks and credit report access and downloads.
        </LegalP>
        <LegalP>
          This Cancellation Policy explains the conditions under which customers may request cancellation of a purchased
          service and the applicable procedures.
        </LegalP>
        <LegalP>
          By purchasing any paid service through our website, customers agree to the terms outlined in this policy.
        </LegalP>

        <LegalH2 id="orders">2. Cancellation of Orders</LegalH2>
        <LegalP>
          Customers may request cancellation of a credit report purchase if the report generation or processing has not
          yet started.
        </LegalP>
        <LegalP>
          All cancellation requests must be submitted through our official customer support channels with the relevant
          transaction details.
        </LegalP>
        <LegalP>
          Once a cancellation request is received, MoneyTrend will verify the transaction and check the processing status
          of the purchased service.
        </LegalP>

        <LegalH2 id="before-delivery">3. Cancellation Before Service Delivery</LegalH2>
        <LegalP>
          If a customer requests cancellation before the credit report generation or processing has started, MoneyTrend
          will review the request.
        </LegalP>
        <LegalP>If the cancellation is approved:</LegalP>
        <LegalUl>
          <li>The order will be cancelled.</li>
          <li>The credit report generation process will not be initiated.</li>
          <li>An eligible refund will be initiated to the original payment method.</li>
        </LegalUl>
        <LegalP>
          Cancellation approval will be subject to transaction verification and applicable legal requirements.
        </LegalP>

        <LegalH2 id="after-generation">4. Cancellation After Report Generation</LegalH2>
        <LegalP>
          Since MoneyTrend provides digital services, cancellation will generally not be accepted once the purchased
          credit report has been successfully generated and made available to the customer.
        </LegalP>
        <LegalP>The following situations will generally not qualify for cancellation:</LegalP>
        <LegalUl>
          <li>The credit report has been successfully generated.</li>
          <li>The credit report is available in the customer&apos;s account.</li>
          <li>The customer has accessed or downloaded the report.</li>
          <li>The customer changes their mind after successful service delivery.</li>
        </LegalUl>
        <LegalP>
          These conditions are subject to any mandatory consumer rights and applicable refund requirements under Indian
          law.
        </LegalP>

        <LegalH2 id="failed-incomplete">5. Failed or Incomplete Services</LegalH2>
        <LegalP>
          If a customer has completed the payment but the credit report has not been generated or delivered due to a
          technical or operational issue attributable to MoneyTrend, the customer may contact our support team.
        </LegalP>
        <LegalP>After verification, MoneyTrend will take appropriate action, which may include:</LegalP>
        <LegalUl>
          <li>Completing the purchased service and making the credit report available; or</li>
          <li>Approving a refund if the service cannot be delivered.</li>
        </LegalUl>

        <LegalH2 id="duplicate">6. Duplicate Transactions</LegalH2>
        <LegalP>
          If a customer accidentally makes multiple payments for the same credit report service, the customer may request
          cancellation of the duplicate transaction.
        </LegalP>
        <LegalP>
          After verifying the duplicate payment, MoneyTrend will initiate an eligible refund for the additional
          transaction to the original payment method.
        </LegalP>

        <LegalH2 id="request">7. Cancellation Request Procedure</LegalH2>
        <LegalP>
          Customers who wish to cancel an eligible order must contact MoneyTrend through the following official channels:
        </LegalP>
        <LegalP>
          <strong>Email:</strong>{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a><br />
          <strong>Customer Care:</strong>{' '}
          <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a><br />
          <strong>Support Page:</strong>{' '}
          <Link to="/support" className="text-secondary hover:underline">https://moneytrend.in/support</Link>
        </LegalP>
        <LegalP>Customers should provide:</LegalP>
        <LegalUl>
          <li>Registered name.</li>
          <li>Registered mobile number or email address.</li>
          <li>Order ID, if available.</li>
          <li>Razorpay Payment ID or transaction reference.</li>
          <li>Payment date and amount.</li>
          <li>Reason for requesting cancellation.</li>
        </LegalUl>
        <LegalP>
          Our support team will review the request and inform the customer about the cancellation status.
        </LegalP>

        <LegalH2 id="refund-after">8. Refund After Cancellation</LegalH2>
        <LegalP>
          If a cancellation request is approved and a refund is applicable, MoneyTrend will initiate the refund through
          the payment gateway to the original payment method.
        </LegalP>
        <LegalP>
          Approved refunds will generally be initiated within 5–7 business days after approval.
        </LegalP>
        <LegalP>
          The actual time taken for the refunded amount to appear in the customer&apos;s account may depend on the bank,
          card issuer or payment service provider.
        </LegalP>
        <LegalP>
          For additional details, customers should refer to our{' '}
          <Link to="/refund" className="text-secondary hover:underline">Payment and Refund Policy</Link>.
        </LegalP>

        <LegalH2 id="non-cancellable">9. Non-Cancellable Services</LegalH2>
        <LegalP>
          The following services or transactions will generally not be eligible for cancellation:
        </LegalP>
        <LegalUl>
          <li>Successfully generated and delivered credit reports.</li>
          <li>Credit reports already made available for customer access or download.</li>
          <li>Completed digital services where the customer has received the purchased service.</li>
          <li>Orders where cancellation is requested after successful service delivery.</li>
        </LegalUl>
        <LegalP>
          This restriction does not override any refund or cancellation rights available under applicable law.
        </LegalP>

        <LegalH2 id="changes-to-services">10. Changes to Purchased Services</LegalH2>
        <LegalP>
          If a customer submits incorrect information or requests a change after placing an order, the customer should
          contact our support team immediately.
        </LegalP>
        <LegalP>
          Any correction, reprocessing or additional service request will be reviewed based on the status of the original
          order and the availability of the service.
        </LegalP>
        <LegalP>
          Additional charges, if any, will be communicated to the customer before processing.
        </LegalP>

        <LegalH2 id="support">11. Customer Support and Grievance Redressal</LegalH2>
        <LegalP>
          For cancellation requests, payment issues or service-related assistance, customers may contact:
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
          Customers are requested to provide accurate transaction information to help our team investigate and resolve
          their requests.
        </LegalP>

        <LegalH2 id="changes">12. Changes to This Policy</LegalH2>
        <LegalP>
          MoneyTrend reserves the right to modify or update this Cancellation Policy whenever necessary.
        </LegalP>
        <LegalP>
          Any changes will be published on this page with the revised effective date.
        </LegalP>

        <LegalH2 id="law">13. Governing Law</LegalH2>
        <LegalP>
          This Cancellation Policy shall be governed by the laws of India and shall be subject to applicable statutory
          and regulatory requirements.
        </LegalP>
      </LegalPage>
    </>
  )
}
