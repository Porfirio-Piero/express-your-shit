'use client';

import { Nav, Section, SectionHeading, Footer, SealGlyph, CheckSeal, CrossMark, Button, Reveal } from '@/components/ui';

interface Competitor {
  name: string;
  tagline: string;
  url: string;
  features: { feature: string; them: string; us: string }[];
}

export function ComparisonPage({ competitor }: { competitor: Competitor }) {
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <div className="pt-32 pb-20">
        <Section className="!pt-0">
          <Reveal>
            <SectionHeading sub={`How Express Your Sh*t compares to ${competitor.name}.`}>
              Express Your Sh*t vs {competitor.name}
            </SectionHeading>
          </Reveal>

          <Reveal variant="scale">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-3 gap-0 border-b border-charcoal-light/50">
                  <div className="p-5 bg-charcoal/30">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-parchment/40">Feature</span>
                  </div>
                  <div className="p-5 bg-charcoal/30 text-center border-l border-charcoal-light/30">
                    <span className="font-display text-lg text-parchment/70">{competitor.name}</span>
                    <div className="text-parchment/30 text-xs mt-1">{competitor.url}</div>
                  </div>
                  <div className="p-5 text-center border-l border-charcoal-light/30" style={{ background: 'rgba(107, 30, 36, 0.08)' }}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 30%, #8B2A30 0%, #6B1E24 100%)' }}>
                        <span className="text-[6px] font-display font-bold text-parchment">EYS</span>
                      </div>
                      <span className="font-display text-lg gold-text">Express Your Sh*t</span>
                    </div>
                  </div>
                </div>

                {/* Feature Rows */}
                {competitor.features.map((f, i) => (
                  <div key={i} className={`grid grid-cols-3 gap-0 ${i !== competitor.features.length - 1 ? 'border-b border-charcoal-light/30' : ''}`}>
                    <div className="p-5 flex items-center">
                      <span className="text-parchment/70 text-sm">{f.feature}</span>
                    </div>
                    <div className="p-5 text-center flex items-center justify-center border-l border-charcoal-light/20">
                      <span className="text-parchment/40 text-sm">{f.them}</span>
                    </div>
                    <div className="p-5 text-center flex items-center justify-center border-l border-charcoal-light/20" style={{ background: 'rgba(107, 30, 36, 0.04)' }}>
                      <span className="text-parchment text-sm font-medium">{f.us}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-parchment/50 mb-8 max-w-xl mx-auto text-balance">
                  {competitor.name} does one thing fine. But if you want theater, personalization, 
                  and a genuinely funny experience — not just &ldquo;we mailed you feces&rdquo; — 
                  the choice is clear.
                </p>
                <Button variant="gold" onClick={() => window.location.href = '/checkout'}>
                  File Your Case — $34.99
                </Button>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
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
          </Reveal>
        </Section>
      </div>
      <Footer />
    </main>
  );
}

export const SHITEXPRESS: Competitor = {
  name: 'ShitExpress',
  tagline: 'The original. But original doesn\'t mean best.',
  url: 'shitexpress.com',
  features: [
    { feature: 'Product Variety', them: 'Real animal feces only', us: 'Signature Blend (synthetic) + Studio Reserve (real)' },
    { feature: 'Personalization', them: 'None', us: 'Certificate of Grievance + AI Voice Note' },
    { feature: 'Tier Options', them: 'Basic', us: '3 tiers with quality upgrades' },
    { feature: 'Presentation', them: 'Generic packaging', us: 'Wax-sealed, glitter-infused, biohazard-stickered' },
    { feature: 'Payment Privacy', them: 'Crypto only', us: 'Crypto (BTC/LN/XMR) + Cash by Mail' },
    { feature: 'Anti-Harassment', them: 'Basic', us: 'No repeat shipments to same address' },
    { feature: 'Data Privacy', them: 'Unknown retention', us: '30-day data purge, public policy' },
    { feature: 'Voice/Audio', them: 'None', us: '6 characters, 2 genders, 4 accents' },
    { feature: 'Brand Experience', them: 'Functional', us: 'Bureaucratic theater — the whole point' },
  ],
};

export const POOPSENDERS: Competitor = {
  name: 'PoopSenders',
  tagline: 'They send poop. We deliver justice.',
  url: 'poopsenders.com',
  features: [
    { feature: 'Product', them: 'Real animal feces', us: 'Signature Blend (synthetic) + Studio Reserve (real)' },
    { feature: 'Personalization', them: 'Basic message', us: 'Certificate of Grievance + AI Voice Note' },
    { feature: 'Tier Options', them: '1-2 options', us: '3 curated tiers' },
    { feature: 'Presentation', them: 'Generic box', us: 'Wax-sealed, glitter-infused, biohazard-stickered' },
    { feature: 'Payment Privacy', them: 'Crypto + cards', us: 'Crypto (BTC/LN/XMR) + Cash by Mail (no cards ever)' },
    { feature: 'Anti-Harassment', them: 'Minimal', us: 'No repeat shipments to same address' },
    { feature: 'Data Privacy', them: 'Unknown', us: '30-day data purge, public policy' },
    { feature: 'Voice/Audio', them: 'None', us: '6 characters, 2 genders, 4 accents' },
    { feature: 'Brand Experience', them: 'Basic gag site', us: 'Premium bureaucratic theater' },
  ],
};

export const SENDSOMEPOOP: Competitor = {
  name: 'SendSomePoop',
  tagline: 'Same joke, no delivery.',
  url: 'sendsomepoop.com',
  features: [
    { feature: 'Product', them: 'Real animal feces', us: 'Signature Blend + Studio Reserve' },
    { feature: 'Personalization', them: 'None', us: 'Certificate of Grievance + AI Voice Note' },
    { feature: 'Tier Options', them: 'Single tier', us: '3 tiers with quality upgrades' },
    { feature: 'Presentation', them: 'Basic', us: 'Wax-sealed, glitter-infused, biohazard-stickered' },
    { feature: 'Payment Privacy', them: 'Cards', us: 'Crypto + Cash by Mail only' },
    { feature: 'Anti-Harassment', them: 'None', us: 'No repeat shipments to same address' },
    { feature: 'Data Privacy', them: 'Unknown', us: '30-day data purge' },
    { feature: 'Voice/Audio', them: 'None', us: 'Full Character Assassination Kit' },
    { feature: 'Brand Experience', them: 'Low-effort', us: 'Premium satire experience' },
  ],
};