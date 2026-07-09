'use client';

import { Nav, Section, SectionHeading, TierCard, WaxSeal, DeckledDivider, Footer, SealGlyph, Button } from '@/components/ui';
import { useState } from 'react';

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
  {
    q: 'What if I have a problem with my order?',
    a: 'Contact us with your order code. We\'ll make it right.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-ink">
      <Nav />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-ink to-ink" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E8E1CC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10">
          <div className="mb-8">
            <WaxSeal size="lg" animate={true} />
          </div>
          <div className="font-display text-xs tracking-[0.4em] uppercase text-foil-gold/70 mb-4">
            Office of Anonymous Justice
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-parchment mb-6 leading-tight">
            Express Your Sh*t
          </h1>
          <p className="font-display text-xl md:text-2xl text-parchment/60 italic mb-8">
            Say it with shit.
          </p>
          <p className="text-parchment/50 max-w-xl mx-auto mb-10 text-lg">
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
        </div>
      </section>

      <DeckledDivider />

      {/* How It Works */}
      <Section id="how-it-works" className="bg-ink">
        <SectionHeading sub="The process is simple. The delivery is unforgettable.">
          How It Works
        </SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
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
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-charcoal border border-charcoal-light mb-4">
                <span className="case-number text-foil-gold text-lg">{item.step}</span>
              </div>
              <h3 className="font-display text-xl text-parchment mb-3">{item.title}</h3>
              <p className="text-parchment/60 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <DeckledDivider />

      {/* Tiers */}
      <Section id="tiers">
        <SectionHeading sub="Choose the severity of your statement.">
          The Tiers
        </SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-parchment/40 text-sm">
            All tiers include plain packaging and anonymous delivery. No volume upsells — upgrade quality, not quantity.
          </p>
        </div>
      </Section>

      <DeckledDivider />

      {/* Character Assassination Kit */}
      <Section id="kit">
        <SectionHeading sub="Add a Certificate of Grievance and AI voice note to any tier.">
          The Character Assassination Kit
        </SectionHeading>
        <div className="max-w-3xl mx-auto">
          <div className="certificate-border bg-paper-white text-ink p-8 md:p-12 mb-8">
            <div className="text-center mb-4">
              <div className="font-display text-xs tracking-[0.3em] uppercase text-wax-wine/60 mb-2">
                Office of Anonymous Justice
              </div>
              <h3 className="font-display text-2xl text-wax-wine mb-1">Certificate of Grievance</h3>
              <div className="case-number text-sm text-charcoal/60">Case No. EYS-GR-XXXXXX</div>
            </div>
            <div className="text-sm text-charcoal/70 text-center italic">
              Select your cited offenses. Add a custom charge. Choose a voice. 
              The recipient scans the QR code and hears it read aloud.
            </div>
            <div className="flex justify-center mt-6">
              <WaxSeal size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-charcoal/50 rounded-xl p-6 border border-charcoal-light">
              <h4 className="font-display text-lg text-foil-gold mb-3">Certificate of Grievance</h4>
              <p className="text-parchment/70 text-sm mb-3">
                An official-looking decree citing the recipient&apos;s offenses. 
                Printed and sealed. Framable.
              </p>
              <div className="space-y-2">
                {['Petty Betrayal', 'Chronic Left-on-Read', 'Crimes Against the Group Chat', 'Thermostat Tampering', 'Leftover Theft', 'Aggressive Reply-All', 'Parking Space Piracy', 'Unsolicited Life Advice'].map((offense) => (
                  <div key={offense} className="flex items-center gap-2 text-parchment/60 text-xs">
                    <SealGlyph className="shrink-0" />
                    {offense}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-charcoal/50 rounded-xl p-6 border border-charcoal-light">
              <h4 className="font-display text-lg text-foil-gold mb-3">AI Voice Note</h4>
              <p className="text-parchment/70 text-sm mb-3">
                The recipient scans a QR code and hears your message read aloud 
                by one of six characters.
              </p>
              <div className="space-y-2">
                {['The Disappointed Judge', 'Movie Trailer Announcer', 'Royal Herald', 'Nature Documentarian', 'Drill Sergeant', 'Disappointed Parent'].map((char) => (
                  <div key={char} className="flex items-center gap-2 text-parchment/60 text-xs">
                    <SealGlyph className="shrink-0" />
                    {char}
                  </div>
                ))}
              </div>
              <p className="text-parchment/40 text-xs mt-4">
                Choose gender (Male/Female) and accent (American, British, Australian, Flat &amp; Robotic). 
                Every combination is previewable before you commit.
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-parchment/50 text-sm">
              <SealGlyph className="mr-1" /> <strong className="text-foil-gold">$7</strong> standalone · Discounted when added at checkout
            </p>
          </div>
        </div>
      </Section>

      <DeckledDivider />

      {/* Comparison Teaser */}
      <Section id="compare">
        <SectionHeading sub="See how we stack up against the competition.">
          Why Express Your Sh*t?
        </SectionHeading>
        <div className="bg-charcoal/50 rounded-xl p-6 md:p-8 border border-charcoal-light">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-display text-3xl text-foil-gold mb-2">6</div>
              <div className="text-parchment/60 text-sm">Character Voices</div>
            </div>
            <div>
              <div className="font-display text-3xl text-foil-gold mb-2">0</div>
              <div className="text-parchment/60 text-sm">Credit Cards Accepted</div>
            </div>
            <div>
              <div className="font-display text-3xl text-foil-gold mb-2">30</div>
              <div className="text-parchment/60 text-sm">Day Data Purge</div>
            </div>
          </div>
          <div className="mt-8 text-center">
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
      </Section>

      <DeckledDivider />

      {/* FAQ */}
      <Section id="faq">
        <SectionHeading sub="Everything you need to know before filing.">
          Frequently Asked Questions
        </SectionHeading>
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border border-charcoal-light rounded-lg overflow-hidden">
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between bg-charcoal/30 hover:bg-charcoal/50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-display text-parchment text-sm md:text-base pr-4">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-foil-gold shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 py-4 bg-charcoal/20 text-parchment/70 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="py-20 text-center bg-gradient-to-b from-ink via-charcoal to-ink">
        <div className="max-w-2xl mx-auto px-4">
          <WaxSeal size="md" className="mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-parchment mb-4">
            Ready to File?
          </h2>
          <p className="text-parchment/60 mb-8">
            The Office of Anonymous Justice is now accepting cases.
          </p>
          <Button variant="gold" onClick={() => window.location.href = '/checkout'}>
            Start Your Case — $34.99
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}