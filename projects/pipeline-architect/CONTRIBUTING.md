# Contributing Guidelines

Thank you for considering contributing to the Bicep DevOps Pipeline project!

## 📋 Prerequisites

Before contributing:

1. Read the [Setup Guide](docs/SETUP-GUIDE.md)
2. Run local validation: `./scripts/validate-bicep.ps1`
3. Test against at least one environment

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Validate Locally

```powershell
# Lint and build
./scripts/validate-bicep.ps1 -Environment "dev" -Lint -Build

# Run security scan
./scripts/validate-bicep.ps1 -Environment "dev" -SecurityScan

# What-if (requires Azure login)
./scripts/validate-bicep.ps1 -Environment "dev" -WhatIf -SubscriptionId "your-sub-id"
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## 📝 Commit Message Format

We follow conventional commits:

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Code style (formatting) |
| `refactor:` | Code refactoring |
| `test:` | Test changes |
| `chore:` | Maintenance tasks |

Examples:
- `feat: add private endpoint support to Key Vault`
- `fix: resolve SQL firewall rule conflict`
- `docs: update README with new parameters`

## 🏗️ Module Development Standards

### Module Structure

```bicep
// Header comment with description

// Parameters (sorted alphabetically)

// Variables (sorted by usage)

// Resources (ordered by dependencies)

// Outputs (sorted alphabetically)
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Parameters | camelCase | `serverName` |
| Variables | camelCase | `webAppName` |
| Resources | TitleCase | `sqlServer` |
| Outputs | camelCase | `webAppId` |

### Required Annotations

Every parameter should have:

```bicep
@description('Clear description of the parameter')
@allowed(['value1', 'value2'])  // If applicable
param exampleParam string
```

## ✅ Pull Request Checklist

- [ ] All Bicep files pass linting
- [ ] Security scan returns no critical/high findings
- [ ] Documentation updated
- [ ] Parameter files updated if parameters changed
- [ ] Local validation successful
- [ ] No breaking changes (or explicitly documented)

## 🐛 Reporting Issues

When reporting issues, include:

1. **Environment**: Which environment (dev/staging/prod)
2. **Issue Type**: Bug/Feature Request/Question
3. **Reproduction Steps**: How to reproduce
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Logs**: Relevant pipeline logs

## 🔒 Security

- Never commit secrets or credentials
- Use Key Vault references for sensitive data
- Run security scans before submitting PRs
- Follow least privilege principle

## 📊 Testing

### Unit Testing

Validate individual modules:

```bash
bicep build ./bicep/modules/your-module.bicep
```

### Integration Testing

Test full deployment:

```bash
./scripts/setup-environment.ps1 \
    -Environment "dev" \
    -SubscriptionId "your-sub-id" \
    -ProjectName "test-project" \
    -Validate
```

## 🎨 Code Style

- Use 2 spaces for indentation
- Maximum line length: 120 characters
- Add blank lines between logical sections
- Use clear, descriptive names

## 📖 Resources

- [Bicep Best Practices](https://docs.microsoft.com/azure/azure-resource-manager/bicep/best-practices)
- [Azure DevOps Pipelines](https://docs.microsoft.com/azure/devops/pipelines/)
- [Azure Architecture Center](https://docs.microsoft.com/azure/architecture/)

## 📧 Contact

For questions or discussion:
- Open an issue
- Contact: platform-team@yourorg.com

---

Thank you for contributing! 🚀
