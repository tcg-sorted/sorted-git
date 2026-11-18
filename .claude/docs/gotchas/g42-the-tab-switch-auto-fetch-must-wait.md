# G42 — the tab-switch auto fetch must wait for the remotes to load

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G42 — the tab-switch auto fetch must wait for the remotes to load**: the
  RepositoryPage auto-fetch effect keys on `repoPath` and runs `tick()` at once,
  but `useRepo.open()` sets `repo` with `remotes: []` and only then awaits
  `refresh()`, so on a real repo the immediate tick saw zero remotes, returned,
  and nothing fetched until the interval — a 15-minute setting meant a tab switch
  never fetched (issue #20 follow-up, 2026-09-13, reproduced by `akg open`-ing
  another tab and back while a remote had moved). Demo mode hides it because the
  demo refresh resolves before React commits. The effect now also depends on
  `autoFetchRemotes` (the remote names joined, a STRING so re-setting the same
  list does not re-run it) and bails while it is empty; when the names arrive the
  effect re-runs and fetches. Playwright cannot see this one — verify against the
  installed app with a remote that moved: `akg open <other>` then `akg open <repo>`
  and check `.git/FETCH_HEAD`'s mtime. TRAP while doing that: `tick()` also returns
  on `document.hidden`, and WebKit reports the page hidden while the window is
  fully covered (VS Code in front), so a switch driven from a terminal often
  fetches nothing and the 1-minute interval later does — that looked like the fix
  failing twice on 2026-09-13; a temporary localStorage guard log proved every
  skipped tick was `hidden: true` and every visible switch fetched. Bring the
  window to the front (`open -a AngKorGit`) before switching.
