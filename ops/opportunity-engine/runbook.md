# Opportunity Engine Runbook

## Overview

Nightly automated pipeline for pain mining, opportunity clustering, and MVP scaffolding.

## Nightly Schedule (Local Time)

| Time | Phase | Agent | Output |
|------|-------|-------|--------|
| 01:00 | Pain Mining | Scout | Raw problems JSON |
| 01:30 | Clustering + Scoring | Product Manager | Cluster analysis MD |
| 02:00 | Feasibility + MVP Brief | Feasibility Agent | Validated opportunities + Top 1 MVP brief |
| 02:30 | Optional Scaffold | Engineering | Feature branch with code (if score ≥ 8.5) |

## Artifacts Written Each Run

All timestamps use `YYYY-MM-DD` format.

### 1. Intake (`workspace/opportunity/intake/`)

**File:** `YYYY-MM-DD-problems.json`

Array of problem objects:
```json
{
  "problem_statement": "string",
  "who_is_affected": "string",
  "frequency_signal": "string",
  "intensity_signal": "string",
  "evidence_links": ["url1", "url2"],
  "existing_solutions": "string",
  "gap_detected": "string",
  "monetization_potential": "string",
  "confidence_score": 0.0
}
```

### 2. Clusters (`workspace/opportunity/clusters/`)

**File:** `YYYY-MM-DD-cluster-analysis.md`

Contains:
- Top 10 clusters table
- Evidence counts by source
- Repeated phrasing patterns
- Opportunity score (0-10)
- Recommended next action

### 3. Validated (`workspace/opportunity/validated/`)

**File:** `YYYY-MM-DD-feasible-opportunities.md`

Top 5 opportunities with:
- MVP concept
- Why now
- Who pays
- Pricing hypothesis
- Build complexity (S/M/L)
- 1 week build plan
- 30 day path to revenue

### 4. MVP Briefs (`workspace/opportunity/mvp-briefs/`)

**File:** `YYYY-MM-DD-top1-mvp.md`

Full brief for highest-scoring opportunity:
- Problem
- User persona
- Jobs to be done
- MVP scope
- Non-goals
- Data model (light)
- API surface (light)
- Pages and UX flow
- Success metrics
- Monetization

### 5. Logs (`workspace/opportunity/logs/`)

**File:** `YYYY-MM-DD-run-log.md`

- Which agents ran
- Sources used
- Changes from yesterday
- Any errors or blockers

## Scoring Rubric

Total: 10 points

| Factor | Weight | Criteria |
|--------|--------|----------|
| Frequency | 0-3 | How often mentioned |
| Intensity | 0-2 | Pain level, urgency |
| Monetization | 0-2 | Clear path to $ |
| Build Feasibility | 0-2 | Can build in 7 days |
| Differentiation | 0-1 | Gap vs competitors |

## Scoring Guide

**9-10:** Exceptional - immediate scaffold candidate
**7.5-8.9:** Strong - prioritize for next cycle
**6-7.4:** Moderate - monitor
**<6:** Weak - archive

## MVP Scaffolding Threshold

**Minimum score:** 8.5
**Required context:** `ALLOW_SCAFFOLD=true`

When both conditions met:
1. Create branch: `feat/opplab/{short-name}`
2. Scaffold Next.js app with:
   - Landing page
   - Basic nav
   - Placeholder pricing
   - API route stub
3. Commit and push
4. Create PR to `develop`

## Manual Trigger

```bash
# Via OpenClaw cron
openclaw cron run opportunity-engine-nightly

# Via agent direct
openclaw run scout-agent --task "pain-mining"
```

## Sources (Scout)

- Reddit: r/SaaS, r/Entrepreneur, r/startups
- Hacker News: Show HN, Ask HN
- IndieHackers: Products, Ideas
- Twitter/X: IndieDev mentions

## Troubleshooting

### No problems found
- Check source connectivity
- Review frequency thresholds
- Verify scraper not blocked

### Low scores consistently
- Review rubric weights
- Check source freshness
- Validate clustering algo

### Scaffold fails
- Verify ALLOW_SCAFFOLD flag
- Check disk space
- Review branch permissions
