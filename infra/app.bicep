targetScope = 'resourceGroup'

param location string
param staticSiteName string
param pipelinePrincipalId string
param tags object

resource site 'Microsoft.Web/staticSites@2025-03-01' = {
  name: staticSiteName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // Deployed from GitHub Actions with a deployment token; no repository link needed.
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    publicNetworkAccess: 'Enabled'
  }
}

// Only what the pipeline needs: read the site and list its deployment token.
resource tokenReaderRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(resourceGroup().id, 'swa-deployment-token-reader')
  properties: {
    roleName: 'SWA deployment token reader (${resourceGroup().name})'
    description: 'Read the Static Web App and list its deployment token. Scoped to one resource group.'
    type: 'CustomRole'
    assignableScopes: [ resourceGroup().id ]
    permissions: [
      {
        actions: [
          'Microsoft.Web/staticSites/read'
          'Microsoft.Web/staticSites/listSecrets/action'
        ]
        notActions: []
        dataActions: []
        notDataActions: []
      }
    ]
  }
}

resource pipelineAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(pipelinePrincipalId)) {
  name: guid(resourceGroup().id, pipelinePrincipalId, tokenReaderRole.id)
  scope: resourceGroup()
  properties: {
    roleDefinitionId: tokenReaderRole.id
    principalId: pipelinePrincipalId
    principalType: 'ServicePrincipal'
  }
}

output staticSiteName string = site.name
output defaultHostname string = site.properties.defaultHostname
