# §9.5 Open-source & community files

[Back to the index](../../CLAUDE.md)

Root: `LICENSE` (MIT), `CODE_OF_CONDUCT.md`, `SECURITY.md` (incl. the app's
privacy surface: no telemetry), `CHANGELOG.md` (Keep-a-Changelog; update
`[Unreleased]` in feature PRs). `.github/`: issue templates (bug/feature YAML),
PR template with the quality checklist. Crash resilience:
`components/ErrorBoundary.tsx` wraps the Shell — never let a render error
white-screen the app. `docs/Distribution.md` documents signing/notarization,
the updater plan (pull-based from GitHub releases; needs owner keys before the
plugin can be added), and the Homebrew cask.

**GitHub repo settings (set 2026-09-11, not visible in the code):** squash merges
only, subject = PR title, body = BLANK (the default COMMIT_MESSAGES body would have
carried a contributor's `Co-authored-by: Cursor` trailer into main); merged head
branches auto-delete; ruleset "Protect main" (id 22892466) on the default branch
blocks deletion + force-push, requires a PR with 1 approval, resolved threads and
the six CI job checks (typecheck/unit/build, Playwright, Rust × 3 OS, Commit
messages — added to the ruleset 2026-09-12 when the `commits` job landed) —
with RepositoryRole 5 (admin) as an always-bypass actor so the owner's release
flow (fast-forward main + tag from the terminal) still works; Actions requires
approval for first-time contributors' fork PRs, so a new contributor's CI run sits
at "action_required" until the owner clicks "Approve and run" in the Actions tab
(or `gh api -X POST repos/cheat2001/angkorgit/actions/runs/<id>/approve`) — an
unapproved run EXPIRES as a red "failure" with zero jobs, which is what PRs #11,
#12 and the Sep 7 fork PR showed — the policy was then relaxed to "first-time
contributors NEW TO GITHUB" so established accounts run CI unasked; Dependabot
ALERTS on (Security tab) but automatic security-update PRs OFF and no
dependabot.yml — the owner wants a quiet PR list (2026-09-11: security updates
opened four bot PRs at once, all closed), so dependency bumps land by hand in a
`chore(deps)` commit when an alert matters (react-router-dom 6.30.6 was taken
that way); secret scanning + push protection on. The `commits` CI job
(PR-only) fails on tool-generated trailers — `Co-authored-by` naming a coding
agent, "Generated with/by", 🤖 — while leaving real people's
`users.noreply.github.com` co-authors alone. EXCEPTION (owner decision 2026-11-18):
`Co-authored-by: Claude …` / Anthropic trailers are ALLOWED — the owner's own workflow
commits with Claude Code and requires that trailer, so `claude` and `anthropic` were
removed from the job's pattern; every other tool name is still rejected.
