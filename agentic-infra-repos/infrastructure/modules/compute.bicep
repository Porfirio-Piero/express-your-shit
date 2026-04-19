# Azure Compute Module - App Services and Functions
param location string = resourceGroup().location
param environment string
param projectName string
param storageAccountName string

# Azure App Service Plan (Free Tier - F1)
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
        {
          name: 'ENVIRONMENT'
          value: environment
        }
        {
          name: 'STORAGE_ACCOUNT_NAME'
          value: storageAccountName
        }
      ]
      connectionStrings: []
      http20Enabled: true
      webSocketsEnabled: true
    }
    clientCertEnabled: false
    clientCertMode: 'Required'
    httpsOnly: true
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
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${reference(resourceId('Microsoft.Storage/storageAccounts', storageAccountName)).listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'ENVIRONMENT'
          value: environment
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

# Azure Container Instance for additional compute if needed
resource containerInstance 'Microsoft.ContainerInstance/containerGroups@2023-01-01' = {
  name: '${projectName}-container-${environment}'
  location: location
  properties: {
    containers: [
      {
        name: '${projectName}-container'
        properties: {
          image: 'mcr.microsoft.com/windows/servercore:ltsc2022'
          resources: {
            requests: {
              cpu: 1
              memoryInGb: 1
            }
          }
          ports: [
            {
              port: 80
              protocol: 'TCP'
            }
          ]
          environmentVariables: [
            {
              name: 'ENVIRONMENT'
              value: environment
            }
          ]
        }
      }
    ]
    osType: 'Windows'
    restartPolicy: 'Always'
  }
}

output appServicePlanName string = appServicePlan.name
output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.name}.azurewebsites.net'
output functionAppName string = functionApp.name
output functionAppUrl string = 'https://${functionApp.name}.azurewebsites.net'
output containerInstanceName string = containerInstance.name