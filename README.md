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
GitHub Actions ── OIDC ──► Entra ID app (federated credentials, no secrets)
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
| `infra/` | Bicep: resource group, `Microsoft.Web/staticSites` (sku Free), custom least-privilege role |
| `.github/workflows/ci-cd.yml` | PR: tests + preview. Push to main: tests, then production deploy + header check |
| `test/unit/` | `node:test` unit tests (table, amounts, dates, parsing, eligibility, i18n, validity) |
| `test/smoke/` | Playwright smoke test: both languages at 360 px, no console errors, no CSP violations |
| `tools/serve.mjs` | Local server that applies the same headers as production |
| `tools/check-headers.mjs` | Verifies headers and content on a deployed URL |

### Calculation

`koopsom = WOZ value × table percentage / 100`, rounded to whole euros (exact integer arithmetic).
The published table (Bijlage 1, Gemeenteblad 2026, 547830) is the only source of the result.
A derived formula (`test/helpers/derived.js`) is used only in tests to check the table's integrity.

Remaining years = whole years from the conversion date up to and including the end date of the
buy-off period (a period that ends 30-06-2037 runs until 01-07-2037). When part of a year remains,
the page also shows the amount for the next whole year up. No result outside 5..49 years, for periodic
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

Run these yourself, signed in with `az login` (Owner or User Access Administrator on the subscription)
and `gh auth login`. The values below match the defaults in `infra/main.bicepparam`.

```bash
OWNER=dutchdinosaur639
REPO=erfpacht-zaanstad
RG=rg-erfpacht-zaanstad
SWA=swa-erfpacht-zaanstad
SUB_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)
OWNER_ID=$(gh api repos/$OWNER/$REPO --jq .owner.id)
REPO_ID=$(gh api repos/$OWNER/$REPO --jq .id)
```

1. Entra ID app and service principal for the pipeline (no client secret is created):

```bash
APP_ID=$(az ad app create --display-name "github-$REPO-deploy" --query appId -o tsv)
```

```bash
SP_OBJECT_ID=$(az ad sp create --id "$APP_ID" --query id -o tsv)
```

2. Federated credentials. Repositories created after 15 July 2026 use GitHub's immutable OIDC
subject format `repo:OWNER@OWNER_ID/REPO@REPO_ID:...`. Both jobs that use Azure run in a GitHub
environment, so only environment subjects are needed:

```bash
for ENV in preview production; do
  az ad app federated-credential create --id "$APP_ID" --parameters "{\"name\":\"github-$ENV\",\"issuer\":\"https://token.actions.githubusercontent.com\",\"subject\":\"repo:$OWNER@$OWNER_ID/$REPO@$REPO_ID:environment:$ENV\",\"audiences\":[\"api://AzureADTokenExchange\"]}"
done
```

If `azure/login` fails with `AADSTS700213` (no matching federated identity), the error shows the
subject GitHub presented; update the credential to that exact value.

3. Infrastructure (preview first, then deploy):

```bash
PIPELINE_SP_OBJECT_ID=$SP_OBJECT_ID az deployment sub what-if --location westeurope --template-file infra/main.bicep --parameters infra/main.bicepparam
```

```bash
PIPELINE_SP_OBJECT_ID=$SP_OBJECT_ID az deployment sub create --location westeurope --template-file infra/main.bicep --parameters infra/main.bicepparam
```

4. GitHub environments, branch restriction for production, read-only default token, variables
(identifiers only; none of these are secrets):

```bash
gh api -X PUT repos/$OWNER/$REPO/environments/preview
```

```bash
gh api -X PUT repos/$OWNER/$REPO/environments/production -F "deployment_branch_policy[protected_branches]=false" -F "deployment_branch_policy[custom_branch_policies]=true"
```

```bash
gh api -X POST repos/$OWNER/$REPO/environments/production/deployment-branch-policies -f name=main -f type=branch
```

```bash
gh api -X PUT repos/$OWNER/$REPO/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
```

```bash
gh variable set AZURE_CLIENT_ID --repo $OWNER/$REPO --body "$APP_ID"
gh variable set AZURE_TENANT_ID --repo $OWNER/$REPO --body "$TENANT_ID"
gh variable set AZURE_SUBSCRIPTION_ID --repo $OWNER/$REPO --body "$SUB_ID"
gh variable set SWA_NAME --repo $OWNER/$REPO --body "$SWA"
gh variable set SWA_RESOURCE_GROUP --repo $OWNER/$REPO --body "$RG"
```

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

Remove the role assignment and the custom role while their scope still exists, then the group:

```bash
az role assignment delete --assignee "$SP_OBJECT_ID" --resource-group rg-erfpacht-zaanstad
```

```bash
az role definition delete --name "SWA deployment token reader (rg-erfpacht-zaanstad)" --scope "/subscriptions/$SUB_ID/resourceGroups/rg-erfpacht-zaanstad"
```

```bash
az group delete --name rg-erfpacht-zaanstad --yes
```

```bash
az ad app delete --id "$APP_ID"
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
