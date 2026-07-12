---
name: security-review
description: Threat-model sensitive surfaces. Review authorization, secrets, uploads, tokens, public endpoints, logging, rate limiting, and dependencies. Uses CodeQL, pnpm audit, and Snyk in CI/CD pipeline.
version: 2.0
last_updated: 2026-07-12
---

# Security Review

Threat-model sensitive surfaces. Review authorization, secrets, uploads, tokens, public endpoints, logging, rate limiting, and dependencies.

## Security in Our Pipeline

Security scanning runs automatically in CI (GitHub Actions: `ci-cd-vercel.yml`):

```
CodeQL Job:
  - language: javascript-typescript
  - queries: security-extended, security-and-quality
  - runs on: every push and PR

Dependency Audit Job:
  - pnpm install --frozen-lockfile
  - pnpm audit --audit-level=high
  - pnpm outdated (informational)
```

**⚠️ Snyk Gap:** Snyk is NOT yet installed. This is a known gap. For Snyk integration:
1. Install: `npm install -g snyk`
2. Auth: `snyk auth <token>`
3. Test: `snyk test --severity-threshold=high`
4. Monitor: `snyk monitor`

## Security Checklist

### Code Level
- [ ] No hardcoded credentials or API keys
- [ ] No SQL injection vectors (use parameterized queries)
- [ ] No XSS vulnerabilities (sanitize all user input)
- [ ] No insecure deserialization
- [ ] No path traversal risks
- [ ] No command injection vectors
- [ ] All secrets in environment variables, never in code

### Infrastructure Level
- [ ] HTTPS enforced everywhere
- [ ] Authentication mechanisms verified
- [ ] Access control lists reviewed
- [ ] Rate limiting configured
- [ ] Logging and monitoring enabled
- [ ] CORS configured correctly
- [ ] CSP headers set

### Dependency Level
- [ ] `pnpm audit --audit-level=high` passes
- [ ] No known CVEs in dependencies
- [ ] No outdated critical packages
- [ ] License compliance checked

### Deployment Level
- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] No sensitive data in build output
- [ ] Health check endpoint available

## Severity Levels

| Level | Description | Action | SLA |
|-------|-------------|--------|-----|
| **Critical** | Immediate threat, data breach risk | Fix immediately, block deploy | < 1 hour |
| **High** | Significant risk, auth bypass | Fix within 24 hours | < 24 hours |
| **Medium** | Moderate risk, info disclosure | Fix within week | < 7 days |
| **Low** | Minor risk, best practice | Fix when possible | Next sprint |

## Local Security Commands

```powershell
# Dependency audit
pnpm audit --audit-level=high

# Check for outdated dependencies
pnpm outdated

# Run CodeQL locally (if installed)
codeql database analyze --format=sarif-latest --output=results.sarif

# Snyk test (when installed)
snyk test --severity-threshold=high
snyk monitor
```

## CI Security Gates

The CI pipeline has three security gates:

1. **CodeQL Analysis** — Static analysis for vulnerabilities
2. **Dependency Audit** — `pnpm audit --audit-level=high`
3. **Vercel Environment** — Secrets managed in Vercel dashboard

**All three must pass before production deployment.**

## Agent Delegation

- **Security audit** → Breaking Ben (GLM 5.1)
- **Deep security review** → Sal the Shield (on demand)
- **Dependency audit** → Breaking Ben or automated CI

## Report Format

```markdown
## Security Audit Report

**Date:** [Date]
**Scope:** [Application/Repository]
**Severity:** Critical / High / Medium / Low

### Summary
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

### Findings
1. **[Title]** — [Severity]
   - Location: [file:line]
   - Description: [description]
   - Remediation: [fix steps]
   - Status: [open/fixed/accepted risk]
```

## Completion Output

Return:
- findings
- changes or recommendations
- evidence
- unresolved risks
- explicit pass/fail status where applicable