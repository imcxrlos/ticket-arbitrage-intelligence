import { Link } from "react-router-dom";

const LAST_UPDATED = "June 18, 2026";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="font-display font-semibold tracking-tight text-white">Ghost</span>
          </Link>
          <Link to="/" className="text-xs text-white/40 hover:text-white font-mono transition-colors">← Back</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-xs text-white/25 font-mono">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-sm text-white/50 leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Ghost ("the Service", "we", "us", "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all visitors, users, and others who access the Service.</p>
          </Section>

          <Section title="2. Nature of the Service">
            <p>Ghost is an <strong className="text-white/70">independent, informational price-comparison and market intelligence tool</strong>. We aggregate and analyze publicly available secondary ticket market data to help users identify potential price discrepancies across marketplaces.</p>
            <p className="mt-3"><strong className="text-white/70">Ghost is not a ticket broker, ticket seller, or ticket reseller.</strong> We do not sell, transfer, list, or facilitate the purchase of tickets. We do not hold inventory of any kind. All ticket transactions occur exclusively on third-party platforms, which are independent of Ghost.</p>
            <p className="mt-3">Ghost has <strong className="text-white/70">no financial relationship</strong> with any ticket marketplace. We receive no affiliate commissions, referral fees, or any other compensation from any ticket platform, seller, or broker. Our rankings and scores are based solely on price data.</p>
          </Section>

          <Section title="3. No Guarantee of Accuracy">
            <p>Ticket prices, availability, and market data change rapidly. Ghost displays information that was accurate at the time of its last scan but <strong className="text-white/70">makes no warranty that any displayed price, availability, or opportunity is current, accurate, or will remain available</strong> by the time you act on it.</p>
            <p className="mt-3">You acknowledge that:</p>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Price data may be delayed, incomplete, or inaccurate.",
                "Opportunities may no longer exist when you visit a third-party platform.",
                "Ghost's scoring and analysis is algorithmic and may contain errors.",
                "Past pricing patterns are not indicative of future market behavior.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-white/20 mt-0.5">—</span>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="4. Not Financial or Investment Advice">
            <p>Nothing on Ghost constitutes financial, investment, legal, or tax advice. Ticket arbitrage involves real financial risk. You may purchase tickets at a price that does not appreciate, lose value, or become worthless (e.g., event cancellation, fraud). <strong className="text-white/70">Ghost is not responsible for any financial loss arising from your use of this Service.</strong></p>
          </Section>

          <Section title="5. Third-Party Platforms">
            <p>Ghost links to third-party ticket platforms for informational purposes only. We have no control over those platforms and are not responsible for their content, pricing, policies, or practices. Your interactions with third-party platforms are governed by their own terms and privacy policies. Ghost disclaims all liability for transactions conducted on third-party platforms.</p>
          </Section>

          <Section title="6. Permitted Use">
            <p>You may use Ghost for personal, non-commercial informational purposes. You agree not to:</p>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Scrape, crawl, or systematically extract data from the Service.",
                "Use the Service for automated trading, botting, or resale at scale.",
                "Reverse engineer, decompile, or attempt to extract source code.",
                "Use the Service in any way that violates applicable law.",
                "Impersonate another user or create false accounts.",
                "Circumvent any access controls or rate limits.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-white/20 mt-0.5">—</span>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>All content, scoring algorithms, design, and software comprising Ghost are owned by or licensed to Ghost and protected by applicable intellectual property laws. You may not copy, reproduce, modify, or distribute any part of the Service without our prior written consent.</p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GHOST AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p className="mt-3">OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED $100 USD.</p>
          </Section>

          <Section title="10. Indemnification">
            <p>You agree to indemnify, defend, and hold harmless Ghost and its operators from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any third-party rights.</p>
          </Section>

          <Section title="11. Ticket Scalping & Resale Laws">
            <p>Ticket resale laws vary by jurisdiction. <strong className="text-white/70">Ghost does not facilitate ticket scalping or resale.</strong> We are an information service only. It is your sole responsibility to ensure that any ticket purchase or resale activity you undertake complies with the laws of your jurisdiction. Ghost disclaims all liability for any legal consequences arising from your ticket transactions.</p>
          </Section>

          <Section title="12. Modifications to Terms">
            <p>We reserve the right to modify these Terms at any time. We will update the "Last updated" date at the top of this page. Continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>
          </Section>

          <Section title="13. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes shall be resolved exclusively through binding arbitration under the rules of the American Arbitration Association.</p>
          </Section>

          <Section title="14. Contact">
            <p>For questions about these Terms, contact us through the Service.</p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6">
          <Link to="/privacy" className="text-xs text-white/30 hover:text-white font-mono transition-colors">Privacy Policy →</Link>
          <Link to="/" className="text-xs text-white/30 hover:text-white font-mono transition-colors">Back to Ghost →</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-white/80 mb-3">{title}</h2>
      {children}
    </div>
  );
}