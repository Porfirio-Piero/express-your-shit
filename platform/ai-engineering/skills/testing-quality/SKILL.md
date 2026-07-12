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