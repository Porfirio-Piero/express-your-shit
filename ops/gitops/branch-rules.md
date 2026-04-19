# Branch Rules & Conventions

## Branch Naming

### Protected Branches

| Branch | Purpose | Protection Level |
|--------|---------|------------------|
| `main` | Production code | Full protection |
| `develop` | Integration branch | Standard protection |

### Feature Branches

Format: `feat/<agent>/<short-description>`

Examples:
- `feat/scout/pain-mining-v2`
- `feat/pm/clustering-algo`
- `feat/eng/nextjs-scaffold`

### Nightly Branches

Format: `nightly/YYYY-MM-DD`

Example: `nightly/2026-02-23`

Created automatically by nightly Opportunity Engine runs.

## Workflow Rules

### Creating Branches

```powershell
# Create feature branch
git checkout -b feat/scout/new-feature origin/develop

# Push branch
git push -u origin feat/scout/new-feature
```

### Merging to develop

1. Create PR from `feat/*` to `develop`
2. CI checks must pass
3. At least 1 approval required
4. BotFather approves and merges

### Merging to main

1. Create PR from `develop` or `feat/*` to `main`
2. CI checks must pass
3. At least 1 approval required
4. BotFather approves and merges
5. Production deploy triggers automatically

## Commit Convention

```
feat(<agent>): <summary>
fix(<agent>): <summary>
chore(<agent>): <summary>
docs(<agent>): <summary>
refactor(<agent>): <summary>
test(<agent>): <summary>
```

Examples:
- `feat(scout): add Reddit pain mining`
- `fix(devops): correct Vercel org ID`
- `chore(pm): update scoring rubric`

## Approval Matrix

| Action | Who Approves |
|--------|--------------|
| Feature → develop | BotFather |
| develop → main | BotFather |
| Hotfix → main | BotFather (expedited) |
| Nightly → develop | BotFather (auto-approved) |

## Emergency Procedures

**Hotfix to main:**
1. Branch from `main`: `hotfix/<description>`
2. Make minimal fix
3. PR to `main` with `HOTFIX:` prefix
4. BotFather expedited review
5. Merge and deploy
6. Backport to `develop`
