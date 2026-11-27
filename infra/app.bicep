targetScope = 'resourceGroup'

param location string
param staticSiteName string
param identityName string
param githubOwner string
param githubOwnerId string
param githubRepo string
param githubRepoId string
param githubEnvironments array
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

// Pipeline identity: a user-assigned managed identity (free, no Entra app registration needed).
resource pipelineIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: identityName
  location: location
  tags: tags
}

// GitHub OIDC trust, one credential per GitHub environment. Repositories created after
// 15 July 2026 use the immutable subject format repo:OWNER@OWNER_ID/REPO@REPO_ID:...
// Written one at a time: concurrent federated credential writes on one identity are not supported.
@batchSize(1)
resource githubCredentials 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2024-11-30' = [for env in githubEnvironments: {
  parent: pipelineIdentity
  name: 'github-${env}'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: 'repo:${githubOwner}@${githubOwnerId}/${githubRepo}@${githubRepoId}:environment:${env}'
    audiences: [ 'api://AzureADTokenExchange' ]
  }
}]

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

resource pipelineAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, pipelineIdentity.id, tokenReaderRole.id)
  scope: resourceGroup()
  properties: {
    roleDefinitionId: tokenReaderRole.id
    principalId: pipelineIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output staticSiteName string = site.name
output pipelineClientId string = pipelineIdentity.properties.clientId
output tenantId string = pipelineIdentity.properties.tenantId
output defaultHostname string = site.properties.defaultHostname
