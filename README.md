# Cash Out Challenge — KPI Asset Builder (Kajabi / Netlify; NO Supabase)

This version keeps the Cash Out-branded interface, spreadsheet layout, formulas, Google Sheets API integration, and optional AI growth priorities. It **removes Supabase entirely**: no second member login, database provisioning, or per-member history. Embed the tool in a paid Kajabi lesson.

**Important security limitation:** Kajabi secures access to *the lesson*, but does **not** authenticate API requests to Netlify or make the embedded Netlify address private. Someone with the Netlify URL can open it directly. To reduce abuse, this project requires a server-verified Cloudflare Turnstile challenge and uses Netlify Blobs to apply best-effort daily IP/global generation limits. Neither proves Kajabi purchase status. These Blobs limits are not atomic under concurrency and do not replace real per-member authorization. For firm per-member allowances or verified paid access, a future Kajabi-to-backend SSO / signed entitlement integration is necessary (it does **not** have to be Supabase). Do not promote this as reliably locked to Kajabi members yet.

## What remains the same
- Responsive Cash Out Challenge UI embeddable in a Kajabi lesson.
- 4-sheet branded, editable Google workbook: START HERE, EXECUTIVE DASHBOARD, DAILY SALES KPI, GROWTH ROADMAP.
- 1–15 salespeople, 500 activity rows, formulas, dropdown, customizable KPIs and growth priorities.
- Private share to the Google email the user enters (Google Drive permission is not public).
- Optional OpenAI recommendation generation, deterministic fallback when unavailable.
- Existing FollowUp.com source spreadsheet remains unchanged; no historical customer data copied.

## What's removed / simplified
- No Supabase project, schema, magic-link, service-role keys, secondary member authentication, or manual SQL approval.
- No durable per-member generation counter or saved-sheet history.
- The visitor types the Google email to receive their Sheet; it is not verified as the Kajabi member's email. Someone can submit another address, so do not submit sensitive company information in this simplified public-endpoint configuration unless you accept that risk.

## Deployment (shortest path)

### 1. Netlify + GitHub
1. Put this entire directory into a **private GitHub repository** (not just `index.html`).
2. Import the repo to Netlify. `netlify.toml` already defines publish=`public`, functions=`netlify/functions`, and `/api/*` rewrite.
3. Set the variables in `.env.example` in Netlify Site configuration → Environment variables, in the Functions runtime. Keep all secrets there, not in GitHub.
4. Redeploy. This project requires Node >=20 and installs `@netlify/blobs` + `googleapis`.

### 2. Cloudflare Turnstile (required, free tier available)
1. Create a Turnstile widget at Cloudflare, select Managed mode, and add the **actual Netlify domain** and any future custom domain to allowed hostnames.
2. Put the public widget key into `TURNSTILE_SITE_KEY` and the server-only secret into `TURNSTILE_SECRET_KEY` in Netlify.
3. Both settings are mandatory; the generator refuses requests without a valid one-time Turnstile token.
4. The website uses the challenge in its embedded iframe; test the iframe in Kajabi on desktop/mobile. The embed domain itself is Netlify, so allow the Netlify hostname in Turnstile.

### 3. Google Sheets + Drive API (same process as the original project)
1. In Google Cloud Console create/select a project; enable **Sheets API** and **Drive API**.
2. Configure OAuth consent for the dedicated business Google account that will own the newly created workbooks. Production settings and app verification may be required depending on scopes and audience. Testing-mode refresh tokens can expire.
3. Create OAuth client credentials of type Web application, redirect URL: `http://localhost:4000/oauth2callback`.
4. From a trusted terminal with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set:
   ```bash
   npm install
   node scripts/google-oauth-url.mjs
   ```
5. Open the authorization URL in your dedicated Google account and approve the requested permissions. Copy `code` from the redirected URL, even if the localhost page itself fails to open.
6. Run `node scripts/google-exchange-code.mjs 'PASTE_CODE'` and store the resulting `GOOGLE_REFRESH_TOKEN` in Netlify, never in GitHub or frontend files.
7. Set `GOOGLE_OUTPUT_FOLDER_ID` only if you have configured and tested that folder permission; otherwise leave blank.
8. Test a sheet generation and confirm it is shared only with the entered email (not public).

### 4. Optional AI
Set `OPENAI_API_KEY` in Netlify to generate tailored growth advice. Without the key, the workbook still works. `OPENAI_MODEL` defaults to `gpt-4.1-mini` in the existing code. Set your own OpenAI account spending limits.

### 5. Kajabi embed
1. Open `kajabi-embed.html` and replace both `YOUR-NETLIFY-SITE` placeholders with your actual Netlify site prefix or edit the complete iframe/link URLs to your custom Netlify-hosted domain.
2. Paste the HTML into the Kajabi lesson source/custom-code area that supports iframes.
3. Restrict the lesson to paying Cash Out Challenge members through Kajabi.
4. Confirm the embedded builder, Turnstile, and Google Sheet link work on desktop and mobile. Increase iframe `height` if necessary.

### 6. Production safeguards
- Default best-effort limits: `DAILY_PER_IP_LIMIT=3`, `DAILY_GLOBAL_LIMIT=200` (adjust via Netlify environment variables). Counts reset on UTC day boundaries. A burst of parallel requests can pass these limits because Netlify Blobs counters are not atomic.
- Watch Netlify, Google API, and OpenAI usage and alerts. These limits are not hard cost ceilings.
- Anyone who obtains the tool URL can access the tool directly, even without Kajabi. Turnstile prevents some automation but not determined people.
- Google Sheets are created in **your Google account** and privately shared with the submitted email. Google may send a share notification. Do not collect highly sensitive client data without stronger authorization and appropriate privacy safeguards.
- When you want **actual Kajabi-member-only** access without Supabase, replace the public endpoint with a verified Kajabi identity/entitlement integration or a secure authenticated proxy. Merely hiding an API key in Kajabi HTML is **not** secure.

## Local checks
```bash
npm install
npm test
npm run dev
```

For local Netlify development you need Netlify CLI credentials/environment variables and the Google + Turnstile settings. The site is **not live or production-verified** merely because the source package has been generated.
