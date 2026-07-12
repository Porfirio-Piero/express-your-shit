# Loop 6 — Micro-Tool Farm

Tiny free web tools (single-page, no backend) in target niches. Each tool = SEO asset + email capture + affiliate placement.

## Tool Pipeline (one per week from shared template)

### Immediate (Week 1-4)
| # | Tool | Niche | SEO Target | Monetization |
|---|------|-------|-----------|--------------|
| 1 | Azure VM Cost Estimator | Loop 2 (Azure) | "azure vm cost calculator" | Azure affiliate + email |
| 2 | "Which EU AI Act Tier Am I?" Quiz | Loop 5 (Compliance) | "eu ai act compliance check" | Compliance tool affiliates |
| 3 | Local LLM GPU Matcher | Loop 2 (Home Lab) | "which gpu for local llm" | Amazon affiliate + email |
| 4 | AI Use-Case Scorer | Loop 1 (Products) | "ai use case scoring rubric" | Product upsell |

### Month 2-3
| # | Tool | Niche | SEO Target | Monetization |
|---|------|-------|-----------|--------------|
| 5 | Barcode Format Validator | Loop 5 (GS1) | "barcode format checker" | Affiliate + email |
| 6 | Privacy Law Deadline Calculator | Loop 5 (Compliance) | "privacy law deadline tracker" | Compliance affiliates |
| 7 | Azure Waste Finder (simplified) | Loop 1 (Azure) | "azure cost waste check" | Product upsell |
| 8 | Copilot Readiness Assessment | Loop 1 (Products) | "copilot readiness checklist" | Product upsell |

### Month 4+
| # | Tool | Niche | SEO Target | Monetization |
|---|------|-------|-----------|--------------|
| 9 | SSL/TLS Version Checker | Security | "tls version check" | SSL cert affiliates |
| 10 | Cloud Cost Comparison (AWS vs Azure vs GCP) | FinOps | "cloud cost comparison" | Cloud affiliates |

## Shared Template Structure
Each tool page:
```
1. Headline: "Free [Tool Name]"
2. Interactive tool (JS calculator/quiz/form)
3. "Get the full [Product Name]" CTA (links to Gumroad)
4. Email capture: "Get [related resource] free"
5. Affiliate: 2-3 relevant tool recommendations
6. FAQ schema (3-5 questions)
7. Related tools links (internal)
```

## Tech Stack
- Next.js static export (or plain HTML/JS)
- Hosted on Vercel (free tier)
- Shared CSS template (dark theme, fast, mobile-first)
- Each tool = separate subdirectory on same domain
- Email capture via Gumroad or Beehiiv embed