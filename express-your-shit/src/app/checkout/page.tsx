'use client';

import { useState, useMemo } from 'react';
import { Nav, Footer, WaxSeal, SealGlyph, Button } from '@/components/ui';

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

  // Upsell state
  const [upsellAction, setUpsellAction] = useState<'none' | 'kit' | 'upgrade'>('none');

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
    { id: 'disappointed-judge', name: 'The Disappointed Judge', preview: 'The court finds you guilty of chronic left-on-read.' },
    { id: 'movie-trailer', name: 'Movie Trailer Announcer', preview: 'In a world where you leave people on read...' },
    { id: 'royal-herald', name: 'Royal Herald', preview: 'Hear ye, hear ye! By royal decree, you are hereby found guilty.' },
    { id: 'nature-doc', name: 'Nature Documentarian', preview: 'Here we observe the chronic non-responder in their natural habitat.' },
    { id: 'drill-sergeant', name: 'Drill Sergeant', preview: 'Listen up! Your texting habits are a disgrace!' },
    { id: 'disappointed-parent', name: 'Disappointed Parent', preview: 'I\'m not angry, I\'m just disappointed.' },
  ];

  const ACCENTS = ['american', 'british', 'australian', 'flat-robotic'];

  function handleCheckout() {
    if (!addKit) {
      // Post-purchase upsell: offer kit
      setStep('upsell');
    } else {
      // Route to kit config
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

  if (step === 'kit-config') {
    return (
      <main className="min-h-screen bg-ink">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
          <div className="text-center mb-8">
            <WaxSeal size="sm" className="mb-4" />
            <h1 className="font-display text-3xl text-parchment mb-2">Configure Your Kit</h1>
            <p className="text-parchment/60 text-sm">Customize the Certificate of Grievance and AI voice note.</p>
          </div>

          {/* Offenses */}
          <div className="mb-8">
            <h3 className="font-display text-lg text-parchment mb-4">Cited Offenses</h3>
            <div className="grid grid-cols-2 gap-3">
              {OFFENSES.map((offense) => (
                <label key={offense} className="flex items-center gap-2 bg-charcoal/50 border border-charcoal-light rounded-lg px-3 py-2 cursor-pointer hover:border-foil-gold/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={kitOffenses.includes(offense)}
                    onChange={(e) => {
                      if (e.target.checked) setKitOffenses([...kitOffenses, offense]);
                      else setKitOffenses(kitOffenses.filter(o => o !== offense));
                    }}
                    className="accent-wax-wine"
                  />
                  <span className="text-parchment/80 text-sm">{offense}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Charge */}
          <div className="mb-8">
            <h3 className="font-display text-lg text-parchment mb-4">Additional Charge (optional)</h3>
            <input
              type="text"
              value={kitCustomCharge}
              onChange={(e) => setKitCustomCharge(e.target.value.slice(0, 200))}
              placeholder="e.g., Unforgivable use of the reply-all..."
              className="checkout-input"
              maxLength={200}
            />
            <p className="text-parchment/40 text-xs mt-1">{kitCustomCharge.length}/200 characters</p>
          </div>

          {/* Character Selection */}
          <div className="mb-8">
            <h3 className="font-display text-lg text-parchment mb-4">Choose Your Voice</h3>
            <div className="space-y-3">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setKitCharacter(char.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    kitCharacter === char.id
                      ? 'bg-charcoal border-foil-gold'
                      : 'bg-charcoal/30 border-charcoal-light hover:border-charcoal-light/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-parchment">{char.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); previewVoice(char.id, kitGender, kitAccent); }}
                      className="text-foil-gold text-sm hover:text-foil-gold-light"
                    >
                      ▶ Preview
                    </button>
                  </div>
                  <p className="text-parchment/50 text-xs mt-1 italic">&ldquo;{char.preview}&rdquo;</p>
                </button>
              ))}
            </div>
          </div>

          {/* Gender & Accent */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-display text-lg text-parchment mb-4">Gender</h3>
              <div className="space-y-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setKitGender(g)}
                    className={`w-full py-3 rounded-lg border font-body text-sm transition-colors ${
                      kitGender === g
                        ? 'bg-wax-wine text-parchment border-wax-wine'
                        : 'bg-charcoal/30 text-parchment/70 border-charcoal-light hover:border-charcoal-light/80'
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg text-parchment mb-4">Accent</h3>
              <div className="space-y-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent}
                    onClick={() => setKitAccent(accent)}
                    className={`w-full py-3 rounded-lg border font-body text-sm transition-colors ${
                      kitAccent === accent
                        ? 'bg-wax-wine text-parchment border-wax-wine'
                        : 'bg-charcoal/30 text-parchment/70 border-charcoal-light hover:border-charcoal-light/80'
                    }`}
                  >
                    {accent.charAt(0).toUpperCase() + accent.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Voice Message */}
          <div className="mb-8">
            <h3 className="font-display text-lg text-parchment mb-4">Voice Message</h3>
            <textarea
              value={kitMessage}
              onChange={(e) => setKitMessage(e.target.value.slice(0, 180))}
              placeholder="Your message, read aloud by the character (max 180 chars)..."
              className="checkout-input resize-none h-24"
              maxLength={180}
            />
            <p className="text-parchment/40 text-xs mt-1">{kitMessage.length}/180 characters</p>
          </div>

          {/* Order Summary */}
          <div className="bg-charcoal/50 border border-charcoal-light rounded-xl p-6 mb-8">
            <h3 className="font-display text-lg text-parchment mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-parchment/70">
                <span>{currentTier.name}</span>
                <span>${currentTier.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-parchment/70">
                <span>Character Assassination Kit</span>
                <span>${KIT_DISCOUNT_PRICE.toFixed(2)}</span>
              </div>
              <div className="border-t border-charcoal-light pt-2 flex justify-between font-display text-lg">
                <span className="text-parchment">Total</span>
                <span className="text-foil-gold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button variant="gold" className="w-full text-lg" onClick={handleKitComplete}>
            Finalize — ${total.toFixed(2)}
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  if (step === 'upsell') {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <WaxSeal size="lg" className="mb-6" />
          <h2 className="font-display text-3xl text-parchment mb-3">Wait — One More Thing</h2>
          {currentTier.id !== 'case-closed' ? (
            <>
              <p className="text-parchment/60 mb-6">
                Your order qualifies for the <strong className="text-foil-gold">Character Assassination Kit</strong> at a 
                checkout-only discount. Certificate of Grievance + AI voice note — just <strong className="text-foil-gold">${KIT_DISCOUNT_PRICE}</strong>.
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
              <p className="text-parchment/60 mb-2">You&apos;ve already added the Kit.</p>
              <p className="text-parchment/60 mb-6">
                Want to upgrade to <strong className="text-foil-gold">Case Closed</strong>? Studio Reserve, same-day dispatch, 
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

  if (step === 'thankyou') {
    const orderCode = `EYS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <WaxSeal size="lg" />
          </div>
          <div className="font-display text-xs tracking-[0.3em] uppercase text-foil-gold/70 mb-2">
            Case Filed
          </div>
          <h2 className="font-display text-3xl text-parchment mb-4">Your Case Is Sealed</h2>
          <div className="bg-charcoal/50 border border-charcoal-light rounded-xl p-6 mb-6">
            <div className="text-sm text-parchment/50 mb-1">Order Code</div>
            <div className="case-number text-2xl text-foil-gold mb-4">{orderCode}</div>
            {addKit && (
              <div className="text-sm text-parchment/50">
                Kit QR code will be generated once payment is confirmed.
              </div>
            )}
            <div className="text-sm text-parchment/50 mt-2">
              {paymentMethod === 'crypto' ? (
                <>BTC/LN/XMR payment address will be emailed to you.</>
              ) : (
                <>Mail cash + order code to the address provided. Ships within 2 business days of receipt.</>
              )}
            </div>
          </div>

          <div className="bg-charcoal/30 border border-charcoal-light rounded-xl p-6 mb-6">
            <h3 className="font-display text-lg text-parchment mb-3">Share the Cause</h3>
            <p className="text-parchment/60 text-sm mb-4">
              Get credit toward your next order when someone files through your link.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 text-sm">Copy Link</Button>
              <Button variant="secondary" className="flex-1 text-sm">Share to X</Button>
              <Button variant="secondary" className="flex-1 text-sm">Text a Friend</Button>
            </div>
          </div>

          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  // Main checkout form
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-8">
          <WaxSeal size="md" className="mb-4" />
          <h1 className="font-display text-3xl md:text-4xl text-parchment mb-2">File Your Case</h1>
          <p className="text-parchment/60">One page. One decision. Justice served.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tier Selection */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4">Choose Your Tier</h3>
              <div className="space-y-3">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTier === tier.id
                        ? 'border-foil-gold bg-charcoal/70'
                        : 'border-charcoal-light bg-charcoal/30 hover:border-charcoal-light/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-display text-lg text-parchment">{tier.name}</span>
                        {tier.default && (
                          <span className="ml-2 text-xs bg-foil-gold/20 text-foil-gold px-2 py-0.5 rounded-full">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <span className="font-display text-xl text-foil-gold">${tier.price}</span>
                    </div>
                    <p className="text-parchment/50 text-sm">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Kit Add-On */}
            <div className={`border-2 border-dashed rounded-xl p-4 transition-colors ${
              addKit ? 'border-foil-gold bg-foil-gold/5' : 'border-charcoal-light bg-charcoal/20'
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="add-kit"
                  checked={addKit}
                  onChange={(e) => setAddKit(e.target.checked)}
                  className="mt-1 accent-wax-wine w-4 h-4"
                />
                <label htmlFor="add-kit" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-parchment">
                      Add the Character Assassination Kit
                    </span>
                    <span className="text-foil-gold font-display">
                      ${KIT_DISCOUNT_PRICE} <span className="text-parchment/40 text-sm line-through">${KIT_PRICE}</span>
                    </span>
                  </div>
                  <p className="text-parchment/50 text-sm mt-1">
                    Certificate of Grievance + AI voice note. Customize after checkout.
                  </p>
                </label>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4">Recipient Address</h3>
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
                  <input
                    type="text"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    placeholder="City"
                    className="checkout-input"
                  />
                  <input
                    type="text"
                    value={recipientState}
                    onChange={(e) => setRecipientState(e.target.value)}
                    placeholder="State"
                    className="checkout-input"
                  />
                  <input
                    type="text"
                    value={recipientZip}
                    onChange={(e) => setRecipientZip(e.target.value)}
                    placeholder="ZIP"
                    className="checkout-input"
                  />
                </div>
              </div>
            </div>

            {/* Anonymous Note */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4">Anonymous Note (optional)</h3>
              <textarea
                value={anonymousNote}
                onChange={(e) => setAnonymousNote(e.target.value.slice(0, 200))}
                placeholder="Printed on a paper insert. Separate from the Kit voice message."
                className="checkout-input resize-none h-24"
                maxLength={200}
              />
              <p className="text-parchment/40 text-xs mt-1">{anonymousNote.length}/200 characters</p>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-display text-lg text-parchment mb-4">Payment Method</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    paymentMethod === 'crypto'
                      ? 'border-foil-gold bg-charcoal/70'
                      : 'border-charcoal-light bg-charcoal/30 hover:border-charcoal-light/80'
                  }`}
                >
                  <div className="font-display text-parchment">Bitcoin / Lightning / Monero</div>
                  <div className="text-parchment/50 text-sm">Via BTCPay Server — no KYC, no card</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-foil-gold bg-charcoal/70'
                      : 'border-charcoal-light bg-charcoal/30 hover:border-charcoal-light/80'
                  }`}
                >
                  <div className="font-display text-parchment">Cash by Mail</div>
                  <div className="text-parchment/50 text-sm">Mail cash + your order code — ships within 2 business days</div>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-charcoal/50 border border-charcoal-light rounded-xl p-6">
              <h3 className="font-display text-lg text-parchment mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-parchment/70">
                  <span>{currentTier.name}</span>
                  <span>${currentTier.price.toFixed(2)}</span>
                </div>
                {addKit && (
                  <div className="flex justify-between text-parchment/70">
                    <span>Character Assassination Kit</span>
                    <span>${KIT_DISCOUNT_PRICE.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-parchment/70">
                  <span>Shipping</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-charcoal-light pt-3 flex justify-between font-display text-xl">
                  <span className="text-parchment">Total</span>
                  <span className="text-foil-gold">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button variant="gold" className="w-full mt-6" onClick={handleCheckout}>
                {paymentMethod === 'crypto' ? `Pay with Crypto — $${total.toFixed(2)}` : `Mail Cash — $${total.toFixed(2)}`}
              </Button>
              <p className="text-parchment/30 text-xs text-center mt-3">
                The recipient never sees your name or any identifying detail.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function previewVoice(characterId: string, gender: string, accent: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const char = {
      'disappointed-judge': 'The court finds you guilty of chronic left on read.',
      'movie-trailer': 'In a world where you leave people on read.',
      'royal-herald': 'Hear ye hear ye! By royal decree, you are hereby found guilty.',
      'nature-doc': 'Here we observe the chronic non responder in their natural habitat.',
      'drill-sergeant': 'Listen up! Your texting habits are a disgrace!',
      'disappointed-parent': 'I am not angry. I am just disappointed.',
    }[characterId] || 'The court finds you guilty.';

    const utterance = new SpeechSynthesisUtterance(char);
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a matching voice
    const langMap: Record<string, string> = {
      american: 'en-US',
      british: 'en-GB',
      australian: 'en-AU',
      'flat-robotic': 'en-US',
    };
    
    const targetLang = langMap[accent] || 'en-US';
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.lang = targetLang;
    utterance.rate = accent === 'flat-robotic' ? 0.7 : 0.9;
    utterance.pitch = gender === 'female' ? 1.3 : 0.8;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}