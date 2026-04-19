// SQL Database Module - SQL Server and Database Configuration

@description('SQL Server name')
param serverName string

@description('Database name')
param databaseName string

@description('Primary Azure region')
param location string

@description('Secondary Azure region for DR')
param secondaryLocation string

@description('Tags to apply to resources')
param tags object

@description('Environment name')
param environment string

@description('SQL Database SKU name')
param skuName string

@description('SQL Database tier')
param tier string

@description('Enable zone redundancy')
param zoneRedundancy bool

@description('Backup retention days')
@minValue(7)
@maxValue(35)
param backupRetentionDays int

@description('Enable geo-replication')
param enableGeoReplication bool

@description('Log Analytics Workspace ID')
param logAnalyticsId string

@description('Allowed VNet ID')
param allowedVnetId string

@description('Allowed Subnet ID')
param allowedSubnetId string

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: serverName
  location: location
  tags: tags
  properties: {
    version: '12.0'
    minimalTlsVersion: '1.2'
    administrators: {
      administratorType: 'ActiveDirectory'
      principalType: 'Group'
      login: 'SQL Admins'
      sid: '00000000-0000-0000-0000-000000000000' // Replace with actual AAD Group Object ID
      tenantId: subscription().tenantId
      azureADOnlyAuthentication: false
    }
    publicNetworkAccess: environment == 'dev' ? 'Enabled' : 'Disabled'
  }
}

// SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: tier
  }
  properties: {
    zoneRedundancy: zoneRedundancy
    requestedBackupStorageRedundancy: environment == 'production' ? 'Geo' : 'Local'
    minCapacity: {
      dev: 0
      staging: 0.5
      production: 1
    }[environment]
    autoPauseDelay: environment == 'dev' ? 60 : -1
    catalogCollation: 'SQL_Latin1_General_CP1_CI_AS'
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: {
      dev: 2147483648 // 2GB
      staging: 26843545600 // 25GB
      production: 107374182400 // 100GB
    }[environment]
  }
}

// Long-term Backup Retention (for compliance)
resource longTermRetention 'Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies@2023-08-01-preview' = if (environment == 'production') {
  parent: sqlDatabase
  name: 'default'
  properties: {
    weeklyRetention: 'P4W'
    monthlyRetention: 'P12M'
    yearlyRetention: 'P5Y'
  }
}

// Short-term Backup Retention
resource shortTermRetention 'Microsoft.Sql/servers/databases/backupShortTermRetentionPolicies@2023-08-01-preview' = {
  parent: sqlDatabase
  name: 'default'
  properties: {
    retentionDays: backupRetentionDays
    diffBackupIntervalInHours: 24
  }
}

// Firewall Rules (only for dev)
resource firewallRule 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = if (environment == 'dev') {
  name: 'AllowAzureServices'
  parent: sqlServer
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// VNet Rule (for non-dev environments)
resource vnetRule 'Microsoft.Sql/servers/virtualNetworkRules@2023-08-01-preview' = if (environment != 'dev') {
  name: 'AllowVNet'
  parent: sqlServer
  properties: {
    virtualNetworkSubnetId: allowedSubnetId
    ignoreMissingVnetServiceEndpoint: false
  }
}

// Geo-Replication (for production and staging)
resource geoReplication 'Microsoft.Sql/servers/databases/replicationLinks@2023-08-01-preview' = if (enableGeoReplication) {
  parent: sqlDatabase
  name: '${serverName}-${secondaryLocation}'
  properties: {
    partnerServer: 'sql-${secondaryLocation}-secondary'
    partnerLocation: secondaryLocation
    role: 'Primary'
    replicationMode: 'Async'
  }
}

// Failover Group (for production)
resource failoverGroup 'Microsoft.Sql/servers/failoverGroups@2023-08-01-preview' = if (environment == 'production') {
  name: '${serverName}-fg'
  parent: sqlServer
  properties: {
    readWriteEndpoint: {
      failoverPolicy: 'Automatic'
      failoverWithDataLossGracePeriodMinutes: 60
    }
    readOnlyEndpoint: {
      failoverPolicy: 'Disabled'
    }
    partnerServers: [
      {
        id: resourceId(subscription().subscriptionId, resourceGroup().name, 'Microsoft.Sql/servers', '${serverName}-secondary')
      }
    ]
    databases: [
      sqlDatabase.id
    ]
  }
}

// Auditing Policy
resource sqlAuditing 'Microsoft.Sql/servers/auditingSettings@2023-08-01-preview' = {
  name: 'default'
  parent: sqlServer
  properties: {
    state: 'Enabled'
    retentionDays: backupRetentionDays
    auditActionsAndGroups: [
      'SUCCESSFUL_DATABASE_AUTHENTICATION_GROUP'
      'FAILED_DATABASE_AUTHENTICATION_GROUP'
      'BATCH_COMPLETED_GROUP'
    ]
    isAzureMonitorTargetEnabled: true
    isManagedIdentityInUse: false
  }
}

// Diagnostic Settings
resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${serverName}-diagnostics'
  scope: sqlDatabase
  properties: {
    workspaceId: logAnalyticsId
    logs: [
      {
        category: 'SQLInsights'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'AutomaticTuning'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'QueryStoreRuntimeStatistics'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'QueryStoreWaitStatistics'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'Errors'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'DatabaseWaitStatistics'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'Timeouts'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'Blocks'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'Deadlocks'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
    ]
    metrics: [
      {
        category: 'Basic'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
    ]
  }
}

// ═══════════════════════════════════════════════════════════════
// OUTPUTS
// ═══════════════════════════════════════════════════════════════

output sqlServerId string = sqlServer.id
output sqlServerName string = sqlServer.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseId string = sqlDatabase.id
output databaseName string = sqlDatabase.name
output databaseResourceId string = sqlDatabase.id
