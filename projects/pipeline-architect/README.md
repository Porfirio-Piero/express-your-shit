# Pipeline Architect

[![Azure](https://img.shields.io/badge/Azure-DevOps-blue.svg)](https://azure.microsoft.com)
[![Bicep](https://img.shields.io/badge/IaC-Bicep-purple.svg)](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready Azure DevOps pipeline for Bicep infrastructure deployments with validation, security scanning, and approval gates.

## Purpose

Infrastructure as Code requires rigorous validation before production deployment. This pipeline:

1. Validates Bicep templates for syntax and best practices
2. Scans for security vulnerabilities (Checkov, Template Analyzer)
3. Generates what-if deployment previews
4. Detects destructive changes before deployment
5. Enforces approval gates for staging and production

## Quick Start

```bash
git clone https://github.com/Porfirio-Piero/pipeline-architect.git
cd pipeline-architect

# Validate Bicep locally
./scripts/validate-bicep.ps1

# Deploy pipeline to Azure DevOps
# See docs/SETUP-GUIDE.md for detailed instructions
```

## Pipeline Stages

| Stage | Purpose | Gates |
|-------|---------|-------|
| Validation | Bicep lint + compile | Auto |
| Security | Checkov + Template Analyzer | Auto |
| Preview | What-If analysis per environment | Auto |
| Approval | Manual review for Prod | Required |
| Deploy Dev | Incremental deployment | Auto |
| Deploy Staging | Pre-production | Auto |
| Deploy Prod | Production | Manual approval |

## Architecture

```
pipeline-architect/
├── pipelines/
│   └── azure-pipelines.yml    # Main pipeline definition
├── bicep/
│   ├── main.bicep             # Entry template
│   └── modules/               # Reusable components
├── parameters/                # Environment configs
│   ├── dev.parameters.json
│   ├── staging.parameters.json
│   └── prod.parameters.json
├── scripts/                   # Local validation
│   ├── validate-bicep.ps1
│   └── what-if.ps1
└── docs/
    └── SETUP-GUIDE.md         # Complete setup instructions
```

## Bicep Modules

| Module | Resources | Purpose |
|--------|-----------|---------|
| monitoring | Log Analytics, App Insights | Observability baseline |
| keyvault | Key Vault, RBAC | Secrets management |
| networking | VNet, subnets, NSGs | Network foundation |
| sqldb | SQL Server, DB, geo-replication | Data persistence |
| appconfig | App Configuration, feature flags | Runtime configuration |
| appservice | Web Apps, deployment slots | Application hosting |

## Security Scanning

### Checkov

Scans for 750+ policy violations:
- Encryption at rest/transit
- Public access misconfigurations
- Privilege escalation risks
- Compliance (SOC2, PCI-DSS, etc.)

### Template Analyzer

Microsoft's Bicep linter:
- Best practice violations
- API version deprecations
- Resource naming conventions

## What-If Analysis

Generates preview of changes:

```
Resources to create:   3
Resources to update:   2
Resources to delete:   0
Destructive changes:   None detected
```

Blocks deployment if destructive changes detected in production.

## Parameters

Environment-specific values in `parameters/`:

```json
{
  "environment": "prod",
  "location": "eastus",
  "sqlSku": "S2",
  "appServicePlanSku": "P1v2",
  "enableGeoReplication": true
}
```

## Setup

See `docs/SETUP-GUIDE.md` for:
- Azure DevOps project configuration
- Service connection setup
- Variable group creation
- Pipeline import steps
- Environment protection rules

## Local Validation

```powershell
# Validate syntax
./scripts/validate-bicep.ps1

# Preview changes
./scripts/what-if.ps1 -Environment dev
```

## Approval Gates

Production deployments require:
- Minimum 1 approver
- No destructive changes in what-if
- Security scan passed
- All previous stages successful

## License

MIT License - See LICENSE file
