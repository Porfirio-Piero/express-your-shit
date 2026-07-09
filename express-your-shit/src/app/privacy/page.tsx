'use client';

import { Nav, Footer, WaxSeal, SealGlyph, Reveal } from '@/components/ui';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
        <Reveal>
          <div className="text-center mb-12">
            <WaxSeal size="md" className="mb-4" />
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-foil-gold/60 mb-2">
              Office of Anonymous Justice
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-parchment mb-3">
              Privacy Policy
            </h1>
            <p className="text-parchment/40 text-sm font-mono tracking-wider">
              Last updated: July 2026 · EYS-DOC-002
            </p>
          </div>
        </Reveal>

        <Reveal variant="up">
          <div className="glass-card-gold rounded-2xl p-6 md:p-8 mb-10">
            <p className="text-parchment/80 font-medium text-center text-balance">
              We keep minimal data and purge it aggressively. This isn&apos;t just policy — it&apos;s architecture.
            </p>
          </div>
        </Reveal>

        <Reveal variant="up">
          <div className="glass-card rounded-2xl p-6 md:p-10 legal-doc">
            <h2 data-section="§01">Data We Collect</h2>
            <p>We collect only what is necessary to fulfill your order:</p>
            <ul>
              <li><strong>Sender:</strong> Email address (for order confirmation and payment receipt only), payment information (processed by BTCPay Server — we never see or store crypto wallet details), and order preferences (tier, Kit configuration, anonymous note text).</li>
              <li><strong>Recipient:</strong> Name and shipping address. This is the minimum required to deliver the order.</li>
            </ul>

            <h2 data-section="§02">Data We Do NOT Collect</h2>
            <ul>
              <li>Payment card numbers (we don&apos;t accept cards)</li>
              <li>Government-issued identification</li>
              <li>Browsing history or tracking pixels beyond basic analytics</li>
              <li>Location data beyond what you voluntarily provide (shipping address)</li>
            </ul>

            <h2 data-section="§03">30-Day Data Purge</h2>
            <p>
              Recipient data (name, address) is <strong>automatically purged 30 days after confirmed delivery</strong>. 
              This is enforced by an automated cron job. After purging, recipient data cannot be recovered — it is 
              permanently deleted from our systems, including backups.
            </p>
            <p>
              Sender data (email, order history) is retained for 1 year for customer service purposes, then purged. 
              Order codes (EYS-XXXXXX format) are retained indefinitely as non-identifying transaction records.
            </p>

            <h2 data-section="§04">Anonymity Claims</h2>
            <p>
              We state plainly: &ldquo;The recipient never sees your name or any identifying detail.&rdquo; We do NOT 
              claim &ldquo;no paper trail&rdquo; or &ldquo;untraceable.&rdquo; Minimal records are kept to fulfill orders 
              and comply with lawful requests. We believe honest privacy claims are better than exaggerated ones.
            </p>

            <h2 data-section="§05">Anti-Harassment Technical Enforcement</h2>
            <p>
              We maintain a 90-day rolling record of recipient addresses to prevent repeat shipments to the same 
              person. This is a hashed, non-reversible record — we store a hash of the address, not the address itself. 
              After 90 days, the hash is purged. This system cannot be circumvented by creating multiple accounts.
            </p>

            <h2 data-section="§06">Payment Privacy</h2>
            <p>
              All crypto payments are processed through our self-hosted BTCPay Server. We do not use third-party 
              payment processors that require KYC. BTCPay generates unique payment addresses per invoice, and we 
              do not link payment addresses to sender identity beyond the current order.
            </p>
            <p>
              Cash-by-mail orders are processed using a short code system. The mailing address is a PO box / CMRA 
              address. We do not retain envelopes or return addresses after processing.
            </p>

            <h2 data-section="§07">Voice Notes & Content</h2>
            <p>
              AI voice notes are generated at checkout and hosted as static audio files. They are not regenerated 
              on each scan. Voice note content is subject to automated moderation before generation. Voice note 
              audio files are purged on the same schedule as the associated order&apos;s recipient data (30 days 
              post-delivery).
            </p>

            <h2 data-section="§08">Cookies & Analytics</h2>
            <p>
              We use minimal, privacy-respecting analytics. No tracking pixels from advertising platforms. 
              No third-party cookies. Essential cookies are used only for checkout session continuity.
            </p>

            <h2 data-section="§09">Lawful Requests</h2>
            <p>
              We comply with lawful legal process (court orders, subpoenas). Given our data purge schedule, 
              our ability to respond to retrospective requests is limited by design. We cannot produce data 
              that has been deleted.
            </p>

            <h2 data-section="§10">Contact</h2>
            <p>
              Privacy inquiries can be directed through the website. We respond within 30 days.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 text-center">
            <WaxSeal size="sm" className="mb-3" />
            <p className="text-parchment/30 text-xs">
              Filed under: EYS-DOC-002 · Privacy Policy · Office of Anonymous Justice
            </p>
          </div>
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}