'use client';

import { useState } from 'react';

function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

interface Competitor {
  name: string;
  tagline: string;
  url: string;
  features: { feature: string; them: string; us: string }[];
}

const COMPETITORS: Record<string, Competitor> = {
  shitexpress: {
    name: 'ShitExpress',
    tagline: 'The original. But original doesn\'t mean best.',
    url: 'shitexpress.com',
    features: [
      { feature: 'Source material', them: 'Real animal feces only', us: 'Signature Blend (synthetic) + Studio Reserve (real)' },
      { feature: 'Personalization', them: 'None', us: 'Certificate of Grievance + AI Voice Note' },
      { feature: 'Tier options', them: 'Basic', us: '3 tiers with quality upgrades' },
      { feature: 'Presentation', them: 'Generic packaging', us: 'Wax-sealed, glitter-infused, biohazard-stickered' },
      { feature: 'Payment privacy', them: 'Crypto only', us: 'Crypto (BTC/LN/XMR) + Cash by Mail' },
      { feature: 'Anti-harassment', them: 'Basic', us: 'No repeat shipments to same address' },
      { feature: 'Data privacy', them: 'Unknown retention', us: '30-day data purge, public policy' },
      { feature: 'Voice/audio', them: 'None', us: '6 characters, 2 genders, 4 accents' },
      { feature: 'Brand experience', them: 'Functional', us: 'Bureaucratic theater — the whole point' },
    ],
  },
  poopsenders: {
    name: 'PoopSenders',
    tagline: 'They send poop. We deliver justice.',
    url: 'poopsenders.com',
    features: [
      { feature: 'Product', them: 'Real animal feces', us: 'Signature Blend (synthetic) + Studio Reserve (real)' },
      { feature: 'Personalization', them: 'Basic message', us: 'Certificate of Grievance + AI Voice Note' },
      { feature: 'Tier options', them: '1-2 options', us: '3 curated tiers' },
      { feature: 'Presentation', them: 'Generic box', us: 'Wax-sealed, glitter-infused, biohazard-stickered' },
      { feature: 'Payment privacy', them: 'Crypto + cards', us: 'Crypto (BTC/LN/XMR) + Cash by Mail (no cards ever)' },
      { feature: 'Anti-harassment', them: 'Minimal', us: 'No repeat shipments to same address' },
      { feature: 'Data privacy', them: 'Unknown', us: '30-day data purge, public policy' },
      { feature: 'Voice/audio', them: 'None', us: '6 characters, 2 genders, 4 accents' },
      { feature: 'Brand experience', them: 'Basic gag site', us: 'Premium bureaucratic theater' },
    ],
  },
  sendsomepoop: {
    name: 'SendSomePoop',
    tagline: 'Same joke, no delivery.',
    url: 'sendsomepoop.com',
    features: [
      { feature: 'Product', them: 'Real animal feces', us: 'Signature Blend + Studio Reserve' },
      { feature: 'Personalization', them: 'None', us: 'Certificate of Grievance + AI Voice Note' },
      { feature: 'Tier options', them: 'Single tier', us: '3 tiers with quality upgrades' },
      { feature: 'Presentation', them: 'Basic', us: 'Wax-sealed, glitter-infused, biohazard-stickered' },
      { feature: 'Payment privacy', them: 'Cards', us: 'Crypto + Cash by Mail only' },
      { feature: 'Anti-harassment', them: 'None', us: 'No repeat shipments to same address' },
      { feature: 'Data privacy', them: 'Unknown', us: '30-day data purge' },
      { feature: 'Voice/audio', them: 'None', us: 'Full Character Assassination Kit' },
      { feature: 'Brand experience', them: 'Low-effort', us: 'Premium satire experience' },
    ],
  },
};

const COMPETITOR_SLUGS: Record<string, string> = {
  shitexpress: 'vs-shitexpress',
  poopsenders: 'vs-poopsenders',
  sendsomepoop: 'vs-sendsomepoop',
};

export function ComparisonPage({ competitor }: { competitor: Competitor }) {
  return (
    <>
      <header className="eys-header">
        <nav className="eys-nav">
          <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
          <div className="eys-navlinks"><a href="/#how">How It Works</a><a href="/#tiers">Tiers</a><a href="/faq">FAQ</a></div>
          <a href="/#order" className="eys-nav-cta">File Your Grievance</a>
        </nav>
      </header>

      <section className="eys-section">
        <div className="eys-section-head">
          <div className="eys-eyebrow">Why Express Your Sh*t?</div>
          <h2>Express Your Sh*t vs {competitor.name}</h2>
          <p>{competitor.tagline}</p>
        </div>

        <div className="eys-compare">
          <div className="eys-compare-row head">
            <div>Feature</div>
            <div>Express Your Sh*t</div>
            <div>{competitor.name}</div>
          </div>
          {competitor.features.map((f, i) => (
            <div className="eys-compare-row" key={i}>
              <div>{f.feature}</div>
              <div className="us check">{f.us}</div>
              <div className="x">{f.them}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: 'var(--parchment-dim)', marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            {competitor.name} does one thing fine. But if you want theater, personalization, and a genuinely funny experience — not just "we mailed you feces" — the choice is clear.
          </p>
          <a href="/#order" className="eys-btn-primary">File Your Grievance →</a>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          {Object.entries(COMPETITORS).map(([key, comp]) => (
            <a
              key={key}
              href={`/${COMPETITOR_SLUGS[key]}`}
              className="eys-btn-ghost"
              style={{ opacity: comp.name === competitor.name ? 0.5 : 1 }}
            >
              vs {comp.name}
            </a>
          ))}
        </div>
      </section>

      <footer className="eys-footer">
        <div className="eys-footer-inner">
          <div><div className="eys-footer-brand">Express Your Sh*t</div><div className="eys-footer-tag">Say it with shit. A novelty gag-gift service. Please prank responsibly.</div></div>
          <div className="eys-footer-links"><a href="/">Home</a><a href="/#tiers">Tiers</a><a href="/faq">FAQ</a><a href="/#legal">Legal</a></div>
        </div>
        <div className="eys-footer-bottom wrap">© 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise.</div>
      </footer>
    </>
  );
}

export { COMPETITORS, COMPETITOR_SLUGS };