'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'Is this actually legal?',
    a: 'Yes — as a novelty gag gift. Mailing feces as a prank isn\'t a federal crime in the US. Using any delivery service to threaten, harass, or target someone is illegal, and we don\'t allow it: no threat notes, no repeat shipments to the same address, no targeting minors or public officials.',
  },
  {
    q: 'Is it really anonymous?',
    a: 'The recipient never sees your name or any identifying detail — the return address is ours, not yours. We keep the minimum records needed to fulfill orders and comply with lawful requests, and we purge recipient data 30 days after delivery.',
  },
  {
    q: 'Does it smell during shipping?',
    a: 'No. Signature Blend specimens are inert, non-biological, and odor-sealed. Studio Reserve (real) specimens are double-sealed in odor-locking bags with absorbent liners, inside a rigid box.',
  },
  {
    q: 'Can I get a refund?',
    a: 'No. It\'s poop. Once it ships, it\'s committed to its journey, same as you should be.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Bitcoin, Lightning, Monero, or cash by mail. No cards — period. Crypto means no processor holding a record with your name on it. Cash by mail means not even a digital trace.',
  },
  {
    q: 'What\'s the Character Assassination Kit?',
    a: 'An optional add-on: a printed Certificate of Grievance with your chosen offenses, plus an AI-generated voice note the recipient hears by scanning a QR code. Six character voices, four accents, fully customizable.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Petty Theft and Full Send ship within 2 business days via standard mail. Case Closed ships same-day via Priority Mail. We don\'t promise freshness or temperature — you\'re sending a gag gift, not groceries.',
  },
  {
    q: 'What prevents harassment?',
    a: 'Our system technically enforces a 90-day block on repeat shipments to the same address. You cannot circumvent this by creating multiple accounts. We also prohibit targeting minors, schools, and government officials.',
  },
  {
    q: 'How is my data handled?',
    a: 'Minimal collection. Recipient data is purged 30 days post-delivery. Sender data retained for 1 year for customer service, then purged. Payment data never touches our servers.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently US only. International shipping creates customs and biological material complications we\'re not prepared to navigate yet.',
  },
];

function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <header className="eys-header">
        <nav className="eys-nav">
          <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
          <div className="eys-navlinks"><a href="/#how">How It Works</a><a href="/#tiers">Tiers</a><a href="/#legal">Legal</a></div>
          <a href="/#order" className="eys-nav-cta">File Your Grievance</a>
        </nav>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eys-eyebrow" style={{ marginBottom: 14 }}>Before You Ask</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', color: 'var(--parchment)', lineHeight: 1.12 }}>
            Frequently deposited questions
          </h1>
        </div>

        <div className="eys-faq">
          {FAQ_ITEMS.map((item, i) => (
            <div className={`eys-faq-item${openFaq === i ? ' open' : ''}`} key={i}>
              <button className="eys-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                {item.q} <span className="plus">+</span>
              </button>
              <div className="eys-faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="eys-footer">
        <div className="eys-footer-inner">
          <div><div className="eys-footer-brand">Express Your Sh*t</div><div className="eys-footer-tag">Say it with shit. A novelty gag-gift service. Please prank responsibly.</div></div>
          <div className="eys-footer-links"><a href="/">Home</a><a href="/#tiers">Tiers</a><a href="/#legal">Terms</a><a href="/#legal">Privacy</a><a href="/#order">Order</a></div>
        </div>
        <div className="eys-footer-bottom wrap">© 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise.</div>
      </footer>
    </>
  );
}