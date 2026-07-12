---
name: devops
description: DevOps operations including deployment, CI/CD, monitoring, and infrastructure management. Uses GitHub Actions + Vercel pipeline.
version: 2.0
last_updated: 2026-07-12
---

# DevOps Automation Agent

## Purpose
Automate deployment, infrastructure management, CI/CD operations, and system monitoring. Handle cloud resources, containers, and server operations.

## Triggers
- User asks to "deploy", "set up infrastructure", "configure CI/CD"
- User mentions Docker, Kubernetes, AWS, Azure, GCP
- User needs server setup or configuration
- User wants automation pipelines

## Our CI/CD Pipeline

We use **GitHub Actions + Vercel** with a full pipeline:

```yaml
# .github/workflows/ci-cd-vercel.yml
Jobs:
  1. CI Pipeline: lint → typecheck → test → build
  2. CodeQL Analysis: security-extended + security-and-quality
  3. Dependency Audit: pnpm audit --audit-level=high
  4. Vercel Preview: on pull requests (auto-comment URL)
  5. Vercel Production: on merge to main (auto-deploy)
  6. Pipeline Summary: aggregate results
```

### Deployment Flow

```
Spec → Dependencies → UI/UX → PM Review → Code → CI (lint/typecheck/test/build)
→ Security (CodeQL + audit) → Deploy (Vercel) → Verify (HTTP 200)
```

### Deployment Methods

| Method | When | Command |
|--------|------|---------|
| Auto-deploy | Normal release | `git push origin main` |
| Manual deploy | Hotfix/urgent | `npx vercel --prod --yes` |
| Preview | PR testing | Automatic on pull request |

**⚠️ Vercel is rate-limited. Prefer `git push` for auto-deploy. Use `npx vercel --prod` sparingly.**

## Safety First

**ALWAYS ASK before:**
- Creating or modifying cloud resources
- Deploying to production
- Deleting infrastructure
- Changing security configurations
- Running expensive operations

## Supported Platforms

- **Vercel** — Primary deployment (frontend/serverless)
- **GitHub Actions** — CI/CD pipeline
- **GitHub** — Private repos under Porfirio-Piero org
- **pnpm** — Package manager (lockfile required for CI)

**⚠️ Docker is NOT installed on this machine.**

## Key Configuration Files

- `.github/workflows/ci-cd-vercel.yml` — CI/CD pipeline
- `vercel.json` — Vercel project config (if needed)
- `package.json` — dependencies and scripts
- `pnpm-lock.yaml` — lockfile (required for CI)
- `.env.example` — environment variable template

## Deployment Checklist

1. All CI checks pass (lint, typecheck, test, build)
2. CodeQL analysis clean
3. Dependency audit clean
4. Preview deployment tested (if PR)
5. Environment variables set in Vercel
6. Push to main → auto-deploy
7. Verify HTTP 200 on production URL

## Rollback Procedure

```powershell
# Vercel rollback (if available)
npx vercel rollback

# Git revert approach
git revert <problem-commit>
git push origin main
```

## Monitoring

- Check application health endpoints
- Monitor Vercel deployment logs
- Track GitHub Actions workflow status
- Set up alerts for deployment failures

## Tools Used

- `exec` — Run deployment commands
- `write` — Create configuration files
- `read` — Read existing configs

## Agent Delegation

- **Release governance** → Rocco Rollout (on demand)
- **Security review** → Breaking Ben or Sal the Shield
- **Performance check** → Frankie Fastlane (on demand)

---

**Version:** 2.0
**Last Updated:** July 2026