# Loop 5 — Compliance Countdown: Programmatic SEO on Regulatory Deadlines

## The Insight
Regulatory and platform deadlines generate panicked, high-intent search traffic that spikes predictably. Nobody optimizes for these deadlines until 90 days out. We get there 12 months early.

## Deadline Database (50+ entries, auto-refreshed weekly)

### EU AI Act Phases
| Deadline | Phase | What Changes | Who's Affected | Lead-Gen Value |
|----------|-------|-------------|----------------|----------------|
| 2025-02-02 | Phase 1 | Prohibited AI practices banned | All EU orgs deploying AI | High |
| 2025-08-02 | Phase 2 | GPAI transparency requirements | GPAI providers | High |
| 2026-02-02 | Phase 3 | High-risk AI classification obligations | Public sector + critical infrastructure | Very High |
| 2026-08-02 | Phase 4 | High-risk AI conformity assessments | High-risk AI deployers | Very High |
| 2027-08-02 | Phase 5 | Full enforcement | All AI systems in EU market | Extreme |

### US State Privacy Laws
| Deadline | State | Law | Key Requirements | Who's Affected |
|----------|-------|-----|-----------------|----------------|
| 2025-01-01 | CA | CPRA amendments | Employee data rights, dark patterns | All CA businesses |
| 2025-01-01 | OR | Oregon Privacy Act | Consumer rights, opt-out | Businesses with OR consumers |
| 2025-01-01 | TX | Texas Data Privacy | Consent requirements | Large TX businesses |
| 2025-07-01 | CO | CPA updates | Profiling restrictions | CO businesses |
| 2025-07-01 | CT | CTDPA amendments | Children's data | CT businesses |
| 2025-07-01 | VA | VCDPA updates | Data minimization | VA businesses |
| 2026-01-01 | MT | MTDPA | Consumer rights | MT businesses |
| 2026-01-01 | NJ | NJDPA | Opt-out requirements | NJ businesses |

### Technology Deprecations & Deadlines
| Deadline | Technology | What's Happening | Impact |
|----------|-----------|-----------------|--------|
| 2025-06-01 | TLS 1.0/1.1 | Major browsers drop support | HTTPS sites must upgrade |
| 2025-10-15 | SHA-1 certificates | Complete distrust | Certificate reissuance required |
| 2025-09-01 | Azure AD MSAL v1 | Retirement | Migrate to MSAL v2 |
| 2026-01-01 | Azure SQL Edge | Retirement | Migrate to alternative |
| 2026-03-31 | Exchange Server 2016 | End of support | Migrate to Exchange Online |
| 2026-07-01 | Windows 10 21H2 | End of servicing | Upgrade to Windows 11 |
| 2026-10-14 | Windows Server 2012 R2 | Extended support ends | Migrate to Server 2025 |
| 2027-01-01 | Azure DevOps Server 2020 | End of support | Migrate to Azure DevOps Services |

### M365/Azure Retirement Dates
| Deadline | Service | Status | Replacement |
|----------|---------|--------|-------------|
| 2025-09-30 | Azure Functions v3 | Retired | Migrate to v4 |
| 2025-10-14 | SharePoint Server 2016 | End of support | SharePoint Online |
| 2026-01-12 | Microsoft Teams Free (classic) | Retired | New Teams Free |
| 2026-04-01 | Azure Active Directory Graph | Complete retirement | Microsoft Graph |
| 2026-07-01 | OneDrive sync (legacy) | Retired | New sync client |
| 2026-10-01 | Office 2016 connectivity | End of support | Microsoft 365 |

### Standards & Compliance Deadlines
| Deadline | Standard | What Changes | Impact |
|----------|----------|-------------|--------|
| 2025-12-31 | PCI DSS v4.0 | Full enforcement begins | All merchants processing cards |
| 2026-03-01 | ISO 27001:2022 | Transition deadline for 2013 certs | All ISO-certified orgs |
| 2026-06-30 | SOC 2 Type II | Updated trust criteria | SOC 2 certified orgs |
| 2026-09-01 | NIST CSF 2.0 | Full implementation guidance | Federal contractors |

## Page Template Structure
Each deadline gets a page with:
1. **Countdown timer** — days remaining (auto-calculated)
2. **Plain-English explainer** — what it is, in 200 words
3. **Who's affected** — clear scope (organizations, geographies, systems)
4. **Checklist** — 5-10 action items
5. **"Get Help" form** — lead-gen for consultants (future monetization)
6. **Relevant SaaS affiliate links** — tools that solve the problem

## Tech Stack
- Static site: Astro on Vercel
- Countdown: client-side JS (no server needed)
- Content: markdown files in `/content/deadlines/`
- Auto-refresh: weekly cron scrapes official sources, updates markdown
- SEO: structured data (FAQ schema, HowTo schema), programmatic sitemap

## Monetization
- Phase 1: SaaS affiliate links (compliance tools, migration tools)
- Phase 2: Consultant lead-gen ($50-150/lead)
- Phase 3: Sponsored deadline pages (vendors want to be listed on "X days until Y")