# CASH OUT CHALLENGE — KPI BUILDER (simple Excel download)

## Fastest deployment — existing GitHub + Netlify site

1. Download and unzip this ZIP. Inside `cashout-kpi-builder`, select **all** files and folders (including `public`, `netlify`, `netlify.toml`, `package.json`). Upload/commit them to the **root** of your existing GitHub repo, replacing matching files. Delete the obsolete `scripts/google-*.mjs` if still present. **Do not upload the parent folder as an extra nested directory.**
2. Netlify will automatically deploy the new commit. Open **Netlify → Deploys** and verify **Published**. If the deploy fails, read the deploy log.
3. Keep your already-configured `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Google Cloud, OAuth, `GOOGLE_*` variables, Supabase, and Google API integrations are **not needed**. You may delete leftover `GOOGLE_*` vars from Netlify later.
4. Open your existing Netlify site, complete Turnstile, enter test business details, and click **Build my KPI scorecard**. Your browser downloads an `.xlsx` file automatically. Try it in Excel or upload it manually to Google Sheets.
5. **Kajabi:** Your existing iframe embed can stay as-is if the site URL remains unchanged. Restrict the lesson to paying members.

### What it generates
- **START HERE** — business-specific setup and instructions
- **EXECUTIVE DASHBOARD** — summary KPIs and individual rep results
- **DAILY SALES KPI** — 500 entry rows and automatic ratios
- **GROWTH ROADMAP** — gap-to-goal calculations and optional AI advice

The tool uses deterministic formulas and can run **without** an OpenAI key. Set `OPENAI_API_KEY` only if you want optional AI-written growth actions.

### Cost/security notes
- Secrets remain server-side on Netlify.
- Turnstile verifies requests; Netlify Blobs tracks best-effort daily IP/global limits. Limits are not atomic and are not hard spending caps.
- Kajabi controls access to the lesson but does **not** authenticate access to the Netlify endpoint. Anyone with the Netlify URL can reach the page and attempt Turnstile verification. Consider verified member authentication for stronger protection.
- No personal Google account credentials or emailed spreadsheets are needed. The file downloads directly to the member's device.
- The browser does not persist submitted details; Netlify processing is transient, though service logs and third-party services may retain operational information.

### Local verification
```
npm install
npm test
```

Use Node.js 20+. If a browser test does not download a file, inspect the Netlify **Functions** logs for `generate` and the browser error.


## KPI dashboard upgrade
This version adds a visual KPI DASHBOARD and a separate MARKETING FUNNEL tracking sheet while preserving the original four workbook tabs, existing sales-rep formulas, Netlify endpoints, and Kajabi iframe. Add campaign/day-level entries in MARKETING FUNNEL and salesperson/day-level entries in DAILY SALES KPI. Do not duplicate ad spend per rep. Funnel reference ranges are illustrative values supplied in the example screenshot, not verified industry benchmarks. The downloadable Excel file recalculates KPI cards when opened in Excel or imported into Google Sheets. No additional credentials are required.
