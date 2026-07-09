'use client';

function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

export default function Privacy() {
  return (
    <>
      <header className="eys-header">
        <nav className="eys-nav">
          <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
          <div className="eys-navlinks"><a href="/#faq">FAQ</a><a href="/terms">Terms</a></div>
          <a href="/#order" className="eys-nav-cta">File Your Grievance</a>
        </nav>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eys-eyebrow" style={{ marginBottom: 14 }}>The Fine Print</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', color: 'var(--parchment)', lineHeight: 1.12 }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--parchment-dim)', marginTop: 14, fontFamily: 'var(--mono)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
            Last updated: July 2026 · EYS-DOC-002
          </p>
        </div>

        <div style={{ background: 'rgba(107,30,36,0.15)', border: '1px solid var(--wine)', borderRadius: 6, padding: '22px 24px', marginBottom: 36 }}>
          <p style={{ color: 'var(--parchment)', fontWeight: 500, textAlign: 'center', lineHeight: 1.6 }}>
            We keep minimal data and purge it aggressively. This isn&apos;t just policy — it&apos;s architecture.
          </p>
        </div>

        <div style={{ marginBottom: 40 }}>
          {[
            { section: '§01', title: 'Data We Collect', body: 'We collect only what is necessary to fulfill your order:', list: ['Sender: Email address (for order confirmation and payment receipt only), payment information (processed by BTCPay Server — we never see or store crypto wallet details), and order preferences (tier, Kit configuration, anonymous note text).', 'Recipient: Name and shipping address. This is the minimum required to deliver the order.'] },
            { section: '§02', title: 'Data We Do NOT Collect', list: ['Payment card numbers (we don\'t accept cards)', 'Government-issued identification', 'Browsing history or tracking pixels beyond basic analytics', 'Location data beyond what you voluntarily provide (shipping address)'] },
            { section: '§03', title: '30-Day Data Purge', body: 'Recipient data (name, address) is automatically purged 30 days after confirmed delivery. This is enforced by an automated cron job. After purging, recipient data cannot be recovered — it is permanently deleted from our systems, including backups. Sender data (email, order history) is retained for 1 year for customer service purposes, then purged. Order codes (EYS-XXXXXX format) are retained indefinitely as non-identifying transaction records.' },
            { section: '§04', title: 'Anonymity Claims', body: 'We state plainly: "The recipient never sees your name or any identifying detail." We do NOT claim "no paper trail" or "untraceable." Minimal records are kept to fulfill orders and comply with lawful requests. We believe honest privacy claims are better than exaggerated ones.' },
            { section: '§05', title: 'Anti-Harassment Technical Enforcement', body: 'We maintain a 90-day rolling record of recipient addresses to prevent repeat shipments to the same person. This is a hashed, non-reversible record — we store a hash of the address, not the address itself. After 90 days, the hash is purged. This system cannot be circumvented by creating multiple accounts.' },
            { section: '§06', title: 'Payment Privacy', body: 'All crypto payments are processed through our self-hosted BTCPay Server. We do not use third-party payment processors that require KYC. BTCPay generates unique payment addresses per invoice, and we do not link payment addresses to sender identity beyond the current order. Cash-by-mail orders are processed using a short code system. The mailing address is a PO box / CMRA address. We do not retain envelopes or return addresses after processing.' },
            { section: '§07', title: 'Voice Notes & Content', body: 'AI voice notes are generated at checkout and hosted as static audio files. They are not regenerated on each scan. Voice note content is subject to automated moderation before generation. Voice note audio files are purged on the same schedule as the associated order\'s recipient data (30 days post-delivery).' },
            { section: '§08', title: 'Cookies & Analytics', body: 'We use minimal, privacy-respecting analytics. No tracking pixels from advertising platforms. No third-party cookies. Essential cookies are used only for checkout session continuity.' },
            { section: '§09', title: 'Lawful Requests', body: 'We comply with lawful legal process (court orders, subpoenas). Given our data purge schedule, our ability to respond to retrospective requests is limited by design. We cannot produce data that has been deleted.' },
            { section: '§10', title: 'Contact', body: 'Privacy inquiries can be directed through the website. We respond within 30 days.' },
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
          <div className="eys-footer-links"><a href="/">Home</a><a href="/#faq">FAQ</a><a href="/terms">Terms</a><a href="/#order">Order</a></div>
        </div>
        <div className="eys-footer-bottom wrap">© 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise.</div>
      </footer>
    </>
  );
}