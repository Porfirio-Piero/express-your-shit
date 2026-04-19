# GitOps Setup Checklist

## Repository Configuration

- [ ] Create private GitHub repository: `opportunity-lab`
- [ ] Enable branch protection rules for `main`
- [ ] Require PR reviews before merging
- [ ] Require status checks to pass before merging
- [ ] Require branches to be up to date before merging

## Vercel Connection

### Required Secrets

Set these in GitHub repository Settings > Secrets and variables > Actions:

| Secret | How to Get |
|--------|------------|
| `VERCEL_TOKEN` | Run `vercel login` then `vercel token` |
| `VERCEL_ORG_ID` | In `.vercel/project.json` or `vercel project list` |
| `VERCEL_PROJECT_ID` | In `.vercel/project.json` or `vercel project list` |

### Getting Vercel IDs

```bash
# Login to Vercel
vercel login

# Get token
vercel token

# Link project (creates .vercel/project.json)
cd projects/opportunity-lab
vercel link

# View project.json for orgId and projectId
cat .vercel/project.json
```

## Branch Protection Rules

Enable for `main` branch:

1. **Require pull request reviews** (1 reviewer)
2. **Dismiss stale PR approvals** when new commits are pushed
3. **Require status checks to pass** before merging
4. **Require branches to be up to date**
5. **Require conversation resolution**
6. **Do not allow bypassing the above settings**

## Deployment Flow

1. **Developer** pushes to `feat/*` branch
2. **GitHub Actions** runs CI on PR
3. **Vercel Preview** deploys PR branch
4. **Reviewer** approves PR
5. **BotFather** merges to `develop` or `main`
6. **Vercel Production** deploys on `main` push

## Environment Branches

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production code | Production |
| `develop` | Integration branch | Preview |
| `feat/*` | Feature work | Preview (PR only) |
| `nightly/*` | Automated nightly | Preview |

## Workflow Files

Located in `.github/workflows/`:

- `ci.yml` - Runs on PR to main/develop
- `vercel-preview.yml` - Deploys PR previews
- `vercel-production.yml` - Deploys production on main push
