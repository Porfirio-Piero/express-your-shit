# Missing Secrets Report

## Status: ⛔ BLOCKED - Secrets Required

The following secrets are missing and must be configured before deployment can proceed.

## Required Secrets

### GitHub Repository Secrets

Set at: `https://github.com/OWNER/REPO/settings/secrets/actions`

| Secret | Status | Instructions |
|--------|--------|--------------|
| `VERCEL_TOKEN` | ❌ MISSING | Run `vercel token` after `vercel login` |
| `VERCEL_ORG_ID` | ❌ MISSING | Found in `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | ❌ MISSING | Found in `.vercel/project.json` |

## How to Obtain

### 1. VERCEL_TOKEN

```bash
# Login
vercel login

# Generate token
vercel token

# Copy the token
```

### 2. VERCEL_ORG_ID and VERCEL_PROJECT_ID

```bash
# Link project
cd projects/opportunity-lab
vercel link

# Read IDs
cat .vercel/project.json
# Example output:
# {
#   "orgId": "team_xxxxxxxxxxxxxxxx",
#   "projectId": "prj_xxxxxxxxxxxxxxxx"
# }
```

### 3. Add to GitHub

1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with exact names above

## Verification

After adding secrets, verify with a test PR. Preview deployment should succeed.

## Current Impact

- [ ] Preview deployments: BLOCKED
- [ ] Production deployments: BLOCKED
- [ ] CI/CD pipeline: PARTIAL (CI runs, deploys fail)

## Next Steps

1. Add missing secrets
2. Trigger test PR
3. Verify preview deployment succeeds
4. Remove this file once verified
