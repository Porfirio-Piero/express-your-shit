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
