# Project change log

## 2026-11-16 · Complete status visibility and file movement history

- Added a combined status view on the Dashboard and File Details so a file can show its current stage alongside outstanding Tax, Wharfage, permit, Port/Swissport, and Delivery Order milestones.
- Added dashboard counts that open the files in each active status and a recent file movement feed.
- Logged same-status workflow changes (including payment approvals, permit updates, arrival dates, and operational milestones) as readable activity entries instead of recording them as no-op status changes.
- Kept Swissport and Delivery Order statuses hidden from Permits Clerks.
- Verification: TypeScript project check and Vite production build passed. Existing Browserslist, mixed-import, and bundle-size warnings remain; no tests run.
- Deployment: pending.

## 2026-11-16 · Declaration payment approval access

- Added a contact-person dashboard queue for pending Tax/Wharfage payer selection and client payment proof, with direct file links.
- Matched payment action access to either the normalized contact ID or embedded contact record; unassigned files follow the existing all-contact notification fallback.
- Renamed positive Tax/Wharfage payment review actions to “Proceed”. Client proof still requires the declarant’s TAX PAID/WHARFAGE PAID acknowledgement; Declaration Done remains enabled only after required payments are confirmed.
- Verification: TypeScript project build and Vite production build passed. Existing warnings remain for stale Browserslist data, mixed static/dynamic imports, and the large application bundle. Netlify reports the production deploy live; unauthenticated HTTP check redirects to the site's Netlify access gate, confirming it remains private. No test suite run.
- Published to the private Netlify site: deployment `6afaddb2a9d438ec6fd81771` (`https://6afaddb2a9d438ec6fd81771--dow-elef-erp-test.netlify.app/`).

## 2026-11-16 · Deployment link refresh

- Confirmed Netlify's latest private production deployment is ready: `6af84957ce34e4f5e84431b9`. The stable production URL remains https://dow-elef-erp-test.netlify.app/.
- Refreshed current deployment links in the handoff context and deployment summary; no application code changed, so no new site deployment was needed.
- Link updates committed and pushed to `SushiZeus/testProject` on `main`.

## 2026-11-14 · Temporary operational data reset

- Published temporary Administrator-only reset control to the private test site (deployment `6af8478f8ce8e3cbed86919e`) and used it on the current browser profile.
- Cleared 2 shipment files, their embedded documents and approval history, 5 shipment/petty-cash document-store uploads, and related alerts. No petty-cash or permit requests were present. Preserved user accounts, client records, and unrelated module data; verified the dashboard shows zero files and uploads.
- Removed the temporary reset control from source and published the cleaned build as deployment `6af84957ce34e4f5e84431b9` (`https://6af84957ce34e4f5e84431b9--dow-elef-erp-test.netlify.app/`).
- Verified the stable site still shows zero shipment files and no uploads, and the User Management page no longer exposes the temporary control. Signed the Administrator test session out afterward.
- No new shipment or payment request was created; new shipment details are needed before the normal approval chain can begin.

## 2026-11-14 · Test credentials visibility

- Added a collapsible test-credentials list to the sign-in page with role labels and one-click form fill for the private test site.
- Credential values remain sourced from the existing test-account data and are not copied into handoff notes.
- Built and published the update to the private Netlify site; deployment ID: `6af838f5e6ce372977dd2a12`.

## 2026-11-14 · File-opening document uploads

- Changed document source selection from one global mode to a per-document-type choice, so existing selections and new uploads can be mixed in the same file opening.
- Document types with no matching existing upload default to the new-upload source; file inputs reset after selection so the same file can be chosen again if needed.
- TypeScript check and Vite production build passed. No tests were run.

## 2026-11-14 · Link refresh and deployment

- Rebuilt and published the current ERP updates to private Netlify production.
- Refreshed stale production access links in the handoff, deployment, access, and credential-reference documents to the current DOW ELEF ERP URL. Updated the Netlify project dashboard link.
- Verified deployment ID: `6af82b8f8599fb6bd1c44578`.
- Pushed committed ERP and access-link updates to `SushiZeus/testProject` on `main`; the branch was synchronized with `origin/main`.

## 2026-11-13 · File comments

- Added a File Comments page available from the shared navigation for every signed-in role, with file selection, comment history, and posting.
- Kept comments visible from each file detail view and added a comment count to its tab.
- Replaced blanket SEA Shipping Line comment alerts with notifications for assigned clerks, Declaration/Operations Managers, and the COO; exclude the commenter.
- Added cross-tab refresh for notification storage. File comments already refresh across same-origin tabs through the file store.
- TypeScript check and Vite production build passed. No test suite was run.
- Cross-device limitation: file/comment data remains browser-local because this app currently has no central backend/API.

## 2026-11-13 · Handoff workflow

- User confirmed that future code developments should be saved and tracked through this handoff folder and the existing local Git repository.
- Keep source edits in `app/`, record each completed task here, and make focused local commits when the change scope is clear. Do not push unless asked.

## 2026-11-13

- Added air arrival Gate-in Date handling alongside Manifest Comparison Date.
- Added staged Tax/Wharfage payment approvals: declaration clerk, Declaration Manager, Contact Person payer selection, and either client proof plus clerk acknowledgement or COO → Finance Manager → Cashier.
- Added file detail payment panels so each approver can complete their step.
- Added permit and Delivery Order role notifications; hid Swissport and Delivery status for Permits Clerks.
- Locked permit availability after a related permit or invoice upload and routed permit/shipping-line petty cash through Operations Manager first.
- Verified TypeScript check, Vite production build, and all 3 existing storage tests.
- Published and opened the private Netlify production deployment: `6af739706b7ca5d404811436`.

## Earlier project history

See the repository's Git commit history for prior code changes. This file records concise handoff summaries; it does not replace Git diffs or commits.

