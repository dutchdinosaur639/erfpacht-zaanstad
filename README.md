# Erfpacht Zaanstad: koopsom vol eigendom (unofficial)

An independent, unofficial web page that estimates the purchase price (koopsom) for converting
residential leasehold (erfpacht) in Gemeente Zaanstad to full ownership (vol eigendom), for holders
who have bought off the ground rent (canon) for a 50-year period. It is not from the municipality.

It is **not** a calculator for buying off the canon for a new period.

## Architecture

```
Browser (all calculation client-side, no cookies, no third-party requests)
   │  HTTPS, strict CSP + security headers (src/staticwebapp.config.json)
   ▼
Azure Static Web Apps, Free plan (one app, its own resource group)
   ▲
GitHub Actions ── OIDC ──► user-assigned managed identity (federated credentials, no secrets)
   │                         └─ custom role on the resource group only:
   │                            Microsoft.Web/staticSites/read + listSecrets/action
   └─ reads the SWA deployment token at run time, masks it, deploys src/
```

| Path | Purpose |
|---|---|
| `src/data/parameters.js` | **All year-specific data**: table, parameters, validity dates, source links, verification date, publisher line |
| `src/js/calc.js` | Pure logic: number parsing, date arithmetic, eligibility, table lookup, amount |
| `src/js/i18n.js` | All strings (`nl`, `en`), language detection, formatting |
| `src/js/app.js` | DOM wiring only |
| `src/staticwebapp.config.json` | Security headers (CSP without `unsafe-inline`, Trusted Types, HSTS, etc.) |
| `infra/` | Bicep: resource group, `Microsoft.Web/staticSites` (sku Free), pipeline managed identity with GitHub federated credentials, custom least-privilege role |
| `.github/workflows/ci-cd.yml` | PR: tests + preview. Push to main: tests, then production deploy + header check |
| `test/unit/` | `node:test` unit tests (table, amounts, dates, parsing, eligibility, i18n, validity) |
| `test/smoke/` | Playwright smoke test: both languages at 360 px, no console errors, no CSP violations |
| `tools/serve.mjs` | Local server that applies the same headers as production |
| `tools/check-headers.mjs` | Verifies headers and content on a deployed URL |
| `tools/limits-analysis.mjs` | Plot sizes for which the EUR 350..800/m2 land value limits do not override the table |

### Calculation

`koopsom = WOZ value × table percentage / 100`, rounded to whole euros (exact integer arithmetic).
The published table (Bijlage 1, Gemeenteblad 2026, 547830) is the only source of the result.
A derived formula (`test/helpers/derived.js`) is used only in tests to check the table's integrity.

Remaining years: the publication gives no counting rule, so with an end date the page compares every
plausible count (whole years with the end date inclusive, whole years with it exclusive, and part of a
year rounded up) and shows the **highest** amount (pessimistic scenario), with the range. The table is
not monotonic (13 years: 22.99%, 14 years: 22.13%), so the highest amount is not always the rounded-up
count. The 5..49 range check uses whole years with the end date inclusive. No result outside 5..49 years, for periodic
canon, non-50-year buy-offs, BKZ land, non-residential use, or "I don't know" answers.

## Run locally

Requires Node.js 22 or later.

```bash
npm ci
```

```bash
npm start
```

Open http://127.0.0.1:8080/. Tests:

```bash
npm test
```

```bash
npx playwright install chromium && npm run test:smoke
```

## One-time setup

Run these yourself, signed in with `az login` and `gh auth login`. Requirements: **Owner** or
**User Access Administrator** on the subscription (the deployment creates a custom role and a role
assignment). No Entra ID directory permissions are needed: the pipeline signs in as a
**user-assigned managed identity** with GitHub federated credentials, all created by Bicep.

The GitHub owner and repository IDs for the OIDC subjects are in `infra/main.bicepparam`
(repositories created after 15 July 2026 use `repo:OWNER@OWNER_ID/REPO@REPO_ID:...`). If the
repository is ever recreated, update them:

```bash
gh api repos/dutchdinosaur639/erfpacht-zaanstad --jq '[.owner.id, .id]'
```

1. Check your role on the subscription:

```bash
az role assignment list --assignee "$(az ad signed-in-user show --query id -o tsv)" --scope "/subscriptions/$(az account show --query id -o tsv)" --include-inherited --query "[].roleDefinitionName" -o tsv
```

2. Preview, then deploy the infrastructure (resource group, Static Web App Free, managed identity,
two federated credentials, custom role, role assignment):

```bash
az deployment sub what-if --location westeurope --name erfpacht-zaanstad --template-file infra/main.bicep --parameters infra/main.bicepparam
```

```bash
az deployment sub create --location westeurope --name erfpacht-zaanstad --template-file infra/main.bicep --parameters infra/main.bicepparam
```

3. GitHub environments, branch restriction for production, read-only default token:

```bash
gh api -X PUT repos/dutchdinosaur639/erfpacht-zaanstad/environments/preview
```

```bash
gh api -X PUT repos/dutchdinosaur639/erfpacht-zaanstad/environments/production -F "deployment_branch_policy[protected_branches]=false" -F "deployment_branch_policy[custom_branch_policies]=true"
```

```bash
gh api -X POST repos/dutchdinosaur639/erfpacht-zaanstad/environments/production/deployment-branch-policies -f name=main -f type=branch
```

```bash
gh api -X PUT repos/dutchdinosaur639/erfpacht-zaanstad/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
```

4. Repository variables from the deployment outputs (identifiers only, not secrets). The Azure
jobs stay skipped until `AZURE_CLIENT_ID` is set:

```bash
R=dutchdinosaur639/erfpacht-zaanstad
out() { az deployment sub show --name erfpacht-zaanstad --query "properties.outputs.$1.value" -o tsv; }
gh variable set AZURE_CLIENT_ID --repo $R --body "$(out pipelineClientId)"
gh variable set AZURE_TENANT_ID --repo $R --body "$(out tenantId)"
gh variable set AZURE_SUBSCRIPTION_ID --repo $R --body "$(az account show --query id -o tsv)"
gh variable set SWA_NAME --repo $R --body "$(out staticSiteName)"
gh variable set SWA_RESOURCE_GROUP --repo $R --body "$(out resourceGroupName)"
```

If `azure/login` fails with `AADSTS700213` (no matching federated identity record), the error shows
the subject GitHub presented; compare it with the subject in `infra/app.bicep`.

Fork pull requests run the tests only; the preview and close jobs are skipped for forks, and
`pull_request` (not `pull_request_target`) never exposes OIDC tokens to fork code.

## Yearly parameter update

1. Fetch the new Gemeenteblad publication and its Bijlage 1; compare with the old values.
2. Edit `src/data/parameters.js` only: `year`, `validFrom`, `validUntil`, `verifiedOn`, `table`,
   `parameters`, `sources`. No strings contain a year (a test enforces this).
3. Update the independent copy of the table in `test/unit/table.test.js` and the derived formula
   in `test/helpers/derived.js` (grondquote steps, indexation, discount rate), plus the fixed expected
   amounts in `test/unit/amounts.test.js` and the dates in `test/unit/validity.test.js`,
   `test/unit/evaluate.test.js` and `test/smoke/browser.test.js`.
4. `npm test && npm run test:smoke`, open a pull request, check the preview, merge.

Until updated, the page shows an "outdated parameters" message instead of a result from 1 January
of the following year.

## Rollback

Production always reflects `main`. Revert the bad commit and push; the pipeline tests and redeploys:

```bash
git revert <commit-sha>
```

```bash
git push origin main
```

## Teardown

Delete the custom role while its scope still exists (deleting its assignment first), then the
resource group, which also removes the Static Web App, the managed identity and its credentials:

```bash
az role assignment delete --resource-group rg-erfpacht-zaanstad --role "SWA deployment token reader (rg-erfpacht-zaanstad)"
```

```bash
az role definition delete --name "SWA deployment token reader (rg-erfpacht-zaanstad)" --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-erfpacht-zaanstad"
```

```bash
az group delete --name rg-erfpacht-zaanstad --yes
```

```bash
gh api -X DELETE repos/dutchdinosaur639/erfpacht-zaanstad/environments/production
gh api -X DELETE repos/dutchdinosaur639/erfpacht-zaanstad/environments/preview
```

## Sources

- Gemeenteblad 2026, 547830: https://zoek.officielebekendmakingen.nl/gmb-2026-547830.html
- Bijlage 1: https://repository.officiele-overheidspublicaties.nl/externebijlagen/exb-2026-40851/currentItem
- Municipal page: https://www.zaanstad.nl/direct-regelen/wonen-bouwen-en-omgeving/wonen-en-verhuizen/erfpacht/
- 2024 worked example: https://zaanstad.bestuurlijkeinformatie.nl/Document/View/9e3efd63-c680-4b07-b18b-c16f10c0e776
