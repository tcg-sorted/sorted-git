# G52 — What's new reads CHANGELOG.md at build time

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G52 — What's new reads CHANGELOG.md at build time** (owner request 2026-10-16,
  "users don't have the changelog in the app"): features/changelog/changelog.ts imports
  the repo-root `CHANGELOG.md?raw` (Vite raw import — apps/desktop/src/vite-env.d.ts
  references `vite/client` for the typing; the file sits outside the Vite root but
  inside the pnpm workspace, which Vite's fs.allow covers) and core changelog/parse.ts
  turns it into releases (`## [x.y.z] — date`, intro paragraphs, `### ` sections, `- `
  bullets with wrapped lines joined; Unreleased and the `[x]: url` references skipped).
  So the Keep-a-Changelog shape IS the UI contract: a release entry that drifts from it
  renders wrong in the app, keep the format. WhatsNewDialog (ui dialog 'whatsNew',
  mounted once in App Shell so both pages share it) lists every release, badges the
  running version (ipc.appVersion; demo = 'dev', so no badge there), renders
  **bold**/`code` through parseAiTextSegments and `#123` as GitHub issue links.
  settings.lastSeenVersion (persisted) is written when the dialog opens;
  useWhatsNew().unseen = version !== lastSeenVersion drives the primary dot on the
  StatusBar Bell (data-whats-new, data-whats-new-unseen) and the welcome footer link —
  a fresh install shows the dot once on purpose.
