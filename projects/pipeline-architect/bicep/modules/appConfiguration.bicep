// App Configuration Module - Centralized Configuration Management

@description('Name of the App Configuration store')
param name string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object

@description('SKU tier (free, standard)')
@allowed(['free', 'standard'])
param sku string

@description('Key Vault Resource ID for referencing secrets')
param keyVaultId string

// App Configuration Store
resource appConfig 'Microsoft.AppConfiguration/configurationStores@2023-09-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    encryption: {}
    disableLocalAuth: false
    softDeleteRetentionInDays: 7
    enablePurgeProtection: false
  }
}

// Configuration Values
resource configValues 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-09-01-preview' = {
  parent: appConfig
  name: 'Application:Name'
  properties: {
    value: 'MyApplication'
    contentType: 'text/plain'
    tags: tags
  }
}

// Feature Flags
resource featureFlag 'Microsoft.AppConfiguration/configurationStores/keyValues@2023-09-01-preview' = {
  parent: appConfig
  name: '.appconfig.featureflag~2FNewFeature'
  properties: {
    value: '{\"id\":\"NewFeature\",\"description\":\"My new feature\",\"enabled\":false,\"conditions\":{\"client_filters\":[]}}'
    contentType: 'application/vnd.microsoft.appconfig.ff+json;charset=utf-8'
    tags: tags
  }
}

// ═══════════════════════════════════════════════════════════════
// OUTPUTS
// ═══════════════════════════════════════════════════════════════

output appConfigId string = appConfig.id
output appConfigName string = appConfig.name
output appConfigEndpoint string = appConfig.properties.endpoint
output appConfigPrincipalId string = appConfig.identity.principalId
