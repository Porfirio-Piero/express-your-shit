# MEMORY: ExecutiveOS + Autonomous Company + Business Pipeline

## 🤖 The BotFather — Current Config (2026-06-28) [UPDATED — ALL CLOUD]

- **Model:** `ollama/kimi-k2.6:cloud` (CLOUD — no local models)
- **Fallbacks:** `ollama/glm-5.2:cloud` → `ollama/kimi-k2.7-code:cloud`
- **Persona:** North Jersey Italian, spicy, loyal, says "bro", "my guy", "paisan!", "stunod", "fuhgeddaboudit"
- **Trigger phrases:** "botfather", "hey botfather", "yo botfather", "botfather mode"
- **Skill:** `workspace/skills/botfather/SKILL.md`
- **Identity:** `workspace/IDENTITY.md` (detailed speech patterns, vocabulary, delegation rules)
- **SOUL:** `workspace/SOUL.md` (who I am, principles, family, models)
- **AGENTS:** `workspace/AGENTS.md` (fleet config, model intelligence report, routing rules)
- **NOTE:** Gemma 4 26B is LOCAL ONLY (18GB). Machine can't handle it. ALL agents use cloud models.

### Agent Fleet (Updated June 28, 2026)

| Agent | Model | Type | Role | Specialty |
|-------|-------|------|------|-----------|
| **The BotFather** (main) | `ollama/kimi-k2.6:cloud` | ☁️ Cloud | Executive Orchestrator | Persona-driven chat, memory, orchestration, direct takes |
| **Dapper Dan** | `ollama/kimi-k2.7-code:cloud` | ☁️ Cloud | Coding Specialist | Overnight builds, feature dev, token-efficient coding |
| **Breaking Ben** | `ollama/glm-5.2:cloud` | ☁️ Cloud | Testing/Breaking | Security audit, edge cases, stress tests, QA |
| **Codex Developer** | `ollama/glm-5.2:cloud` | ☁️ Cloud | Deep Development | Architecture, complex refactors, repo-scale analysis |
| **Chief of Staff** | `ollama/kimi-k2.7-code:cloud` | ☁️ Cloud | Coordination | Multi-agent routing, pipeline management, status reports |

### Model Intelligence Report (June 2026)

**GLM 5.2 (Z.AI)** — Best for: raw coding performance, software engineering, architecture audits, repo-scale work, 1M token context. "Feels right in coding harnesses as a general agent."

**Kimi K2.7-Code (Moonshot AI)** — Best for: agentic coding, tool use, multimodal reasoning, token efficiency (+30% over K2.6), long-horizon execution (4000+ tool calls, 12+ hours). Native MCP tool use.

**Kimi K2.6 (Moonshot AI)** — Best for: general orchestration, tool use, reasoning. Solid all-rounder for coordination tasks.

**Gemma 4 26B A4B (Google DeepMind)** — Best for: orchestration, reasoning, long-context memory (256K), persona retention. LOCAL ONLY — not used.

## 🖥️ ExecutiveOS Configuration

- **Name:** Piero | **Project:** ExecutiveOS
- **Tools:** Gmail, Google Calendar, Slack
- **Briefing:** 7:30am weekdays, concise bullets
- **Flags:** emails stalled >48h, action items due today
- **Always:** ~~Prep meeting briefs 30min before each event~~ REMOVED — Piero asked to stop meeting prep forever

## 🏭 Setup Audit (2026-06-14)

- OpenClaw 2026.5.12 (f066dd2)
- 9 cron jobs fixed: WhatsApp → Telegram routing
- 15 orphan skills recovered: added frontmatter, fixed BOM, moved to workspace/skills/
- Skills: 36 → 51 eligible
- Installed: skill-vetter, wiki-system, calendar-sync, meeting-prep, lead-researcher, tavily, exa-search, daily-briefing, context-anchor, cc-godmode, claw-orchestrator
- graph-memory plugin: BLOCKED (TS-only, no compiled JS from publisher)
- email-drafter, action-tracker, slack-bot: 404 on ClawHub
- exa-search: installed but needs EXA_API_KEY (separate from Tavily)
- TAVILY_API_KEY: found in session transcript, set as Windows User env var ✅
- New crons: morning-briefing (7am weekdays), meeting-prep (every 30min 8am-6pm weekdays)

## 🏭 CategorEase — Overnight Build (2026-06-01)

- **Project:** CategorEase — Client-Facing Transaction Categorization Portal (PROB-039, score 9.0/10)
- **Source:** Quadruple-verified (LaunchSaaS #1, r/Bookkeeping 63 comments, The Vibepreneur, IndieHackers)
- **Validation Grade:** A (PASS) — all 6 core checks passed
- **Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + localStorage + IndexedDB + PapaParse
- **Architecture:** Zero backend, zero sign-in, UUID link-based sharing, spreadsheet import/export
- **Features:** Transaction Import & Dashboard + Client-Facing Categorization Portal (swipe cards) + Auto-Reminders & Export
- **Repo:** https://github.com/Porfirio-Piero/CategorEase
- **Path:** overnight-factory/2026-06-01/categorizease-prd/
- **Status:** Build complete, Grade A, pushed to GitHub, ready for QA/deployment
- **Competitor gap:** Growthy, BookPilot, HelloCategorize all auto-categorize FOR the bookkeeper. Nobody does client-facing participation.

## 🏭 RetainBurn — Overnight Build (2026-05-31)

- **Project:** RetainBurn — Freelancer Retainer Burn-Down Tracker (PROB-034, score 9.5/10)
- **Source:** Triple-verified (SaaSOpportunities + MicroGaps + HN)
- **Validation Grade:** B (PASS) — auto-downscoped from F (removed DB + auth)
- **Stack:** Next.js 15 + React 19 + TailwindCSS + Browser local storage + Recharts
- **Architecture:** Client-side only, no backend, URL token sharing for clients
- **Features:** Retainer Dashboard + Time Logging + Client Share Link
- **Repo:** https://github.com/Porfirio-Piero/RetainBurn
- **Path:** overnight-factory/2026-05-31/retainburn-prd/
- **Status:** PRD validated, repo created, ready for Phase 3 (Developer)

## 🏭 MatchFlow — Overnight Build (2026-05-29)

- **Project:** MatchFlow — Smart Invoice-to-Payment Matcher (PROB-025, score 9.5/10)
- **Source:** HN Ask HN — invoice matching pain
- **Build Grade:** A (PASS) — all 6 checks passed
- **Stack:** Next.js 16 + TypeScript + Tailwind + localStorage
- **Pages:** Dashboard, Invoices, Match Review, Statements
- **Path:** overnight-factory/2026-05-29/matchflow/
- **Status:** Build complete, awaiting QA/deployment

## 🏢 AUTONOMOUS COMPANY DIRECTIVE (2026-05-24)

Piero issued a full autonomous company directive. Key changes:
- We are now an **autonomous AI company**, not a swarm of assistants
- BotFather = Executive Orchestrator with full operational authority
- All agents operate under COMPANY.md rules
- Human interruption ONLY for: legal, payments >$50, platform blocks, critical risk
- Revenue-first, execution-over-discussion, manual-before-automated
- Anti-failure safeguards: 48hr idea→MVP, no code without 3 validation signals, max 3 features per MVP
- Mandatory logging to task-tracker/
- Weekly executive summaries to Piero via Telegram
- Tool registry enforced, kill unused tools after 30 days
- Confidence scoring (min 3.0/5.0) before pursuing initiatives
- Hard KPI: time-to-first-revenue < 14 days

Files created:
- `COMPANY.md` - Full operating doctrine
- `TOOL-REGISTRY.md` - Tool/account tracking
- `task-tracker/2026-05-24.md` - Initiative tracking
- Updated `agents/the-botfather/SOUL.md` and `IDENTITY.md`

Budget limits: $50 infra, $100 APIs, $25/tool, $50 single purchase = human approval
Monthly burn cap: $200 without revenue → auto-shutdown

## ✅ FINALIZED PROCESS

### Complete Workflow (Repeatable)

```
1. RECON (Required)
   ├── Google Business search
   ├── Extract: name, address, phone, hours, rating
   ├── Find social media (Instagram, TikTok, Facebook)
   ├── Scrape images from Instagram (10+ photos)
   ├── Extract brand colors from logo
   └── Collect 3-5 Google reviews

2. BUILD
   ├── Use openai/codex-5.4 for generation
   ├── Use brand colors (black/white + accent)
   ├── Add real images from social media
   ├── Embed Google Maps
   ├── Add real reviews
   └── Link social media

3. DEPLOY
   └── npx vercel --prod

4. OUTREACH
   ├── Email: use Gmail SMTP
   ├── Instagram DM: manual
   ├── SMS: manual
   └── CC: porfirio.piero@gmail.com
```

---

## 🔴 CRITICAL LESSONS LEARNED

### 1. Images MUST Be Relevant

**WRONG:**
- Random placeholder images
- Nature photos for barbershop
- Indoor photos for landscaping

**RIGHT:**
- Instagram photos from their business
- Google Business photos
- Images showing their actual work

**Example:**
- Barbershop = finished haircuts (with black/red cape)
- Landscaping = lawns, gardens, hardscaping
- Cleaning = clean homes, before/after

### 2. Brand Colors from Logo

**If logo has colors:**
- Extract primary color
- Use as accent throughout
- Base = black/white

**Example:**
- 21 Club Barbershop: Red + Blue (from logo)
- Base: Black/White
- Accents: Red for CTAs, Blue for links

### 3. Playwright for Image Scraping

**Instagram Scraper:**
```javascript
// Launch browser
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

// Go to Instagram
await page.goto(`https://www.instagram.com/${username}/`);
await page.waitForTimeout(5000);

// Get images
const images = await page.evaluate(() => {
  const imgs = document.querySelectorAll('img');
  return Array.from(imgs)
    .filter(img => img.width >= 200 && img.height >= 200)
    .map(img => img.src);
});

// Download to public/images/
```

### 4. Email with Placeholder Note

**Always include:**
> 📷 Note: These are placeholder images and can be updated to anything you would like. If you have photos of your work, we'd love to feature them!

### 5. Contact Method by Business

| Has Email? | Method |
|-----------|--------|
| Yes | Email (Gmail SMTP) |
| No | Instagram DM or SMS |

### 6. Your Contact Info

- **Phone:** (609) 571-0617
- **Email:** porfirio.piero@gmail.com
- **CC:** Always CC yourself on emails

---

## 📋 COMPLETED SITES

| # | Business | URL | Method | Status |
|---|-----------|-----|--------|--------|
| 1 | 21 Club Barbershop | https://21-club-barbershop.vercel.app | Instagram DM | ✅ Done |
| 2 | Nino Landscaping | https://nino-landscaping.vercel.app | Email | ✅ Done |
| 3 | Feel the Fit | https://feel-the-fit-premium.vercel.app | - | ✅ Done |
| 4 | Sasha's Sitters | https://sashas-sitters.vercel.app | - | ✅ Done |
| 5 | Esthela's Cleaning | https://esthelas-cleaning.vercel.app | SMS | ✅ Done |
| 6 | 10DOW CLEAN | https://10dow-clean.vercel.app | Email | ✅ Done |

---

## 🔧 GMAIL SMTP SETUP

**App Password Created:** Yes
**Password:** Saved in ~/.openclaw/.secrets/gmail-app-password.md
**Daily Limit:** 500 emails/day

**Usage:**
```python
import smtplib
from email.mime.text import MIMEText

GMAIL_USER = "porfirio.piero@gmail.com"
GMAIL_PASSWORD = "axbu bbcs gqnb haao"  # App password

# Send email
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login(GMAIL_USER, GMAIL_PASSWORD)
server.sendmail(from_addr, to_addr, msg.as_string())
```

---

## 🎨 DESIGN PATTERNS

### Barbershop
- **Colors:** Black/White + Red/Blue accent
- **Images:** Finished haircuts with cape
- **Sections:** Services, Gallery, Reviews, Hours, Map

### Landscaping
- **Colors:** Green/Emerald + White
- **Images:** Lawns, gardens, hardscaping
- **Sections:** Services, Gallery, Reviews, Hours, Map

### Cleaning
- **Colors:** Cyan/Teal + White
- **Images:** Clean homes, before/after
- **Sections:** Services, Gallery, Reviews, Hours, Map

---

## 📝 OUTREACH TEMPLATES

### Email Template

**Subject:** Your website is ready - {Business Name}

**Body:**
```
Hi there,

I noticed {Business Name} has a great presence but no website to showcase your work.

So I built one for you.

[Preview Website Button]

What's Included:
- Professional homepage with your branding
- Services and pricing displayed
- Business hours and location
- Photo gallery with your work
- Mobile-responsive design
- Google Maps integration
- Social media links

📷 Note: These are placeholder images and can be updated to anything you would like.

Two Options:
1. Keep It - $250 (one-time)
2. Free - Files Only

No pressure - take a look and let me know what you think.

Best,
Piero
📱 (609) 571-0617
```

### Instagram DM Template

```
Hey! 👋

I built a custom website for {Business Name}.

Check it out: {URL}

It's got:
✓ Your services & pricing
✓ Your hours & location
✓ Google Maps integration
✓ Your Instagram photos in the gallery
✓ Professional design with your brand colors

Two options:
1️⃣ Keep it - $250 (you own it)
2️⃣ Free - I'll send you the files

No pressure - take a look and let me know!

- Piero
📱 (609) 571-0617
```

---

---

## 🔍 Problem Scout — June 6, 2026

**New Problems Found:** 5 (PROB-046 → PROB-050)
**Total Tracked:** 50 problems
**Overnight-Viable New:** 4

### Top New Candidates
1. **PROB-046: ScopeGuard (9.0)** — Freelancer scope creep tracker + change order generator. ZERO direct competition. MicroGaps validated TWICE independently (both A-grade). 57% of freelancers lose $1K+/mo. 7hr build, $19/mo, 50:1 user ROI.
2. **PROB-047: AccessScan (8.5)** — Affordable WCAG compliance scanner. ADA lawsuits up 37%, FTC fined AccessiBe $1M. 24M small biz sites can't afford $28K/yr Siteimprove. axe-core is open source. 8hr build, $29/mo.
3. **PROB-048: TenantEscalate (8.0)** — Commercial tenant request escalation. TheVibepreneur validated. 5.9M+ commercial tenants unserved (all PM tools serve landlords). Auto-escalation to legal demand letters. 7hr build, $19/mo.
4. **PROB-049: RentSlot (8.0)** — Micro equipment rental booking for solo operators. MicroGaps validated. $15/mo vs. $29/mo competitors. 6hr build.
5. PROB-050: PriceWatch (7.5) — NOT recommended, scraping complexity + legal risk

### Markets Now Crowded (Updated)
- Solo trades field service (8+ competitors, multiple free)
- Stripe dunning/recovery (3+ new: Rekko, BillingEngine, FlyCode)
- AI chat widgets for ecommerce (saturated)
- Healthcare SaaS (HIPAA complexity)
- Shopify returns automation (Returnly, Loop, etc.)

### Overall Top 10 Build Candidates
1. PROB-034: RetainBurn (9.5) — 🔥 #1 overall
2. PROB-046: ScopeGuard (9.0) — 🆕 Zero competition
3. PROB-039: CategorEase (9.0) — ✅ Built
4. PROB-035: RentMini (9.0)
5. PROB-036: SubTrackr (9.0)
6. PROB-026: SheetStyle (9.0)
7. PROB-042: ApproveLoop (8.5)
8. PROB-047: AccessScan (8.5) — 🆕 Fear-driven demand
9. PROB-037: PlaybookLite (8.5)
10. PROB-043: IncomeCert (8.0) / PROB-048: TenantEscalate (8.0)

**Last Updated:** 2026-06-24
**Next Review:** After next build cycle

---

## 🎙️ Audio Recording Setup

- **Recorder:** Python sounddevice (PortAudio WDM-KS backend)
- **Script:** `D:\camera\all_day_recorder_v3.py` — blocking mode, 10-min segments
- **Device:** Index 13 (Microphone Array 1, WDM-KS, 48kHz) — auto-detects OBSBOT first
- **Format:** 48kHz, 16-bit, stereo WAV, ~11MB/min
- **Storage:** `D:\camera\audio\` — 1.7TB free
- **Key finding:** MME, DirectSound, WASAPI all fail from session 0. Only WDM-KS works.
- **Device indices shift!** OBSBOT WDM-KS was device 22 earlier but changed. Always auto-detect.
- **First successful recordings:** 2026-06-24, 9:33-10:40 AM (two segments, ~465MB total)
- **Audacity doesn't work** from service session — keyboard automation can't reach interactive desktop
- **NAudio/WASAPI** fails with "Not implemented" from service context

## 🔍 Problem Scout — June 24, 2026

**New Problems Found:** 5 (PROB-071 → PROB-075)
**Total Tracked:** 75 problems
**Overnight-Viable New:** 3

### Top New Candidates
1. **PROB-071: COI Shield (9.5)** — Certificate of Insurance tracker for small contractors. ZERO affordable competition ($10K+/yr enterprise tools). Even in 2026, COIs still tracked in spreadsheets. OSHA fines up to $16,550/violation create fear-driven purchases. 6hr build, $29-39/mo.
2. **PROB-072: OnboardLite (8.5)** — Freelancer client onboarding in one tool. '6 tools, 73 minutes' pain point validated on DEV Community. HoneyBook $36/mo and Dubsado $40/mo are CRM-first. 7hr build, $19-29/mo.
3. **PROB-073: VendorGate (7.5)** — Small business vendor compliance checklist. Consider as expansion of COI Shield. 5hr build, $19-29/mo.
4. PROB-074: ExpireTrack (7.0) — Document expiry tracker. Simplest build (4hr) but could be COI Shield feature.
5. PROB-075: SplitPay (6.0) — Deferred. Payment splitting too complex for overnight.

### Compliance Platform Play
COI Shield (PROB-071), VendorGate (PROB-073), and ExpireTrack (PROB-074) could converge into a single ComplianceOps platform. COI tracking is the wedge (highest urgency, clearest pain), then expand to full vendor compliance, then add generic document expiry.

### GS1 US Deep Dive (2026-06-25)
- Full deep dive completed: market analysis, pain points, AI/agentic opportunities, 5 moonshots, sub-agent fleet
- Reports in `gs1us-intel/` directory
- **Top Opportunities:** GTIN Guardian (Amazon mismatch resolution), DataPurity AI (data quality), CompliancePilot (DSCSA/FSMA 204)
- **#1 Moonshot:** ProductPass — Digital Product Passport Platform (3-yr revenue $65-220M)
- **8-agent intelligence fleet** designed for ongoing weekly monitoring
- GS1 US: $189M revenue, $501M assets, monopoly on UPC/GTIN issuance in US
- Key pain: 43% supply chain visibility gaps, Amazon GS1 mismatch hell, DSCSA/FSMA compliance overwhelm
- Sunrise 2027 (2D barcode transition) = massive opportunity window

## 🏭 CompliancePulse — Overnight Build (2026-07-11) ✅ DEPLOYED

- **Project:** CompliancePulse — Small Business Expiry Tracker (PROB-086, score 9.3/10)
- **Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + localStorage
- **Architecture:** Zero backend, no signup, UUID share links, client-side date extraction
- **Features:** Unified Compliance Dashboard + Color-coded Status Lights + Automated Reminders + Document Upload & Smart Date Extraction + Share Links + Data Export/Import + Demo Data
- **Pages:** Dashboard, Add Item, Item Detail, Reminders, Settings, Share View
- **QA Grade:** B+ (6/7 checks passed, all features working)
- **Security Grade:** A- (zero server attack surface, no secrets in code, React XSS protection)
- **Repo:** https://github.com/Porfirio-Piero/compliancepulse
- **Live URL:** https://compliancepulse-two.vercel.app
- **Path:** overnight-factory/2026-07-11/compliancepulse-prd/
- **Local:** C:\Users\devpi\.openclaw\workspace\compliancepulse\
- **Status:** ✅ LIVE on Vercel, pushed to GitHub
- **Known Issues:** localStorage file storage (fix → IndexedDB in v1.1), share links have no expiry, reminder logs don't persist
- **Platform Expansion:** CompliancePulse → VendorCollect → SubWaste (natural ComplianceOps platform)

## 🔍 Problem Scout — July 10, 2026

**New Problems Found:** 5 (PROB-086 → PROB-090)
**Total Tracked:** 90 problems

### Top Pick
1. **PROB-086: CompliancePulse (9.3)** — ✅ BUILT & DEPLOYED
2. **PROB-087: VendorCollect (8.7)** — EVOLUTION of VendorVault. Vendor document collection portal. VendorJot's 12-document checklist defines exact scope. 78% contractors have delays from missing docs. 7hr build. $29-39/mo.
3. **PROB-088: SubWaste (8.0)** — EVOLUTION of SaaSLeak. SaaS spend waste detector. Payment recovery/dunning is #1 micro-SaaS niche by margin (70-90%). 6hr build. $19-29/mo.
4. PROB-089: ContractorCRM (7.2) — Compliance-aware CRM. Competitive (QuoteIQ at $29.99). Best as Phase 2 of CompliancePulse.
5. PROB-090: OpsCalendar (6.8) — Simple expiry calendar. Could be CompliancePulse free tier. 4hr build.

### Key Signals (July 10 Update)
- "Boring SaaS" OFFICIALLY winning over "AI everything" in 2026 (Flowjam, BuildMVPFast, LinkedIn)
- Vertical compliance = #1 micro-SaaS niche by margin (68%)
- Payment recovery/dunning = #1 by margin (70-90%)
- 78% of contractors have project delays from expired/missing documents (DocShield, July 2026)
- 67% of contractors still rely on spreadsheets (QuoteIQ, 2026)
- CompliancePulse → VendorCollect → SubWaste = natural ComplianceOps platform
- ExpiryEdge messaging: "A calendar reminder is not a renewal system"
- VendorJot 12-document checklist = exact product scope for VendorCollect

### Validation Pipeline
- PROB-086: ✅ BUILT & DEPLOYED (CompliancePulse — live at compliancepulse-two.vercel.app)
- PROB-087: ✅ Ready for PRD (VendorCollect)
- PROB-088: ✅ Ready for PRD (SubWaste)
- Consiglio tasks: task-065, task-066, task-067

## 🔍 Problem Scout — July 9, 2026 (ARCHIVED)

**New Problems Found:** 5 (PROB-081 → PROB-085)
**Total Tracked:** 85 problems

### Top Pick (EVOLVED to July 10 problems)
1. **PROB-081: RenewAlert Ops (9.5)** → EVOLVED into CompliancePulse (PROB-086, score 9.3)
2. **PROB-082: VendorVault (8.5)** → EVOLVED into VendorCollect (PROB-087, score 8.7)
3. **PROB-083: SaaSLeak (7.5)** → EVOLVED into SubWaste (PROB-088, score 8.0)
4. PROB-084: OpsTracker (7.0) — Still Tier 2, too broad
5. PROB-085: WhatsApp Commerce (6.5) — Still Tier 2, platform risk
## Improvement Log � Vinny Vault

### VV-20260712-091800 (July 12, 2026 — Latest Run)
| # | Suggestion | Impact | Status |
|---|-----------|--------|--------|
| 1 | Archive & remove C:\openclaw_backups (8.3 GB) | Reclaim ~8.3 GB on C: | ⏳ Pending approval |
| 2 | Clean npm cache (~2.3 GB) | Reclaim ~2 GB on C: | ⏳ Pending approval |
| 3 | Clean uv cache (~5.8 GB) | Reclaim ~5 GB on C: | ⏳ Pending approval |
| 4 | Install Defender update KB2267602 | Security hygiene | ⏳ No approval needed |
| 5 | Schedule quarterly elevated audit | Windows features inventory gap | ⏳ Low priority |

### VV-20260712-090000 (July 12, 2026 — Earlier Run)
| # | Suggestion | Impact | Status |
|---|-----------|--------|--------|
| 1 | Clean npm cache (~6 GB) | Reclaim ~4-5 GB on C: | ⏳ Pending approval |
| 2 | Clean uv cache (~5.8 GB) | Reclaim ~5 GB on C: | ⏳ Pending approval |
| 3 | Review C:\openclaw_backups (10.44 GB) | Potential reclaim ~10 GB on C: | ⏳ Pending approval |
| 4 | Install Defender update KB2267602 | Security hygiene | ⏳ No approval needed |
| 5 | Schedule quarterly elevated audit | Windows features inventory gap | ⏳ Low priority |

### VV-20260711 (Prior Run — Now Resolved � Now Resolved)
| # | Suggestion | Status |
|---|-----------|--------|
| 1 | C: 18 GB drop (150?132 GB) | ? RESOLVED � Recovered to 152.59 GB |
| 2 | 5 pending updates | ? RESOLVED � 4 installed, 1 remaining (Defender) |

