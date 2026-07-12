---
name: overnight-complexity-validator
description: Validate overnight build complexity to ensure projects stay within scope and time constraints.
---
#Overnight Factory - Complexity Validator

## Purpose
Prevent oversized builds from entering the overnight pipeline. Any project estimating >8 hours should be rejected or downscoped.

## Validation Rules

### Rule 1: Build Time Estimate
```yaml
maximum_build_time: 8_hours  # Hard limit for overnight
optimal_build_time: 4_hours    # Preferred for overnight
tier_system:
  tier_1_overnight: "≤8 hours"
  tier_2_weekend: "8-24 hours" 
  tier_3_project: ">24 hours (manual only)"
```

### Rule 2: Feature Count
```yaml
maximum_p0_features: 3  # No more than 3 core features
p0_complexity_limits:
  - feature_1: max_4_hours
  - feature_2: max_3_hours  
  - feature_3: max_2_hours
p1_features: 0  # No P1 features in overnight
p2_features: 0  # No P2 features in overnight
```

### Rule 3: Tech Stack Complexity
```yaml
overnight_approved_stacks:
  - frontend_only: "Next.js + LocalStorage"
  - simple_backend: "Next.js + Serverless function"
  - no_database: "Client-side persistence only"
  - static_site: "No backend required"

overnight_rejected_stacks:
  - full_database: "MongoDB/PostgreSQL with auth"
  - complex_auth: "OAuth2 + JWT + sessions"
  - real_time: "WebSockets, live updates"
  - multi_service: "Multiple microservices"
  - external_apis: ">3 third-party integrations"
```

## Validation Checklist

### Before PRD Approval:
- [ ] Build estimate ≤8 hours?
- [ ] P0 features ≤3?
- [ ] No database required?
- [ ] Single-page-app or simple multi-page?
- [ ] Deployable to Vercel in one step?
- [ ] Requires only OpenAI API key (no other creds)?

### Auto-Reject Criteria:
- [ ] PRD mentions "database" or "PostgreSQL"
- [ ] PRD mentions "authentication" or "user accounts"
- [ ] PRD mentions "real-time" or "websockets"
- [ ] 5+ P0 features defined
- [ ] Build estimate >8 hours
- [ ] External API count >3

## Downscope Strategy

### If PRD is Too Complex:
```
DO NOT REJECT - AUTOMATICALLY DOWNCOPE TO MVP:

Full PRD: "SheetFlow - Data automation with database, auth, real-time"
↓
MVP: "SheetFlow Core - CSV upload, data preview, simple export"

Changes:
- Remove: Database (use LocalStorage)
- Remove: Authentication (no auth)
- Remove: Real-time sync
- Remove: Team collaboration
- Keep: CSV upload + preview + export (3 features only)
- Reduce: 12 hours → 4 hours estimate
```

### Auto-Downscope Logic:
```yaml
if build_estimate > 8_hours:
  downscope_to: "MVP only"
  remove_features:
    - authentication
    - database_persistence
    - real_time_features
    - team_collaboration
    - advanced_analytics
  keep_only: 3_core_features
  new_estimate: 4_hours
```

## Implementation in Pipeline

### Phase 2 (Product Owner) Additions:
```python
# After PRD creation, validate complexity
def validate_overnight_scope(prd):
    if prd.build_estimate > 8_hours:
        # Auto-downscope
        prd = downscope_to_mvp(prd)
        prd.notes += "AUTOMATICALLY DOWNSCOPED for overnight build"
    
    if not validate_stack_overnight_friendly(prd.tech_stack):
        prd.tech_stack = get_overnight_safe_stack()
        prd.notes += "Tech stack simplified for overnight"
    
    return prd
```

## Tier Assignment Guide

### Classify Problem/Project:
```yaml
tier_1_overnight:
  characteristics:
    - "Simple automation"
    - "Single user tool"
    - "No database"
    - "Client-side only"
    - "3 hours estimated"
  examples:
    - "CSV converter"
    - "Simple calculator"
    - "Form builder"
    - "Inventory tracker (LocalStorage)"

tier_2_weekend:
  characteristics:
    - "Multi-user support"
    - "Simple database"
    - "OAuth login"
    - "8-12 hours estimated"
  when_to_run: "Friday night → Sunday morning"

tier_3_project:
  characteristics:
    - "Full application"
    - "Complex database"
    - "Real-time features"
    - "Payment processing"
    - ">12 hours estimated"
  when_to_run: "MANUAL ONLY - Not automated"
```

## Success Metrics

- Zero overnight failures due to overscoping
- All overnight builds complete in <8 hours
- Minimum 80% feature delivery rate
- All overnight builds deploy successfully

---

**Tag:** Apply this validator in Phase 2 (Product Owner) before Phase 3 (Developer)
## Operating Manual: Discipline Protocol

**Source:** skills/botfather/SKILL.md � read the full manual for context and examples.

Every response runs the **five-question gate** before sending:

1. Did I answer the **decision** they're making, or just the words they typed?
2. What's the **one claim** that, if wrong, wrecks the answer � and did I verify it by re-derivation?
3. Is every **guess labeled** at the sentence where it lives?
4. What's the **strongest objection** to my conclusion � does the response survive it or state it?
5. If the reader stops after my **first sentence**, do they act correctly?

### Core Disciplines

1. **Read beneath the words.** Name the artifact, the decision, and what they'll do five minutes later. If those don't align, answer the decision.
2. **Break into independently checkable pieces.** Decompose along verification seams. Each piece should be falsifiable alone.
3. **Find where risk lives.** Effort goes to likelihood x cost, not what's interesting. Note the worst-place-to-be-wrong explicitly.
4. **Verify by re-deriving, not recognizing.** "It sounds familiar" is not evidence. Reconstruct from primitives through a different path.
5. **Separate known from guessed, out loud.** Every claim is derived, sourced, or inferred. Inferred claims get inline labels ("likely", "unverified") at the sentence level.
6. **Attack your own conclusion.** Generate the strongest objection a skeptical expert would raise. If you can't answer it, include it.
7. **Answer, then reasoning, then risk.** First sentence = correct action. Then shortest reasoning. Then specific conditions where the answer is wrong.
8. **Watch for competence-shaped mistakes.** Thoroughness as cover. Precision without accuracy. Fluent structure over checked content. Hedging everything equally. Agreeing with the premise. Answering the harder question. Speed as confidence.
