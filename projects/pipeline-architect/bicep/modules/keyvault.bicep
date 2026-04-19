// Key Vault Module - Centralized Secrets Management

@description('Name of the Key Vault')
param name string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object

@description('Environment name')
param environment string

@description('Enable purge protection')
param enablePurgeProtection bool

@description('Log Analytics Workspace ID for diagnostics')
param logAnalyticsId string

@description('Object IDs of users/groups with admin access')
param adminObjectIds array = []

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: environment == 'production' ? 'premium' : 'standard'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: enablePurgeProtection
    publicNetworkAccess: environment == 'dev' ? 'Enabled' : 'Disabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: environment == 'dev' ? 'Allow' : 'Deny'
      ipRules: []
      virtualNetworkRules: []
    }
    provisioningState: 'Succeeded'
  }
}

// Diagnostic Settings
resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${name}-diagnostics'
  scope: keyVault
  properties: {
    workspaceId: logAnalyticsId
    logs: [
      {
        category: 'AuditEvent'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'AzurePolicyEvaluationDetails'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
    ]
  }
}

// Vault Access Policy for Admin Users (legacy - prefer RBAC)
resource adminAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = if (!empty(adminObjectIds)) {
  name: 'add'
  parent: keyVault
  properties: {
    accessPolicies: [for objectId in adminObjectIds: {
      tenantId: subscription().tenantId
      objectId: objectId
      permissions: {
        keys: [
          'Get'
          'List'
          'Update'
          'Create'
          'Import'
          'Delete'
          'Backup'
          'Restore'
          'Purge'
        ]
        secrets: [
          'Get'
          'List'
          'Set'
          'Delete'
          'Backup'
          'Restore'
          'Purge'
        ]
        certificates: [
          'Get'
          'List'
          'Update'
          'Create'
          'Import'
          'Delete'
          'Backup'
          'Restore'
          'Purge'
        ]
      }
    }]
  }
}

// Sample Secret - Database Connection String
resource dbConnectionString 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'DatabaseConnectionString'
  properties: {
    value: 'Server=tcp:placeholder.database.windows.net,1433;Initial Catalog=placeholder;Persist Security Info=False;User ID=placeholder;Password=placeholder;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// Private Endpoint (only for non-dev environments)
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2023-09-01' = if (environment != 'dev') {
  name: '${name}-pe'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-placeholder', 'subnet-keyvault')
    }
    privateLinkServiceConnections: [
      {
        name: '${name}-plsc'
        properties: {
          privateLinkServiceId: keyVault.id
          groupIds: ['vault']
        }
      }
    ]
  }
}

// ═══════════════════════════════════════════════════════════════
// OUTPUTS
// ═══════════════════════════════════════════════════════════════

output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
