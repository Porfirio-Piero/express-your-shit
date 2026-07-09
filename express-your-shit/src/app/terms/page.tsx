'use client';

import { Nav, Footer, WaxSeal, SealGlyph, Reveal } from '@/components/ui';

export default function Terms() {
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
              Terms of Service
            </h1>
            <p className="text-parchment/40 text-sm font-mono tracking-wider">
              Last updated: July 2026 · EYS-DOC-001
            </p>
          </div>
        </Reveal>

        <Reveal variant="up">
          <div className="glass-card-gold rounded-2xl p-6 md:p-8 mb-10">
            <p className="text-parchment/80 font-medium text-center text-balance">
              Express Your Sh*t is a novelty gag-gift service. By using this service, you agree to the following terms. 
              This is not a harassment tool. Misuse will result in order cancellation and account prohibition.
            </p>
          </div>
        </Reveal>

        <Reveal variant="up">
          <div className="glass-card rounded-2xl p-6 md:p-10 legal-doc">
            <h2 data-section="§01">Service Description</h2>
            <p>
              Express Your Sh*t (&ldquo;EYS&rdquo;) provides a premium anonymous novelty gag-gift service. 
              We deliver synthetic or real specimens (depending on tier) with optional personalized certificates 
              and voice notes to recipients designated by the sender.
            </p>

            <h2 data-section="§02">Eligibility</h2>
            <p>You must be 18 years or older to use this service. By placing an order, you represent that you are at least 18 years old.</p>

            <h2 data-section="§03">Prohibited Uses</h2>
            <p>You may NOT use this service to:</p>
            <ul>
              <li>Target minors (anyone under 18)</li>
              <li>Target schools, educational institutions, or government officials</li>
              <li>Threaten, intimidate, or harass any person</li>
              <li>Reference violence, self-harm, or illegal activity in notes or voice messages</li>
              <li>Send repeat shipments to the same recipient address (our system enforces this technically — see §4)</li>
              <li>Use the service for any purpose other than as a novelty gag gift</li>
            </ul>

            <h2 data-section="§04">Anti-Harassment Protections</h2>
            <p>
              We take harassment seriously. Our system enforces a technical prohibition on repeat shipments to the same 
              recipient address. If an address has received a shipment within the past 90 days, additional orders to that 
              address will be automatically declined. This is a technical enforcement, not just a policy — you cannot 
              circumvent it by creating multiple accounts.
            </p>

            <h2 data-section="§05">Anonymity</h2>
            <p>
              The recipient never sees your name or any identifying detail. We keep minimal records to fulfill orders 
              and comply with lawful requests. We do NOT claim &ldquo;no paper trail&rdquo; or &ldquo;untraceable&rdquo; — 
              that would be dishonest and legally irresponsible. Recipient data is purged 30 days after delivery 
              (see our Privacy Policy).
            </p>

            <h2 data-section="§06">Product Claims</h2>
            <p>
              We guarantee production quality at the time of shipment: sealed, wax-stamped, glitter-infused (for Full Send), 
              and accompanied by any included certificates or notes. We do NOT guarantee delivery conditions that depend on 
              shipping time, including arrival temperature, freshness, or any state that degrades in transit. 
              Studio Reserve (Case Closed tier) is shipped same-day via Priority Mail to minimize transit time, 
              but transit conditions are outside our control.
            </p>

            <h2 data-section="§07">Payments</h2>
            <p>
              We accept Bitcoin, Lightning Network, and Monero via BTCPay Server, as well as cash by mail. 
              We do NOT accept credit cards — this is a permanent design decision, not a temporary limitation. 
              Crypto payments are processed through our self-hosted BTCPay Server. Cash-by-mail orders receive a 
              short code and ship within 2 business days of cash receipt.
            </p>

            <h2 data-section="§08">Content Moderation</h2>
            <p>
              All anonymous notes and voice messages are subject to moderation. We use automated wordlist filtering 
              and a server-side moderation pass before any content is produced. Orders containing prohibited content 
              (threats, violence references, targeting of protected groups) will be cancelled and refunded.
            </p>

            <h2 data-section="§09">Studio Reserve Cap</h2>
            <p>
              Case Closed (Studio Reserve) orders are capped at a daily limit based on actual specimen availability from 
              contributing cats. The daily remaining count is displayed honestly on the product page. When daily supply 
              is exhausted, the tier becomes unavailable until the next day. This is not artificial scarcity — it is 
              the actual supply constraint of sourcing real specimens.
            </p>

            <h2 data-section="§10">Refunds</h2>
            <p>
              If your order cannot be fulfilled (e.g., daily Studio Reserve cap reached, address verification failure, 
              or content policy violation), you will receive a full refund in the original payment method. 
              Crypto refunds are processed within 48 hours. Cash-by-mail refunds are returned via the address 
              provided with your order.
            </p>

            <h2 data-section="§11">Limitation of Liability</h2>
            <p>
              Express Your Sh*t is a novelty service provided &ldquo;as is.&rdquo; We are not responsible for 
              recipient reactions, shipping delays beyond our control, or any consequences of proper use of the 
              service as a gag gift. Our total liability is limited to the amount paid for the order.
            </p>

            <h2 data-section="§12">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after changes constitutes 
              acceptance of the updated terms. Material changes will be noted on this page with an updated date.
            </p>

            <h2 data-section="§13">Contact</h2>
            <p>
              For questions about these terms, contact us through the website. We do not provide a phone number — 
              this is an anonymous service, and we respect that goes both ways.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 text-center">
            <WaxSeal size="sm" className="mb-3" />
            <p className="text-parchment/30 text-xs">
              Filed under: EYS-DOC-001 · Terms of Service · Office of Anonymous Justice
            </p>
          </div>
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}