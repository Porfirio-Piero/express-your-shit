'use client';

function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

export default function Terms() {
  return (
    <>
      <header className="eys-header">
        <nav className="eys-nav">
          <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
          <div className="eys-navlinks"><a href="/#faq">FAQ</a><a href="/privacy">Privacy</a></div>
          <a href="/#order" className="eys-nav-cta">File Your Grievance</a>
        </nav>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eys-eyebrow" style={{ marginBottom: 14 }}>The Fine Print</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', color: 'var(--parchment)', lineHeight: 1.12 }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--parchment-dim)', marginTop: 14, fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
            Last updated: July 2026 · EYS-DOC-001
          </p>
        </div>

        <div style={{ background: 'rgba(107,30,36,0.15)', border: '1px solid var(--wine)', borderRadius: 6, padding: '22px 24px', marginBottom: 36 }}>
          <p style={{ color: 'var(--parchment)', fontWeight: 500, textAlign: 'center', lineHeight: 1.6 }}>
            Express Your Sh*t is a novelty gag-gift service. By using this service, you agree to the following terms.
            This is not a harassment tool. Misuse will result in order cancellation and account prohibition.
          </p>
        </div>

        <div style={{ marginBottom: 40 }}>
          {[
            { section: '§01', title: 'Service Description', body: 'Express Your Sh*t ("EYS") provides a premium anonymous novelty gag-gift service. We deliver synthetic or real specimens (depending on tier) with optional personalized certificates and voice notes to recipients designated by the sender.' },
            { section: '§02', title: 'Eligibility', body: 'You must be 18 years or older to use this service. By placing an order, you represent that you are at least 18 years old.' },
            { section: '§03', title: 'Prohibited Uses', body: 'You may NOT use this service to:', list: ['Target minors (anyone under 18)', 'Target schools, educational institutions, or government officials', 'Threaten, intimidate, or harass any person', 'Reference violence, self-harm, or illegal activity in notes or voice messages', 'Send repeat shipments to the same recipient address (enforced technically — see §4)', 'Use the service for any purpose other than as a novelty gag gift'] },
            { section: '§04', title: 'Anti-Harassment Protections', body: 'We take harassment seriously. Our system enforces a technical prohibition on repeat shipments to the same recipient address. If an address has received a shipment within the past 90 days, additional orders to that address will be automatically declined. This is a technical enforcement, not just a policy — you cannot circumvent it by creating multiple accounts.' },
            { section: '§05', title: 'Anonymity', body: 'The recipient never sees your name or any identifying detail. We keep minimal records to fulfill orders and comply with lawful requests. We do NOT claim "no paper trail" or "untraceable" — that would be dishonest and legally irresponsible. Recipient data is purged 30 days after delivery (see our Privacy Policy).' },
            { section: '§06', title: 'Product Claims', body: 'We guarantee production quality at the time of shipment: sealed, wax-stamped, glitter-infused (for Full Send), and accompanied by any included certificates or notes. We do NOT guarantee delivery conditions that depend on shipping time. Studio Reserve (Case Closed tier) is shipped same-day via Priority Mail to minimize transit time, but transit conditions are outside our control.' },
            { section: '§07', title: 'Payments', body: 'We accept Bitcoin, Lightning Network, and Monero via BTCPay Server, as well as cash by mail. We do NOT accept credit cards — this is a permanent design decision, not a temporary limitation.' },
            { section: '§08', title: 'Content Moderation', body: 'All anonymous notes and voice messages are subject to moderation. We use automated wordlist filtering and a server-side moderation pass before any content is produced. Orders containing prohibited content (threats, violence references, targeting of protected groups) will be cancelled and refunded.' },
            { section: '§09', title: 'Studio Reserve Cap', body: 'Case Closed (Studio Reserve) orders are capped at a daily limit based on actual specimen availability from contributing cats. The daily remaining count is displayed honestly on the product page. When daily supply is exhausted, the tier becomes unavailable until the next day. This is not artificial scarcity — it is the actual supply constraint of sourcing real specimens.' },
            { section: '§10', title: 'Refunds', body: 'If your order cannot be fulfilled (e.g., daily Studio Reserve cap reached, address verification failure, or content policy violation), you will receive a full refund in the original payment method. Crypto refunds are processed within 48 hours. Cash-by-mail refunds are returned via the address provided with your order.' },
            { section: '§11', title: 'Limitation of Liability', body: 'Express Your Sh*t is a novelty service provided "as is." We are not responsible for recipient reactions, shipping delays beyond our control, or any consequences of proper use of the service as a gag gift. Our total liability is limited to the amount paid for the order.' },
            { section: '§12', title: 'Changes to Terms', body: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms. Material changes will be noted on this page with an updated date.' },
            { section: '§13', title: 'Contact', body: 'For questions about these terms, contact us through the website. We do not provide a phone number — this is an anonymous service, and we respect that goes both ways.' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--parchment)', marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', flexShrink: 0 }}>{item.section}</span>
                {item.title}
              </h3>
              {item.body && <p style={{ color: 'var(--parchment-dim)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: 8 }}>{item.body}</p>}
              {item.list && (
                <ul style={{ paddingLeft: 20, color: 'var(--parchment-dim)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {item.list.map((li, j) => (
                    <li key={j} style={{ marginBottom: 8 }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--wine)', marginRight: 10, verticalAlign: 'middle', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }} />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="eys-footer">
        <div className="eys-footer-inner">
          <div><div className="eys-footer-brand">Express Your Sh*t</div><div className="eys-footer-tag">Say it with shit. A novelty gag-gift service. Please prank responsibly.</div></div>
          <div className="eys-footer-links"><a href="/">Home</a><a href="/#faq">FAQ</a><a href="/privacy">Privacy</a><a href="/#order">Order</a></div>
        </div>
        <div className="eys-footer-bottom wrap">© 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise.</div>
      </footer>
    </>
  );
}