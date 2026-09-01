# SCSK Website

Official website for **SCSK — Site Companion Side Kick**, published at [sc-sk.com](https://sc-sk.com).

## Current Site Structure

- `index.html` — Main SCSK product homepage
- `subscriptions.html` — Plans and subscriptions
- `support.html` — Support and FAQ
- `manual.html` — SCSK user manual
- `feedback.html` — Feedback portal
- `privacy.html` — Privacy policy
- `terms.html` — Terms and conditions
- `delete-account.html` — Account deletion information
- `sitemap.xml` — Search engine sitemap
- `robots.txt` — Search crawler instructions
- `_redirects` — Cloudflare Pages redirect rules

## SEO Landing Pages

Added 24 August 2026 to build targeted organic search traffic around core SCSK construction workflows.

- `construction-site-inspection-app.html`
  - Primary topic: construction site inspection app
  - Clean URL: `/construction-site-inspection-app`

- `construction-defect-management-app.html`
  - Primary topic: construction defect management app
  - Clean URL: `/construction-defect-management-app`

- `construction-site-diary-app.html`
  - Primary topic: construction site diary app
  - Clean URL: `/construction-site-diary-app`

- `construction-checklist-app.html`
  - Primary topic: construction checklist app
  - Clean URL: `/construction-checklist-app`

- `offline-construction-management-app.html`
  - Primary topic: offline construction management app
  - Clean URL: `/offline-construction-management-app`

All five pages:

- Use `seo-pages.css` for a consistent responsive SCSK design.
- Have unique page titles and meta descriptions.
- Use canonical URLs on `https://sc-sk.com`.
- Include Open Graph metadata.
- Include basic Schema.org structured data.
- Cross-link to the other SEO pages.
- Link back to the SCSK homepage, pricing, support and manual.
- Use existing SCSK screenshots rather than stock imagery.
- Are listed in `sitemap.xml` for search-engine discovery.

## SEO Roadmap

### Stage 1 — Completed

- [x] Main homepage metadata and structured product information
- [x] Canonical URLs
- [x] XML sitemap
- [x] Robots file
- [x] Retired duplicate homepage redirect
- [x] Construction site inspection landing page
- [x] Construction defect management landing page
- [x] Construction site diary landing page
- [x] Construction checklist landing page
- [x] Offline construction management landing page

### Stage 2 — Next

- [ ] Add prominent homepage links to the new construction workflow pages
- [ ] Add contextual links from relevant user-manual sections
- [ ] Add dedicated construction photo documentation page
- [ ] Add construction daily report page
- [ ] Add construction punch-list / snag-list page
- [ ] Review Search Console impressions and queries after indexing
- [ ] Expand pages that begin earning impressions and clicks

### Stage 3 — Growth Content

- [ ] Construction inspection guides
- [ ] Site diary best-practice guides
- [ ] Defect and handover documentation guides
- [ ] Free construction checklist resources
- [ ] Feature comparison and workflow pages based on real search demand

## Deployment

The production Cloudflare Pages project is `scsk-current-site`, and its production branch is `main`.

Production must only be deployed from this repository's clean, pushed `main` branch. Do not run a raw `wrangler pages deploy` command from the app repository or another checkout: Wrangler can attach the wrong source commit and replace the correct website with stale files.

Use the guarded deployment command:

```powershell
.\scripts\deploy-production.ps1 -ConfirmProduction
```

The script fails closed unless all of the following are true:

- The Git origin is `saadevelopmentsinc-cpu/scsk-site`.
- The checked-out branch is `main`.
- `HEAD` exactly matches `origin/main`.
- Tracked files are clean.
- The redesigned screenshot references and required assets are present.
- Legacy `Screenshot1.png` through `Screenshot7.png` homepage references are absent.

It deploys a clean Git archive, attaches the exact commit SHA to Cloudflare, publishes a `deployment-manifest.json`, and verifies that `sc-sk.com` reports that same repository and commit. GitHub Actions repeats the screenshot-source checks on every push and pull request to `main`.
