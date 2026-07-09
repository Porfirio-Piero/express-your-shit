# BUILD SPEC — Express Your Sh*t
Full and final. Supersedes the "TurdNotice" spec entirely. This is the complete brief for an agent (or dev) to build production.

## 1. Brand

Name: Express Your Sh*t (display) — the asterisk is a stylistic wink, not a real censor; write it in full wherever a domain, URL, or plain-text context requires it.
Domain: expressyourshit.io (per founder directive)
Tagline: "Say it with shit."
The pun: "Express" carries a double meaning — express (mail/shipping speed) and express yourself (emotional honesty/catharsis). The name reads as a shipping company on first glance and reveals the joke on second.

Positioning: Premium novelty gag-gift service. Not a scale/volume player — direct competitors already own that lane on price and genericness (ShitExpress, PoopSenders, SendSomePoop, ShipPoop, DickInTheMail, BoxedRevenge, and others confirmed active in this space). Express Your Sh*t wins on theater, personalization, and production value, priced accordingly.

Brand voice: Deadpan bureaucratic/legal satire layered under a blunt, crude name. The contrast is the joke — an outrageously named site that behaves like a prim, official institution once you're past the homepage. "Office of Anonymous Justice," certificates, case numbers, cited offenses. Play it straight everywhere except the name itself.

Naming note: the brand name contains an unambiguous profanity. This has real downstream consequences, flagged throughout this spec — most notably payment processor eligibility (§8) and paid ad platform eligibility (not in scope for v1, see §9). This was a deliberate trade-off in favor of a name that's funny without decoding, made after several more "clever" alternatives were considered and set aside for being too subtle.

## 2. Legal & Compliance Framing (non-negotiable copy rules)

- Public-facing framing is always "novelty gag gift service." Never market as a harassment or targeting tool.
- Anonymity claim, exact wording: "The recipient never sees your name or any identifying detail." Do NOT claim "no paper trail" or "untraceable" — real legal exposure, and it's the kind of claim that gets a business dropped by whatever payment/hosting providers it still qualifies for. State plainly that minimal records are kept to fulfill orders and comply with lawful requests, and that recipient data is purged on a schedule (30 days post-delivery).
- Required pages: Terms of Service, Privacy Policy, FAQ.
- ToS must prohibit: threats/violence references, repeat shipments to the same recipient (the harassment line — enforce technically, not just contractually), targeting minors/schools/government officials.
- Do not promise delivery conditions that can't be guaranteed — no claims about arrival temperature, freshness, or any state dependent on shipping time. Production-value claims must be verifiable at ship time only (sealed, wax-stamped, glitter-infused, etc.).

## 3. Product Line

Two production tracks, sold as three customer-facing tiers.

| Tier | Price | Production track | What it is |
|---|---|---|---|
| The Petty Theft | $19.99 | Signature Blend (synthetic) | Bare-bones. Kraft box, anonymous label. Entry tier, no theater upsell pressure. |
| The Full Send | $34.99 (default/most-gifted) | Signature Blend (synthetic) | Glitter-infused, wax-sealed, biohazard-stickered. Production value is the entire pitch — no freshness/temperature claims. |
| Case Closed | $54.99 | Studio Reserve (real, scarce) | Authentic specimen from a named contributing cat at a partner cat café/shelter, dated batch card, handwritten note, Certificate of Authenticity. Daily supply cap marketed honestly as a feature ("7 left today"). |

Why the real/synthetic split exists: real cat waste doesn't scale — a contributing cat produces ~1-2 usable specimens/day, pathogen risk (*Toxoplasma*, *Salmonella*, *Campylobacter*) is unmanageable at volume with multiple handlers, and decomposition over a multi-day shipping window is a quality-control nightmare. Signature Blend removes all of that: shelf-stable, zero pathogen liability, no cold chain, ships anywhere. Studio Reserve stays capped and scarce by design.

Never sell volume as the upsell axis. No "double the specimens," no "add a second target for X% off." The upgrade path is always toward *more produced* (Full Send) or *more real/scarce* (Case Closed), never toward *more mess*.

## 4. The Character Assassination Kit (core differentiator, cross-tier add-on)

Bundle: Certificate of Grievance (printed) + AI voice note (QR-coded on the box). $7 standalone / bundled at a discount when added at checkout. Zero-fulfillment-cost, highest-margin item in the catalog.

### 4a. Certificate of Grievance
Printed certificate styled as an official decree from the "Office of Anonymous Justice." Structure:
- Case number, format EYS-GR-XXXXXX (updated prefix)
- Multi-select "cited offenses" from a preset list (Petty Betrayal, Chronic Left-on-Read, Crimes Against the Group Chat, Thermostat Tampering, Leftover Theft, Aggressive Reply-All, Parking Space Piracy, Unsolicited Life Advice) — customer picks any number
- Optional custom "additional charge" — freeform, printed in italics as a blockquote
- Signature line: "The Complainant — Identity withheld by design"
- Live preview while building the order

### 4b. AI Voice Note
Customer selects, in order:
- Character/tone (6 options): The Disappointed Judge, Movie Trailer Announcer, Royal Herald, Nature Documentarian, Drill Sergeant, Disappointed Parent
- Gender: Male / Female
- Accent: American, British, Australian, Flat & Robotic (deliberately synthetic-sounding, comedic, honest label for what browser TTS actually produces)
- Preview: every combination must be sample-playable before commitment, using a short canned line — conversion/trust feature, not optional polish
- Custom message (≤180 chars) — read aloud when the recipient scans the QR code

Production TTS requirement: prototype uses Web Speech API — functional demo, inconsistent quality across devices. Production build must swap to ElevenLabs or OpenAI TTS so each character/gender/accent combination is a genuinely distinct generated voice. Generate and host the audio file once per order at checkout completion; the QR resolves to a static hosted page with embedded audio, not regenerated per scan.

### 4c. Delivery mechanism
Every order including the Kit gets a unique QR code printed on the box, resolving to a hosted landing page showing the certificate and a "Play Grievance" button. Carry forward the visual language exactly (certificate styling, seal motif, playback UI) from the prototype's grievance page — just rebrand per §13.

## 5. Funnel Architecture

Two entry paths, deliberately kept separate:

Path A — Fast checkout (`/checkout`), for paid traffic / impulse buyers
One page, single scroll:
1. Package picker (3 tiers, Full Send pre-selected default), inline description, no separate step
2. Recipient address fields
3. Short anonymous note field (printed paper insert, separate from the Kit's voice message)
4. Single order bump: "Add the Character Assassination Kit" — visually distinct (dashed border callout), unchecked by default
5. Payment method (crypto / cash by mail)
6. Sticky order summary panel, live price
7. Single CTA button with live total in the label

After purchase decision:
- One-click post-purchase upsell, dynamic, never offers more volume:
  - Kit not added at checkout → offered again at a discount
  - Kit already added → offer Case Closed / Studio Reserve upgrade instead, with real scarcity messaging
- If Kit is included, route to a Kit customization screen (gender/accent/character/preview/message) before finalizing
- Thank-you screen: order code, QR code for the Kit (if included) with working preview link, referral mechanic (copy link / share to X / text a friend, framed as credit toward next order)

Path B — Full builder (main site, scroll-anchored `#tiers` → `#order`), for browsing/organic traffic
The detailed 5-step configurator: tier+addons → note/address → Kit customization (full inline) → payment → confirmation. For people reading the FAQ and wanting full control before buying.

Both paths share the same backend order schema regardless of entry point.

## 6. Sourcing — Signature Blend (synthetic)

Existing commercial category — same product family as fake vomit, whoopee cushions, prank gag items. Not a novel manufacturing problem.

- Source: contract novelty/prank toy manufacturers (Alibaba/1688/ThomasNet) — many already tool this shape and will private-label.
- Material: non-toxic, food-safe silicone or PVC-free molding compound, brown-pigmented, cast in a silicone mold.
- Odor: asafoetida — standard novelty/prank-industry stink agent, food-safe, no biological material.
- Premium option: film/SFX prop houses for higher texture variation on Full Send specifically.
- Compliance payoff: inert, non-biological — zero pathogen liability, no cold chain, no shelf life, composition disclosable openly.

## 7. Sourcing — Studio Reserve (real, Case Closed tier only)

- Partner with local cat cafés/shelters for a small network of contributing cats; pay a per-specimen stipend.
- Cap daily order volume to what same-day collection and same-day shipping actually support — this cap is the scarcity mechanic; keep it real.
- Same-day fill, Priority shipping only, to minimize transit-driven quality issues.
- Full biohazard-safe handling protocol (gloves, sealed collection, no cross-specimen repackaging).

## 8. Payments

- Primary: self-hosted BTCPay Server — BTC, Lightning, Monero via plugin. No KYC, no processor holding customer identity.
- Secondary: cash by mail — order gets a short code, customer mails cash + code to a PO box/CMRA address, ships within 2 business days of receipt.
- Cards: explicitly out of scope, not just "v1 deferred." With a brand name containing unambiguous profanity, card processor category review will almost certainly reject the business outright. Crypto + cash isn't just an anonymity choice now, it's the only realistic payment path. Budget for this as permanent, not temporary.

## 9. SEO Plan

- Do NOT rely on exact-match-domain SEO — Google's EMD update demoted that strategy. Compete on content and brand distinctiveness.
- Target keywords: "send poop to someone," "anonymous poop delivery," "ship poop anonymously," "cat poop prank gift," "gag gift for enemy," "poop senders alternative," "shitexpress alternative."
- Comparison landing pages: /vs-shitexpress, /vs-poopsenders, /vs-sendsomepoop — honest feature comparison tables.
- Content engine: 2 posts/week at launch.
- Technical: SSG for speed, schema.org Product + FAQ markup, Lighthouse 95+, OG images per tier.
- Ad platform note: paid search/social ads are likely a non-starter with this brand name. Organic/content SEO and the referral mechanic carry more of the growth load.

## 10. Design System

- Palette: Ink #14110F (bg), Parchment #E8E1CC (panels/certificate), Wax Wine #6B1E24 (primary accent), Foil Gold #B8925A / #D4AF7A (secondary/metallic), Soft Charcoal #2A2620 (card surfaces)
- Type: Fraunces (display serif) + Inter (body) + JetBrains Mono (case numbers, order codes, technical labels)
- Motif: wax seal glyph in place of checkmarks/bullets site-wide; deckled (torn-paper) section dividers instead of hairlines; certificate/legal-decree visual language for the Kit and FAQ/legal sections
- Signature interaction: animated wax-seal stamp on hero load (scale+rotate+drip) — reuse wherever a "confirmed/sealed" state needs representing

## 11. Tech Stack

- Next.js (App Router), Tailwind, deployed on Vercel
- Orders/backend: Supabase — minimal PII, scheduled purge job for recipient data (30 days post-delivery)
- BTCPay Server on a small VPS
- TTS: OpenAI TTS API (replaces Web Speech API from prototype)
- Transactional email (order confirmations only, optional at checkout): Resend
- Note/message moderation: wordlist filter + server-side LLM moderation pass before any note or voice message is produced

## 12. Build Order

1. Design system + component library from §10
2. Marketing site: hero, how-it-works, tiers (§3), comparison section, FAQ, legal pages — all under new branding
3. Fast checkout funnel (§5, Path A) with real BTCPay integration and cash-order-code flow
4. Character Assassination Kit builder (§4) with real TTS integration
5. Full builder / Path B, wired to the same order schema as Path A
6. QR landing page (grievance/certificate page) serving hosted audio + certificate render
7. Comparison SEO pages + blog content scaffolding
8. Order/fulfillment backend: queue, Signature Blend vs Studio Reserve routing, daily Studio Reserve cap enforcement, data purge job

## 13. Rename Pass (from "Turd Class Mail" prototypes)

| Old | New |
|---|---|
| "Turd Class Mail" (page titles, nav brand, footer, meta description) | "Express Your Sh*t" |
| "Delivered with dishonor." (hero tagline) | "Say it with shit." |
| Wax seal glyph text "TC" | "EYS" |
| Case number prefix TC-GR-XXXXXX | EYS-GR-XXXXXX |
| Order code prefix TC-XXXXXX | EYS-XXXXXX |
| turdclassmail.com (referral share text, meta tags) | expressyourshit.io |
| Any "Turd Class Mail" references in ToS/legal copy | "Express Your Sh*t" |

## Notes from Founder

- Domain: expressyourshit.io (founder-specified, overrides spec's .com)
- Deploy to Vercel
- Build fresh — prototypes not available on this machine, treat spec as authoritative
- No existing GitHub repo — create one under Porfirio-Piero