// Networking Module - VNet, NSGs, and Subnets

@description('Name of the Virtual Network')
param vnetName string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object

@description('Environment name')
param environment string

@description('Enable Private Link')
param enablePrivateLink bool

@description('VNet address space')
param vnetAddressSpace string = '10.${environment == "dev" ? "0" : environment == "staging" ? "1" : "2"}.0.0/16'

@description('Enable DDoS protection')
param enableDdosProtection bool = false

// Address prefixes for different environments
var addressPrefixes = {
  dev: {
    vnet: '10.0.0.0/16'
    defaultSubnet: '10.0.1.0/24'
    webAppSubnet: '10.0.2.0/24'
    privateLinkSubnet: '10.0.3.0/24'
    bastionSubnet: '10.0.4.0/26'
  }
  staging: {
    vnet: '10.1.0.0/16'
    defaultSubnet: '10.1.1.0/24'
    webAppSubnet: '10.1.2.0/24'
    privateLinkSubnet: '10.1.3.0/24'
    bastionSubnet: '10.1.4.0/26'
  }
  production: {
    vnet: '10.2.0.0/16'
    defaultSubnet: '10.2.1.0/24'
    webAppSubnet: '10.2.2.0/24'
    privateLinkSubnet: '10.2.3.0/24'
    bastionSubnet: '10.2.4.0/26'
  }
}

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [addressPrefixes[environment].vnet]
    }
    subnets: [
      {
        name: 'default'
        properties: {
          addressPrefix: addressPrefixes[environment].defaultSubnet
          serviceEndpoints: [
            {
              service: 'Microsoft.Sql'
            }
            {
              service: 'Microsoft.Storage'
            }
            {
              service: 'Microsoft.KeyVault'
            }
          ]
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: 'webapp'
        properties: {
          addressPrefix: addressPrefixes[environment].webAppSubnet
          delegations: [
            {
              name: 'webapp-delegation'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
            }
          ]
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: 'PrivateLinkSubnet'
        properties: {
          addressPrefix: addressPrefixes[environment].privateLinkSubnet
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
      }
      {
        name: 'AzureBastionSubnet'
        properties: {
          addressPrefix: addressPrefixes[environment].bastionSubnet
        }
      }
    ]
    enableDdosProtection: enableDdosProtection
  }
}

// Network Security Group - Web App
resource webAppNsg 'Microsoft.Network/networkSecurityGroups@2023-09-01' = {
  name: '${vnetName}-webapp-nsg'
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'AllowHTTPSInbound'
        properties: {
          description: 'Allow HTTPS traffic from Internet'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: 'Internet'
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
      {
        name: 'DenyAllInbound'
        properties: {
          description: 'Deny all other inbound traffic'
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          access: 'Deny'
          priority: 4096
          direction: 'Inbound'
        }
      }
    ]
  }
}

// Network Security Group - Default
resource defaultNsg 'Microsoft.Network/networkSecurityGroups@2023-09-01' = {
  name: '${vnetName}-default-nsg'
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'AllowVNetInbound'
        properties: {
          description: 'Allow intra-VNet traffic'
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: 'VirtualNetwork'
          destinationAddressPrefix: 'VirtualNetwork'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
      {
        name: 'DenyInternetInbound'
        properties: {
          description: 'Block internet inbound'
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: 'Internet'
          destinationAddressPrefix: '*'
          access: 'Deny'
          priority: 4096
          direction: 'Inbound'
        }
      }
    ]
  }
}

// Route Table
resource routeTable 'Microsoft.Network/routeTables@2023-09-01' = {
  name: '${vnetName}-rt'
  location: location
  tags: tags
  properties: {
    disableBgpRoutePropagation: false
    routes: [
      {
        name: 'InternetRoute'
        properties: {
          addressPrefix: '0.0.0.0/0'
          nextHopType: 'Internet'
        }
      }
    ]
  }
}

// ═══════════════════════════════════════════════════════════════
// OUTPUTS
// ═══════════════════════════════════════════════════════════════

output vnetId string = vnet.id
output vnetName string = vnet.name
output defaultSubnetId string = resourceId('Microsoft.Network/virtualNetworks/subnets', vnet.name, 'default')
output webAppSubnetId string = resourceId('Microsoft.Network/virtualNetworks/subnets', vnet.name, 'webapp')
output privateLinkSubnetId string = resourceId('Microsoft.Network/virtualNetworks/subnets', vnet.name, 'PrivateLinkSubnet')
output vnetAddressSpace string = vnetAddressSpace
output webAppNsgId string = webAppNsg.id
output defaultNsgId string = defaultNsg.id
