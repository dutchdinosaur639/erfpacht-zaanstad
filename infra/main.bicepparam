using 'main.bicep'

param resourceGroupName = 'rg-erfpacht-zaanstad'
param location = 'westeurope'
param staticSiteName = 'swa-erfpacht-zaanstad'
param identityName = 'id-erfpacht-zaanstad-github'

// From: gh api repos/dutchdinosaur639/erfpacht-zaanstad --jq '[.owner.id, .id]'
// (public identifiers, not secrets; they change if the repository is recreated)
param githubOwner = 'dutchdinosaur639'
param githubOwnerId = '59776519'
param githubRepo = 'erfpacht-zaanstad'
param githubRepoId = '1474299645'
