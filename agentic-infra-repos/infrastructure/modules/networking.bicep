# Azure Networking Module
param location string = resourceGroup().location
param environment string
param projectName string

# Virtual Network (required for Azure Functions and App Services in isolated mode)
resource virtualNetwork 'Microsoft.Network/virtualNetworks@2023-01-01' = {
  name: '${projectName}-vnet-${environment}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'web-subnet'
        properties: {
          addressPrefix: '10.0.1.0/24'
          serviceEndpoints: [
            {
              service: 'Microsoft.KeyVault'
            }
            {
              service: 'Microsoft.Storage'
            }
          ]
        }
      }
      {
        name: 'func-subnet'
        properties: {
          addressPrefix: '10.0.2.0/24'
          serviceEndpoints: [
            {
              service: 'Microsoft.KeyVault'
            }
            {
              service: 'Microsoft.Storage'
            }
          ]
        }
      }
      {
        name: 'data-subnet'
        properties: {
          addressPrefix: '10.0.3.0/24'
          serviceEndpoints: [
            {
              service: 'Microsoft.KeyVault'
            }
            {
              service: 'Microsoft.Storage'
            }
          ]
        }
      }
    ]
  }
}

# Network Security Group for web subnet
resource webNsg 'Microsoft.Network/networkSecurityGroups@2023-01-01' = {
  name: '${projectName}-web-nsg-${environment}'
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowHttp'
        properties: {
          priority: 100
          protocol: 'Tcp'
          access: 'Allow'
          direction: 'Inbound'
          sourceAddressPrefix: '*'
          sourcePortRange: '*'
          destinationAddressPrefix: 'VirtualNetwork'
          destinationPortRange: '80'
        }
      }
      {
        name: 'AllowHttps'
        properties: {
          priority: 110
          protocol: 'Tcp'
          access: 'Allow'
          direction: 'Inbound'
          sourceAddressPrefix: '*'
          sourcePortRange: '*'
          destinationAddressPrefix: 'VirtualNetwork'
          destinationPortRange: '443'
        }
      }
    ]
  }
}

# Network Security Group for function subnet
resource funcNsg 'Microsoft.Network/networkSecurityGroups@2023-01-01' = {
  name: '${projectName}-func-nsg-${environment}'
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowFunctionInbound'
        properties: {
          priority: 100
          protocol: 'Tcp'
          access: 'Allow'
          direction: 'Inbound'
          sourceAddressPrefix: 'VirtualNetwork'
          sourcePortRange: '*'
          destinationAddressPrefix: 'VirtualNetwork'
          destinationPortRange: '443'
        }
      }
      {
        name: 'AllowFunctionOutbound'
        properties: {
          priority: 100
          protocol: '*'
          access: 'Allow'
          direction: 'Outbound'
          sourceAddressPrefix: 'VirtualNetwork'
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

# Public IP for Load Balancer (if needed)
resource publicIp 'Microsoft.Network/publicIPAddresses@2023-01-01' = {
  name: '${projectName}-pip-${environment}'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
    dnsSettings: {
      domainNameLabel: '${projectName}${environment}'
    }
  }
}

output vnetId string = virtualNetwork.id
output vnetName string = virtualNetwork.name
output webSubnetId string = resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetwork.name, 'web-subnet')
output funcSubnetId string = resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetwork.name, 'func-subnet')
output dataSubnetId string = resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetwork.name, 'data-subnet')
output publicIpAddress string = publicIp.properties.ipAddress