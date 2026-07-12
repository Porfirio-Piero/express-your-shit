# Loop 3 — Pinterest Traffic Engine

## Strategy
Pinterest = search engine with long pin half-life (3-6 months vs hours on Twitter). Ideal for driving traffic to Loop 1 products and Loop 2 articles.

## Account Setup (Piero does this)
- [ ] Create Pinterest Business Account
- [ ] Claim website (consiglio-dashboard.vercel.app or future affiliate domain)
- [ ] Enable Pinterest API access
- [ ] Create 5 niche boards

## Board Structure

### Board 1: AI for Business
- Pins: AI enablement tips, governance frameworks, rollout checklists
- Links to: Loop 1 Product #1 (AI Enablement Kit)

### Board 2: Azure Cost Tips
- Pins: Azure waste statistics, cost comparison graphics, savings tips
- Links to: Loop 1 Product #2 (Azure Cost Cleanup)

### Board 3: Copilot Rollout
- Pins: M365 tips, rollout timelines, productivity gains
- Links to: Loop 1 Product #3 (Copilot Comms Pack)

### Board 4: Local LLM Hardware
- Pins: GPU comparison graphics, build guides, benchmark charts
- Links to: Loop 2 affiliate articles

### Board 5: Tech Compliance Deadlines
- Pins: Countdown graphics, regulation summaries, checklist previews
- Links to: Loop 5 compliance countdown pages

## First 10 Pin Concepts

| # | Title | Visual | Link Target | Keywords |
|---|-------|--------|-------------|----------|
| 1 | "Stop Guessing Which AI Projects to Fund" | Scoring rubric preview | AI Enablement Kit | AI governance, AI scoring, AI use case |
| 2 | "Azure Waste: The $300/Month You're Not Checking" | Orphaned disk infographic | Azure Cleanup Playbook | Azure cost, cloud waste, FinOps |
| 3 | "Your Copilot Rollout in 5 Emails" | Email template preview | Copilot Comms Pack | Copilot rollout, M365 AI, AI comms |
| 4 | "RTX 4090 vs 6000 Ada: Local LLM Benchmarks" | GPU benchmark chart | Loop 2 article | local LLM, GPU benchmarks, AI hardware |
| 5 | "EU AI Act Countdown: 90 Days to Comply" | Deadline countdown graphic | Loop 5 page | EU AI Act, AI compliance, regulation |
| 6 | "The AI Intake Form That Changed Everything" | Form preview | AI Enablement Kit | AI intake, AI process, AI governance |
| 7 | "11 Scripts That Saved Us $4K/Month on Azure" | PowerShell screenshot | Azure Cleanup Playbook | Azure savings, PowerShell, cloud audit |
| 8 | "Local LLM Server Build Under $1500" | Build photo + parts list | Loop 2 article | home lab, LLM server, AI hardware |
| 9 | "Copilot FAQ: What Your Team Will Ask" | FAQ preview card | Copilot Comms Pack | Copilot FAQ, AI rollout, M365 |
| 10 | "AI Governance Checklist: 47 Items" | Checklist preview | AI Enablement Kit | AI governance, AI checklist, AI compliance |

## Pin Template Specs
- Size: 1000x1500px (2:3 ratio, Pinterest optimal)
- Font: Clean sans-serif (Inter, DM Sans)
- Colors: Dark blue (#1a1a2e), Cyan (#06b6d4), White
- Brand: "AI Enablement" or consistent logo mark
- Text overlay: 3-5 words maximum per pin
- Always include: product name, price, "Download" CTA

## Daily Loop (automated via cron)
1. Select content piece (product or article)
2. Generate pin image from template
3. Write keyword-rich title + description (500 chars)
4. Schedule via Pinterest API or manual scheduler
5. Target: 5-10 pins/day across boards

## Weekly Review
- Outbound clicks by pin style
- Save rate by board
- Top-performing keywords
- Feed winners back into generation prompts