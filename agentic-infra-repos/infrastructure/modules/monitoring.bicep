# Azure Monitoring Module
param location string = resourceGroup().location
param projectName string
param environment string

param enableApplicationInsights bool = true
param enableLogAnalytics bool = true
param retentionInDays int = 30

# Azure Log Analytics Workspace (Free Tier)
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-01-01' = {
  name: '${projectName}-workspace-${environment}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  retentionInDays: retentionInDays
  properties: {
    sku: {
      name: 'Free'
    }
    enableLogAccessUsingReadPermission: true
  }
}

# Azure Monitor Application Insights
resource applicationInsights 'Microsoft.Insights/components@2023-01-01' = {
  name: '${projectName}-ai-${environment}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResource: logAnalyticsWorkspace.id
  }
  condition: enableApplicationInsights
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

# Azure Monitor Workbook for dashboards
resource monitorWorkbook 'Microsoft.Insights/workbooks@2023-01-01' = {
  name: '${projectName}-monitor-${environment}'
  location: location
  properties: {
    displayName: '${projectName} Infrastructure Dashboard'
    category: 'workbook'
    revision: '1'
    workbookDisplayName: '${projectName} Infrastructure Dashboard'
  }
  condition: enableApplicationInsights
}

# Azure Monitor Alert Rules
resource cpuAlertRule 'Microsoft.Insights/metricAlerts@2023-01-01' = {
  name: '${projectName}-cpu-alert-${environment}'
  location: location
  properties: {
    description: 'High CPU usage alert'
    severity: '3'
    enabled: true
    scopes: [
      resourceId('Microsoft.OperationalInsights/workspaces', logAnalyticsWorkspace.name)
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      allOf: [
        {
          metricName: 'Percentage CPU'
          metricNamespace: 'Microsoft.Compute/virtualMachines'
          operator: 'GreaterThan'
          threshold: 80
          timeAggregation: 'Average'
        }
      ]
    }
  }
}

# Azure Monitor Alert Rules for memory
resource memoryAlertRule 'Microsoft.Insights/metricAlerts@2023-01-01' = {
  name: '${projectName}-memory-alert-${environment}'
  location: location
  properties: {
    description: 'High memory usage alert'
    severity: '3'
    enabled: true
    scopes: [
      resourceId('Microsoft.OperationalInsights/workspaces', logAnalyticsWorkspace.name)
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      allOf: [
        {
          metricName: 'Available Memory Bytes'
          metricNamespace: 'Microsoft.Compute/virtualMachines'
          operator: 'LessThan'
          threshold: 1073741824
          timeAggregation: 'Average'
        }
      ]
    }
  }
}

# Azure Monitor Alert Rules for storage
resource storageAlertRule 'Microsoft.Insights/metricAlerts@2023-01-01' = {
  name: '${projectName}-storage-alert-${environment}'
  location: location
  properties: {
    description: 'High storage usage alert'
    severity: '3'
    enabled: true
    scopes: [
      resourceId('Microsoft.OperationalInsights/workspaces', logAnalyticsWorkspace.name)
    ]
    evaluationFrequency: 'PT10M'
    windowSize: 'PT30M'
    criteria: {
      allOf: [
        {
          metricName: 'Percentage Used'
          metricNamespace: 'Microsoft.Storage/storageAccounts'
          operator: 'GreaterThan'
          threshold: 85
          timeAggregation: 'Maximum'
        }
      ]
    }
  }
}

output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id
output logAnalyticsWorkspaceName string = logAnalyticsWorkspace.name
output applicationInsightsKey string = applicationInsights.InstrumentationKey
output applicationInsightsName string = applicationInsights.name
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.vaultUri
output monitorWorkbookId string = monitorWorkbook.id