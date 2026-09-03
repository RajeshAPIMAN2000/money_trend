import { Link } from 'react-router-dom'
import { getPageBanner } from '../data/page-banners.js'
import PageBanner from '../components/common/PageBanner.jsx'
import LegalPage, { LegalH2, LegalH3, LegalP, LegalUl } from '../components/common/LegalPage.jsx'

const LAST_UPDATED = '31 May 2026'

export default function Terms() {
  return (
    <>
      <PageBanner {...getPageBanner('terms')} breadcrumbs={[{ label: 'Terms & Conditions' }]} />
      <LegalPage title="Terms & Conditions" lastUpdated={LAST_UPDATED}>
      <LegalP>
        These Terms and Conditions (&quot;Terms&quot;) govern access to and use of the Fintech Demo website, mobile
        applications, and related services (collectively, the &quot;Platform&quot;) operated by{' '}
        <strong>Fintech Demo Pvt Ltd</strong> (&quot;Fintech Demo&quot;, &quot;we&quot;, &quot;us&quot;), a company
        incorporated in India. By registering on or using the Platform, you (&quot;User&quot;, &quot;you&quot;,
        &quot;Investor&quot;) agree to be bound by these Terms and our{' '}
        <Link to="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>.
      </LegalP>

      <LegalH2 id="regulatory">1. Regulatory status and scope</LegalH2>
      <LegalP>
        Fintech Demo facilitates access to investment products including mutual funds, fixed deposits (FDs), and recurring
        deposits (RDs) offered by SEBI-registered Asset Management Companies (AMCs), banks, and NBFCs. Fintech Demo is
        described on the Platform as a SEBI-registered investment intermediary (registration reference: INA000012345) and
        maintains processes designed to align with RBI norms applicable to customer due diligence, payments, and
        financial consumer protection.
      </LegalP>
      <LegalUl>
        <li>
          <strong>SEBI:</strong> Mutual fund distribution and related communications are undertaken in accordance with
          the SEBI Master Circular for Mutual Funds dated 27 June 2024, AMFI Master Circular for Mutual Fund
          Distributors, and applicable SEBI circulars on disclosure, commission transparency, and conduct.
        </li>
        <li>
          <strong>RBI:</strong> Customer identification, bank-account verification, and record-keeping follow the RBI
          Master Direction – Know Your Customer (KYC) Direction, 2016 (as updated), and allied RBI instructions on
          regulated payment flows.
        </li>
        <li>
          <strong>PMLA:</strong> Anti-money laundering (AML) and combating financing of terrorism (CFT) obligations
          under the Prevention of Money Laundering Act, 2002 and the Prevention of Money Laundering (Maintenance of
          Records) Rules, 2005 apply to us and our partners.
        </li>
      </LegalUl>
      <LegalP>
        Fintech Demo is not a bank. Deposits displayed on the Platform are products of respective banks/NBFCs subject to
        their terms and DICGC/issuer protections as applicable. Mutual fund units are subject to market risks; please
        read all scheme-related documents carefully.
      </LegalP>

      <LegalH2 id="eligibility">2. Eligibility and account</LegalH2>
      <LegalUl>
        <li>You must be 18 years or older and competent to contract under the Indian Contract Act, 1872.</li>
        <li>You must be resident in India unless a product explicitly permits NRI investment with valid NRE/NRO documentation and FATCA/CRS declarations.</li>
        <li>You agree to provide accurate PAN, Aadhaar (where permitted for e-KYC), identity, address, and bank details and to update them promptly on change.</li>
        <li>We may refuse, suspend, or terminate access where KYC/AML checks fail, information is incomplete, or regulatory action requires it.</li>
      </LegalUl>

      <LegalH2 id="kyc">3. KYC, AML, and CFT (RBI / PMLA)</LegalH2>
      <LegalP>
        Before transacting, you must complete Know Your Customer (KYC) verification as prescribed under RBI KYC
        Directions and SEBI/AMFI requirements, including PAN verification, Aadhaar-based OTP e-KYC or physical KYC where
        required, and in-person verification (IPV) if mandated.
      </LegalP>
      <LegalUl>
        <li>We and our regulated partners may seek source-of-funds information, enhanced due diligence for high-risk profiles, and periodic KYC refresh.</li>
        <li>Suspicious transactions may be reported to the Financial Intelligence Unit-India (FIU-IND) without prior notice, as required by law.</li>
        <li>You must not use the Platform for money laundering, terror financing, circular trading, or any unlawful purpose.</li>
      </LegalUl>

      <LegalH2 id="products">4. Products, orders, and settlement</LegalH2>
      <LegalH3>4.1 Mutual funds</LegalH3>
      <LegalUl>
        <li>Orders are placed in your name and transmitted to AMCs/registrars. Cut-off times, NAV applicability, and exit loads follow respective Scheme Information Documents (SID), Key Information Memoranda (KIM), and Statement of Additional Information (SAI).</li>
        <li>Where Fintech Demo offers <strong>direct plans</strong>, no distributor commission is charged by us on those plans; Total Expense Ratio (TER) and statutory levies still apply.</li>
        <li>Where trail or other commissions apply, disclosure is provided at point of sale and on the Platform as required under SEBI/AMFI commission disclosure norms.</li>
        <li>Past performance does not guarantee future results. Schemes are not guaranteed or assured return products unless explicitly stated in approved offer documents.</li>
      </LegalUl>
      <LegalH3>4.2 Fixed and recurring deposits</LegalH3>
      <LegalUl>
        <li>FD/RD bookings are subject to acceptance by the issuing bank/NBFC. Interest rates, tenure, premature withdrawal penalties, and insurance (e.g. DICGC limits for eligible bank deposits) are as per the issuer&apos;s terms.</li>
        <li>Fintech Demo does not hold client money; funds move through banking/NPCI channels to the issuer or collection account as disclosed at transaction time.</li>
      </LegalUl>

      <LegalH2 id="fees">5. Fees, charges, and taxes</LegalH2>
      <LegalP>
        Applicable fees include AMC TER, exit loads, stamp duty, securities transaction tax (STT) where relevant, GST,
        and any Platform service fees disclosed before confirmation. You are responsible for tax reporting of
        capital gains, interest, and TDS credits as per the Income-tax Act, 1961.
      </LegalP>

      <LegalH2 id="conduct">6. Conduct, communications, and restrictions</LegalH2>
      <LegalUl>
        <li>Platform content is general information unless you have a separate written advisory agreement compliant with SEBI (Investment Advisers) Regulations, 2013.</li>
        <li>We do not guarantee returns, assure capital safety on market-linked products, or recommend schemes without regard to your stated profile where suitability norms apply.</li>
        <li>You may not scrape, reverse-engineer, or misuse the Platform; impersonate others; or publish misleading statements about Fintech Demo or listed products.</li>
        <li>Marketing by Fintech Demo or its authorised personnel will identify registration details (e.g. AMFI ARN / SEBI registration) where required by SEBI/AMFI social media and communication circulars.</li>
      </LegalUl>

      <LegalH2 id="ip">7. Intellectual property</LegalH2>
      <LegalP>
        Trademarks, logos, software, and content on the Platform are owned by Fintech Demo or licensors. You receive a
        limited, non-exclusive licence to use the Platform for personal investment purposes in accordance with these
        Terms.
      </LegalP>

      <LegalH2 id="liability">8. Limitation of liability</LegalH2>
      <LegalP>
        To the maximum extent permitted by law, Fintech Demo is not liable for indirect, incidental, or consequential
        losses, loss of profits, or losses arising from AMC/bank/registrar delays, market movements, force majeure,
        or third-party system failures. Our aggregate liability for direct losses arising from proven gross
        negligence in Platform operations shall not exceed the fees paid by you to Fintech Demo in the twelve months
        preceding the claim, except where consumer protection law or regulator-mandated compensation requires otherwise.
      </LegalP>

      <LegalH2 id="grievance">9. Grievance redressal (SEBI / RBI aligned)</LegalH2>
      <LegalP>
        We maintain a grievance redressal mechanism consistent with SEBI and RBI expectations for financial
        intermediaries:
      </LegalP>
      <LegalUl>
        <li><strong>Level 1:</strong> Email <a href="mailto:support@fintechdemo.in" className="text-secondary hover:underline">support@fintechdemo.in</a> — acknowledgement within 3 working days; resolution target within 15 working days for standard complaints.</li>
        <li><strong>Level 2:</strong> Escalation to Grievance Officer at <a href="mailto:grievance@fintechdemo.in" className="text-secondary hover:underline">grievance@fintechdemo.in</a> if unresolved within 15 working days.</li>
        <li><strong>SEBI SCORES:</strong> Investors may lodge complaints on the SEBI Complaints Redress System (SCORES) at <a href="https://scores.sebi.gov.in" className="text-secondary hover:underline" target="_blank" rel="noopener noreferrer">scores.sebi.gov.in</a> for securities market matters.</li>
        <li><strong>RBI Ombudsman:</strong> For applicable banking/payment-related issues, you may approach the RBI Integrated Ombudsman Scheme as notified by RBI from time to time.</li>
      </LegalUl>
      <LegalP>
        <strong>Grievance Officer:</strong> Ms. Ananya Reddy · Fintech Demo Pvt Ltd · Bengaluru, Karnataka ·
        grievance@fintechdemo.in · Mon–Fri, 10:00–18:00 IST (excluding public holidays).
      </LegalP>

      <LegalH2 id="records">10. Records and audits</LegalH2>
      <LegalP>
        We maintain transaction logs, KYC records, and communications for periods required under RBI KYC Directions
        (typically at least five years after relationship termination, and longer where PMLA or specific SEBI/AMFI
        norms apply). Records may be inspected by regulators, auditors, or law enforcement as permitted by law.
      </LegalP>

      <LegalH2 id="termination">11. Suspension and termination</LegalH2>
      <LegalP>
        We may suspend or close your account for breach of these Terms, regulatory direction, or risk management.
        You may close your account subject to settlement of pending transactions and statutory retention of records.
      </LegalP>

      <LegalH2 id="law">12. Governing law and jurisdiction</LegalH2>
      <LegalP>
        These Terms are governed by the laws of India. Courts at Bengaluru, Karnataka shall have exclusive
        jurisdiction, subject to your rights under applicable consumer protection laws to approach forums in your
        place of residence where permitted.
      </LegalP>

      <LegalH2 id="changes">13. Changes to Terms</LegalH2>
      <LegalP>
        We may update these Terms to reflect regulatory changes (including RBI, SEBI, AMFI, or DPDP amendments).
        Material changes will be notified on the Platform or by email. Continued use after the effective date
        constitutes acceptance.
      </LegalP>
    </LegalPage>
    </>
  )
}
