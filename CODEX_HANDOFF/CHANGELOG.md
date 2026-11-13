# Project change log

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

