# Bicep DevOps Pipeline - Setup Guide

## 📋 Overview

This guide walks you through setting up the Azure DevOps pipeline for automated Bicep infrastructure deployments with validation, security scanning, what-if analysis, approval gates, and multiple deployment strategies.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GIT REPOSITORY                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Branch: feature/*  →  develop  →  main (production)     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE DEVOPS PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│   Stage 1: Validation                                          │
│   ├── ☐ Lint Bicep Templates                                   │
│   └── ☐ Build and Compile                                      │
│                                                                │
│   Stage 2: Security Scan                                       │
│   ├── ☐ Template Analyzer (SARIF)                              │
│   └── ☐ Checkov Scan                                           │
│                                                                │
│   Stage 3: Preview (What-If)                                   │
│   ├── ☐ Development                                            │
│   ├── ☐ Staging                                                │
│   └── ☐ Production                                             │
│                                                                │
│   Stage 4: Approval Gate (Prod Only)                           │
│   └── ☐ Manual Approval                                        │
│                                                                │
│   Stage 5: Deployment                                          │
│   ├── ☐ Development (Auto)                                     │
│   ├── ☐ Staging (Auto)                                         │
│   └── ☐ Production (Approved)                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Azure CLI | 2.50+ | Deployment and interaction with Azure |
| Bicep CLI | 0.20+ | Template compilation and validation |
| PowerShell | 7.0+ | Script execution |
| Git | 2.30+ | Source control |

### Azure Resources Required

1. **Azure DevOps Organization** with active subscription
2. **Azure Subscription** with appropriate permissions
3. **Service Principal** for pipeline authentication
4. **Variable Group** for environment-specific variables

## 📦 Repository Structure

```
pipeline-architect/
├── bicep/
│   ├── main.bicep              # Root deployment template
│   └── modules/
│       ├── monitoring.bicep    # Log Analytics & App Insights
│       ├── keyvault.bicep      # Key Vault configuration
│       ├── networking.bicep    # VNet, NSGs, Subnets
│       ├── sqlDatabase.bicep   # SQL Server & Database
│       ├── appConfiguration.bicep # App Config Service
│       └── appService.bicep    # App Service Plan & Web App
├── parameters/
│   ├── dev.parameters.json     # Development parameters
│   ├── staging.parameters.json # Staging parameters
│   └── production.parameters.json # Production parameters
├── pipelines/
│   └── azure-pipelines.yml     # Main pipeline definition
├── scripts/
│   ├── setup-environment.ps1   # Environment setup script
│   └── validate-bicep.ps1      # Local validation script
└── docs/
    └── SETUP-GUIDE.md          # This file
```

## 🔧 Step-by-Step Setup

### Step 1: Create Service Connections

#### Development Service Connection

```powershell
# Run in Azure Cloud Shell or with Azure CLI authenticated
New-AzADServicePrincipal -DisplayName "bicep-pipeline-dev" `
                         -RoleDefinitionName "Contributor" `
                         -Scope "/subscriptions/{dev-subscription-id}"
```

#### Staging Service Connection

```powershell
New-AzADServicePrincipal -DisplayName "bicep-pipeline-staging" `
                         -RoleDefinitionName "Contributor" `
                         -Scope "/subscriptions/{staging-subscription-id}"
```

#### Production Service Connection

```powershell
New-AzADServicePrincipal -DisplayName "bicep-pipeline-prod" `
                         -RoleDefinitionName "Contributor" `
                         -Scope "/subscriptions/{prod-subscription-id}"
```

### Step 2: Configure Service Connections in Azure DevOps

1. Navigate to **Project Settings** → **Service Connections**
2. Click **New Service Connection** → **Azure Resource Manager**
3. Select **Service Principal (manual)**
4. Enter credentials for each environment

### Step 3: Create Variable Group

Navigate to **Pipelines** → **Library** → **+ Variable Group**

Variable Group Name: `bicep-deployment-variables`

| Variable | Dev Value | Staging Value | Production Value | Secret |
|----------|-----------|---------------|------------------|--------|
| `azureServiceConnection` | `dev-connection` | `staging-connection` | `prod-connection` | No |
| `azureDevServiceConnection` | `dev-connection` | `dev-connection` | `prod-connection` | No |
| `azureStagingServiceConnection` | `staging-connection` | `staging-connection` | `prod-connection` | No |
| `azureProdServiceConnection` | X | `staging-connection` | `prod-connection` | No |
| `devLocation` | `eastus` | `eastus` | `eastus` | No |
| `stagingLocation` | `eastus` | `eastus` | `eastus` | No |
| `prodLocation` | X | `eastus` | `eastus` | No |
| `productionApprovers` | "admin@contoso.com" | "admin@contoso.com" | "admin@contoso.com" | No |
| `deploymentMode` | `Incremental` | `Incremental` | `Incremental` | No |
| `enableRollback` | `false` | `true` | `true` | No |

### Step 4: Create Environments

In Azure DevOps:

1. Navigate to **Pipelines** → **Environments** → **New Environment**
2. Create the following environments with approvals:

| Environment | Required Approvers |
|-------------|-------------------|
| Development | None (auto) |
| Staging | None (auto) |
| Production | Platform Team Members (2 required) |

### Step 5: Configure Pipeline Permissions

1. Go to **Project Settings** → **Pipelines** → **Settings**
2. Ensure "Permit access to all pipelines" is enabled for the variable group

## 📝 Parameter File Configuration

### Development (dev.parameters.json)

```json
{
  "environment": "dev",
  "location": "eastus",
  "projectName": "your-project",
  "enableZoneRedundancy": false,
  "logRetentionDays": 30
}
```

### Staging (staging.parameters.json)

```json
{
  "environment": "staging",
  "location": "eastus",
  "projectName": "your-project",
  "enableZoneRedundancy": true,
  "logRetentionDays": 60
}
```

### Production (production.parameters.json)

```json
{
  "environment": "production",
  "location": "eastus",
  "projectName": "your-project",
  "enableZoneRedundancy": true,
  "logRetentionDays": 90
}
```

## 🏃 Running the Pipeline

### Option 1: Automatic Trigger

The pipeline automatically triggers on:
- Push to `main` → Full deployment with approval gates
- Push to `develop` → Dev deployment only
- Push to `feature/*` → Validation only
- Pull request to `main` or `develop` → Validation only

### Option 2: Manual Trigger

1. Navigate to **Pipelines** → **Pipelines**
2. Select your pipeline
3. Click **Run Pipeline**
4. Select branch and options
5. Click **Run**

### Option 3: Azure CLI

```bash
# Trigger pipeline manually
az pipelines run --name "bicep-infrastructure-pipeline" \
                 --branch main \
                 --variables "deploymentMode=Complete"
```

## 🔍 Pipeline Stages Explained

### Stage 1: Validation

**Purpose**: Ensure Bicep templates are syntactically correct and compile successfully.

**Steps**:
1. Install Bicep CLI
2. Lint all `.bicep` files
3. Compile to ARM JSON
4. Publish compiled artifacts

**Failure handling**: Pipeline stops if validation fails.

### Stage 2: Security Scan

**Purpose**: Detect security vulnerabilities in infrastructure code.

**Tools**:
- **Microsoft Template Analyzer**: Microsoft-provided security scanning
- **Checkov**: Open-source IaC security scanner

**Reports**: SARIF format output for integration with Azure Security Center.

### Stage 3: Preview (What-If)

**Purpose**: Preview changes before actual deployment.

**Capabilities**:
- Shows resources to be created/modified/deleted
- Detects destructive changes
- Reports drift from current state

**Warning Levels**:
- 🟡 **Medium**: Warning logged, deployment continues
- 🔴 **High**: Pipeline may block based on configuration

### Stage 4: Approval Gate

**Purpose**: Prevent accidental production deployments.

**Configuration**:
- Requires explicit approval for Production
- Maximum 48-hour timeout
- Can be bypassed by administrators in emergencies

### Stage 5: Deployment

**Deployment Modes**:
| Mode | Behavior | Use Case |
|------|----------|----------|
| **Incremental** | Adds/updates resources without deleting | Standard deployments |
| **Complete** | Exact match to template - deletes extras | Cleanup, disaster recovery |

## 🛠️ Troubleshooting

### Common Issues

#### Issue: "Service connection not found"

**Solution**: Verify service connection name matches variable group configuration.

#### Issue: "Bicep lint failed"

**Solution**: Check for deprecated syntax; use latest Bicep CLI.

#### Issue: "What-If times out"

**Solution**: 
- Large environments may require extended timeout
- Increase `timeoutInMinutes` in deployment task

#### Issue: "Approval gate not triggering"

**Solution**: 
- Verify environment names match between pipeline and approvals
- Check branch conditions in pipeline YAML

### Pipeline Logs

Access logs at: **Pipeline Run** → **Logs**

Key log files:
- `validation/validation.log`
- `security/template-analyzer.log`
- `deploy/what-if-output.json`

## 🔐 Security Considerations

1. **Service Principal Rotation**: Rotate credentials every 90 days
2. **Approval Gates**: Never disable for production
3. **What-If Analysis**: Always review before production deployment
4. **Secrets**: Store in Key Vault, never in parameter files
5. **Network Security**: Private Link enabled in production

## 📊 Monitoring

### Pipeline Metrics

Track:
- Deployment success rate
- Average deployment duration
- Security scan findings
- What-If change counts

### Azure Monitor Dashboard

Create a dashboard with:
- Resource deployment logs
- Application Insights availability
- SQL Database metrics
- Key Vault access logs

## 📈 Advanced Configuration

### Custom Deployment Strategies

Edit `deploymentMode` variable:

| Strategy | Description |
|----------|-------------|
| Blue-Green | Deploy to secondary slot, swap |
| Canary | Deploy to subset of instances |
| Rolling | Update resources incrementally |

### Adding New Environments

1. Create new parameter file: `parameters/{env}.parameters.json`
2. Add environment variable in variable group
3. Add stage in pipeline YAML
4. Configure approvals for the new environment

## 📄 License

This pipeline template is provided as-is. Review and adapt security practices to match your organization's requirements.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: Platform Engineering Team
