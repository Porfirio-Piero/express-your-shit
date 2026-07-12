---
name: release-governance
description: Verify all quality gates, environment configuration, migrations, rollback, deployment, and post-release health. Uses GitHub Actions CI/CD + Vercel.
version: 2.0
last_updated: 2026-07-12
---

# Release Governance

Verify all quality gates, environment configuration, migrations, rollback, deployment, and post-release health.

## Release Pipeline

Every release goes through our full CI/CD pipeline:

```
1. SPEC → Dependencies Mapped → UI/UX Design → PM Review ✓
2. CODE → Local Dev (pnpm dev)
3. CI (GitHub Actions):
   ✅ pnpm lint
   ✅ pnpm typecheck (or tsc --noEmit)
   ✅ pnpm test -- --reporter=verbose
   ✅ pnpm build (NEXT_TELEMETRY_DISABLED=1)
4. Security:
   ✅ CodeQL Analysis (security-extended, security-and-quality)
   ✅ pnpm audit --audit-level=high
   ⚠️ Snyk (gap — not yet installed)
5. Deploy:
   - PR → Vercel Preview (auto-comment on PR)
   - Merge to main → Vercel Production (auto-deploy)
6. Verify:
   ✅ HTTP 200 health check
   ✅ Post-deploy verification
```

## Quality Gates (Must Pass Before Production)

| Gate | Check | Blocking |
|------|-------|----------|
| **Lint** | `pnpm lint` passes | Yes |
| **Type Check** | `pnpm typecheck` passes | Yes |
| **Unit Tests** | `pnpm test` passes | Yes |
| **Build** | `pnpm build` succeeds | Yes |
| **CodeQL** | No critical/high findings | Yes |
| **Dependency Audit** | `pnpm audit --audit-level=high` clean | Yes |
| **Preview Deploy** | Vercel preview succeeds | Yes (PRs) |
| **Health Check** | HTTP 200 on production URL | Yes |

## Release Checklist

### Pre-Release
- [ ] All CI checks pass (lint, typecheck, test, build)
- [ ] CodeQL analysis clean (no critical/high)
- [ ] Dependency audit clean (`pnpm audit --audit-level=high`)
- [ ] Preview deployment tested
- [ ] Environment variables set in Vercel
- [ ] Database migrations ready (if applicable)
- [ ] Breaking changes documented

### Release
- [ ] Merge PR to main branch
- [ ] GitHub Actions triggers production deploy
- [ ] Vercel builds and deploys automatically
- [ ] Deployment URL confirmed

### Post-Release
- [ ] Health check passes (HTTP 200)
- [ ] Smoke tests on production
- [ ] Monitor error logs for 30 minutes
- [ ] Announce release if applicable

## Rollback Procedure

If production deployment fails or causes issues:

1. **Vercel Instant Rollback** — Use Vercel dashboard to rollback to previous deployment
2. **Git Revert** — `git revert <commit>` and push to main
3. **Emergency** — `npx vercel --prod` with previous working commit

```powershell
# Check current Vercel deployment
npx vercel ls

# Rollback via Vercel (if available)
npx vercel rollback

# Git revert approach
git revert <problem-commit>
git push origin main
```

## Deployment Methods

| Method | When | Command | Risk |
|--------|------|---------|------|
| Auto-deploy | Normal release | `git push origin main` | Low |
| Manual deploy | Hotfix | `npx vercel --prod --yes` | Medium |
| Preview | PR testing | Automatic on PR | Low |

**⚠️ Vercel is rate-limited. Prefer `git push` for auto-deploy.**

## Agent Delegation

- **Release governance** → Rocco Rollout (on demand)
- **Security review** → Breaking Ben or Sal the Shield
- **QA verification** → Joey No-Bugs (on demand)
- **Performance check** → Frankie Fastlane (on demand)

## Completion Output

Return:
- findings
- changes or recommendations
- evidence
- unresolved risks
- explicit pass/fail status where applicable