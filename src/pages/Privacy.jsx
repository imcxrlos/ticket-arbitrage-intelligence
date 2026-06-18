import { Link } from "react-router-dom";

const LAST_UPDATED = "June 18, 2026";

export default function Privacy() {
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
          <h1 className="font-display text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-xs text-white/25 font-mono">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-sm text-white/50 leading-relaxed">

          <Section title="1. Overview">
            <p>Ghost ("we", "us", "our") respects your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data. Ghost is an informational tool — we collect the minimum data necessary to operate the Service.</p>
          </Section>

          <Section title="2. Data We Collect">
            <p><strong className="text-white/70">Account data:</strong> If you create an account, we collect your email address and a hashed password. We do not collect your real name unless you choose to provide it.</p>
            <p className="mt-3"><strong className="text-white/70">Usage data:</strong> We collect basic usage analytics including pages visited, features used, and approximate session duration. This data is aggregated and not tied to your identity.</p>
            <p className="mt-3"><strong className="text-white/70">Watchlist & alert preferences:</strong> We store the matches, price thresholds, and notification preferences you configure so we can deliver alerts to you.</p>
            <p className="mt-3"><strong className="text-white/70">Communications:</strong> If you contact us, we may retain your message to respond to you.</p>
            <p className="mt-3"><strong className="text-white/70">What we do NOT collect:</strong></p>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "We do not collect payment information — we do not sell anything.",
                "We do not collect government IDs or financial information.",
                "We do not track you across third-party websites.",
                "We do not sell or rent your data to any third party.",
                "We do not use your data for advertising targeting.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-white/20 mt-0.5">—</span>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>We use the data we collect to:</p>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Provide, maintain, and improve the Service.",
                "Send you price alerts and notifications you have configured.",
                "Respond to your support inquiries.",
                "Detect abuse, fraud, and violations of our Terms of Service.",
                "Comply with applicable legal obligations.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-white/20 mt-0.5">—</span>{item}</li>
              ))}
            </ul>
            <p className="mt-3">We do not use your data for any purpose not listed above without your explicit consent.</p>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do not sell, trade, or rent your personal data. We may share data only in the following limited circumstances:</p>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Service providers: Infrastructure and hosting providers who process data on our behalf under strict confidentiality agreements.",
                "Legal compliance: If required by law, court order, or governmental authority.",
                "Business transfer: In the event of a merger, acquisition, or sale of assets, with notice to you.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-white/20 mt-0.5">—</span>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="5. Cookies & Tracking">
            <p>Ghost uses minimal session cookies strictly necessary to keep you logged in. We do not use advertising cookies, third-party tracking pixels, or behavioral analytics tools (e.g., Facebook Pixel, Google Ads tracking). You may disable cookies in your browser, but certain features (such as staying logged in) will not function without them.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time. Usage analytics data is retained in anonymized, aggregated form and cannot be linked back to you. Alert and watchlist data is deleted upon account deletion.</p>
          </Section>

          <Section title="7. Security">
            <p>We implement industry-standard security measures including encryption in transit (TLS), hashed password storage, and access controls. However, no system is completely secure. We cannot guarantee the absolute security of your data and are not liable for unauthorized access resulting from factors outside our reasonable control.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="mt-2 space-y-1.5 list-none">
              {[
                "Access the personal data we hold about you.",
                "Request correction of inaccurate data.",
                "Request deletion of your data ('right to be forgotten').",
                "Object to or restrict certain processing of your data.",
                "Data portability — receive a copy of your data in a machine-readable format.",
                "Withdraw consent at any time where processing is based on consent.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-white/20 mt-0.5">—</span>{item}</li>
              ))}
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us through the Service. We will respond within 30 days.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Ghost is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, please contact us immediately and we will delete it.</p>
          </Section>

          <Section title="10. International Users">
            <p>Ghost is operated from the United States. If you access the Service from outside the US, you consent to the transfer and processing of your data in the US, which may have different data protection laws than your country of residence.</p>
            <p className="mt-3"><strong className="text-white/70">GDPR (EU/EEA users):</strong> We process your data under the lawful basis of contract performance (to provide the Service) and legitimate interests. You have all rights enumerated in Section 8 above.</p>
            <p className="mt-3"><strong className="text-white/70">CCPA (California users):</strong> We do not sell your personal information. You have the right to know what data we collect and request deletion at any time.</p>
          </Section>

          <Section title="11. Third-Party Links">
            <p>Ghost links to third-party ticket marketplaces. Once you leave our Service, this Privacy Policy does not apply. We encourage you to review the privacy policies of any third-party platforms you visit.</p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will update the "Last updated" date and, for material changes, notify you via email or a prominent notice on the Service. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="13. Contact">
            <p>For privacy-related inquiries, data access requests, or deletion requests, contact us through the Service.</p>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6">
          <Link to="/terms" className="text-xs text-white/30 hover:text-white font-mono transition-colors">Terms of Service →</Link>
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