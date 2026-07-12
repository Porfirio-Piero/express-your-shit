---
name: security
description: Security auditing, vulnerability scanning, and hardening. Uses CodeQL + pnpm audit in CI/CD pipeline. Snyk integration pending.
version: 2.0
last_updated: 2026-07-12
---

# Security Audit Agent

## Purpose
Analyze code and infrastructure for security vulnerabilities, enforce security best practices, and generate security reports.

## Triggers
- User asks to "audit security", "check for vulnerabilities", "scan for issues"
- User mentions "security", "vulnerability", "CVE", "OWASP"
- User needs compliance checking
- User wants security hardening

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

Pipeline Summary Job:
  - Aggregates CI + CodeQL + Audit results
  - All must pass for production deploy
```

**⚠️ Snyk Gap:** Snyk is NOT yet installed. To integrate:
1. `npm install -g snyk`
2. `snyk auth <token>`
3. `snyk test --severity-threshold=high`
4. `snyk monitor`

## Security Workflow

1. **Code Analysis** — Scan for hardcoded secrets, SQL injection, XSS, insecure deserialization, path traversal, command injection
2. **Infrastructure Scan** — Check firewall rules, encryption, access controls, authentication
3. **Dependency Audit** — Check for known CVEs, identify outdated packages, recommend updates
4. **Report Generation** — Prioritize by severity, provide remediation steps, include compliance mappings

## Security Checks

### Code Level
- Hardcoded credentials/api keys
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Insecure deserialization
- Path traversal risks
- Command injection

### Infrastructure Level
- Open ports and services
- SSL/TLS configuration
- Authentication mechanisms
- Access control lists
- CORS configuration
- CSP headers
- Rate limiting

### Dependency Level
- Known CVEs
- Outdated packages
- License compliance
- Malicious packages

### Deployment Level
- Environment variables set in Vercel (not in code)
- `.env` files in `.gitignore`
- No sensitive data in build output
- Health check endpoint available

## Severity Levels

| Level | Description | Action | SLA |
|-------|-------------|--------|-----|
| **Critical** | Immediate threat, data breach | Fix immediately, block deploy | < 1 hour |
| **High** | Significant risk, auth bypass | Fix within 24 hours | < 24 hours |
| **Medium** | Moderate risk, info disclosure | Fix within week | < 7 days |
| **Low** | Minor risk, best practice | Fix when possible | Next sprint |

## Local Security Commands

```powershell
# Dependency audit
pnpm audit --audit-level=high

# Check for outdated dependencies
pnpm outdated

# Snyk test (when installed)
snyk test --severity-threshold=high
snyk monitor

# Run CodeQL locally (if installed)
codeql database analyze --format=sarif-latest --output=results.sarif
```

## Report Format

```markdown
## Security Audit Report

**Date:** [Date]
**Scope:** [Application/Repository]

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

## Agent Delegation

- **Security audit** → Breaking Ben (GLM 5.1)
- **Deep security review** → Sal the Shield (on demand)
- **Dependency audit** → Breaking Ben or automated CI

## Tools Used

- `exec` — Run security scanners
- `read` — Analyze code files
- `write` — Generate reports

---

**Version:** 2.0
**Last Updated:** July 2026