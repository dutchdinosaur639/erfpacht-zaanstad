using 'main.bicep'

param resourceGroupName = 'rg-erfpacht-zaanstad'
param location = 'westeurope'
param staticSiteName = 'swa-erfpacht-zaanstad'
// Set from the setup commands (object ID of the pipeline service principal):
param pipelinePrincipalId = readEnvironmentVariable('PIPELINE_SP_OBJECT_ID', '')
