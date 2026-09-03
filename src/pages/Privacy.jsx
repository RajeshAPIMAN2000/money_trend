import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import LegalPage, { LegalH2, LegalH3, LegalP, LegalUl } from '../components/common/LegalPage.jsx'

const LAST_UPDATED = '31 May 2026'

export default function Privacy() {
  return (
    <>
      <PageBanner {...getPageBanner('privacy')} breadcrumbs={[{ label: 'Privacy Policy' }]} />
      <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalP>
        This Privacy Policy explains how <strong>Fintech Demo Pvt Ltd</strong> (&quot;Fintech Demo&quot;,
        &quot;we&quot;, &quot;Data Fiduciary&quot;) collects, uses, stores, shares, and protects your personal data
        when you use our Platform. It is drafted to align with the{' '}
        <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP Act), applicable DPDP Rules,{' '}
        <strong>RBI Master Direction on KYC</strong>, <strong>PMLA</strong> record-keeping requirements, and{' '}
        <strong>SEBI</strong> norms on confidentiality and investor protection for securities market intermediaries.
      </LegalP>

      <LegalH2 id="notice">1. Notice under Section 5, DPDP Act</LegalH2>
      <LegalP>
        Before or at the time of collecting personal data, we provide this Policy (and product-specific notices at
        onboarding) describing:
      </LegalP>
      <LegalUl>
        <li>Personal data collected and the purpose of processing;</li>
        <li>How you may exercise your rights and withdraw consent;</li>
        <li>How to lodge a complaint with us and the Data Protection Board of India;</li>
        <li>Contact details of our Data Protection Officer / grievance contact.</li>
      </LegalUl>

      <LegalH2 id="data-collected">2. Personal data we collect</LegalH2>
      <LegalH3>2.1 Identity and KYC (RBI / SEBI mandated)</LegalH3>
      <LegalUl>
        <li>PAN, name, date of birth, photograph/selfie, signature specimen where required;</li>
        <li>Aadhaar (only through UIDAI-compliant authentication where you consent), address proof, and CKYC/KRA records;</li>
        <li>FATCA/CRS and politically exposed person (PEP) declarations for applicable investors;</li>
        <li>Video KYC or IPV records where prescribed.</li>
      </LegalUl>
      <LegalH3>2.2 Financial and transaction data</LegalH3>
      <LegalUl>
        <li>Bank account details, IFSC, penny-drop verification results, UPI/NEFT mandate data;</li>
        <li>Investment orders, holdings, CAS references, FD/RD booking details, SIP registrations;</li>
        <li>Risk profile, goal preferences, and suitability responses.</li>
      </LegalUl>
      <LegalH3>2.3 Technical and usage data</LegalH3>
      <LegalUl>
        <li>Device identifiers, IP address, browser type, logs, cookies, and fraud-prevention signals;</li>
        <li>Support tickets, chat transcripts, and call recordings where disclosed and consented.</li>
      </LegalUl>

      <LegalH2 id="purposes">3. Purposes and legal bases</LegalH2>
      <LegalP>We process personal data for the following purposes:</LegalP>
      <LegalUl>
        <li><strong>Consent (Section 6, DPDP Act):</strong> onboarding, marketing communications (opt-in), optional product features, and non-essential cookies.</li>
        <li><strong>Legitimate uses (Section 7, DPDP Act):</strong> fraud prevention, network security, and processing necessary to comply with law.</li>
        <li><strong>Legal obligation:</strong> KYC/AML under RBI and PMLA; SEBI/AMFI reporting; tax and audit requirements; court or regulator orders.</li>
        <li><strong>Contract:</strong> executing transactions you request and operating your account.</li>
      </LegalUl>
      <LegalP>
        We do not use KYC or transaction data retained solely for regulatory purposes for unrelated marketing or
        profiling, consistent with RBI–DPDP dual-compliance expectations.
      </LegalP>

      <LegalH2 id="sharing">4. Sharing with third parties</LegalH2>
      <LegalP>We may share personal data with:</LegalP>
      <LegalUl>
        <li>AMCs, registrars (RTAs), banks, NBFCs, and depositories for order execution and servicing;</li>
        <li>KYC Registration Agencies (KRAs), CKYC registry, and UIDAI-authentication service providers;</li>
        <li>Payment aggregators, NPCI members, and banking partners for fund transfers;</li>
        <li>Cloud hosting, encryption, analytics, and customer-support vendors under data-processing agreements with security obligations;</li>
        <li>Regulators (SEBI, RBI, FIU-IND, tax authorities) when required by law;</li>
        <li>Professional advisers (auditors, lawyers) bound by confidentiality.</li>
      </LegalUl>
      <LegalP>
        We do not sell personal data. Cross-border transfers, if any, occur only to jurisdictions not restricted by
        the Central Government under the DPDP Act and with appropriate contractual safeguards.
      </LegalP>

      <LegalH2 id="retention">5. Retention (DPDP Section 8 and RBI / PMLA overrides)</LegalH2>
      <LegalP>
        We retain personal data only as long as necessary for the stated purpose or as required by law:
      </LegalP>
      <LegalUl>
        <li><strong>KYC records:</strong> minimum period under RBI Master Direction on KYC (generally at least five years after account/relationship closure; enhanced periods may apply for certain records).</li>
        <li><strong>Transaction / AML records:</strong> at least five years from transaction date or end of relationship under PMLA Rules, whichever is later.</li>
        <li><strong>SEBI/AMFI records:</strong> distribution and investor interaction records as per applicable circulars (commonly five years or more for audit readiness).</li>
        <li><strong>Marketing data:</strong> until consent is withdrawn or purpose ends, then erased unless another legal basis applies.</li>
      </LegalUl>
      <LegalP>
        If you request erasure under the DPDP Act, we will comply for data not subject to statutory retention, and
        explain the legal basis for retaining regulated records (DPDP Act Section 8(7) — necessity for compliance with law).
      </LegalP>

      <LegalH2 id="security">6. Security safeguards (DPDP Section 8)</LegalH2>
      <LegalUl>
        <li>Encryption in transit (TLS) and at rest for sensitive fields;</li>
        <li>Role-based access controls, multi-factor authentication for staff systems, and periodic access reviews;</li>
        <li>Security monitoring, vulnerability management, and incident response procedures;</li>
        <li>Employee training on data protection and AML confidentiality;</li>
        <li>Alignment with RBI guidance on IT governance and cyber resilience for regulated financial services partners.</li>
      </LegalUl>

      <LegalH2 id="breach">7. Personal data breach notification</LegalH2>
      <LegalP>
        In the event of a personal data breach likely to affect you, we will notify the Data Protection Board of India
        and affected Data Principals as required under the DPDP Act and Rules (including timelines prescribed for
        such intimation, presently oriented around prompt reporting within statutory windows such as 72 hours where
        applicable). We will describe the nature of the breach, mitigating steps, and contact points for queries.
      </LegalP>

      <LegalH2 id="rights">8. Your rights as a Data Principal</LegalH2>
      <LegalP>Subject to the DPDP Act and applicable exceptions, you may:</LegalP>
      <LegalUl>
        <li><strong>Access</strong> a summary of personal data held and processing activities;</li>
        <li><strong>Correction and updating</strong> of inaccurate or incomplete data (also via Profile / KYC refresh on the Platform);</li>
        <li><strong>Erasure</strong> where retention is not legally required;</li>
        <li><strong>Withdraw consent</strong> for processing based on consent (without affecting law-based processing);</li>
        <li><strong>Nominate</strong> another individual to exercise rights in the event of death or incapacity;</li>
        <li><strong>Grievance redressal</strong> through our officer below, and escalation to the Data Protection Board of India.</li>
      </LegalUl>
      <LegalP>
        Requests may be sent to <a href="mailto:privacy@fintechdemo.in" className="text-secondary hover:underline">privacy@fintechdemo.in</a>.
        We will verify identity before responding and aim to reply within timelines prescribed under the DPDP Rules.
      </LegalP>

      <LegalH2 id="children">9. Children&apos;s data</LegalH2>
      <LegalP>
        The Platform is not directed at persons under 18. We do not knowingly process children&apos;s personal data
        without verifiable parental consent where required under the DPDP Act and allied rules.
      </LegalP>

      <LegalH2 id="cookies">10. Cookies and similar technologies</LegalH2>
      <LegalP>
        We use essential cookies for authentication and security. Analytics and marketing cookies are used only with
        consent where required. You may manage preferences through browser settings or in-app controls where available.
      </LegalP>

      <LegalH2 id="sebi-rbi">11. SEBI and RBI specific disclosures</LegalH2>
      <LegalUl>
        <li>Investor data obtained for mutual fund transactions may be shared with AMCs and RTAs under SEBI-mandated processes including Consolidated Account Statement (CAS) frameworks.</li>
        <li>We cooperate with SEBI inspections and AMFI compliance reviews concerning distributor conduct and record-keeping.</li>
        <li>Payment data is processed in line with RBI directions on digital payments, customer protection, and outsourcing of IT services to third parties.</li>
      </LegalUl>

      <LegalH2 id="dpo">12. Contact and Data Protection Officer</LegalH2>
      <LegalP>
        <strong>Data Protection Officer / Privacy Grievance</strong><br />
        Fintech Demo Pvt Ltd<br />
        Email: <a href="mailto:privacy@fintechdemo.in" className="text-secondary hover:underline">privacy@fintechdemo.in</a><br />
        Grievance: <a href="mailto:grievance@fintechdemo.in" className="text-secondary hover:underline">grievance@fintechdemo.in</a>
      </LegalP>
      <LegalP>
        If unsatisfied with our response, you may approach the <strong>Data Protection Board of India</strong> as
        established under the DPDP Act, in addition to remedies under the Information Technology Act, 2000 and other
        applicable laws.
      </LegalP>

      <LegalH2 id="updates">13. Changes to this Policy</LegalH2>
      <LegalP>
        We update this Policy when laws, RBI/SEBI circulars, or our processing activities change. The &quot;Last
        updated&quot; date will be revised, and significant changes will be highlighted on the Platform.
      </LegalP>
    </LegalPage>
    </>
  )
}
