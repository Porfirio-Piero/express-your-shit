'use client';

import { Nav, Section, SectionHeading, Footer, SealGlyph, Button } from '@/components/ui';

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
      <div className="pt-24">
        <Section>
          <SectionHeading sub={`How Express Your Sh*t compares to ${competitor.name}.`}>
            Express Your Sh*t vs {competitor.name}
          </SectionHeading>

          <div className="max-w-4xl mx-auto">
            <div className="bg-charcoal/50 border border-charcoal-light rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-4 bg-charcoal/30 border-b border-charcoal-light">
                  <span className="font-display text-parchment/70 text-sm">Feature</span>
                </div>
                <div className="p-4 bg-charcoal/30 border-b border-charcoal-light text-center">
                  <span className="font-display text-parchment/70 text-sm">{competitor.name}</span>
                </div>
                <div className="p-4 bg-wax-wine/20 border-b border-charcoal-light text-center">
                  <span className="font-display text-foil-gold text-sm">Express Your Sh*t</span>
                </div>

                {competitor.features.map((f, i) => (
                  <>
                    <div key={`f-${i}`} className="p-4 border-b border-charcoal-light/50 text-parchment/70 text-sm">
                      {f.feature}
                    </div>
                    <div key={`t-${i}`} className="p-4 border-b border-charcoal-light/50 text-parchment/50 text-sm text-center">
                      {f.them}
                    </div>
                    <div key={`u-${i}`} className="p-4 border-b border-charcoal-light/50 bg-wax-wine/5 text-parchment text-sm text-center font-medium">
                      {f.us}
                    </div>
                  </>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-parchment/60 mb-6 max-w-xl mx-auto">
                {competitor.name} does one thing fine. But if you want theater, personalization, 
                and a genuinely funny experience — not just &ldquo;we mailed you feces&rdquo; — 
                the choice is clear.
              </p>
              <Button variant="gold" onClick={() => window.location.href = '/checkout'}>
                File Your Case — $34.99
              </Button>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
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