# Passive Income Portfolio — Operating System

> Agent-driven portfolio of small loops. Ship many, measure weekly, kill losers, double winners.
> Human-in the-loop: Piero approves money movement, account creation, and public publishing (first 2 weeks).
> After trust is established: publishing goes autonomous; payments never do.

## Portfolio Overview

| # | Loop | Type | Status | Revenue |
|---|------|------|--------|---------|
| 1 | Digital Product Drop (Gumroad) | Sell once, forever | 🟡 Building | $0 |
| 2 | Niche Comparison/Affiliate Site | Content + affiliate | 🟡 Researching | $0 |
| 3 | Pinterest Traffic Engine | Distribution | 🟡 Templates ready | $0 |
| 4 | Hyper-Niche Newsletter (Beehiiv) | Sponsor/affiliate | 🟡 Researching | $0 |
| 5 | Compliance Countdown Pages | Programmatic SEO | 🟡 Database seeded | $0 |
| 6 | Micro-Tool Farm | Free tools + ads | 🟡 Planning | $0 |

## Day-One Checklist

### Piero must do (30 min):
- [ ] Create Gumroad account + connect Stripe
- [ ] Create Pinterest business account
- [ ] Create Beehiiv account

### Agent does (today):
- [x] Build Loop 1 Product #1: AI Enablement Kit (content ready)
- [x] Build Loop 1 Product #2: Azure Cost Cleanup Playbook (content ready)
- [x] Build Loop 1 Product #3: Copilot Rollout Pack (content ready)
- [x] Research comparable Gumroad products + pricing
- [x] Draft sales page copy for all 3 products
- [x] Niche validation reports for Loop 2
- [x] Pinterest templates + first 10 pin concepts
- [x] Compliance Countdown database seed (50+ deadlines)
- [x] Portfolio metrics tracker setup

## Operating Rules

- Cadence: each loop = cron job → agent run → output staged → daily digest to Piero
- Metrics: metrics.jsonl per loop — date, traffic, clicks, revenue
- Kill rule: any loop < $10/mo after 90 days gets archived
- Spend caps: hard cap on agent API spend per loop; no agent access to payment credentials
- ToS: official APIs only, no scraping behind logins, no mass account creation, affiliate disclosures everywhere
- Legal: income is taxable; track from dollar one; consider LLC at $500/mo

## Revenue Tracking

All revenue tracked in `metrics/revenue.jsonl` from dollar one.

## File Structure

```
passive-income/
├── README.md                    (this file)
├── loop-1-products/
│   ├── ai-enablement-kit/       (Product #1)
│   ├── azure-cost-cleanup/      (Product #2)
│   └── copilot-rollout-pack/    (Product #3)
├── loop-2-affiliate-site/       (Niche comparison site)
├── loop-3-pinterest/            (Traffic engine)
├── loop-4-newsletter/           (Beehiiv newsletter)
├── loop-5-compliance-countdown/ (Programmatic SEO)
├── loop-6-micro-tools/          (Free web tools)
└── metrics/                     (Revenue + traffic tracking)
```