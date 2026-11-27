// Subscription-scope entry point: one resource group with one Free Static Web App,
// plus a least-privilege custom role for the pipeline identity, scoped to that resource group.
// No billable resources: SWA Free, a role definition and a role assignment are free.
targetScope = 'subscription'

@description('Resource group that holds only this app.')
param resourceGroupName string = 'rg-erfpacht-zaanstad'

@description('Region for the resource group and the Static Web App metadata. Free SWA content is served globally.')
@allowed([ 'westeurope', 'westus2', 'centralus', 'eastus2', 'eastasia' ])
param location string = 'westeurope'

@description('Static Web App name; becomes part of the default *.azurestaticapps.net hostname.')
param staticSiteName string = 'swa-erfpacht-zaanstad'

@description('Object ID of the service principal used by GitHub Actions (OIDC). Leave empty to skip the role assignment.')
param pipelinePrincipalId string = ''

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
    pipelinePrincipalId: pipelinePrincipalId
    tags: tags
  }
}

output resourceGroupName string = rg.name
output staticSiteName string = app.outputs.staticSiteName
output defaultHostname string = app.outputs.defaultHostname
