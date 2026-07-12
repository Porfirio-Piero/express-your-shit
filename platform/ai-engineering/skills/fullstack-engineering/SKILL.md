---
name: fullstack-engineering
description: Implement within existing architecture using the La Famiglia CI/CD pipeline. Spec → Code → Test → Security → Deploy.
version: 2.0
last_updated: 2026-07-12
---

# Fullstack Engineering

Implement within existing architecture.

## Required Practices

- **Inspect first** — read existing code, conventions, and patterns before writing
- **Preserve conventions** — match existing style, naming, structure
- **Centralize domain logic** — business rules in one place, not scattered
- **Validate boundaries** — input validation, API contracts, type safety
- **Use migrations** — database changes go through migration files
- **Write tests** — unit, integration, E2E as appropriate to risk
- **Avoid fake infrastructure** — no hardcoded test servers, no mock APIs in production

## Our CI/CD Pipeline

Every change goes through this pipeline before reaching production:

```
1. SPEC → Dependencies Mapped → UI/UX Design → PM Review
2. CODE → Local Dev (pnpm dev)
3. CI (GitHub Actions: ci-cd-vercel.yml):
   - pnpm lint
   - pnpm typecheck (or tsc --noEmit)
   - pnpm test -- --reporter=verbose
   - pnpm build (NEXT_TELEMETRY_DISABLED=1)
4. Security:
   - CodeQL Analysis (security-extended, security-and-quality)
   - pnpm audit --audit-level=high
   - Snyk (when available — currently a gap)
5. Deploy:
   - PR → Vercel Preview (auto-comment on PR)
   - Merge to main → Vercel Production (auto-deploy)
6. Verify:
   - HTTP 200 health check
   - Post-deploy verification
```

## Deployment Methods

| Method | When | Command |
|--------|------|---------|
| Auto-deploy | Push to main | `git push origin main` |
| Manual deploy | Hotfix or needed now | `npx vercel --prod --yes` |
| Preview | PR testing | Automatic on pull request |

**⚠️ Vercel is rate-limited. Prefer `git push` for auto-deploy. Use `npx vercel --prod` sparingly.**

## Project Structure Standards

- **Next.js** — App Router, TypeScript, Tailwind CSS
- **Package manager** — pnpm (lockfile required)
- **Node version** — 20+
- **Environment** — Vercel (serverless, edge functions)
- **Git** — Private GitHub repos under Porfirio-Piero org
- **CI** — GitHub Actions (`.github/workflows/ci-cd-vercel.yml`)

## Key Configuration Files

- `package.json` — dependencies and scripts
- `pnpm-lock.yaml` — lockfile (required for CI)
- `next.config.js` or `next.config.ts` — Next.js config
- `.github/workflows/ci-cd-vercel.yml` — CI/CD pipeline
- `vercel.json` — Vercel project config (if needed)
- `.env.example` — environment variable template (never commit `.env`)

## Agent Delegation

- **New feature build** → Dapper Dan (Kimi K2.7-Code)
- **Architecture refactor** → Codex Developer (GLM 5.1)
- **Security review** → Breaking Ben (GLM 5.1)
- **QA testing** → Joey No-Bugs (on demand)
- **Release governance** → Rocco Rollout (on demand)

## Completion Output

Return:
- findings
- changes or recommendations
- evidence
- unresolved risks
- explicit pass/fail status where applicable