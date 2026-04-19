# Agentic Infrastructure Repositories - Azure DevOps

Complete Azure DevOps repository with Bicep templates for deploying Agentic Infrastructure using Azure Free Tier services.

## 🏗️ Repository Structure

```
agentic-infra-repos/
├── infrastructure/
│   ├── main.bicep                 # Main Bicep template
│   ├── modules/
│   │   ├── storage.bicep          # Storage Account module
│   │   ├── networking.bicep       # Virtual Network & NSG modules
│   │   ├── compute.bicep          # App Services & Functions module
│   │   └── monitoring.bicep       # Key Vault, App Insights, Log Analytics
│   └── parameters/
│       ├── dev.parameters.json    # Development environment
│       ├── qa.parameters.json     # Quality Assurance environment
│       ├── stage.parameters.json  # Staging environment
│       └── prod.parameters.json   # Production environment
├── pipelines/
│   └── deploy-infra.yml           # Azure DevOps pipeline with validation gates
├── scripts/
│   ├── validate-bicep.ps1         # Bicep validation and linting
│   └── what-if-analysis.ps1       # What-If analysis script
└── README.md                      # This file
```

## 🎯 Azure Free Services Used

- **Azure DevOps** - Pipelines, Repos, Boards
- **Azure Storage Accounts** - Hot/Cool tiers, Blob storage
- **Azure App Service (Free Tier)** - F1 instances
- **Azure Functions** - Consumption plan
- **Azure Monitor (Free Tier)** - Application Insights
- **Azure Key Vault** - Free tier secrets management
- **Azure Log Analytics** - Free tier (5GB/day, 30-day retention)
- **Azure Virtual Network** - Basic networking
- **Azure Network Security Groups** - Basic security

## 🔐 Security Features

- ✅ **HTTPS Enforcement** - All web endpoints require HTTPS
- ✅ **TLS 1.2+ Enforced** - Minimum TLS version enforcement
- ✅ **System Managed Identity** - Automatic identity management
- ✅ **Network Security Groups** - Firewall rules and access control
- ✅ **Key Vault Integration** - Centralized secrets management
- ✅ **Resource Tagging** - Environment and compliance tagging

## 🛠️ Pipeline Validation Gates

### 1. **Validation Stage**
- Bicep Lint validation
- Schema validation
- Resource naming convention checks
- Cost estimation warnings
- Security compliance checks

### 2. **What-If Analysis**
- Preview deployment changes
- Detect destructive operations
- Provide detailed change analysis

### 3. **Deployment Stages**
- **Development** - Automatic on develop branch
- **QA** - Automatic on develop branch
- **Staging** - Automatic on develop branch
- **Production** - Manual approval required on main branch

### 4. **Post-Deployment Validation**
- Resource health checks
- Configuration validation
- Endpoint availability testing

## 🚀 Deployment Process

### Prerequisites
1. Azure DevOps organization and project
2. Azure subscription with Free Tier services enabled
3. Service connection to Azure subscription
4. Variable group: `azure-connection-variables`

### Environment Setup
1. **Resource Groups** (will be auto-created):
   - `rg-agentic-infra-dev`
   - `rg-agentic-infra-qa`
   - `rg-agentic-infra-stage`
   - `rg-agentic-infra-prod`

2. **Variable Group Configuration**:
   ```yaml
   ARM_TENANT_ID: <your-tenant-id>
   ARM_CLIENT_ID: <service-principal-client-id>
   ARM_CLIENT_SECRET: <service-principal-secret>
   ARM_SUBSCRIPTION_ID: <subscription-id>
   ```

### Deployment Triggers
- **PR to main**: Validation + What-If analysis
- **Commit to develop**: Dev → QA → Stage deployment
- **Merge to main**: Production deployment (requires approval)

## 💰 Cost Estimation

**Monthly Cost Breakdown:**
- App Service Plan (Free): $0.00
- Storage Account (LRS): ~$1.00
- Key Vault (Free): $0.00
- Log Analytics (Free): $0.00
- Virtual Network (Free): $0.00
- Network Security Groups (Free): $0.00

**Total Estimated Cost: ~$1.00/month**

## 📋 Local Development

### Prerequisites
- Azure CLI
- Bicep CLI
- PowerShell

### Local Validation
```powershell
# Validate Bicep templates
.\scripts\validate-bicep.ps1 -Environment dev

# Run What-If analysis
.\scripts\what-if-analysis.ps1 -ResourceGroupName "rg-agentic-infra-dev" -Environment dev
```

### Manual Deployment
```bash
# Login to Azure
az login
az account set --subscription <subscription-id>

# Deploy to Dev
az deployment group create \
  --resource-group rg-agentic-infra-dev \
  --template-file infrastructure/main.bicep \
  --parameters @infrastructure/parameters/dev.parameters.json
```

## 🔧 Customization

### Adding New Resources
1. Create new Bicep module in `infrastructure/modules/`
2. Reference in `infrastructure/main.bicep`
3. Update parameter files as needed
4. Add validation to pipeline

### Environment-Specific Configuration
Modify parameter files in `infrastructure/parameters/`:
- Location (region)
- Environment name
- Retention policies
- Feature flags

## 📊 Monitoring & Alerts

### Built-in Monitoring
- Application Insights for application telemetry
- Log Analytics for infrastructure monitoring
- Custom health check endpoints
- Automated alerting rules

### Alert Rules Configured
- High CPU usage (>80%)
- High memory usage (>85%)
- High disk usage (>85%)
- Service availability monitoring

## 🤝 Contributing

1. Create feature branch from `develop`
2. Implement changes with proper Bicep modules
3. Run validation locally
4. Create PR to `develop`
5. Pipeline validates and deploys to Dev/QA
6. Merge to `main` triggers production deployment

## 📚 Additional Resources

- [Azure Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure DevOps Pipelines](https://learn.microsoft.com/en-us/azure/devops/pipelines/)
- [Azure Free Services](https://azure.microsoft.com/en-us/free/)
- [Bicep Best Practices](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices)

## 🆘 Troubleshooting

### Common Issues
1. **Service Connection**: Ensure proper permissions
2. **Resource Limits**: Free tier has usage limits
3. **Location Availability**: Not all regions support free tier

### Support
- Check pipeline logs for detailed error messages
- Validate templates using local Bicep CLI
- Review Azure portal for resource status