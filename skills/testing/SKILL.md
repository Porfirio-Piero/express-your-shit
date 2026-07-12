---
name: testing
description: Automated testing including unit, integration, E2E, regression, and security testing. Integrated with our CI/CD pipeline.
version: 2.0
last_updated: 2026-07-12
---

# Testing Agent

## Purpose
Design, implement, and run tests. Create unit tests, integration tests, end-to-end tests, and generate test reports with coverage analysis.

## Triggers
- User asks to "test", "write tests", "check if this works"
- User mentions "unit test", "integration test", "E2E", "coverage"
- User needs to validate code changes
- User wants automated testing pipeline

## Our CI/CD Pipeline

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

## Testing Workflow

1. **Test Discovery** — Identify code to test, analyze dependencies, determine test levels needed
2. **Test Design** — Unit tests for functions, integration for components, E2E for user workflows
3. **Implementation** — Use appropriate framework, mock external dependencies, create fixtures
4. **Execution & Reporting** — Run tests with coverage, generate reports, identify failures

## Test Frameworks

- **Unit/Integration:** Jest (JavaScript/TypeScript), pytest (Python)
- **E2E:** Playwright (browser automation)
- **Coverage:** Istanbul/nyc (JS), coverage.py (Python)

## Coverage Standards

| Risk Level | Unit | Integration | E2E | Coverage Target |
|-----------|------|-------------|-----|-----------------|
| Low (copy, style) | ✅ | — | — | 60%+ |
| Medium (feature) | ✅ | ✅ | ✅ | 80%+ |
| High (security, money) | ✅ | ✅ | ✅ | 95%+ |

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

# Type check (runs in CI)
pnpm typecheck

# Lint (runs in CI)
pnpm lint
```

## CI Failure Handling

If CI fails:
1. Read the GitHub Actions log
2. Identify the failing step (lint, typecheck, test, build)
3. Fix locally and push again
4. Do NOT force-merge or bypass CI

## Report Format

```markdown
## Test Report

**Date:** [Date]
**Branch:** [Branch]

### Summary
- Total Tests: [count]
- Passed: [count]
- Failed: [count]
- Coverage: [percentage]

### Failures
1. [Test Name]: [Error]

### Coverage by Module
- module1.ts: 95%
- module2.ts: 78%

### Recommendations
- [Action item]
```

## Agent Delegation

- **QA testing** → Breaking Ben (GLM 5.1) or Joey No-Bugs (on demand)
- **E2E test creation** → Dapper Dan (Kimi K2.7-Code)
- **Security testing** → Breaking Ben → Sal the Shield (on demand)

## Tools Used

- `exec` — Run test commands
- `write` — Create test files
- `read` — Load code under test

---

**Version:** 2.0
**Last Updated:** July 2026