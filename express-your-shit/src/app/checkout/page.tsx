'use client';

import { useState, useMemo } from 'react';

const TIERS = [
  { id: 'petty', name: 'The Petty Theft', price: 19.99, desc: 'The basics. Anonymous and effective.', features: ['Signature Blend (synthetic)', 'Kraft box, anonymous label', 'Ships in plain packaging'] },
  { id: 'fullsend', name: 'The Full Send', price: 34.99, desc: 'Glitter. Wax. Consequences.', features: ['Signature Blend (synthetic)', 'Glitter-infused', 'Wax-sealed box', 'Priority shipping'], featured: true },
  { id: 'caseclosed', name: 'Case Closed', price: 54.99, desc: 'The real deal. Scarce by design.', features: ['Studio Reserve (real)', 'Handwritten note', 'Dated batch card', 'Same-day Priority shipping'] },
];

const OFFENSES = [
  'Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat',
  'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All',
  'Parking Space Piracy', 'Unsolicited Life Advice',
];

const CHARACTERS = [
  { id: 'judge', name: 'The Disappointed Judge', rate: 0.9, pitch: 0.85, preview: 'In the matter of your behavior, this court finds you guilty.' },
  { id: 'trailer', name: 'Movie Trailer Announcer', rate: 0.92, pitch: 0.95, preview: 'In a world where consequences finally caught up...' },
  { id: 'herald', name: 'Royal Herald', rate: 1.0, pitch: 1.1, preview: 'Hear ye! Let it be known throughout the land.' },
  { id: 'doc', name: 'Nature Documentarian', rate: 0.82, pitch: 1.0, preview: 'Here we observe the human in its natural habitat: deeply, deeply wrong.' },
  { id: 'drill', name: 'Drill Sergeant', rate: 1.15, pitch: 0.9, preview: 'Drop and give me twenty apologies. Right now.' },
  { id: 'parent', name: 'Disappointed Parent', rate: 0.88, pitch: 1.05, preview: 'I\'m not mad. I\'m just... very disappointed.' },
];

const ACCENTS = [
  { label: 'American', value: 'en-US' },
  { label: 'British', value: 'en-GB' },
  { label: 'Australian', value: 'en-AU' },
  { label: 'Flat & Robotic', value: 'robotic' },
];

function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

export default function Checkout() {
  const [selectedTier, setSelectedTier] = useState('fullsend');
  const [addKit, setAddKit] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientZip, setRecipientZip] = useState('');
  const [anonymousNote, setAnonymousNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'cash'>('crypto');
  const [step, setStep] = useState<'checkout' | 'kit-config' | 'upsell' | 'thankyou'>('checkout');

  // Kit config
  const [kitCharacter, setKitCharacter] = useState('judge');
  const [kitGender, setKitGender] = useState<'male' | 'female'>('female');
  const [kitAccent, setKitAccent] = useState('en-US');
  const [kitMessage, setKitMessage] = useState('');
  const [kitOffenses, setKitOffenses] = useState<string[]>([]);
  const [kitCustomCharge, setKitCustomCharge] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const currentTier = TIERS.find(t => t.id === selectedTier) || TIERS[1];
  const total = useMemo(() => {
    let t = currentTier.price;
    if (addKit) t += 7;
    return t;
  }, [currentTier, addKit]);

  const caseNum = useMemo(() => String(Math.floor(100000 + Math.random() * 899999)), []);

  function pickVoice(accentVal: string, genderVal: string) {
    const voices = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;
    if (accentVal === 'robotic') return voices[0];
    const femaleHints = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira'];
    const maleHints = ['male', 'david', 'alex', 'daniel', 'fred', 'george'];
    const hints = genderVal === 'male' ? maleHints : femaleHints;
    const byAccent = voices.filter(v => v.lang && v.lang.toLowerCase().indexOf(accentVal.toLowerCase().split('-')[0]) === 0);
    const pool = byAccent.length ? byAccent : voices;
    const match = pool.find(v => hints.some(h => v.name.toLowerCase().indexOf(h) !== -1));
    return match || pool[0] || voices[0];
  }

  function previewVoice(charId: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char) return;
    const utter = new SpeechSynthesisUtterance(char.preview);
    utter.rate = char.rate;
    const genderPitch = kitAccent === 'robotic' ? 1.0 : (kitGender === 'male' ? 0.8 : 1.25);
    utter.pitch = Math.max(0, Math.min(2, char.pitch * genderPitch));
    const v = pickVoice(kitAccent, kitGender);
    if (v) utter.voice = v;
    utter.onstart = () => setPreviewPlaying(true);
    utter.onend = () => setPreviewPlaying(false);
    window.speechSynthesis.speak(utter);
  }

  // Render offense chips for cert preview
  const certChips = kitOffenses.length > 0
    ? kitOffenses.map(o => <span className="eys-cert-chip" key={o}>{o}</span>)
    : <span className="eys-cert-chip">Awaiting charges…</span>;

  const certQuote = kitCustomCharge.trim() ? `"${kitCustomCharge}"` : '"Let the record show the ice tray was, in fact, empty."';

  // ===== KIT CONFIG STEP =====
  if (step === 'kit-config') {
    return (
      <>
        <header className="eys-header">
          <nav className="eys-nav">
            <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
            <div className="eys-navlinks"><a href="/#faq">FAQ</a><a href="/#legal">Legal</a></div>
            <a href="/" className="eys-nav-cta">Home</a>
          </nav>
        </header>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eys-eyebrow" style={{ marginBottom: 6 }}>Optional, But Come On</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--parchment)', marginBottom: 8 }}>The Character Assassination Kit</h2>
            <p style={{ color: 'var(--parchment-dim)', fontSize: '0.94rem' }}>An AI voice note and a printed certificate, QR-coded right on the box. $7 standalone, bundled at a discount when added at checkout.</p>
          </div>

          {/* Voice Gender */}
          <div className="eys-upsell-block">
            <label className="eys-field-label">Voice — Gender</label>
            <div className="eys-chip-row">
              {['female', 'male'].map(g => (
                <div key={g} className={`eys-chip${kitGender === g ? ' selected' : ''}`} onClick={() => setKitGender(g as 'male' | 'female')}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </div>
              ))}
            </div>

            <label className="eys-field-label">Voice — Accent</label>
            <div className="eys-chip-row">
              {ACCENTS.map(a => (
                <div key={a.value} className={`eys-chip${kitAccent === a.value ? ' selected' : ''}`} onClick={() => setKitAccent(a.value)}>
                  {a.label}
                </div>
              ))}
            </div>

            <label className="eys-field-label">Character</label>
            <div className="eys-persona-grid">
              {CHARACTERS.map(c => (
                <div
                  key={c.id}
                  className={`eys-persona-card${kitCharacter === c.id ? ' selected' : ''}`}
                  onClick={() => setKitCharacter(c.id)}
                >
                  <div className="pc-top">
                    <h4>{c.name}</h4>
                    <button
                      className="eys-preview-btn"
                      onClick={(e) => { e.stopPropagation(); previewVoice(c.id); }}
                    >{previewPlaying && kitCharacter === c.id ? '■ Playing' : '▶ Preview'}</button>
                  </div>
                  <p>{c.preview}</p>
                </div>
              ))}
            </div>

            <label className="eys-field-label">Your Message (read aloud when they scan the QR code, ≤180 chars)</label>
            <textarea className="eys-textarea" rows={2} maxLength={180} placeholder="e.g. You know exactly what you did." value={kitMessage} onChange={e => setKitMessage(e.target.value)} />
          </div>

          {/* Certificate of Grievance */}
          <div className="eys-upsell-block">
            <label className="eys-field-label">Certificate of Grievance — Cited Offenses</label>
            <div className="eys-chip-row">
              {OFFENSES.map(offense => (
                <div key={offense} className={`eys-chip${kitOffenses.includes(offense) ? ' selected' : ''}`} onClick={() => setKitOffenses(prev => prev.includes(offense) ? prev.filter(o => o !== offense) : [...prev, offense])}>
                  {offense}
                </div>
              ))}
            </div>

            <label className="eys-field-label">Additional Charge (optional, printed in italics on the certificate)</label>
            <input className="eys-input" type="text" maxLength={90} placeholder="e.g. Never once refilled the ice tray" value={kitCustomCharge} onChange={e => setKitCustomCharge(e.target.value)} />

            <label className="eys-field-label">Live Preview</label>
            <div className="eys-cert-preview-wrap">
              <div className="eys-certificate">
                <div className="eys-cert-eyebrow">Office of Anonymous Justice</div>
                <div className="eys-cert-title">Certificate of Grievance</div>
                <div className="eys-cert-case">Case No. EYS-GR-{caseNum}</div>
                <div className="eys-cert-body">This certifies that the recipient of this specimen was found, beyond reasonable doubt, in violation of the following:</div>
                <div className="eys-cert-chips">{certChips}</div>
                <div className="eys-cert-quote">{certQuote}</div>
                <div className="eys-cert-footer">
                  <div className="eys-cert-sig">The Complainant<small>Identity withheld by design</small></div>
                  <div className="eys-cert-seal-mini"><span>EYS</span></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button className="eys-btn-ghost" onClick={() => setStep('checkout')}>← Back</button>
            <button className="eys-btn-primary" onClick={() => setStep('thankyou')}>Seal the Deal — ${total.toFixed(2)}</button>
          </div>
        </div>

        <footer className="eys-footer">
          <div className="eys-footer-inner">
            <div><div className="eys-footer-brand">Express Your Sh*t</div><div className="eys-footer-tag">Say it with shit. A novelty gag-gift service. Please prank responsibly.</div></div>
            <div className="eys-footer-links"><a href="/">Home</a><a href="/#faq">FAQ</a><a href="/#legal">Legal</a></div>
          </div>
          <div className="eys-footer-bottom wrap">© 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise.</div>
        </footer>
      </>
    );
  }

  // ===== UPSELL STEP =====
  if (step === 'upsell') {
    return (
      <>
        <header className="eys-header">
          <nav className="eys-nav">
            <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
            <div className="eys-navlinks"><a href="/#faq">FAQ</a></div>
            <a href="/" className="eys-nav-cta">Home</a>
          </nav>
        </header>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '120px 24px 60px', textAlign: 'center' }}>
          <div className="eys-seal-static" style={{ margin: '0 auto 24px' }}>
            <span className="glyph">EYS</span>
          </div>
          <div className="eys-eyebrow" style={{ marginBottom: 8 }}>One More Thing</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--parchment)', marginBottom: 16 }}>Wait — Before We Seal This</h2>
          {currentTier.id !== 'caseclosed' ? (
            <>
              <p style={{ color: 'var(--parchment-dim)', marginBottom: 32, lineHeight: 1.6 }}>
                Your order qualifies for the <strong style={{ color: 'var(--gold-bright)' }}>Character Assassination Kit</strong> at a checkout-only discount. Certificate of Grievance + AI voice note — just <strong style={{ color: 'var(--gold-bright)' }}>$7</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="eys-btn-primary" onClick={() => { setAddKit(true); setStep('kit-config'); }}>Add the Kit — $7</button>
                <button className="eys-btn-ghost" onClick={() => setStep('thankyou')}>Skip, just ship it</button>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--parchment-dim)', marginBottom: 32 }}>
                Want to upgrade? Studio Reserve, same-day dispatch, real specimen from a named contributing cat.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="eys-btn-primary" onClick={() => { setSelectedTier('caseclosed'); setStep('thankyou'); }}>Upgrade to Case Closed</button>
                <button className="eys-btn-ghost" onClick={() => setStep('thankyou')}>Keep my tier</button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // ===== THANK YOU STEP =====
  if (step === 'thankyou') {
    const code = `EYS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return (
      <>
        <header className="eys-header">
          <nav className="eys-nav">
            <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
          </nav>
        </header>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '120px 24px 60px', textAlign: 'center' }}>
          <div className="eys-seal-static" style={{ margin: '0 auto 24px' }}>
            <span className="glyph">EYS</span>
          </div>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', color: 'var(--parchment)', marginBottom: 10 }}>Consider it deposited.</h3>
          <div style={{ fontFamily: 'var(--mono)', color: 'var(--gold-bright)', fontSize: '1rem', letterSpacing: '0.06em', marginBottom: 20 }}>
            ORDER CODE: {code}
          </div>
          <p style={{ color: 'var(--parchment-dim)', maxWidth: 440, margin: '0 auto 24px', fontSize: '0.94rem' }}>
            Your specimen is being curated. The certificate and voice note ship printed inside the box, QR-coded and ready to scan.
          </p>
          {addKit && (
            <p style={{ color: 'var(--parchment-dim)', fontSize: '0.9rem', marginTop: 12 }}>
              Kit QR code will be generated once payment is confirmed.
            </p>
          )}
          <p style={{ color: 'var(--parchment-dim)', fontSize: '0.9rem', marginTop: 12 }}>
            {paymentMethod === 'crypto' ? 'BTC/LN/XMR payment address will be sent to you.' : 'Mail cash + order code to the address provided. Ships within 2 business days of receipt.'}
          </p>
          <a href="/" className="eys-btn-ghost" style={{ marginTop: 24, display: 'inline-block' }}>Back to Home</a>
        </div>
      </>
    );
  }

  // ===== MAIN CHECKOUT =====
  return (
    <>
      <header className="eys-header">
        <nav className="eys-nav">
          <a href="/" className="eys-brand"><SealMiniSVG /> Express Your Sh*t</a>
          <div className="eys-navlinks"><a href="/#faq">FAQ</a><a href="/#legal">Legal</a></div>
          <a href="/" className="eys-nav-cta">Home</a>
        </nav>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eys-seal-static" style={{ width: 100, height: 100, margin: '0 auto 20px' }}>
            <span className="glyph" style={{ fontSize: '1.4rem' }}>EYS</span>
          </div>
          <div className="eys-eyebrow" style={{ marginBottom: 8 }}>File Your Case</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--parchment)', marginBottom: 8 }}>Checkout</h1>
          <p style={{ color: 'var(--parchment-dim)' }}>One page. One decision. Justice served.</p>
        </div>

        {/* Tier Selection */}
        <div style={{ marginBottom: 32 }}>
          <label className="eys-field-label">Choose Your Specimen</label>
          <div className="eys-pick-grid">
            {TIERS.map(t => (
              <div
                key={t.id}
                className={`eys-pick-card${selectedTier === t.id ? ' selected' : ''}`}
                onClick={() => setSelectedTier(t.id)}
              >
                <h4>{t.name}</h4>
                <div className="p">${t.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kit Add-On */}
        <div style={{ border: `2px dashed ${addKit ? 'var(--gold)' : 'var(--card-line)'}`, borderRadius: 6, padding: 20, marginBottom: 32, background: addKit ? 'rgba(184,146,90,0.05)' : 'transparent' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={addKit} onChange={e => setAddKit(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--wine)' }} />
            <span style={{ flex: 1 }}>
              <strong style={{ color: 'var(--parchment)' }}>Add the Character Assassination Kit</strong>
              <span style={{ color: 'var(--gold-bright)', fontFamily: 'var(--mono)', marginLeft: 8 }}>+$7.00</span>
              <br /><span style={{ color: 'var(--parchment-dim)', fontSize: '0.85rem' }}>Certificate + AI voice note. Customize after checkout.</span>
            </span>
          </label>
        </div>

        {/* Recipient Address */}
        <div style={{ marginBottom: 32 }}>
          <label className="eys-field-label">Recipient Shipping Address</label>
          <input className="eys-input" type="text" placeholder="Full name" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
          <input className="eys-input" type="text" placeholder="Street address" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <input className="eys-input" type="text" placeholder="City" value={recipientCity} onChange={e => setRecipientCity(e.target.value)} />
            <input className="eys-input" type="text" placeholder="ZIP" value={recipientZip} onChange={e => setRecipientZip(e.target.value)} />
          </div>
        </div>

        {/* Anonymous Note */}
        <div style={{ marginBottom: 32 }}>
          <label className="eys-field-label">Anonymous Note (Optional — printed on paper, included in box)</label>
          <textarea className="eys-textarea" rows={3} maxLength={200} placeholder="Keep it playful. We screen every note before it ships." value={anonymousNote} onChange={e => setAnonymousNote(e.target.value)} />
          <div className="eys-char-count">{anonymousNote.length}/200</div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: 32 }}>
          <label className="eys-field-label">Payment Method</label>
          <div className="eys-pay-methods">
            <div className={`eys-pay-card${paymentMethod === 'crypto' ? ' selected' : ''}`} onClick={() => setPaymentMethod('crypto')}>
              <h4>Bitcoin / Lightning / Monero</h4>
              <p>No KYC, no middleman. Invoice generated at checkout.</p>
            </div>
            <div className={`eys-pay-card${paymentMethod === 'cash' ? ' selected' : ''}`} onClick={() => setPaymentMethod('cash')}>
              <h4>Cash by Mail</h4>
              <p>We send you an order code and a PO box address. Ships within 2 business days of receipt.</p>
            </div>
          </div>
          {paymentMethod === 'crypto' && (
            <div className="eys-pay-detail">
              Send the exact amount to the invoice below. Order confirms after 1 confirmation (Lightning is instant).
              <div className="addr">bc1q — invoice generated at checkout — expires in 15:00</div>
            </div>
          )}
          {paymentMethod === 'cash' && (
            <div className="eys-pay-detail">
              Mail cash + your order code (shown on the next screen) to our processing address. Orders ship within 2 business days of receipt.
              <div className="addr">Express Your Sh*t · PO Box 00000 · City, ST 00000</div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="eys-summary-strip" style={{ marginBottom: 24 }}>
          <span>Selected: {currentTier.name}</span>
          <span className="total">Total: ${total.toFixed(2)}</span>
        </div>

        <button className="eys-btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => addKit ? setStep('kit-config') : setStep('upsell')}>
          {paymentMethod === 'crypto' ? 'Pay with Crypto' : 'Mail Cash'} — ${total.toFixed(2)}
        </button>
      </div>

      <footer className="eys-footer">
        <div className="eys-footer-inner">
          <div><div className="eys-footer-brand">Express Your Sh*t</div><div className="eys-footer-tag">Say it with shit. A novelty gag-gift service. Please prank responsibly.</div></div>
          <div className="eys-footer-links"><a href="/">Home</a><a href="/#faq">FAQ</a><a href="/#legal">Legal</a></div>
        </div>
        <div className="eys-footer-bottom wrap">© 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise.</div>
      </footer>
    </>
  );
}