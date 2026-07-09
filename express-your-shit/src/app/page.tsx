'use client';

import { Nav, Section, SectionHeading, TierCard, WaxSeal, DeckledDivider, Footer, SealGlyph, Button, Reveal, Waveform } from '@/components/ui';
import { useState, useEffect, useRef } from 'react';

const TIERS = [
  {
    id: 'petty-theft',
    name: 'The Petty Theft',
    tagline: 'The basics. Anonymous and effective.',
    price: 19.99,
    features: [
      'Signature Blend specimen (synthetic)',
      'Kraft box, anonymous label',
      'Ships in plain packaging',
      'No paper trail for the recipient',
    ],
  },
  {
    id: 'full-send',
    name: 'The Full Send',
    tagline: 'The one they\'ll remember. Glitter. Wax. Consequences.',
    price: 34.99,
    features: [
      'Signature Blend specimen (synthetic)',
      'Glitter-infused for maximum chaos',
      'Wax-sealed box with biohazard sticker',
      'Certificate of Authenticity (optional add-on)',
      'Ships Priority Mail',
    ],
    highlighted: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'case-closed',
    name: 'Case Closed',
    tagline: 'The real deal. Scarce by design.',
    price: 54.99,
    features: [
      'Studio Reserve specimen (real, sourced)',
      'Handwritten note from contributing cat',
      'Dated batch card & Certificate of Authenticity',
      'Priority shipping, same-day dispatch',
      'Daily supply capped — honest scarcity',
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is this real poop?',
    a: 'The Full Send and Petty Theft tiers use our Signature Blend — a non-toxic, food-safe synthetic compound. The Case Closed tier uses a real, sourced specimen from a named contributing cat. We\'re transparent about what goes in every box.',
  },
  {
    q: 'Is this anonymous?',
    a: 'The recipient never sees your name or any identifying detail. We keep minimal records to fulfill orders and comply with lawful requests, and recipient data is purged 30 days after delivery.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Bitcoin, Lightning Network, Monero via BTCPay Server, or cash by mail. We do not accept credit cards — this is by design, not a temporary limitation.',
  },
  {
    q: 'Can I send this to anyone?',
    a: 'Our Terms of Service prohibit targeting minors, schools, or government officials. Repeat shipments to the same address are blocked — this is a gag gift, not a harassment tool.',
  },
  {
    q: 'What\'s the Character Assassination Kit?',
    a: 'An optional add-on: a printed Certificate of Grievance with your chosen offenses, plus an AI-generated voice note the recipient hears by scanning a QR code. Six character voices, four accents, fully customizable.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Petty Theft and Full Send ship within 2 business days via standard mail. Case Closed ships same-day via Priority Mail. We don\'t promise freshness or temperature — you\'re sending a gag gift, not groceries.',
  },
];

const OFFENSES = [
  'Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat',
  'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All',
  'Parking Space Piracy', 'Unsolicited Life Advice',
];

const CHARACTERS = [
  { id: 'disappointed-judge', name: 'The Disappointed Judge', icon: '⚖' },
  { id: 'movie-trailer', name: 'Movie Trailer Announcer', icon: '🎬' },
  { id: 'royal-herald', name: 'Royal Herald', icon: '👑' },
  { id: 'nature-doc', name: 'Nature Documentarian', icon: '🐾' },
  { id: 'drill-sergeant', name: 'Drill Sergeant', icon: '🎖' },
  { id: 'disappointed-parent', name: 'Disappointed Parent', icon: '🏠' },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedOffenses, setSelectedOffenses] = useState<string[]>(['Chronic Left-on-Read', 'Crimes Against the Group Chat']);
  const [playing, setPlaying] = useState(false);

  // Generate particles for hero
  const particles = useRef(
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${5 + Math.random() * 4}s`,
    }))
  );

  function toggleOffense(offense: string) {
    setSelectedOffenses(prev =>
      prev.includes(offense) ? prev.filter(o => o !== offense) : [...prev, offense]
    );
  }

  return (
    <main className="min-h-screen bg-ink">
      <Nav />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-ink to-ink" />
        
        {/* Particle field */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.current.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        {/* Radial glow behind seal */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(184, 146, 90, 0.3) 0%, transparent 60%)' }}
        />

        <div className="relative z-10">
          {/* Wax Seal */}
          <div className="mb-10">
            <WaxSeal size="xl" animate={true} />
          </div>
          
          <div className="font-mono text-[11px] tracking-[0.4em] uppercase text-foil-gold/60 mb-5">
            Office of Anonymous Justice
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-parchment mb-6 leading-[1.05] font-semibold">
            Express Your Sh*t
          </h1>
          
          <p className="font-display text-2xl md:text-3xl gold-shimmer italic mb-8 font-medium">
            Say it with shit.
          </p>
          
          <p className="text-parchment/50 max-w-xl mx-auto mb-12 text-lg text-balance">
            Premium anonymous gag-gift service. Certified, sealed, and delivered 
            with the gravity it deserves. This is official business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" onClick={() => window.location.href = '/checkout'}>
              Begin Filing — $34.99
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(184, 146, 90, 0.4)" strokeWidth="1.5">
              <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <DeckledDivider />

      {/* ===== HOW IT WORKS ===== */}
      <Section id="how-it-works" className="bg-ink">
        <Reveal>
          <SectionHeading sub="The process is simple. The delivery is unforgettable.">
            How It Works
          </SectionHeading>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              step: '01',
              title: 'File Your Grievance',
              desc: 'Choose your tier, enter the recipient\'s address, and optionally add a Certificate of Grievance with cited offenses and an AI voice note.',
            },
            {
              step: '02',
              title: 'We Process & Pack',
              desc: 'Your order is assembled, sealed, and stamped. Full Send gets glitter and wax. Case Closed gets the real deal, same-day.',
            },
            {
              step: '03',
              title: 'Delivery Is Served',
              desc: 'Plain packaging. No return address. The recipient never sees your name or any identifying detail. Justice is served cold.',
            },
          ].map((item, i) => (
            <Reveal key={item.step} delay={i * 150} variant="up">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-charcoal/60 border border-foil-gold/20 mb-5 transition-all duration-300 group-hover:border-foil-gold/50 group-hover:scale-110">
                  <span className="case-number text-foil-gold text-lg">{item.step}</span>
                </div>
                <h3 className="font-display text-xl text-parchment mb-3">{item.title}</h3>
                <p className="text-parchment/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <DeckledDivider />

      {/* ===== TIERS ===== */}
      <Section id="tiers">
        <Reveal>
          <SectionHeading sub="Choose the severity of your statement.">
            The Tiers
          </SectionHeading>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 120} variant="up">
              <TierCard tier={tier} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="text-center mt-10">
            <p className="text-parchment/30 text-sm">
              All tiers include plain packaging and anonymous delivery. No volume upsells — upgrade quality, not quantity.
            </p>
          </div>
        </Reveal>
      </Section>

      <DeckledDivider />

      {/* ===== CHARACTER ASSASSINATION KIT ===== */}
      <Section id="kit">
        <Reveal>
          <SectionHeading sub="Add a Certificate of Grievance and AI voice note to any tier.">
            The Character Assassination Kit
          </SectionHeading>
        </Reveal>

        {/* Interactive Certificate Preview */}
        <Reveal variant="scale">
          <div className="max-w-3xl mx-auto mb-10">
            <div className="certificate-border bg-paper-white text-ink p-8 md:p-12 rounded-sm">
              <div className="text-center mb-4">
                <div className="font-display text-xs tracking-[0.3em] uppercase text-wax-wine/60 mb-2">
                  Office of Anonymous Justice
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-wax-wine mb-1">Certificate of Grievance</h3>
                <div className="case-number text-sm text-charcoal/60">Case No. EYS-GR-XXXXXX</div>
              </div>
              
              <p className="text-center font-display italic text-charcoal/70 text-sm mb-4">
                Let it be known that a formal complaint has been filed
              </p>
              
              <div className="border-t border-b border-wax-wine/20 py-4 my-4">
                <div className="font-display text-sm text-wax-wine mb-2">Cited Offenses:</div>
                <ul className="space-y-1.5">
                  {selectedOffenses.length > 0 ? (
                    selectedOffenses.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-wax-wine mt-0.5 font-mono">§</span>
                        <span>{o}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-charcoal/40 text-sm italic">Select offenses below to preview the certificate...</li>
                  )}
                </ul>
              </div>
              
              <div className="text-center mt-6 pt-4 border-t border-wax-wine/10">
                <div className="text-xs text-charcoal/50 mb-1">Filed by:</div>
                <div className="font-display text-wax-wine">Identity withheld by design</div>
              </div>
              
              <div className="flex justify-center mt-5">
                <WaxSeal size="md" />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Offense Selector */}
        <Reveal>
          <div className="max-w-3xl mx-auto mb-10">
            <h4 className="font-display text-lg text-parchment mb-4 text-center">Select Cited Offenses</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OFFENSES.map((offense) => (
                <button
                  key={offense}
                  onClick={() => toggleOffense(offense)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all duration-200 ${
                    selectedOffenses.includes(offense)
                      ? 'bg-wax-wine/20 border-foil-gold/50 text-parchment'
                      : 'bg-charcoal/30 border-charcoal-light text-parchment/50 hover:border-charcoal-light/80'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedOffenses.includes(offense) ? 'bg-wax-wine border-wax-wine' : 'border-charcoal-light'
                  }`}>
                    {selectedOffenses.includes(offense) && (
                      <span className="text-[5px] font-display font-bold text-parchment">EYS</span>
                    )}
                  </div>
                  <span className="text-left leading-tight">{offense}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* AI Voice Note Preview */}
        <Reveal>
          <div className="max-w-3xl mx-auto mb-8">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-wax-wine flex items-center justify-center shrink-0 wax-glow">
                  <svg className="w-6 h-6 text-parchment" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display text-lg text-parchment mb-1">AI Voice Note Preview</h4>
                  <p className="text-parchment/50 text-sm">The recipient scans a QR code and hears your message read aloud.</p>
                </div>
              </div>
              
              <Waveform playing={playing} bars={32} />
              
              <button
                onClick={() => {
                  setPlaying(!playing);
                  if (!playing && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    const u = new SpeechSynthesisUtterance('The court finds you guilty of chronic left-on-read.');
                    u.rate = 0.9;
                    u.pitch = 0.8;
                    u.onend = () => setPlaying(false);
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                  } else if (typeof window !== 'undefined') {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="mt-4 w-full bg-wax-wine hover:bg-wax-wine/90 text-parchment font-display py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {playing ? '⏸ Pause Preview' : '▶ Play Sample'}
              </button>
            </div>
          </div>
        </Reveal>

        {/* Characters Grid */}
        <Reveal>
          <div className="max-w-3xl mx-auto">
            <h4 className="font-display text-lg text-parchment mb-4 text-center">Choose Your Voice</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CHARACTERS.map((char) => (
                <div key={char.id} className="glass-card rounded-xl p-4 text-center hover:border-foil-gold/30 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2">{char.icon}</div>
                  <div className="font-display text-sm text-parchment">{char.name}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-parchment/40 text-sm">
                <SealGlyph className="mr-1" /> <strong className="text-foil-gold-light">$7</strong> standalone · Discounted when added at checkout
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <DeckledDivider />

      {/* ===== COMPARISON TEASER ===== */}
      <Section id="compare">
        <Reveal>
          <SectionHeading sub="See how we stack up against the competition.">
            Why Express Your Sh*t?
          </SectionHeading>
        </Reveal>
        <Reveal variant="scale">
          <div className="glass-card-gold rounded-2xl p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-display text-4xl gold-text mb-2 font-semibold">6</div>
                <div className="text-parchment/50 text-sm">Character Voices</div>
              </div>
              <div className="md:border-x md:border-foil-gold/10">
                <div className="font-display text-4xl gold-text mb-2 font-semibold">0</div>
                <div className="text-parchment/50 text-sm">Credit Cards Accepted</div>
              </div>
              <div>
                <div className="font-display text-4xl gold-text mb-2 font-semibold">30</div>
                <div className="text-parchment/50 text-sm">Day Data Purge</div>
              </div>
            </div>
            <div className="mt-10 text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" onClick={() => window.location.href = '/vs-shitexpress'}>
                  vs ShitExpress
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/vs-poopsenders'}>
                  vs PoopSenders
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/vs-sendsomepoop'}>
                  vs SendSomePoop
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <DeckledDivider />

      {/* ===== FAQ ===== */}
      <Section id="faq">
        <Reveal>
          <SectionHeading sub="Everything you need to know before filing.">
            Frequently Asked Questions
          </SectionHeading>
        </Reveal>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="glass-card rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-charcoal/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-display text-parchment text-sm md:text-base pr-4">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-foil-gold shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 py-4 text-parchment/60 text-sm leading-relaxed border-t border-charcoal-light/30">
                    {item.a}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-charcoal/40 to-ink" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(184, 146, 90, 0.4) 0%, transparent 60%)' }}
        />
        <Reveal variant="scale" className="relative z-10">
          <div className="max-w-2xl mx-auto px-4">
            <WaxSeal size="lg" className="mb-6" />
            <h2 className="font-display text-3xl md:text-5xl text-parchment mb-4 text-balance">
              Ready to File?
            </h2>
            <p className="text-parchment/50 mb-10 text-lg">
              The Office of Anonymous Justice is now accepting cases.
            </p>
            <Button variant="gold" onClick={() => window.location.href = '/checkout'}>
              Start Your Case — $34.99
            </Button>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}