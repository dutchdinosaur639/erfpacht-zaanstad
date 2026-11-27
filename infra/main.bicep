// Subscription-scope entry point: one resource group with one Free Static Web App,
// plus the pipeline's managed identity and a least-privilege custom role, all scoped to that group.
// No billable resources: SWA Free, a user-assigned managed identity, a role definition and a
// role assignment are free.
targetScope = 'subscription'

@description('Resource group that holds only this app.')
param resourceGroupName string = 'rg-erfpacht-zaanstad'

@description('Region for the resource group and the Static Web App metadata. Free SWA content is served globally.')
@allowed([ 'westeurope', 'westus2', 'centralus', 'eastus2', 'eastasia' ])
param location string = 'westeurope'

@description('Static Web App name; becomes part of the default *.azurestaticapps.net hostname.')
param staticSiteName string = 'swa-erfpacht-zaanstad'

@description('User-assigned managed identity that GitHub Actions signs in as (OIDC, no secrets).')
param identityName string = 'id-erfpacht-zaanstad-github'

@description('GitHub owner login and numeric ID, repository name and numeric ID (for OIDC subjects).')
param githubOwner string
param githubOwnerId string
param githubRepo string
param githubRepoId string

@description('GitHub environments allowed to sign in.')
param githubEnvironments array = [ 'preview', 'production' ]

param tags object = {
  app: 'erfpacht-zaanstad'
  purpose: 'unofficial-public-calculator'
}

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module app 'app.bicep' = {
  name: 'erfpacht-zaanstad-app'
  scope: rg
  params: {
    location: location
    staticSiteName: staticSiteName
    identityName: identityName
    githubOwner: githubOwner
    githubOwnerId: githubOwnerId
    githubRepo: githubRepo
    githubRepoId: githubRepoId
    githubEnvironments: githubEnvironments
    tags: tags
  }
}

output resourceGroupName string = rg.name
output staticSiteName string = app.outputs.staticSiteName
output defaultHostname string = app.outputs.defaultHostname
output pipelineClientId string = app.outputs.pipelineClientId
output tenantId string = app.outputs.tenantId
