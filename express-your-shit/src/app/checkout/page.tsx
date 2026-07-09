'use client';

import { useState, useMemo } from 'react';
import { Nav, Footer, WaxSeal, SealGlyph, Button, Waveform } from '@/components/ui';

const TIERS = [
  {
    id: 'petty-theft',
    name: 'The Petty Theft',
    price: 19.99,
    desc: 'Kraft box, anonymous label. The basics.',
    features: ['Signature Blend (synthetic)', 'Plain packaging', 'Anonymous delivery'],
  },
  {
    id: 'full-send',
    name: 'The Full Send',
    price: 34.99,
    desc: 'Glitter-infused, wax-sealed, biohazard sticker. The one they\'ll remember.',
    features: ['Signature Blend (synthetic)', 'Glitter-infused', 'Wax-sealed box', 'Biohazard sticker', 'Priority shipping'],
    default: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'case-closed',
    name: 'Case Closed',
    price: 54.99,
    desc: 'Real specimen, same-day dispatch. Scarce by design.',
    features: ['Studio Reserve (real)', 'Handwritten note', 'Dated batch card', 'Certificate of Authenticity', 'Same-day Priority shipping'],
  },
];

const KIT_PRICE = 7;
const KIT_DISCOUNT_PRICE = 5;

export default function Checkout() {
  const [selectedTier, setSelectedTier] = useState('full-send');
  const [addKit, setAddKit] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress1, setRecipientAddress1] = useState('');
  const [recipientAddress2, setRecipientAddress2] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientState, setRecipientState] = useState('');
  const [recipientZip, setRecipientZip] = useState('');
  const [anonymousNote, setAnonymousNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'cash'>('crypto');
  const [step, setStep] = useState<'checkout' | 'kit-config' | 'upsell' | 'thankyou'>('checkout');
  
  // Kit config state
  const [kitCharacter, setKitCharacter] = useState('disappointed-judge');
  const [kitGender, setKitGender] = useState<'male' | 'female'>('male');
  const [kitAccent, setKitAccent] = useState('american');
  const [kitMessage, setKitMessage] = useState('');
  const [kitOffenses, setKitOffenses] = useState<string[]>([]);
  const [kitCustomCharge, setKitCustomCharge] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const currentTier = TIERS.find(t => t.id === selectedTier) || TIERS[1];
  
  const total = useMemo(() => {
    let t = currentTier.price;
    if (addKit) t += KIT_DISCOUNT_PRICE;
    return t;
  }, [currentTier, addKit]);

  const OFFENSES = [
    'Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat',
    'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All',
    'Parking Space Piracy', 'Unsolicited Life Advice',
  ];

  const CHARACTERS = [
    { id: 'disappointed-judge', name: 'The Disappointed Judge', icon: '⚖', preview: 'The court finds you guilty of chronic left-on-read.' },
    { id: 'movie-trailer', name: 'Movie Trailer Announcer', icon: '🎬', preview: 'In a world where you leave people on read...' },
    { id: 'royal-herald', name: 'Royal Herald', icon: '👑', preview: 'Hear ye, hear ye! By royal decree, you are hereby found guilty.' },
    { id: 'nature-doc', name: 'Nature Documentarian', icon: '🐾', preview: 'Here we observe the chronic non-responder in their natural habitat.' },
    { id: 'drill-sergeant', name: 'Drill Sergeant', icon: '🎖', preview: 'Listen up! Your texting habits are a disgrace!' },
    { id: 'disappointed-parent', name: 'Disappointed Parent', icon: '🏠', preview: 'I\'m not angry, I\'m just disappointed.' },
  ];

  const ACCENTS = ['american', 'british', 'australian', 'flat-robotic'];

  function handleCheckout() {
    if (!addKit) {
      setStep('upsell');
    } else {
      setStep('kit-config');
    }
  }

  function handleKitComplete() {
    setStep('thankyou');
  }

  function handleUpsellKit() {
    setAddKit(true);
    setStep('kit-config');
  }

  function handleUpsellUpgrade() {
    setSelectedTier('case-closed');
    setStep('thankyou');
  }

  function handleSkipUpsell() {
    setStep('thankyou');
  }

  function previewVoice(characterId: string, gender: string, accent: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const char = CHARACTERS.find(c => c.id === characterId)?.preview || 'The court finds you guilty.';
      const utterance = new SpeechSynthesisUtterance(char);
      const voices = window.speechSynthesis.getVoices();
      const langMap: Record<string, string> = { american: 'en-US', british: 'en-GB', australian: 'en-AU', 'flat-robotic': 'en-US' };
      const targetLang = langMap[accent] || 'en-US';
      const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (matchingVoice) utterance.voice = matchingVoice;
      utterance.lang = targetLang;
      utterance.rate = accent === 'flat-robotic' ? 0.7 : 0.9;
      utterance.pitch = gender === 'female' ? 1.3 : 0.8;
      utterance.onstart = () => setPreviewPlaying(true);
      utterance.onend = () => setPreviewPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  // ===== KIT CONFIG STEP =====
  if (step === 'kit-config') {
    return (
      <main className="min-h-screen bg-ink">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
          <div className="text-center mb-10">
            <WaxSeal size="md" className="mb-4" />
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-foil-gold/60 mb-2">
              Step 2 of 2
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-parchment mb-2">Configure Your Kit</h1>
            <p className="text-parchment/50 text-sm">Customize the Certificate of Grievance and AI voice note.</p>
          </div>

          {/* Offenses */}
          <div className="mb-10 step-enter">
            <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
              <SealGlyph size={18} /> Cited Offenses
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {OFFENSES.map((offense) => (
                <button
                  key={offense}
                  onClick={() => {
                    setKitOffenses(prev => prev.includes(offense) ? prev.filter(o => o !== offense) : [...prev, offense]);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    kitOffenses.includes(offense)
                      ? 'bg-wax-wine/20 border-foil-gold/50 text-parchment'
                      : 'bg-charcoal/30 border-charcoal-light text-parchment/50 hover:border-charcoal-light/80'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    kitOffenses.includes(offense) ? 'bg-wax-wine border-wax-wine' : 'border-charcoal-light'
                  }`}>
                    {kitOffenses.includes(offense) && <span className="text-[5px] font-display font-bold text-parchment">EYS</span>}
                  </div>
                  <span className="text-left leading-tight text-xs">{offense}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Charge */}
          <div className="mb-10 step-enter">
            <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
              <SealGlyph size={18} /> Additional Charge (optional)
            </h3>
            <input
              type="text"
              value={kitCustomCharge}
              onChange={(e) => setKitCustomCharge(e.target.value.slice(0, 200))}
              placeholder="e.g., Unforgivable use of the reply-all..."
              className="checkout-input"
              maxLength={200}
            />
            <p className="text-parchment/30 text-xs mt-1.5">{kitCustomCharge.length}/200 characters</p>
          </div>

          {/* Character Selection */}
          <div className="mb-10 step-enter">
            <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
              <SealGlyph size={18} /> Choose Your Voice
            </h3>
            <div className="space-y-3">
              {CHARACTERS.map((char) => (
                <div
                  key={char.id}
                  onClick={() => setKitCharacter(char.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    kitCharacter === char.id
                      ? 'bg-charcoal/70 border-foil-gold/50 gold-glow'
                      : 'bg-charcoal/30 border-charcoal-light hover:border-charcoal-light/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{char.icon}</span>
                      <div>
                        <span className="font-display text-parchment block">{char.name}</span>
                        <span className="text-parchment/40 text-xs italic">&ldquo;{char.preview}&rdquo;</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); previewVoice(char.id, kitGender, kitAccent); }}
                      className="text-foil-gold text-sm hover:text-foil-gold-light transition-colors flex items-center gap-1.5"
                    >
                      {previewPlaying ? <Waveform playing bars={12} /> : '▶ Preview'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender & Accent */}
          <div className="grid grid-cols-2 gap-6 mb-10 step-enter">
            <div>
              <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                <SealGlyph size={18} /> Gender
              </h3>
              <div className="space-y-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setKitGender(g)}
                    className={`w-full py-3 rounded-lg border font-body text-sm transition-all ${
                      kitGender === g
                        ? 'bg-wax-wine text-parchment border-wax-wine'
                        : 'bg-charcoal/30 text-parchment/60 border-charcoal-light hover:border-charcoal-light/80'
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                <SealGlyph size={18} /> Accent
              </h3>
              <div className="space-y-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent}
                    onClick={() => setKitAccent(accent)}
                    className={`w-full py-3 rounded-lg border font-body text-sm transition-all ${
                      kitAccent === accent
                        ? 'bg-wax-wine text-parchment border-wax-wine'
                        : 'bg-charcoal/30 text-parchment/60 border-charcoal-light hover:border-charcoal-light/80'
                    }`}
                  >
                    {accent.charAt(0).toUpperCase() + accent.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Voice Message */}
          <div className="mb-10 step-enter">
            <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
              <SealGlyph size={18} /> Voice Message
            </h3>
            <textarea
              value={kitMessage}
              onChange={(e) => setKitMessage(e.target.value.slice(0, 180))}
              placeholder="Your message, read aloud by the character (max 180 chars)..."
              className="checkout-input resize-none h-24"
              maxLength={180}
            />
            <p className="text-parchment/30 text-xs mt-1.5">{kitMessage.length}/180 characters</p>
          </div>

          {/* Order Summary */}
          <div className="glass-card-gold rounded-2xl p-6 mb-8">
            <h3 className="font-display text-lg text-parchment mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-parchment/60">
                <span>{currentTier.name}</span>
                <span>${currentTier.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-parchment/60">
                <span>Character Assassination Kit</span>
                <span>${KIT_DISCOUNT_PRICE.toFixed(2)}</span>
              </div>
              <div className="border-t border-charcoal-light/40 pt-2.5 flex justify-between font-display text-xl">
                <span className="text-parchment">Total</span>
                <span className="gold-text font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button variant="gold" className="w-full text-lg" onClick={handleKitComplete}>
            Seal the Deal — ${total.toFixed(2)}
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  // ===== UPSELL STEP =====
  if (step === 'upsell') {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(184, 146, 90, 0.4) 0%, transparent 60%)' }}
        />
        <div className="max-w-md w-full text-center relative z-10">
          <WaxSeal size="lg" className="mb-6" />
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-foil-gold/60 mb-2">
            One More Thing
          </div>
          <h2 className="font-display text-3xl text-parchment mb-4">Wait — Before We Seal This</h2>
          {currentTier.id !== 'case-closed' ? (
            <>
              <p className="text-parchment/50 mb-8 text-balance">
                Your order qualifies for the <strong className="gold-text">Character Assassination Kit</strong> at a 
                checkout-only discount. Certificate of Grievance + AI voice note — just <strong className="gold-text">${KIT_DISCOUNT_PRICE}</strong>.
              </p>
              <div className="space-y-3">
                <Button variant="gold" className="w-full" onClick={handleUpsellKit}>
                  Add the Kit — ${KIT_DISCOUNT_PRICE}
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleSkipUpsell}>
                  Skip, just ship it
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-parchment/50 mb-2">You&apos;ve already added the Kit.</p>
              <p className="text-parchment/50 mb-8">
                Want to upgrade to <strong className="gold-text">Case Closed</strong>? Studio Reserve, same-day dispatch, 
                real specimen from a named contributing cat.
              </p>
              <div className="space-y-3">
                <Button variant="gold" className="w-full" onClick={handleUpsellUpgrade}>
                  Upgrade to Case Closed
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleSkipUpsell}>
                  Keep my tier
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  // ===== THANK YOU STEP =====
  if (step === 'thankyou') {
    const orderCode = `EYS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(184, 146, 90, 0.4) 0%, transparent 60%)' }}
        />
        <div className="max-w-md w-full text-center relative z-10">
          <div className="mb-6">
            <WaxSeal size="xl" animate={true} />
          </div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-foil-gold/60 mb-2">
            Case Filed
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-parchment mb-6">Your Case Is Sealed</h2>
          
          <div className="glass-card-gold rounded-2xl p-6 mb-6">
            <div className="text-sm text-parchment/50 mb-1">Order Code</div>
            <div className="case-number text-2xl gold-text mb-4 font-semibold">{orderCode}</div>
            {addKit && (
              <div className="text-sm text-parchment/50 border-t border-charcoal-light/30 pt-3 mt-3">
                Kit QR code will be generated once payment is confirmed.
              </div>
            )}
            <div className="text-sm text-parchment/50 mt-3 pt-3 border-t border-charcoal-light/30">
              {paymentMethod === 'crypto' ? (
                <>BTC/LN/XMR payment address will be sent to you.</>
              ) : (
                <>Mail cash + order code to the address provided. Ships within 2 business days of receipt.</>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="font-display text-lg text-parchment mb-3">Share the Cause</h3>
            <p className="text-parchment/40 text-sm mb-4">
              Get credit toward your next order when someone files through your link.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 text-sm">Copy Link</Button>
              <Button variant="secondary" className="flex-1 text-sm">Share to X</Button>
              <Button variant="secondary" className="flex-1 text-sm">Text</Button>
            </div>
          </div>

          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  // ===== MAIN CHECKOUT =====
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-10">
          <WaxSeal size="md" className="mb-4" />
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-foil-gold/60 mb-2">
            File Your Case
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-parchment mb-2">Checkout</h1>
          <p className="text-parchment/50">One page. One decision. Justice served.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-10">
            {/* Tier Selection - Visual Cards */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                <SealGlyph size={18} /> Choose Your Tier
              </h3>
              <div className="space-y-3">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                      selectedTier === tier.id
                        ? 'border-foil-gold bg-charcoal/60 gold-glow'
                        : 'border-charcoal-light bg-charcoal/20 hover:border-charcoal-light/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          selectedTier === tier.id 
                            ? 'bg-wax-wine' 
                            : 'bg-charcoal-light/40 border border-charcoal-light'
                        }`}>
                          {selectedTier === tier.id ? (
                            <span className="text-[7px] font-display font-bold text-parchment">EYS</span>
                          ) : (
                            <span className="w-3 h-3 rounded-full bg-charcoal-light/60" />
                          )}
                        </div>
                        <div>
                          <span className="font-display text-lg text-parchment">{tier.name}</span>
                          {tier.badge && (
                            <span className="ml-2 text-[10px] bg-foil-gold/20 text-foil-gold-light px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                              {tier.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-display text-2xl gold-text font-semibold">${tier.price}</span>
                    </div>
                    <p className="text-parchment/40 text-sm ml-13 pl-13" style={{ paddingLeft: '3.25rem' }}>{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Kit Add-On */}
            <div className={`rounded-2xl border-2 border-dashed p-5 transition-all duration-300 ${
              addKit ? 'border-foil-gold bg-foil-gold/5 gold-glow' : 'border-charcoal-light bg-charcoal/15'
            }`}>
              <button
                onClick={() => setAddKit(!addKit)}
                className="w-full flex items-start gap-4 text-left"
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  addKit ? 'bg-wax-wine border-wax-wine' : 'border-charcoal-light'
                }`}>
                  {addKit && <span className="text-[6px] font-display font-bold text-parchment">EYS</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-parchment">
                      Add the Character Assassination Kit
                    </span>
                    <span className="gold-text font-display font-semibold">
                      ${KIT_DISCOUNT_PRICE} <span className="text-parchment/30 text-sm line-through">${KIT_PRICE}</span>
                    </span>
                  </div>
                  <p className="text-parchment/40 text-sm">
                    Certificate of Grievance + AI voice note. Customize after checkout.
                  </p>
                </div>
              </button>
            </div>

            {/* Recipient Address */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                <SealGlyph size={18} /> Recipient Address
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name"
                  className="checkout-input"
                />
                <input
                  type="text"
                  value={recipientAddress1}
                  onChange={(e) => setRecipientAddress1(e.target.value)}
                  placeholder="Address line 1"
                  className="checkout-input"
                />
                <input
                  type="text"
                  value={recipientAddress2}
                  onChange={(e) => setRecipientAddress2(e.target.value)}
                  placeholder="Address line 2 (optional)"
                  className="checkout-input"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} placeholder="City" className="checkout-input" />
                  <input type="text" value={recipientState} onChange={(e) => setRecipientState(e.target.value)} placeholder="State" className="checkout-input" />
                  <input type="text" value={recipientZip} onChange={(e) => setRecipientZip(e.target.value)} placeholder="ZIP" className="checkout-input" />
                </div>
              </div>
            </div>

            {/* Anonymous Note */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                <SealGlyph size={18} /> Anonymous Note (optional)
              </h3>
              <textarea
                value={anonymousNote}
                onChange={(e) => setAnonymousNote(e.target.value.slice(0, 200))}
                placeholder="Printed on a paper insert. Separate from the Kit voice message."
                className="checkout-input resize-none h-24"
                maxLength={200}
              />
              <p className="text-parchment/30 text-xs mt-1.5">{anonymousNote.length}/200 characters</p>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                <SealGlyph size={18} /> Payment Method
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                    paymentMethod === 'crypto'
                      ? 'border-foil-gold bg-charcoal/50 gold-glow'
                      : 'border-charcoal-light bg-charcoal/20 hover:border-charcoal-light/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {/* BTC icon */}
                      <div className="w-8 h-8 rounded-full bg-[#F7931A]/20 flex items-center justify-center text-[#F7931A] text-xs font-bold">₿</div>
                      {/* Lightning icon */}
                      <div className="w-8 h-8 rounded-full bg-[#F2A900]/20 flex items-center justify-center text-[#F2A900] text-xs">⚡</div>
                      {/* XMR icon */}
                      <div className="w-8 h-8 rounded-full bg-[#FF6600]/20 flex items-center justify-center text-[#FF6600] text-xs font-bold">X</div>
                    </div>
                    <div>
                      <div className="font-display text-parchment">Bitcoin / Lightning / Monero</div>
                      <div className="text-parchment/40 text-sm">Via BTCPay Server — no KYC, no card</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                    paymentMethod === 'cash'
                      ? 'border-foil-gold bg-charcoal/50 gold-glow'
                      : 'border-charcoal-light bg-charcoal/20 hover:border-charcoal-light/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal-light/40 flex items-center justify-center text-parchment/60 text-lg">$</div>
                    <div>
                      <div className="font-display text-parchment">Cash by Mail</div>
                      <div className="text-parchment/40 text-sm">Mail cash + your order code — ships within 2 business days</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky order summary - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="glass-card-gold rounded-2xl p-6">
                <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
                  <SealGlyph size={18} /> Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-parchment/60">
                    <span>{currentTier.name}</span>
                    <span>${currentTier.price.toFixed(2)}</span>
                  </div>
                  {addKit && (
                    <div className="flex justify-between text-parchment/60">
                      <span>Character Assassination Kit</span>
                      <span>${KIT_DISCOUNT_PRICE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-parchment/60">
                    <span>Shipping</span>
                    <span className="text-foil-gold/60">Included</span>
                  </div>
                  <div className="border-t border-charcoal-light/40 pt-3 flex justify-between font-display text-2xl">
                    <span className="text-parchment">Total</span>
                    <span className="gold-text font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button variant="gold" className="w-full mt-6 text-lg" onClick={handleCheckout}>
                  {paymentMethod === 'crypto' ? `Pay with Crypto` : `Mail Cash`} — ${total.toFixed(2)}
                </Button>
                <p className="text-parchment/30 text-xs text-center mt-4">
                  The recipient never sees your name or any identifying detail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink/95 backdrop-blur-xl border-t border-foil-gold/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-parchment/50 text-sm">Total</span>
            <span className="font-display text-2xl gold-text font-semibold">${total.toFixed(2)}</span>
          </div>
          <Button variant="gold" className="w-full" onClick={handleCheckout}>
            Seal the Deal — ${total.toFixed(2)}
          </Button>
        </div>
        <div className="h-24 lg:hidden" />
      </div>
      <Footer />
    </main>
  );
}