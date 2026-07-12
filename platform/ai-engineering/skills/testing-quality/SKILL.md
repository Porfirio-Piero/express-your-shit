---
name: testing-quality
description: Create unit, integration, E2E, regression, negative, and boundary tests appropriate to risk. Do not treat compilation as testing. Uses our CI/CD pipeline.
version: 2.0
last_updated: 2026-07-12
---

# Testing Quality

Create unit, integration, E2E, regression, negative, and boundary tests appropriate to risk. **Do not treat compilation as testing.**

## Testing in Our Pipeline

Testing runs automatically in CI (GitHub Actions: `ci-cd-vercel.yml`):

```
CI Pipeline Job:
  1. pnpm install --frozen-lockfile
  2. pnpm lint
  3. pnpm typecheck (or tsc --noEmit)
  4. pnpm test -- --reporter=verbose
  5. pnpm build (NEXT_TELEMETRY_DISABLED=1)
```

**All tests must pass before deployment.** The CI job gates both Vercel Preview (PRs) and Vercel Production (main branch).

## Test Levels by Risk

| Risk Level | Unit | Integration | E2E | Regression | Boundary |
|-----------|------|-------------|-----|------------|----------|
| **Low** (copy, style) | ✅ | — | — | — | — |
| **Medium** (new feature) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **High** (security, money) | ✅ | ✅ | ✅ | ✅ | ✅ |

## Frameworks

- **Unit/Integration:** Jest (JavaScript/TypeScript), pytest (Python)
- **E2E:** Playwright (browser automation)
- **Coverage:** Istanbul/nyc (JS), coverage.py (Python)

## Coverage Standards

- **80%+** on critical paths
- **100%** on utility functions
- **Integration tests** for all API endpoints
- **E2E tests** for main user flows
- **No test = no merge** for medium/high risk changes

## Test Structure

```
tests/
├── unit/
│   └── test_module.ts
├── integration/
│   └── test_api.ts
├── e2e/
│   └── test_user_flow.spec.ts
└── fixtures/
    └── sample_data.json
```

## Local Testing Commands

```powershell
# Run all tests
pnpm test

# Run with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test -- path/to/test.ts

# Run E2E tests with Playwright
npx playwright test

# Check coverage
pnpm test -- --coverage
```

## CI Failure Handling

If CI fails:
1. Read the GitHub Actions log
2. Identify the failing step (lint, typecheck, test, build)
3. Fix locally and push again
4. Do NOT force-merge or bypass CI

## Agent Delegation

- **QA testing** → Breaking Ben (GLM 5.1) or Joey No-Bugs (on demand)
- **E2E test creation** → Dapper Dan (Kimi K2.7-Code)
- **Security testing** → Breaking Ben → Sal the Shield (on demand)

## Completion Output

Return:
- findings
- changes or recommendations
- evidence
- unresolved risks
- explicit pass/fail status where applicable
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
