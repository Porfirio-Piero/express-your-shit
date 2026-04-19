// App Service Module - App Service Plan and Web Apps

@description('Name of the App Service Plan')
param appServicePlanName string

@description('Name of the Web App')
param webAppName string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object

@description('SKU configuration')
param sku object

@description('Application Insights Instrumentation Key')
param appInsightsInstrumentationKey string

@description('Connection strings')
param connectionStrings array = []

@description('App settings')
param appSettings object = {}

@description('VNet integration configuration')
param vnetIntegration object = {}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: sku
  kind: 'linux'
  properties: {
    reserved: true
    targetWorkerCount: 1
    targetWorkerSizeId: 0
    zoneRedundant: false
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    clientAffinityEnabled: false
    siteConfig: {
      appSettings: [
        for key in objectKeys(appSettings): {
          name: key
          value: appSettings[key]
        }
      ]
      connectionStrings: [for connStr in connectionStrings: {
        name: connStr.name
        type: connStr.type
        connectionString: connStr.value
      }]
      alwaysOn: true
      ftpsState: 'Disabled'
      http20Enabled: true
      managedPipelineMode: 'Integrated'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      linuxFxVersion: 'DOTNETCORE|8.0'
      use32BitWorkerProcess: false
      autoHealEnabled: true
      healthCheckPath: '/health'
      autoHealRules: {
        triggers: {
          requests: {
            count: 100
            timeInterval: '00:05:00'
          }
          statusCodes: [
            {
              status: 500
              subStatus: 0
              win32Status: 0
              count: 25
              timeInterval: '00:05:00'
            }
          ]
        }
        actions: {
          actionType: 'Recycle'
          minProcessExecutionTime: '00:01:00'
        }
      }
      ipSecurityRestrictions: [
        {
          ipAddress: 'Any'
          action: 'Allow'
          priority: 1
          name: 'Allow all'
          description: 'Allow all traffic'
        }
      ]
      scmIpSecurityRestrictions: [
        {
          ipAddress: 'Any'
          action: 'Allow'
          priority: 1
          name: 'Allow all'
          description: 'Allow all SCM traffic'
        }
      ]
    }
  }
}

// VNet Integration (if specified)
resource vnetIntegrationConfig 'Microsoft.Web/sites/networkConfig@2023-12-01' = if (!empty(vnetIntegration)) {
  parent: webApp
  name: 'virtualNetwork'
  properties: {
    subnetResourceId: vnetIntegration.subnetId
    swiftSupported: true
  }
}

// Managed Certificate
resource managedCertificate 'Microsoft.Web/certificates@2023-12-01' = {
  name: '${webAppName}-managed-cert'
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    canonicalName: '${webAppName}.azurewebsites.net'
  }
}

// Private Endpoints (optional, for non-dev)
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2023-09-01' = {
  name: '${webAppName}-pe'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-placeholder', 'subnet-webapp')
    }
    privateLinkServiceConnections: [
      {
        name: '${webAppName}-plsc'
        properties: {
          privateLinkServiceId: webApp.id
          groupIds: ['sites']
        }
      }
    ]
  }
}

// Diagnostic Settings
resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${webAppName}-diagnostics'
  scope: webApp
  properties: {
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
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'AppServiceAppLogs'
        enabled: true
        retentionPolicy: {
          days: 30
          enabled: true
        }
      }
      {
        category: 'AppServiceAuditLogs'
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

output webAppId string = webApp.id
output webAppName string = webApp.name
output webAppHostname string = webApp.properties.defaultHostName
output webAppPrincipalId string = webApp.identity.principalId
output appServicePlanId string = appServicePlan.id
output appServicePlanName string = appServicePlan.name
