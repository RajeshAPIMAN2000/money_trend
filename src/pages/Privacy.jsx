import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import LegalPage, { LegalH2, LegalP, LegalUl } from '../components/common/LegalPage.jsx'
import {
  COMPANY_NAME,
  CUSTOMER_CARE_DISPLAY,
  CUSTOMER_CARE_TEL,
  GRIEVANCE_EMAIL,
  SUPPORT_EMAIL,
  COMPANY_ADDRESS,
} from '../lib/company.js'

const LAST_UPDATED = '6 September 2026'

export default function Privacy() {
  return (
    <>
      <PageBanner {...getPageBanner('privacy')} breadcrumbs={[{ label: 'Privacy Policy' }]} />
      <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>
        <LegalP>
          This Privacy Policy explains how <strong>{COMPANY_NAME}</strong> (&quot;MoneyTrend&quot;, &quot;we&quot;,
          &quot;us&quot; or &quot;our&quot;) collects, uses, stores and processes personal information when you use
          moneytrend.in and related digital platforms. It should be read together with our{' '}
          <Link to="/terms" className="text-secondary hover:underline">Terms of Use</Link>.
        </LegalP>

        <LegalH2 id="company">1. Company and contact</LegalH2>
        <LegalUl>
          <li><strong>Company:</strong> {COMPANY_NAME}</li>
          <li><strong>Registered Address:</strong> {COMPANY_ADDRESS}</li>
          <li><strong>Website:</strong> moneytrend.in</li>
          <li>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a>
          </li>
          <li>
            <strong>Customer Care:</strong>{' '}
            <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
          </li>
          <li>
            <strong>Grievance Officer:</strong>{' '}
            <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-secondary hover:underline">{GRIEVANCE_EMAIL}</a>
          </li>
        </LegalUl>

        <LegalH2 id="data-consent">2. Data, privacy and consent</LegalH2>
        <LegalP>
          MoneyTrend may collect, use, store and process personal information in accordance with this Privacy Policy,
          applicable law (including the Digital Personal Data Protection Act, 2023 where applicable) and user consent.
          By using services requiring personal or financial information, users authorise MoneyTrend and relevant
          authorised partners to process such information for the disclosed purpose, subject to applicable legal
          requirements.
        </LegalP>

        <LegalH2 id="what-we-collect">3. Information we may collect</LegalH2>
        <LegalUl>
          <li>Identity and contact details such as name, email, phone number and date of birth.</li>
          <li>KYC and identity-verification information (for example PAN, Aadhaar-related verification outputs, photographs or documents) where you complete eKYC or manual KYC.</li>
          <li>Bank account and payment-related details required to facilitate FD/RD or wallet flows through partners.</li>
          <li>Credit-related information requested with your explicit consent through authorised credit bureau providers (including Experian and TransUnion CIBIL, subject to availability).</li>
          <li>Technical and usage data such as device information, logs and support communications.</li>
        </LegalUl>

        <LegalH2 id="purposes">4. How we use information</LegalH2>
        <LegalUl>
          <li>To create and manage your account and provide platform services.</li>
          <li>To facilitate FD/RD access, eKYC, credit-score tools and related features you request.</li>
          <li>To communicate service updates, support responses and grievance handling.</li>
          <li>To comply with law, contractual requirements with financial partners, and fraud/security monitoring.</li>
        </LegalUl>
        <LegalP>
          MoneyTrend will not use eKYC information beyond the purposes disclosed to the user and permitted by applicable
          law, contractual requirements and this Privacy Policy.
        </LegalP>

        <LegalH2 id="sharing">5. Sharing with partners</LegalH2>
        <LegalP>
          MoneyTrend may share personal information with authorised financial partners, credit information companies,
          KYC/technology providers, payment systems and service vendors only as needed to deliver the requested service
          or as required by law. A currently identified financial partner for selected products is IDFC FIRST Bank,
          subject to applicable arrangements and approvals.
        </LegalP>
        <LegalP>
          Third parties operate under their own terms and privacy policies. MoneyTrend does not sell personal data.
        </LegalP>

        <LegalH2 id="credit">6. Credit score information</LegalH2>
        <LegalP>
          Credit score and credit-related information available through MoneyTrend may be provided through authorised
          integrations with credit information companies and approved service providers, including Experian and
          TransUnion CIBIL, subject to availability, user consent, eligibility and applicable terms.
        </LegalP>
        <LegalP>
          MoneyTrend does not independently calculate, alter or guarantee a user&apos;s credit score. Access to such
          information requires explicit user consent and authentication. See also the consent wording shown in the
          credit-check flow on the platform.
        </LegalP>

        <LegalH2 id="security">7. Security and retention</LegalH2>
        <LegalP>
          We apply reasonable technical and organisational safeguards to protect personal information. We retain
          information only as long as needed for the disclosed purposes, partner/contractual requirements, or applicable
          legal retention obligations.
        </LegalP>

        <LegalH2 id="rights">8. Your choices</LegalH2>
        <LegalP>
          Subject to applicable law, you may request access, correction or updates to your information, withdraw consent
          for consent-based processing (without affecting processing required by law), and raise privacy concerns with
          our Grievance Officer at{' '}
          <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-secondary hover:underline">{GRIEVANCE_EMAIL}</a>.
        </LegalP>

        <LegalH2 id="updates">9. Changes to this Policy</LegalH2>
        <LegalP>
          MoneyTrend may update this Privacy Policy from time to time. Updated versions will be published on the website
          with a revised last-updated date. Continued use of the platform after publication may constitute acceptance,
          subject to applicable law.
        </LegalP>
      </LegalPage>
    </>
  )
}
