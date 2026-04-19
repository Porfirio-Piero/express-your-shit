// Main Bicep Deployment Template
// This template demonstrates best practices for IaC deployments

targetScope = 'subscription'

// ═══════════════════════════════════════════════════════════════
// PARAMETERS
// ═══════════════════════════════════════════════════════════════

@description('Environment name (dev, staging, production)')
@allowed(['dev', 'staging', 'production'])
param environment string

@description('Primary Azure region for deployment')
param location string

@description('Secondary Azure region for disaster recovery')
param secondaryLocation string = location

@description('Project name used in resource naming')
param projectName string

@description('Tags to apply to all resources')
param tags object = {
  environment: environment
  project: projectName
  managedBy: 'bicep'
  lastDeployed: utcNow('yyyy-MM-dd')
}

@description('Enable diagnostic logging')
param enableDiagnostics bool = true

@description('Log analytics workspace retention in days')
@minValue(30)
@maxValue(730)
param logRetentionDays int = 90

@description('SQL Database SKU name')
param sqlDatabaseSkuName string = 'S0'

@description('SQL Database tier')
param sqlDatabaseTier string = 'Standard'

@description('Enable zone redundancy')
param enableZoneRedundancy bool = false

// ═══════════════════════════════════════════════════════════════
// VARIABLES
// ═══════════════════════════════════════════════════════════════

var resourceGroupName = 'rg-${projectName}-${environment}'
var resourceGroupNameSecondary = 'rg-${projectName}-${environment}-dr'
var keyVaultName = 'kv-${projectName}-${environment}-${uniqueString(subscription().id, environment)}'
var sqlServerName = 'sql-${projectName}-${environment}-${uniqueString(subscription().id, environment)}'
var appConfigName = 'appconfig-${projectName}-${environment}'
var logAnalyticsName = 'log-${projectName}-${environment}'
var appInsightsName = 'appi-${projectName}-${environment}'

// Environment-specific configurations
var environmentConfig = {
  dev: {
    enableZoneRedundancy: false
    enablePrivateLink: false
    backupRetentionDays: 7
    logRetentionDays: 30
    sqlDatabaseSku: {
      name: 'S0'
      tier: 'Standard'
    }
    appServicePlanSku: {
      name: 'B1'
      tier: 'Basic'
      size: 'B1'
    }
  }
  staging: {
    enableZoneRedundancy: true
    enablePrivateLink: true
    backupRetentionDays: 14
    logRetentionDays: 60
    sqlDatabaseSku: {
      name: 'S1'
      tier: 'Standard'
    }
    appServicePlanSku: {
      name: 'S1'
      tier: 'Standard'
      size: 'S1'
    }
  }
  production: {
    enableZoneRedundancy: true
    enablePrivateLink: true
    backupRetentionDays: 35
    logRetentionDays: 90
    sqlDatabaseSku: {
      name: 'S2'
      tier: 'Standard'
    }
    appServicePlanSku: {
      name: 'P1v2'
      tier: 'PremiumV2'
      size: 'P1v2'
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// RESOURCE GROUPS
// ═══════════════════════════════════════════════════════════════

resource primaryResourceGroup 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: tags
  managedBy: 'bicep'
}

// Secondary resource group for DR (only in staging/prod)
resource secondaryResourceGroup 'Microsoft.Resources/resourceGroups@2023-07-01' = if (environment != 'dev') {
  name: resourceGroupNameSecondary
  location: secondaryLocation
  tags: tags
}

// ═══════════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════════

// Monitoring & Logging
module monitoring './modules/monitoring.bicep' = {
  name: 'monitoringDeployment'
  scope: primaryResourceGroup
  params: {
    logAnalyticsName: logAnalyticsName
    appInsightsName: appInsightsName
    location: location
    tags: tags
    logRetentionDays: logRetentionDays
    environment: environment
  }
}

// Key Vault (Centralized Secrets Management)
module keyVault './modules/keyvault.bicep' = {
  name: 'keyVaultDeployment'
  scope: primaryResourceGroup
  params: {
    name: keyVaultName
    location: location
    tags: tags
    environment: environment
    enablePurgeProtection: environment == 'production'
    logAnalyticsId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// Networking (VNet, NSGs, etc.)
module networking './modules/networking.bicep' = {
  name: 'networkingDeployment'
  scope: primaryResourceGroup
  params: {
    vnetName: 'vnet-${projectName}-${environment}'
    location: location
    tags: tags
    environment: environment
    enablePrivateLink: environmentConfig[environment].enablePrivateLink
  }
}

// SQL Database Server & Database
module sqlDatabase './modules/sqlDatabase.bicep' = {
  name: 'sqlDatabaseDeployment'
  scope: primaryResourceGroup
  params: {
    serverName: sqlServerName
    databaseName: 'db-${projectName}-${environment}'
    location: location
    secondaryLocation: secondaryLocation
    tags: tags
    environment: environment
    skuName: sqlDatabaseSkuName
    tier: sqlDatabaseTier
    zoneRedundancy: enableZoneRedundancy || environmentConfig[environment].enableZoneRedundancy
    backupRetentionDays: environmentConfig[environment].backupRetentionDays
    enableGeoReplication: environment != 'dev'
    logAnalyticsId: monitoring.outputs.logAnalyticsWorkspaceId
    allowedVnetId: networking.outputs.vnetId
    allowedSubnetId: networking.outputs.defaultSubnetId
  }
}

// App Configuration Service
module appConfiguration './modules/appConfiguration.bicep' = if (environment != 'dev') {
  name: 'appConfigurationDeployment'
  scope: primaryResourceGroup
  params: {
    name: appConfigName
    location: location
    tags: tags
    sku: environment == 'production' ? 'standard' : 'free'
    keyVaultId: keyVault.outputs.keyVaultId
  }
}

// App Service Plan & Web App
module appService './modules/appService.bicep' = {
  name: 'appServiceDeployment'
  scope: primaryResourceGroup
  params: {
    appServicePlanName: 'asp-${projectName}-${environment}'
    webAppName: 'app-${projectName}-${environment}'
    location: location
    tags: tags
    sku: environmentConfig[environment].appServicePlanSku
    appInsightsInstrumentationKey: monitoring.outputs.instrumentationKey
    connectionStrings: [
      {
        name: 'DefaultConnection'
        type: 'SQLAzure'
        value: 'Server=tcp:${sqlDatabase.outputs.sqlServerFqdn},1433;Initial Catalog=${sqlDatabase.outputs.databaseName};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Authentication=Active Directory Default;'
      }
    ]
    appSettings: {
      'ASPNETCORE_ENVIRONMENT': environment
      'APPLICATIONINSIGHTS_CONNECTION_STRING': monitoring.outputs.connectionString
      'KeyVault__Url': keyVault.outputs.keyVaultUri
    }
    vnetIntegration: {
      id: networking.outputs.vnetId
      subnetId: networking.outputs.webAppSubnetId
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// OUTPUTS
// ═══════════════════════════════════════════════════════════════

output resourceGroupName string = primaryResourceGroup.name
output resourceGroupId string = primaryResourceGroup.id
output keyVaultUri string = keyVault.outputs.keyVaultUri
output keyVaultId string = keyVault.outputs.keyVaultId
output sqlServerFqdn string = sqlDatabase.outputs.sqlServerFqdn
output databaseName string = sqlDatabase.outputs.databaseName
output appInsightsName string = monitoring.outputs.appInsightsName
output appInsightsInstrumentationKey string = monitoring.outputs.instrumentationKey
output webAppHostname string = appService.outputs.webAppHostname
output webAppPrincipalId string = appService.outputs.webAppPrincipalId
