'use client';

import { Nav, Footer, SealGlyph } from '@/components/ui';

const FAQ_ITEMS = [
  {
    q: 'Is this real poop?',
    a: 'The Full Send and Petty Theft tiers use our Signature Blend — a non-toxic, food-safe synthetic compound with asafoetida for odor. It\'s the same product category as fake vomit or whoopee cushions. The Case Closed tier uses a real specimen from a named contributing cat at a partner cat café. We\'re transparent about what\'s in every box.',
  },
  {
    q: 'Is this anonymous?',
    a: 'The recipient never sees your name or any identifying detail. We keep minimal records to fulfill orders and comply with lawful requests. Recipient data is automatically purged 30 days after delivery. We do NOT claim "no paper trail" or "untraceable" — those claims are dishonest and we won\'t make them.',
  },
  {
    q: 'Why no credit cards?',
    a: 'Our brand name contains unambiguous profanity, which virtually guarantees rejection by card processors. Crypto and cash aren\'t just anonymity features — they\'re the only realistic payment path. This is permanent, not a v1 limitation.',
  },
  {
    q: 'What crypto do you accept?',
    a: 'Bitcoin (on-chain and Lightning), and Monero, all via our self-hosted BTCPay Server. No KYC, no third-party processor holding your identity.',
  },
  {
    q: 'How does cash by mail work?',
    a: 'You place your order and receive a short code. Mail cash + the code to our PO box. We ship within 2 business days of receipt. Simple.',
  },
  {
    q: 'What\'s the Character Assassination Kit?',
    a: 'A printed Certificate of Grievance with your chosen offenses, plus an AI-generated voice note the recipient hears by scanning a QR code on the box. Choose from 6 character voices, 2 genders, and 4 accents. $7 standalone, discounted when added at checkout.',
  },
  {
    q: 'Can I preview the voice before buying?',
    a: 'Yes. Every character/gender/accent combination can be previewed with a sample line before you commit. No surprises.',
  },
  {
    q: 'What prevents harassment?',
    a: 'Our system technically enforces a 90-day block on repeat shipments to the same address. You cannot circumvent this by creating multiple accounts — it\'s enforced at the address level, not the account level. We also prohibit targeting minors, schools, and government officials in our Terms of Service.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Petty Theft and Full Send ship within 2 business days. Case Closed ships same-day via Priority Mail. We don\'t make promises about arrival temperature or freshness — you\'re sending a gag gift, not groceries.',
  },
  {
    q: 'What is Studio Reserve?',
    a: 'Our real-specimen tier. Sourced from named contributing cats at partner cat cafés. Same-day collection, same-day shipping, Priority Mail only. Daily supply is capped to what actual cats actually produce — this is real scarcity, not artificial.',
  },
  {
    q: 'What\'s Signature Blend?',
    a: 'Our synthetic compound. Non-toxic, food-safe, shelf-stable, zero pathogen liability. Asafoetida for odor. Cast in silicone molds. It\'s the prank industry standard — think fake vomit, not real biology.',
  },
  {
    q: 'How is my data handled?',
    a: 'Minimal collection. Recipient data is purged 30 days post-delivery. Sender data retained for 1 year for customer service, then purged. Payment data never touches our servers — BTCPay handles crypto, and cash-by-mail uses short codes, not personal identifiers.',
  },
  {
    q: 'Can I cancel an order?',
    a: 'If it hasn\'t shipped yet, yes — full refund. Once shipped, we can\'t intercept it. Contact us with your order code.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently US only. International shipping creates customs and biological material complications we\'re not prepared to navigate yet.',
  },
  {
    q: 'How does the referral program work?',
    a: 'After your order, you get a shareable link. When someone files through your link, you get credit toward your next order. Share via link, X (Twitter), or text.',
  },
];

export default function FAQ() {
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="font-display text-3xl md:text-4xl text-parchment mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-parchment/40 text-sm mb-8">
          Everything you need to know before filing.
        </p>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group border border-charcoal-light rounded-lg overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 bg-charcoal/30 cursor-pointer hover:bg-charcoal/50 transition-colors list-none">
                <span className="font-display text-parchment text-sm md:text-base pr-4">{item.q}</span>
                <svg
                  className="w-5 h-5 text-foil-gold shrink-0 transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </summary>
              <div className="px-6 py-4 bg-charcoal/20 text-parchment/70 text-sm leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-parchment/40 text-sm">
            Still have questions? The Office of Anonymous Justice is not currently accepting phone calls.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}