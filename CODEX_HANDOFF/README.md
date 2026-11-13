# DOW ELEF ERP handoff folder

This folder keeps concise project context and a durable record of future work so a new Codex session can resume without relying on chat history.

## Files

- `PROJECT_CONTEXT.md` — application map, common commands, workflow rules, and current deployment information.
- `CHANGELOG.md` — dated summary of completed code changes, checks, and deployments.
- `UPLOAD_REGISTER.md` — index of user-provided files saved under `incoming/`.
- `incoming/` — safe holding area for project documents and other relevant user uploads.

The actual application remains in `../app/`; this is its single source of truth. Save each completed development by updating `CHANGELOG.md` and checkpointing the relevant code plus handoff notes in the local Git history. This folder stores context and references, not a duplicate copy of the application source. Do not put credentials in these notes.

