# DOW ELEF ERP project context

Last updated: 2026-11-13

## Project layout

- Repository root: `C:\Users\Sam\Desktop\testproject`
- ERP application: `app/`
- Application source: `app/src/`
- Main workflows: `app/src/pages/`
- Shared UI: `app/src/components/`
- Application state and notifications: `app/src/store/`
- Domain models: `app/src/types/index.ts`
- Existing tests: `app/tests/`
- User-upload holding area: `CODEX_HANDOFF/incoming/`

The app is a React + TypeScript + Vite frontend. Its seeded/demo records and browser storage are part of the local prototype; do not treat that as a production backend. The repository has an existing Git history on branch `main`. Inspect `git status` before changes because the working tree may contain ongoing user work.

## Local development and checks

Run commands from `app/`:

```powershell
node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5179 --strictPort
node node_modules\typescript\bin\tsc -b
node node_modules\vite\bin\vite.js build
node --test tests\storage.test.mjs
```

The local preview used during the latest session was `http://127.0.0.1:5179/`. If the session process has ended, start it with the first command above. The development server supports hot reload.

## Operational workflow requirements captured from the user

- Air shipment arrival completion requires both Gate-in Date and Manifest Comparison Date.
- Tax and SEA Wharfage payments begin with the declaration clerk, then Declaration Manager, then Contact Person chooses Client or Office.
- Client payment path: Contact Person uploads proof; the declaration clerk verifies and acknowledges with TAX PAID or WHARFAGE PAID.
- Office payment path: COO, Finance Manager, then Cashier.
- Shipments requiring permits notify Permits Clerks. Shipments requiring a Delivery Order notify Shipping Line Clerks.
- Permits Clerks should not see Swissport or Delivery status tabs/status labels.
- A permit's Available/Not available choice locks after its permit document or invoice is uploaded. A not-available permit may receive its issued document after invoice payment.
- Petty cash requests from Permits Clerks and Shipping Line Clerks go to the Operations Manager first, then the normal approvals.

## Latest verified deployment

- Private production URL: https://dow-elef-erp-test.netlify.app/
- Verified deployment URL: https://6af739706b7ca5d404811436--dow-elef-erp-test.netlify.app/
- Deployment date: 2026-11-13
- Latest checked build: TypeScript project check passed; Vite production build passed.
- Existing storage checks: 3 passed, 0 failed (`node --test tests\storage.test.mjs`).
- Netlify access is private. The user's 2026-11-13 approval covered publishing seeded test credentials to this private site only. It does not authorize exposing the site, changing access controls, or publishing real credentials or unrelated private data.

## Handling future uploads

When a relevant attachment is available locally, save a copy in `CODEX_HANDOFF/incoming/` and record its filename, date, and purpose in `UPLOAD_REGISTER.md`. Keep original filenames where practical. If it is a large code archive, inspect it before extraction and avoid overwriting the live `app/` tree; use a dated subfolder under `incoming/` for review. If the attachment is only available in the chat and cannot be copied through the workspace, note that in the register and ask the user to place it in the folder only when continued local access is needed.

