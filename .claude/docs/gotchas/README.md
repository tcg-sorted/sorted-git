# Hard-won gotchas (§8)

[Back to the index](../../../CLAUDE.md). Do not re-learn these. One file per gotcha,
named `gNN-<slug>.md`; the number is stable and referenced everywhere as `GNN`.
A new gotcha takes the next free number, gets its own file and a row below.

## Git engine (libgit2) and IPC

- [G1](g01-libgit2-pathspecs-are-fnmatch.md) — libgit2 pathspecs are fnmatch
- [G5](g05-tauri-command-args-are-camelcase.md) — Tauri command args are camelCase
- [G8](g08-stage-unstage-hunk-indices.md) — stage/unstage hunk indices
- [G10](g10-discard-cannot-touch-submodules.md) — discard cannot touch submodules
- [G13](g13-files-without-a-trailing-newline.md) — files without a trailing newline
- [G24](g24-never-resolve-a-branch-name-with-resolve.md) — never resolve a branch name with resolve_reference_from_short_name alone
- [G25](g25-explicit-merges-are-no-ff-only-pull.md) — explicit merges are no-ff; only pull fast-forwards by default
- [G27](g27-conflict-markers-are-exactly-7-chars-the.md) — conflict markers are exactly 7 chars; the parser must be lossless
- [G28](g28-a-paused-libgit2-rebase-never-concludes-by.md) — a paused libgit2 rebase never concludes by committing
- [G33](g33-libgit2-never-signs-and-empty-string-git.md) — libgit2 never signs, and empty-string git config must read as unset
- [G34](g34-libgit2-worktrees-the-traps-that-shaped-core.md) — libgit2 worktrees: the traps that shaped core/worktree.rs
- [G37](g37-neither-libgit2-nor-git-stash-push-paths.md) — neither libgit2 nor git stash push -- <paths> gives a truthful partial stash
- [G40](g40-do-not-ls-remote-before-a-push.md) — do not ls-remote before a push to detect "nothing to send"
- [G44](g44-blamehunk-final-signature-can-be-null-after.md) — BlameHunk::final_signature() can be NULL after blame_buffer
- [G45](g45-an-isolated-hunk-must-be-re-anchored.md) — an isolated hunk must be re-anchored before git_apply
- [G53](g53-libgit2-never-moves-a-submodule-the-app.md) — libgit2 never moves a submodule; the app does, but only an in-sync one
- [G55](g55-libgit2-never-runs-hooks-so-the-app.md) — libgit2 never runs hooks, so the app runs them through git hook run
- [G58](g58-a-rebase-step-that-fails-without-a.md) — a rebase step that fails without a conflict is NOT applied, whatever libgit2 says next
- [G59](g59-rebase-commits-must-tolerate-a-submodule-left.md) — rebase commits must tolerate a submodule left at its previous commit

## Credentials, accounts, SSH and profiles

- [G6](g06-gitkraken-and-others-rewrite-the-global-gitconfig.md) — GitKraken (and others) rewrite the GLOBAL gitconfig
- [G17](g17-hosting-credentials-in-the-api-token-era.md) — hosting credentials in the API-token era
- [G18](g18-the-two-supported-credential-methods-are-ssh.md) — the two supported credential methods are SSH keys and access tokens
- [G19](g19-credential-preferences-reach-the-engine-through-a.md) — credential preferences reach the engine through a process-global
- [G20](g20-accounts-are-https-only-ssh-remotes-never.md) — accounts are HTTPS-only; SSH remotes never consult them
- [G21](g21-do-not-conclude-an-ssh-algorithm-is.md) — do NOT conclude an SSH algorithm is unsupported from the absence of a build define.
- [G23](g23-libssh2-does-not-read-ssh-config.md) — libssh2 does NOT read ~/.ssh/config
- [G29](g29-profiles-are-repo-bound-never-a-global.md) — profiles are REPO-BOUND, never a global mode switch

## Frontend state and async

- [G9](g09-graph-store-lastpath-guard.md) — graph store lastPath guard
- [G26](g26-every-store-action-that-awaits-must-re.md) — every store action that awaits MUST re-validate before set()
- [G36](g36-react-resizable-panels-saves-one-layout-per.md) — react-resizable-panels saves ONE layout per SET of panels

## Diff viewer

- [G11](g11-wrap-mode-in-diffs-is-not-virtualized.md) — wrap mode in diffs is NOT virtualized
- [G30](g30-the-diff-auto-jump-must-be-pre.md) — the diff auto-jump must be pre-paint AND virtualizer-reset-proof
- [G35](g35-diff-highlighting-is-per-line-so-multi.md) — diff highlighting is PER LINE, so multi-line comments need carried state
- [G46](g46-diff-rows-are-a-webkit-main-thread.md) — diff rows are a WebKit main-thread budget, measured 2026-09-15
- [G47](g47-a-dom-selection-does-not-survive-virtualized.md) — a DOM selection does not survive virtualized rows; keep it in data space

## UI, design system and WebKit

- [G3](g03-window-confirm-is-unreliable-in-the-tauri.md) — window.confirm is unreliable in the Tauri webview
- [G4](g04-tokens-css-must-be-imported-by-relative.md) — tokens.css must be imported by RELATIVE path
- [G7](g07-dialog-animation.md) — dialog animation
- [G32](g32-break-words-is-not-enough-inside-a.md) — break-words is NOT enough inside a flex container; use overflow-wrap: anywhere
- [G38](g38-confirmdialog-labels-are-user-controlled-strings-too.md) — confirmDialog labels are user-controlled strings too
- [G39](g39-a-radix-aschild-trigger-needs-a-child.md) — a Radix asChild trigger needs a child that FORWARDS ITS REF
- [G52](g52-what-s-new-reads-changelog-md-at.md) — What's new reads CHANGELOG.md at build time
- [G54](g54-webkit-never-focuses-a-clicked-button-chromium.md) — WebKit never focuses a clicked button (Chromium does), and a disabled field cannot hold focus
- [G56](g56-a-theme-switch-must-not-run-the.md) — a theme switch must not run the hover fades
- [G60](g60-overflow-hidden-shell-can-still-scroll.md) — an overflow: hidden app shell can still be scrolled; use overflow: clip

## Platform, desktop shell and CI

- [G2](g02-html5-drag-and-drop-needs-dragdropenabled-false.md) — HTML5 drag-and-drop needs "dragDropEnabled": false
- [G12](g12-first-icon-build.md) — first icon build
- [G16](g16-gui-apps-on-macos-don-t-inherit.md) — GUI apps on macOS don't inherit the shell PATH
- [G31](g31-on-windows-every-command-needs-create-no.md) — on Windows every Command needs CREATE_NO_WINDOW
- [G41](g41-the-local-gate-is-macos-two-things.md) — the local gate is macOS; two things only CI catches
- [G42](g42-the-tab-switch-auto-fetch-must-wait.md) — the tab-switch auto fetch must wait for the remotes to load
- [G43](g43-sidebar-drag-and-drop-does-not-work.md) — sidebar drag-and-drop does not work on Linux under Wayland
- [G48](g48-tao-0-35-injects-its-own-gtk.md) — tao 0.35 injects its own GTK header bar on Wayland; we shrink it, we do not replace it
- [G49](g49-explorer-s-select-switch-wants-backslashes-and.md) — Explorer's /select, switch wants backslashes and its own quotes
- [G50](g50-an-unsigned-app-can-never-keep-a.md) — an unsigned .app can never keep a macOS folder permission
- [G51](g51-macos-overlay-title-bar-the-tab-strip.md) — macOS overlay title bar: the tab strip IS the title bar

## AI

- [G22](g22-ai-settings-are-per-provider.md) — AI settings are per provider
- [G57](g57-openai-compatible-request-parameters-differ-per-host.md) — OpenAI-compatible request parameters differ per host and model

## Website (Astro)

- [G14](g14-website-astro-svg-script-gotchas.md) — website (Astro) SVG/script gotchas
- [G15](g15-website-astro-shiki-dual-themes.md) — website (Astro) Shiki dual themes
