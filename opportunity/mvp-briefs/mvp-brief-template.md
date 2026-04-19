# MVP Brief: {Theme Name}

**Date:** YYYY-MM-DD  
**Opportunity Score:** N.N / 10  
**Build Complexity:** Small/Medium/Large  
**Target Launch:** YYYY-MM-DD (N weeks)

---

## Problem

**Current Pain:** {Clear problem statement}

**Current Workarounds:** {What users do now}

**Why Existing Solutions Fail:**
- {Gap 1}
- {Gap 2}
- {Gap 3}

---

## User Persona

**Name:** {Persona Name}  
**Role:** {Job title/role}  
**Age:** {Range}  
**Tech Savvy:** {Low/Medium/High}

**Daily Context:**
{Where they are when problem occurs}

**Current Tools:**
{List of tools they use today}

**Motivations:**
- {Motivation 1}
- {Motivation 2}

**Frustrations:**
- {Frustration 1}
- {Frustration 2}

---

## Jobs to be Done

### Primary JTBD
"{When I ___, I want to ___, so I can ___}"

### Secondary JTBDs
1. {secondary job}
2. {secondary job}

---

## MVP Scope

### In Scope
- {Feature 1}
- {Feature 2}
- {Feature 3}

### Out of Scope (Post-MVP)
- {Future feature 1}
- {Future feature 2}

### Non-Goals
- {What we're explicitly NOT doing}

---

## Data Model (Light)

```
Entity: {Name}
- id: string
- field1: type
- field2: type
- createdAt: timestamp
- updatedAt: timestamp
```

**Relationships:**
- {Entity A} has many {Entity B}

---

## API Surface (Light)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/{resource} | GET | List |
| /api/{resource} | POST | Create |
| /api/{resource}/:id | GET | Retrieve |
| /api/{resource}/:id | PUT | Update |
| /api/{resource}/:id | DELETE | Delete |

---

## Pages and UX Flow

### Page: {Page Name}
**Purpose:** {What user does here}

**Key Elements:**
- {Element 1}
- {Element 2}

**User Flow:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

### Page: {Page Name}
...

---

## Success Metrics

### Launch Metrics (Week 1)
- [ ] X visitors to landing page
- [ ] X signups
- [ ] X active users

### Month 1 Metrics
- [ ] X daily active
- [ ] X retention (7-day)
- [ ] First $X revenue

### Month 3 Metrics
- [ ] X MRR
- [ ] X paying customers
- [ ] X% retention (30-day)

---

## Monetization

**Pricing Model:** {subscription/one-time/freemium/usage}

**Pricing Tiers:**
- Free: {limitations}
- Starter: $X/month - {features}
- Pro: $XX/month - {features}

**Pricing Hypothesis:**
{Why users will pay this amount}

**Payment Processing:**
Stripe / LemonSqueezy / etc.

---

## Technical Notes

**Stack:**
- Frontend: {Next.js, React, etc.}
- Backend: {API, serverless functions}
- Database: {PostgreSQL, Firebase, etc.}
- Auth: {Clerk, Auth0, etc.}
- Hosting: {Vercel, Railway, etc.}

**Key Libraries:**
- {Library 1} for {purpose}
- {Library 2} for {purpose}

**Potential Blockers:**
- {Blocker 1}
- {Blocker 2}

---

## Appendix

**Links:**
- Cluster analysis: `../../clusters/YYYY-MM-DD-cluster-analysis.md`
- Feasibility report: `../../validated/YYYY-MM-DD-feasible-opportunities.md`
- Intake data: `../../intake/YYYY-MM-DD-problems.json`

**Research Notes:**
- {Any additional notes}
