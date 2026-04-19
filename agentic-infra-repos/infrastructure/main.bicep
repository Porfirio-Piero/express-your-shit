# Azure Bicep Template for Agentic Infrastructure
# Using Azure Free Tier services

param location string = resourceGroup().location
param environment string = 'dev'
param projectName string = 'agentic-infra'

# Azure Storage Account for logs and static content
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${projectName}st${environment}001'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

# Azure App Service Plan (Free Tier)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${projectName}-plan-${environment}'
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
    size: 'F1'
    family: 'F'
    capacity: 1
  }
  kind: 'app'
  properties: {
    reserved: false
    targetWorkerCount: 1
    targetWorkerSizeId: 1
  }
}

# Azure App Service for web hosting
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${projectName}-web-${environment}'
  location: location
  kind: 'app'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '18.x'
        }
      ]
      connectionStrings: []
      http20Enabled: true
    }
    clientCertEnabled: false
    clientCertMode: 'Required'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

# Azure Function App for automation
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${projectName}-func-${environment}'
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '18.x'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

# Azure Key Vault for secrets (Free Tier)
resource keyVault 'Microsoft.KeyVault/vaults@2023-01-01' = {
  name: '${projectName}-kv-${environment}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enablePurgeProtection: true
    enableSoftDelete: true
    enableTemplateDeployment: true
    enableVmProtection: false
    vaultUri: 'https://${projectName}-kv-${environment}.vault.azure.net/'
    skuName: 'standard'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
      ipRules: []
      virtualNetworkRules: []
    }
  }
}

# Azure Monitor Application Insights
resource applicationInsights 'Microsoft.Insights/components@2023-01-01' = {
  name: '${projectName}-ai-${environment}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResource: reference('${projectName}-workspace-${environment}').id
  }
}

# Azure Log Analytics Workspace (Free Tier)
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-01-01' = {
  name: '${projectName}-workspace-${environment}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  retentionInDays: 30
  properties: {
    sku: {
      name: 'Free'
    }
    enableLogAccessUsingReadPermission: true
  }
}

# Output values for use in other resources
output storageAccountName string = storageAccount.name
output webAppUrl string = 'https://${webApp.name}.azurewebsites.net'
output functionAppUrl string = 'https://${functionApp.name}.azurewebsites.net'
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.vaultUri
output appInsightsInstrumentationKey string = applicationInsights.InstrumentationKey