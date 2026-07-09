'use client';

import { useState, useEffect, useRef } from 'react';

/* ===== Inline SVG Components ===== */
function SealMiniSVG() {
  return (
    <svg className="eys-seal-mini" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#6B1E24" stroke="#8C2B32" />
      <text x="12" y="16" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#D4AF7A">EYS</text>
    </svg>
  );
}

function SealDripSVG() {
  return (
    <svg viewBox="0 0 60 34"><path d="M20 0 Q18 20 22 26 Q26 32 30 26 Q34 20 30 0 Z M34 4 Q33 18 36 22 Q39 26 41 20 Q42 12 38 4 Z" fill="#6B1E24" /></svg>
  );
}

function MiniSeal() {
  return <span className="mini-seal" />;
}

/* ===== Scroll Reveal Hook ===== */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

/* ===== FAQ Data ===== */
const FAQ_ITEMS = [
  {
    q: 'Is this actually legal?',
    a: 'Yes — as a novelty gag gift. Mailing feces as a prank isn\'t a federal crime in the US. Using any delivery service to threaten, harass, or target someone is illegal, and we don\'t allow it: no threat notes, no repeat shipments to the same address, no targeting minors or public officials.',
  },
  {
    q: 'Is it really anonymous?',
    a: 'The recipient never sees your name or any identifying detail — the return address is ours, not yours. We keep the minimum records needed to fulfill orders and comply with lawful requests, and we purge recipient data 30 days after delivery. We\'re not going to pretend we keep zero records; we just make sure the recipient never gets yours.',
  },
  {
    q: 'Does it smell during shipping?',
    a: 'No. Signature Blend specimens are inert, non-biological, and odor-sealed. They don\'t smell at all. Studio Reserve (real) specimens are double-sealed in odor-locking bags with absorbent liners, inside a rigid box. Your mail carrier and the recipient won\'t know until they open it.',
  },
  {
    q: 'Can I get a refund?',
    a: 'No. It\'s poop. Once it ships, it\'s committed to its journey, same as you should be.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Bitcoin, Lightning, Monero, or cash by mail. No cards — period. Crypto means no processor holding a record with your name on it. Cash by mail means not even a digital trace.',
  },
];

/* ===== Offense Chips ===== */
const OFFENSES = [
  'Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat',
  'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All',
  'Parking Space Piracy', 'Unsolicited Life Advice',
];

/* ===== Character Voices ===== */
const CHARACTERS = [
  { id: 'judge', name: 'The Disappointed Judge', rate: 0.9, pitch: 0.85, preview: 'In the matter of your behavior, this court finds you guilty.' },
  { id: 'trailer', name: 'Movie Trailer Announcer', rate: 0.92, pitch: 0.95, preview: 'In a world where consequences finally caught up...' },
  { id: 'herald', name: 'Royal Herald', rate: 1.0, pitch: 1.1, preview: 'Hear ye! Let it be known throughout the land.' },
  { id: 'doc', name: 'Nature Documentarian', rate: 0.82, pitch: 1.0, preview: 'Here we observe the human in its natural habitat: deeply, deeply wrong.' },
  { id: 'drill', name: 'Drill Sergeant', rate: 1.15, pitch: 0.9, preview: 'Drop and give me twenty apologies. Right now.' },
  { id: 'parent', name: 'Disappointed Parent', rate: 0.88, pitch: 1.05, preview: 'I\'m not mad. I\'m just... very disappointed.' },
];

const ACCENTS: { label: string; value: string }[] = [
  { label: 'American', value: 'en-US' },
  { label: 'British', value: 'en-GB' },
  { label: 'Australian', value: 'en-AU' },
  { label: 'Flat & Robotic', value: 'robotic' },
];

/* ===== Main Page ===== */
export default function Home() {
  // FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Order state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [addKit, setAddKit] = useState(false);
  const [note, setNote] = useState('');
  const [noteWarning, setNoteWarning] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  // Kit state
  const [gender, setGender] = useState('female');
  const [accent, setAccent] = useState('en-US');
  const [persona, setPersona] = useState('judge');
  const [voiceMsg, setVoiceMsg] = useState('');
  const [offenses, setOffenses] = useState<string[]>([]);
  const [customCharge, setCustomCharge] = useState('');
  // Payment
  const [payMethod, setPayMethod] = useState<string | null>(null);
  // Confirmation
  const [orderCode, setOrderCode] = useState('');
  const [caseNum] = useState(() => String(Math.floor(100000 + Math.random() * 899999)));

  const tierPrices: Record<string, number> = { petty: 19.99, fullsend: 34.99, caseclosed: 54.99 };
  const tierNames: Record<string, string> = { petty: 'The Petty Theft', fullsend: 'The Full Send', caseclosed: 'Case Closed' };

  const total = (selectedTier ? tierPrices[selectedTier] : 0) + (addKit ? 7 : 0);

  // Voice preview
  function pickVoice(accentVal: string, genderVal: string) {
    const voices = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;
    if (accentVal === 'robotic') return voices[0];
    const femaleHints = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'susan', 'emma', 'amy'];
    const maleHints = ['male', 'david', 'alex', 'daniel', 'fred', 'george', 'james'];
    const hints = genderVal === 'male' ? maleHints : femaleHints;
    const byAccent = voices.filter((v: SpeechSynthesisVoice) => v.lang && v.lang.toLowerCase().indexOf(accentVal.toLowerCase().split('-')[0]) === 0);
    const pool = byAccent.length ? byAccent : voices;
    const match = pool.find((v: SpeechSynthesisVoice) => hints.some((h: string) => v.name.toLowerCase().indexOf(h) !== -1));
    return match || pool[0] || voices[0];
  }

  function speakPreview(personaId: string, btn: HTMLButtonElement | null) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const char = CHARACTERS.find(c => c.id === personaId);
    if (!char) return;
    const text = char.preview;
    const utter = new SpeechSynthesisUtterance(text);
    const card = document.querySelector(`.eys-persona-card[data-persona="${personaId}"]`);
    const baseRate = card ? parseFloat((card as HTMLElement).dataset.rate || '0.9') : 0.9;
    const basePitch = card ? parseFloat((card as HTMLElement).dataset.pitch || '0.85') : 0.85;
    const genderPitch = accent === 'robotic' ? 1.0 : (gender === 'male' ? 0.8 : 1.25);
    utter.rate = baseRate;
    utter.pitch = Math.max(0, Math.min(2, basePitch * genderPitch));
    const v = pickVoice(accent, gender);
    if (v) utter.voice = v;
    document.querySelectorAll('.eys-preview-btn').forEach((b) => { b.classList.remove('playing'); b.textContent = '▶ Preview'; });
    if (btn) { btn.classList.add('playing'); btn.textContent = '■ Playing'; }
    utter.onend = () => { if (btn) { btn.classList.remove('playing'); btn.textContent = '▶ Preview'; } };
    window.speechSynthesis.speak(utter);
  }

  function handleNoteChange(val: string) {
    setNote(val);
    const bad = /kill|hurt|die|bomb|threat|rape|murder|stab|shoot|attack/i;
    setNoteWarning(bad.test(val));
  }

  function toggleOffense(offense: string) {
    setOffenses(prev => prev.includes(offense) ? prev.filter(o => o !== offense) : [...prev, offense]);
  }

  function goToStep(n: number) {
    if (n === 5) {
      setOrderCode(String(Math.floor(100000 + Math.random() * 899999)));
    }
    setCurrentStep(n);
  }

  // Refs for scroll
  const orderRef = useRef<HTMLDivElement>(null);

  function scrollToOrder() {
    orderRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function selectTierAndScroll(tier: string) {
    setSelectedTier(tier);
    scrollToOrder();
  }

  // Render offense chips in cert preview
  const certChips = offenses.length > 0
    ? offenses.map(o => <span className="eys-cert-chip" key={o}>{o}</span>)
    : <span className="eys-cert-chip">Awaiting charges…</span>;

  const certQuote = customCharge.trim()
    ? `"${customCharge}"`
    : '"Let the record show the ice tray was, in fact, empty."';

  return (
    <>
      {/* ===== NAV ===== */}
      <header className="eys-header">
        <nav className="eys-nav">
          <a href="/" className="eys-brand">
            <SealMiniSVG />
            Express Your Sh*t
          </a>
          <div className="eys-navlinks">
            <a href="#how">How It Works</a>
            <a href="#tiers">Tiers</a>
            <a href="#faq">FAQ</a>
            <a href="#legal">Legal</a>
          </div>
          <a href="#order" className="eys-nav-cta">File Your Grievance</a>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="eys-hero">
        <div className="eys-eyebrow">Office of Anonymous Justice · Est. This Morning · Case No. EYS-GR-000001</div>
        <div className="eys-seal-stage">
          <div className="eys-seal"><span className="glyph">EYS</span></div>
          <div className="eys-seal-drip"><SealDripSVG /></div>
        </div>
        <h1>Say it with <em>shit.</em></h1>
        <p className="sub">Premium anonymous gag-gift service. Certified, sealed, and delivered with the gravity it deserves. This is official business.</p>
        <div className="eys-hero-ctas">
          <a href="#order" className="eys-btn-primary">File Your Grievance →</a>
          <a href="#tiers" className="eys-btn-ghost">View Tiers</a>
        </div>
        <div className="eys-trust-strip">
          <span>The recipient never sees your name</span>
          <span>BTC · Lightning · XMR · Cash</span>
          <span>Sealed &amp; sanitary</span>
          <span>No refunds — it&apos;s poop</span>
        </div>
      </section>

      <div className="deckle" />

      {/* ===== HOW IT WORKS ===== */}
      <section className="eys-section" id="how">
        <div className="eys-section-head">
          <div className="eys-eyebrow">The Process</div>
          <h2>Three steps to closure</h2>
          <p>What used to require a burner phone and a Craigslist post now takes ninety seconds.</p>
        </div>
        <div className="eys-steps">
          <div className="eys-step">
            <div className="seal-num">1</div>
            <h3>File Your Grievance</h3>
            <p>Choose your tier, enter the recipient&apos;s address, and optionally add a Certificate of Grievance with cited offenses and an AI voice note.</p>
          </div>
          <div className="eys-step">
            <div className="seal-num">2</div>
            <h3>We Process &amp; Pack</h3>
            <p>Your order is assembled, sealed, and stamped. Full Send gets glitter and wax. Case Closed gets the real deal, same-day.</p>
          </div>
          <div className="eys-step">
            <div className="seal-num">3</div>
            <h3>Delivery Is Served</h3>
            <p>Plain packaging. No return address. The recipient never sees your name or any identifying detail. Justice is served cold.</p>
          </div>
        </div>
      </section>

      <div className="deckle flip" />

      {/* ===== TIERS ===== */}
      <section className="eys-section" id="tiers" style={{ background: 'var(--ink-soft)' }}>
        <div className="eys-section-head">
          <div className="eys-eyebrow">Certificates of Deposit</div>
          <h2>Choose your specimen</h2>
          <p>Every tier ships in a rigid, leak-proof, USPS-compliant box. What&apos;s inside is between you and your conscience.</p>
        </div>
        <div className="eys-tiers">
          {/* Petty Theft */}
          <div className="eys-tier">
            <div className="cert-label">Specimen No. 01</div>
            <h3>The Petty Theft</h3>
            <div className="desc">The basics. Anonymous and effective.</div>
            <div className="price"><sup>$</sup>19.99</div>
            <ul>
              <li><MiniSeal /> Signature Blend specimen (synthetic)</li>
              <li><MiniSeal /> Kraft box, anonymous label</li>
              <li><MiniSeal /> Ships in plain packaging</li>
            </ul>
            <button className="eys-tier-btn" onClick={() => selectTierAndScroll('petty')}>Select</button>
          </div>
          {/* Full Send */}
          <div className="eys-tier featured">
            <div className="cert-label">Specimen No. 02 · Most Popular</div>
            <h3>The Full Send</h3>
            <div className="desc">The one they&apos;ll remember. Glitter. Wax. Consequences.</div>
            <div className="price"><sup>$</sup>34.99</div>
            <ul>
              <li><MiniSeal /> Signature Blend specimen (synthetic)</li>
              <li><MiniSeal /> Glitter-infused for maximum chaos</li>
              <li><MiniSeal /> Wax-sealed box with biohazard sticker</li>
              <li><MiniSeal /> Priority shipping included</li>
            </ul>
            <button className="eys-tier-btn" onClick={() => selectTierAndScroll('fullsend')}>Select</button>
          </div>
          {/* Case Closed */}
          <div className="eys-tier">
            <div className="cert-label">Specimen No. 03 · Chef&apos;s Selection</div>
            <h3>Case Closed</h3>
            <div className="desc">The real deal. Scarce by design.</div>
            <div className="price"><sup>$</sup>54.99</div>
            <ul>
              <li><MiniSeal /> Studio Reserve specimen (real, sourced)</li>
              <li><MiniSeal /> Handwritten note from contributing cat</li>
              <li><MiniSeal /> Dated batch card &amp; Certificate of Authenticity</li>
              <li><MiniSeal /> Priority shipping, same-day dispatch</li>
            </ul>
            <button className="eys-tier-btn" onClick={() => selectTierAndScroll('caseclosed')}>Select</button>
          </div>
        </div>
      </section>

      <div className="deckle" />

      {/* ===== COMPARISON ===== */}
      <section className="eys-section">
        <div className="eys-section-head">
          <div className="eys-eyebrow">Know Your Worth</div>
          <h2>Why not the other guys?</h2>
        </div>
        <div className="eys-compare">
          <div className="eys-compare-row head"><div>Feature</div><div>Express Your Sh*t</div><div>Everyone Else</div></div>
          <div className="eys-compare-row"><div>Source material</div><div className="us check">Signature Blend (synthetic) or Studio Reserve (real)</div><div className="x">Mystery farm animal</div></div>
          <div className="eys-compare-row"><div>Recipient anonymity</div><div className="us check">Guaranteed — no name, no trace</div><div className="x">Usually</div></div>
          <div className="eys-compare-row"><div>Certificate of Grievance</div><div className="us check">Available on every tier</div><div className="x">Not offered</div></div>
          <div className="eys-compare-row"><div>AI voice note</div><div className="us check">6 characters, 4 accents, QR on the box</div><div className="x">What&apos;s a voice note</div></div>
          <div className="eys-compare-row"><div>Crypto + cash payment</div><div className="us check">Yes, both</div><div className="x">Cards only</div></div>
          <div className="eys-compare-row"><div>Wax seal on every box</div><div className="us check">Every Full Send and above</div><div className="x">What&apos;s a wax seal</div></div>
        </div>
      </section>

      <div className="deckle flip" />

      {/* ===== FAQ ===== */}
      <section className="eys-section" id="faq" style={{ background: 'var(--ink-soft)' }}>
        <div className="eys-section-head">
          <div className="eys-eyebrow">Before You Ask</div>
          <h2>Frequently deposited questions</h2>
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
      </section>

      <div className="deckle" />

      {/* ===== ORDER FLOW ===== */}
      <section className="eys-section" id="order" ref={orderRef}>
        <div className="eys-section-head">
          <div className="eys-eyebrow">The Ritual</div>
          <h2>Place your order</h2>
          <p>Ninety seconds. No account. No name required.</p>
        </div>

        <div className="eys-order-panel">
          {/* Progress bar */}
          <div className="eys-order-progress">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={s < currentStep ? 'done' : s === currentStep ? 'active' : ''}><i /></span>
            ))}
          </div>

          {/* STEP 1: TIER */}
          {currentStep === 1 && (
            <div className="eys-order-step active">
              <label className="eys-field-label">Choose Your Specimen</label>
              <div className="eys-pick-grid">
                {[
                  { id: 'petty', name: 'The Petty Theft', price: 19.99 },
                  { id: 'fullsend', name: 'The Full Send', price: 34.99 },
                  { id: 'caseclosed', name: 'Case Closed', price: 54.99 },
                ].map(t => (
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

              <label className="eys-field-label">Add-Ons</label>
              <div className="eys-addon-row">
                <label>
                  <input
                    type="checkbox"
                    checked={addKit}
                    onChange={(e) => setAddKit(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  Character Assassination Kit — certificate + AI voice note, QR-coded on the box
                </label>
                <span className="price">+$7.00</span>
              </div>

              <div className="eys-order-nav">
                <span />
                <button className="eys-btn-primary" onClick={() => selectedTier && goToStep(2)}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 2: NOTE + ADDRESS */}
          {currentStep === 2 && (
            <div className="eys-order-step active">
              <label className="eys-field-label">Recipient Shipping Address</label>
              <input className="eys-input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
              <input className="eys-input" type="text" placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <input className="eys-input" type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                <input className="eys-input" type="text" placeholder="ZIP" value={zip} onChange={e => setZip(e.target.value)} />
              </div>
              <label className="eys-field-label">Anonymous Note (Optional — printed on paper, included in box)</label>
              <textarea
                className="eys-textarea"
                rows={3}
                maxLength={200}
                placeholder="Keep it playful. We screen every note before it ships."
                value={note}
                onChange={e => handleNoteChange(e.target.value)}
              />
              <div className="eys-char-count">{note.length}/200</div>
              <div className={`eys-note-warning${noteWarning ? ' show' : ''}`}>
                This note looks like it may cross into a threat or harassment. Please rephrase — we only ship gag-gift notes.
              </div>
              <div className="eys-order-nav">
                <button className="eys-btn-ghost" onClick={() => goToStep(1)}>← Back</button>
                <button className="eys-btn-primary" onClick={() => goToStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3: KIT CUSTOMIZATION */}
          {currentStep === 3 && (
            <div className="eys-order-step active">
              <div className="eys-section-head" style={{ textAlign: 'left', margin: '0 0 28px', maxWidth: 'none' }}>
                <div className="eys-eyebrow" style={{ marginBottom: 6 }}>Optional, But Come On</div>
                <h2 style={{ fontSize: '1.5rem' }}>The Character Assassination Kit</h2>
                <p style={{ marginTop: 6 }}>An AI voice note and a printed certificate, QR-coded right on the box. $7 standalone, bundled at a discount when added at checkout.</p>
              </div>

              <div className="eys-upsell-block">
                <label className="eys-field-label">Voice — Gender</label>
                <div className="eys-chip-row">
                  {['female', 'male'].map(g => (
                    <div
                      key={g}
                      className={`eys-chip${gender === g ? ' selected' : ''}`}
                      onClick={() => setGender(g)}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </div>
                  ))}
                </div>

                <label className="eys-field-label">Voice — Accent</label>
                <div className="eys-chip-row">
                  {ACCENTS.map(a => (
                    <div
                      key={a.value}
                      className={`eys-chip${accent === a.value ? ' selected' : ''}`}
                      onClick={() => setAccent(a.value)}
                    >
                      {a.label}
                    </div>
                  ))}
                </div>

                <label className="eys-field-label">Character</label>
                <div className="eys-persona-grid">
                  {CHARACTERS.map(c => (
                    <div
                      key={c.id}
                      className={`eys-persona-card${persona === c.id ? ' selected' : ''}`}
                      data-persona={c.id}
                      data-rate={c.rate}
                      data-pitch={c.pitch}
                      onClick={() => setPersona(c.id)}
                    >
                      <div className="pc-top">
                        <h4>{c.name}</h4>
                        <button
                          className="eys-preview-btn"
                          onClick={(e) => { e.stopPropagation(); speakPreview(c.id, e.currentTarget); }}
                        >▶ Preview</button>
                      </div>
                      <p>{c.preview}</p>
                    </div>
                  ))}
                </div>

                <label className="eys-field-label">Your Message (read aloud when they scan the QR code, ≤180 chars)</label>
                <textarea
                  className="eys-textarea"
                  rows={2}
                  maxLength={180}
                  placeholder="e.g. You know exactly what you did."
                  value={voiceMsg}
                  onChange={e => setVoiceMsg(e.target.value)}
                />
              </div>

              <div className="eys-upsell-block">
                <label className="eys-field-label">Certificate of Grievance — Cited Offenses</label>
                <div className="eys-chip-row">
                  {OFFENSES.map(offense => (
                    <div
                      key={offense}
                      className={`eys-chip${offenses.includes(offense) ? ' selected' : ''}`}
                      onClick={() => toggleOffense(offense)}
                    >
                      {offense}
                    </div>
                  ))}
                </div>

                <label className="eys-field-label">Additional Charge (optional, printed in italics on the certificate)</label>
                <input
                  className="eys-input"
                  type="text"
                  maxLength={90}
                  placeholder="e.g. Never once refilled the ice tray"
                  value={customCharge}
                  onChange={e => setCustomCharge(e.target.value)}
                />

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

              <div className="eys-order-nav">
                <button className="eys-btn-ghost" onClick={() => goToStep(2)}>← Back</button>
                <button className="eys-btn-primary" onClick={() => goToStep(4)}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {currentStep === 4 && (
            <div className="eys-order-step active">
              <label className="eys-field-label">Payment Method</label>
              <div className="eys-pay-methods">
                <div
                  className={`eys-pay-card${payMethod === 'crypto' ? ' selected' : ''}`}
                  onClick={() => setPayMethod('crypto')}
                >
                  <h4>Bitcoin / Lightning / Monero</h4>
                  <p>No KYC, no middleman. Invoice generated at checkout.</p>
                </div>
                <div
                  className={`eys-pay-card${payMethod === 'cash' ? ' selected' : ''}`}
                  onClick={() => setPayMethod('cash')}
                >
                  <h4>Cash by Mail</h4>
                  <p>We send you an order code and a PO box address. Ships within 2 business days of receipt.</p>
                </div>
              </div>

              {payMethod === 'crypto' && (
                <div className="eys-pay-detail">
                  Send the exact amount to the invoice below. Order confirms after 1 confirmation (Lightning is instant).
                  <div className="addr">bc1q — invoice generated at checkout — expires in 15:00</div>
                </div>
              )}

              {payMethod === 'cash' && (
                <div className="eys-pay-detail">
                  Mail cash + your order code (shown on the next screen) to our processing address. Orders ship within 2 business days of receipt.
                  <div className="addr">Express Your Sh*t · PO Box 00000 · City, ST 00000</div>
                </div>
              )}

              <div className="eys-order-nav">
                <button className="eys-btn-ghost" onClick={() => goToStep(3)}>← Back</button>
                <button className="eys-btn-primary" onClick={() => goToStep(5)}>
                  Seal the Deal — ${total.toFixed(2)}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {currentStep === 5 && (
            <div className="eys-order-step active">
              <div className="eys-cert-confirm">
                <div className="eys-seal-stage" style={{ transform: 'scale(0.75)', marginBottom: 6 }}>
                  <div className="eys-seal-static"><span className="glyph">EYS</span></div>
                </div>
                <h3>Consider it deposited.</h3>
                <div className="order-code">ORDER CODE: EYS-{orderCode || '------'}</div>
                <p>Your specimen is being curated. The certificate and voice note ship printed inside the box, QR-coded and ready to scan.</p>
                <a href="/" className="eys-btn-ghost" style={{ marginTop: 24, display: 'inline-block' }}>Back to Home</a>
              </div>
            </div>
          )}

          {/* Summary strip */}
          <div className="eys-summary-strip">
            <span>Selected: {selectedTier ? tierNames[selectedTier] : '—'}</span>
            <span className="total">Total: ${total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <div className="deckle flip" />

      {/* ===== LEGAL ===== */}
      <section className="eys-section" id="legal" style={{ background: 'var(--ink-soft)' }}>
        <div className="eys-section-head">
          <div className="eys-eyebrow">The Fine Print</div>
          <h2>Terms &amp; conduct</h2>
          <p>Short version: gag gifts, not weapons.</p>
        </div>
        <div className="eys-legal-grid">
          <div className="eys-legal-block">
            <h3>What we allow</h3>
            <ul>
              <li>Novelty gag gifts to friends, exes, coworkers, landlords, and other deserving parties</li>
              <li>Anonymous, lighthearted printed notes</li>
              <li>One-time shipments per recipient</li>
            </ul>
          </div>
          <div className="eys-legal-block">
            <h3>What we don&apos;t allow</h3>
            <ul>
              <li>Threats, slurs, or notes referencing violence</li>
              <li>Repeat shipments to the same address (that&apos;s harassment, not a prank)</li>
              <li>Orders targeting minors, schools, or government officials</li>
              <li>Any use intended to intimidate rather than amuse</li>
            </ul>
            <p style={{ fontSize: '0.85rem', color: 'var(--parchment-dim)', marginTop: 14 }}>
              We reserve the right to refuse or cancel any order, and we cooperate with lawful law-enforcement requests.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="eys-footer">
        <div className="eys-footer-inner">
          <div>
            <div className="eys-footer-brand">Express Your Sh*t</div>
            <div className="eys-footer-tag">Say it with shit. A novelty gag-gift service. Please prank responsibly.</div>
          </div>
          <div className="eys-footer-links">
            <a href="#tiers">Tiers</a>
            <a href="#faq">FAQ</a>
            <a href="#legal">Terms</a>
            <a href="#legal">Privacy</a>
            <a href="#order">Order</a>
          </div>
        </div>
        <div className="eys-footer-bottom wrap">
          © 2026 Express Your Sh*t. Not affiliated with any cat, wittingly or otherwise. 18+ to order.
        </div>
      </footer>
    </>
  );
}