# Opportunity Lab

Automated opportunity detection and MVP scaffolding pipeline for OpenClaw.

## Branch Strategy

- `main`: Production only. Protected. Requires PR.
- `develop`: Integration branch (optional but recommended).
- `feat/<agent>/<topic>`: Standard feature branches.
- `nightly/YYYY-MM-DD`: Nightly auto branches.

**Rules:**
- No direct pushes to `main`
- PR required for `main`
- CI checks required for merge
- BotFather approval required

## Commit Convention

- `feat(<agent>): <summary>`
- `fix(<agent>): <summary>`
- `chore(<agent>): <summary>`

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build
```

## Deployment

- **PR Previews**: Automatic via GitHub Actions + Vercel
- **Production**: Merge to `main` triggers production deploy

## Required Secrets

Set these in GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Nightly Pipeline

See `workspace/ops/opportunity-engine/runbook.md` for the full Opportunity Engine schedule and artifacts.
