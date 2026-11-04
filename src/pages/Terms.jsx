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

export default function Terms() {
  return (
    <>
      <PageBanner {...getPageBanner('terms')} breadcrumbs={[{ label: 'Terms & Conditions' }]} />
      <LegalPage title="Terms of Use and Service Policy" lastUpdated={LAST_UPDATED}>
        <LegalP>
          These Terms of Use and Service Policy (&quot;Terms&quot;) govern your access to and use of the website,
          platform, applications, tools, calculators and services operated by{' '}
          <strong>{COMPANY_NAME}</strong> (&quot;MoneyTrend&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot; or
          &quot;our&quot;) through moneytrend.in and related digital platforms. By accessing or using the platform, you
          agree to be bound by these Terms and our{' '}
          <Link to="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>,{' '}
          <Link to="/refund" className="text-secondary hover:underline">Refund Policy</Link> and other policies published
          on the platform.
        </LegalP>

        <LegalH2 id="company">1. Company and contact information</LegalH2>
        <LegalUl>
          <li><strong>Company Name:</strong> {COMPANY_NAME}</li>
          <li><strong>Registered Address:</strong> {COMPANY_ADDRESS}</li>
          <li><strong>Website:</strong> moneytrend.in</li>
          <li>
            <strong>Official Email:</strong>{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">{SUPPORT_EMAIL}</a>
          </li>
          <li>
            <strong>Customer Care Number:</strong>{' '}
            <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
          </li>
          <li>
            <strong>Grievance Officer Email:</strong>{' '}
            <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-secondary hover:underline">{GRIEVANCE_EMAIL}</a>
          </li>
        </LegalUl>

        <LegalH2 id="nature">2. Nature of the platform</LegalH2>
        <LegalP>
          {COMPANY_NAME} is a technology and financial-information platform. MoneyTrend is not a lender, loan provider,
          loan marketplace, loan referral platform, Loan Service Provider (LSP), bank, Non-Banking Financial Company
          (NBFC), credit bureau or investment adviser unless specifically stated and separately authorised under
          applicable law.
        </LegalP>
        <LegalP>
          MoneyTrend does not itself provide loans, sanction credit, collect loan repayments, guarantee credit approval
          or make lending decisions. Any financial product or service offered by a third-party bank, NBFC, credit bureau
          or other regulated entity shall be governed by that entity&apos;s own terms, eligibility criteria, policies and
          applicable regulations.
        </LegalP>

        <LegalH2 id="services">3. Services provided by MoneyTrend</LegalH2>
        <LegalP>
          Subject to availability, eligibility and applicable laws, MoneyTrend may provide the following services and
          tools:
        </LegalP>
        <LegalUl>
          <li>Fixed Deposit (FD) information, access or facilitation through eligible financial partners.</li>
          <li>Recurring Deposit (RD) information, access or facilitation through eligible financial partners.</li>
          <li>Credit score access or related information through authorised credit bureau providers and/or approved integrations.</li>
          <li>EMI Calculator and other financial calculators for informational and illustrative purposes.</li>
          <li>Goal Planning tools to help users plan and track personal financial goals.</li>
          <li>Digital eKYC facilitation or technology support, where legally permitted and where completed through authorised and regulated partners or approved processes.</li>
        </LegalUl>

        <LegalH2 id="partners">4. Financial partners</LegalH2>
        <LegalP>
          MoneyTrend may work with financial institutions and service providers to enable or facilitate selected
          services. A currently identified financial partner is <strong>IDFC FIRST Bank</strong>, subject to the
          existence and continuation of a valid commercial and/or technology arrangement, applicable approvals, product
          availability and regulatory requirements.
        </LegalP>
        <LegalP>
          MoneyTrend may add, remove or change partners from time to time. The availability of any partner product on
          the MoneyTrend platform shall not constitute a guarantee that the product will be available to every user.
        </LegalP>

        <LegalH2 id="fd-rd">5. FD and RD services</LegalH2>
        <LegalP>
          FD and RD products, where available through MoneyTrend, are offered, issued and governed by the relevant bank
          or financial institution and its applicable terms and conditions. Interest rates, tenure, premature withdrawal
          conditions, penalties, maturity value, deposit limits, eligibility and other product features are determined by
          the relevant product provider and may change from time to time.
        </LegalP>
        <LegalP>
          MoneyTrend does not guarantee any interest rate, return, maturity amount or acceptance of an FD or RD
          application. Users must review the relevant bank&apos;s product terms, disclosures and confirmations before
          completing a transaction. Payment, cancellation and refund handling is described in our{' '}
          <Link to="/refund" className="text-secondary hover:underline">Refund Policy</Link>.
        </LegalP>

        <LegalH2 id="calculators">6. EMI calculator and goal planning tools</LegalH2>
        <LegalP>
          The EMI Calculator, Goal Planning tools and other calculators available on MoneyTrend are intended for general
          informational and illustrative purposes only. Results may vary based on actual interest rates, fees, taxes,
          repayment schedules, product terms and other factors.
        </LegalP>
        <LegalP>
          These tools do not constitute financial, investment, tax, legal or professional advice. Users should
          independently verify calculations and consult qualified professionals where appropriate.
        </LegalP>

        <LegalH2 id="ekyc">7. eKYC</LegalH2>
        <LegalP>
          Where eKYC or identity-verification functionality is made available, it may be facilitated through authorised
          partners, regulated entities or legally permitted technology providers. Users agree to provide accurate
          information and complete any required consent and verification processes.
        </LegalP>
        <LegalP>
          MoneyTrend will not use eKYC information beyond the purposes disclosed to the user and permitted by applicable
          law, contractual requirements and applicable privacy policies. Completion of eKYC does not guarantee approval
          for any financial product or service.
        </LegalP>

        <LegalH2 id="responsibilities">8. User responsibilities</LegalH2>
        <LegalUl>
          <li>Provide true, accurate and complete information.</li>
          <li>Keep login credentials and authentication information secure.</li>
          <li>Use the platform only for lawful purposes.</li>
          <li>Not impersonate another person or provide misleading information.</li>
          <li>Review third-party financial product terms before accepting a product or completing a transaction.</li>
          <li>Notify MoneyTrend promptly if they suspect unauthorised access or misuse of their account.</li>
        </LegalUl>

        <LegalH2 id="third-party">9. Third-party services and links</LegalH2>
        <LegalP>
          MoneyTrend may provide links, integrations, embedded services or access to third-party websites and services.
          Such third parties operate under their own terms and privacy policies. MoneyTrend is not responsible for the
          content, availability, security, decisions, products or services of third parties except to the extent required
          by applicable law.
        </LegalP>

        <LegalH2 id="no-guarantee">10. No guarantee of product approval or returns</LegalH2>
        <LegalP>
          MoneyTrend does not guarantee approval, acceptance, issuance, availability, interest rates, returns, credit
          scores or eligibility for any third-party financial product or service. All approvals and product decisions
          remain with the relevant regulated financial institution or service provider.
        </LegalP>

        <LegalH2 id="ip">11. Intellectual property</LegalH2>
        <LegalP>
          The MoneyTrend name, logos, website content, software, designs, trademarks and other intellectual property are
          owned by or licensed to {COMPANY_NAME} unless otherwise stated. Users may not copy, reproduce, distribute or
          commercially use such material without prior written permission.
        </LegalP>

        <LegalH2 id="liability">12. Limitation of liability</LegalH2>
        <LegalP>
          To the maximum extent permitted by applicable law, MoneyTrend shall not be liable for indirect, incidental,
          consequential or special losses arising from use of the platform, third-party products, third-party service
          interruptions, inaccurate user information, market changes, banking system delays or matters outside
          MoneyTrend&apos;s reasonable control.
        </LegalP>
        <LegalP>
          Nothing in these Terms excludes liability that cannot lawfully be excluded under applicable law.
        </LegalP>

        <LegalH2 id="grievance">13. Grievance redressal</LegalH2>
        <LegalP>For complaints, grievances or service-related concerns, users may contact the Grievance Officer through:</LegalP>
        <LegalUl>
          <li>
            Email:{' '}
            <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-secondary hover:underline">{GRIEVANCE_EMAIL}</a>
          </li>
          <li>
            Customer Care Number:{' '}
            <a href={`tel:${CUSTOMER_CARE_TEL}`} className="text-secondary hover:underline">{CUSTOMER_CARE_DISPLAY}</a>
          </li>
        </LegalUl>
        <LegalP>
          MoneyTrend will make reasonable efforts to acknowledge and address grievances within the timelines and
          procedures applicable to the nature of the service and under applicable law. Where a complaint relates to a
          third-party bank, credit bureau or other financial institution, the matter may need to be addressed under that
          entity&apos;s grievance process as well.
        </LegalP>

        <LegalH2 id="modification">14. Modification of Terms</LegalH2>
        <LegalP>
          MoneyTrend may update or modify these Terms from time to time. Updated Terms will be published on the website
          with a revised effective or last-updated date. Continued use of the platform after publication of updated Terms
          may constitute acceptance of the revised Terms, subject to applicable law.
        </LegalP>

        <LegalH2 id="law">15. Governing law and jurisdiction</LegalH2>
        <LegalP>
          These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the
          competent courts in India, subject to any mandatory statutory or regulatory provisions that may apply.
        </LegalP>

        <LegalH2 id="disclaimer">16. Important disclaimer</LegalH2>
        <LegalP>
          {COMPANY_NAME} is a technology and financial-information platform and is not a lender, loan provider, loan
          marketplace, loan referral platform or LSP. FD and RD products, credit score services and other financial
          products or services are provided by or through relevant authorised financial institutions, credit information
          companies or other approved service providers, subject to applicable terms, eligibility and law.
        </LegalP>
        <LegalP>
          Users are advised to read all product-specific disclosures, terms and conditions and privacy notices before
          proceeding with any financial transaction or sharing personal information.
        </LegalP>
        <LegalP>
          © {COMPANY_NAME}. All rights reserved.
        </LegalP>
      </LegalPage>
    </>
  )
}
