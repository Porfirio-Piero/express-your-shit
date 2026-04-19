# Azure Storage Account Module
param location string = resourceGroup().location
param storageAccountName string
param projectName string
param environment string

param enableBlobPublicAccess bool = false
param minimumTlsVersion string = 'TLS1_2'
param supportsHttpsTrafficOnly bool = true

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: enableBlobPublicAccess
    minimumTlsVersion: minimumTlsVersion
    supportsHttpsTrafficOnly: supportsHttpsTrafficOnly
  }
}

# Storage container for application data
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/data'
  properties: {
    publicAccess: 'Private'
  }
  dependsOn: [
    storageAccount
  ]
}

# Storage container for logs
resource logContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/logs'
  properties: {
    publicAccess: 'Private'
  }
  dependsOn: [
    storageAccount
  ]
}

output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output blobEndpoint string = storageAccount.properties.primaryEndpoints.blob
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'