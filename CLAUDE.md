# CLAUDE.md — AngKorGit Project Knowledge Base

> **Purpose of this file**: the entry point and index for AI coding assistants. It holds
> what every task needs (what the project is, the stack, commands, the non-negotiable
> conventions) and points to the detailed docs in [`.claude/docs/`](.claude/docs/).
> Read this first, then open only the docs for the area you are touching — they replace
> scanning the repository. See "Maintaining these docs" at the end before editing them.

---

## 1. What AngKorGit is

**AngKorGit** is a modern, fast, beautiful cross-platform desktop **Git client**
(macOS / Windows / Linux), inspired by the workflow efficiency of GitKraken but
deliberately minimal: *"if GitKraken has 100 features, ship the best 25 executed
exceptionally well."* The name honors **Angkor Wat** — strength, simplicity, and
craftsmanship from Cambodia 🇰🇭.

- **Bundle size: 14 MB universal .dmg / 27 MB installed** (0.16.0, measured from the
  release artifacts, now ad-hoc signed on both slices; 0.13.0 was 14 / 28, 0.12.0 was
  12 / 25 before the single-instance plugin and blame) — a single-arch build is 13 MB
  installed. (vs ~1 GB for Electron-based clients.) Re-measure
  before quoting it: `du -sh target/universal-apple-darwin/release/bundle/macos/AngKorGit.app`
- Styled with the company's Sorted design system: Sorted dark theme by default for new installs (14 themes total, dark + light), Sorted Blue the single accent, Sorted S monogram as the logo. The product name stays AngKorGit. Details in [design-system.md](.claude/docs/design-system.md)
- Keyboard-first (⌘K palette), beginner-friendly (visual conflict resolver, confirm
  dialogs, undo/redo), performance-first (virtualized graph & diffs, 100k-commit repos stay smooth)

## 2. Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Desktop shell | **Tauri v2** | system webview (WKWebView / WebView2 / WebKitGTK) |
| Git engine | **Rust + git2 (libgit2)** | `vendored-libgit2`; no shelling out for hot paths |
| Frontend | **React 18 + TypeScript (strict)** | Vite 6, bundler moduleResolution |
| Styling | **TailwindCSS 3.4** + shadcn-style primitives (Radix UI) | tokens in CSS variables |
| State | **Zustand 5** (per-feature stores, some persisted) | |
| Animation | **Framer Motion 11** (subtle; splash logo draw) | |
| Router | react-router-dom 6 (MemoryRouter: `/welcome`, `/repo`) | |
| Icons / fonts | lucide-react · Archivo Variable + JetBrains Mono (self-hosted @fontsource) | |
| Key libs | @tanstack/react-virtual, react-resizable-panels, cmdk, sonner, @xterm/xterm, highlight.js (lib/core + 26 langs) | |
| Rust deps | tauri-plugin-dialog/opener, portable-pty, keyring 3, notify-debouncer-mini, reqwest (rustls), which 7, base64, thiserror, same-file (hook paths by file identity); tempfile for atomic rebase baseline writes and tests | |

## 3. Monorepo layout (pnpm workspaces)

```
angkorgit/
├── CLAUDE.md                  ← this index
├── .claude/docs/              ← detailed AI docs (see §Docs index below)
├── apps/desktop/              ← THE app (@angkorgit/desktop)
│   ├── src/                   ← React frontend      → .claude/docs/frontend/
│   └── src-tauri/             ← Rust git engine     → .claude/docs/engine/
├── apps/website/              ← marketing site (Astro 5, static, angkorgit.app)
├── packages/core/             ← @angkorgit/core — pure TypeScript domain (git types, graph
│                                layout, diff, conflicts, forge adapters, AI providers)
├── packages/design-system/    ← @angkorgit/design-system — tokens + Radix primitives
├── docs/                      ← human docs: Architecture, UI-Guidelines, Development, …
├── tests/unit/ · tests/e2e/   ← vitest (pure core logic) · Playwright (demo mode)
└── .github/                   ← CI, release, SignPath config, issue/PR templates
```

The full annotated tree (every package folder, the website's pages and copy rules,
`packages/core` modules) is in
[.claude/docs/architecture/monorepo-layout.md](.claude/docs/architecture/monorepo-layout.md).

**Import aliases**: `@/` = `apps/desktop/src`; `@angkorgit/core` and
`@angkorgit/design-system` resolve to package **sources** (vite alias + tsconfig paths —
no build step for packages).

## 4. Commands (run from repo root unless stated)

| Command | Purpose |
| --- | --- |
| `pnpm install` | install workspace deps |
| `pnpm tauri:dev` | full desktop app, hot reload both sides |
| `pnpm dev` | frontend only in a browser — runs on **demo mode** (see §6.1) |
| `pnpm typecheck` / `pnpm test` | TS across packages / vitest unit tests |
| `pnpm test:e2e` | Playwright against demo mode |
| `cd apps/desktop/src-tauri && cargo test` | **git engine integration tests** (real temp repos) |
| `pnpm tauri:build` | release bundles (.app + .dmg in `src-tauri/target/release/bundle/`) |
| `pnpm install:mac` | copy built .app → /Applications and launch |
| `pnpm release:mac` | build then open the dmg folder |
| `pnpm website` | dev-server the marketing site (http://localhost:4321/) |
| `pnpm website:build` / `pnpm website:preview` | build / preview the static site |
| `pnpm website:images` | regenerate WebP screenshots + og.png from `docs/assets` (sharp) |
| `pnpm icons` | regenerate the Sorted monogram app icon from `src-tauri/icons/source` (then `tauri icon` for .icns/.ico) |

**Build gotchas (important):**
- **Quit the running app before `tauri:build`** — the `.dmg` bundler script is flaky while the app runs (the `.app` itself still builds).
- `source ~/.cargo/env` before cargo commands (rustup-installed toolchain).
- The auto-updater is DISABLED in this fork (2026-11-18, see docs/Distribution.md §3):
  its trust root was the upstream author's feed and minisign key. No updater plugin,
  capability, endpoint or startup check exists, `createUpdaterArtifacts` is false and
  releases need no `TAURI_SIGNING_PRIVATE_KEY`.
- Root pnpm scripts must run **from repo root**; background shells don't persist `cd`.
- Rust fmt/clippy are CI gates: `cargo fmt --check && cargo clippy --all-targets -- -D warnings`.
- `pnpm install:mac` quits a running AngKorGit first (pkill) — a new binary copied under a
  running process can never match a macOS folder grant (G50), and the single-instance
  plugin would otherwise just focus the old process.

## 5. Core conventions (apply to every change)

### Code style: NO inline comments

The owner's explicit convention: **source files contain no comments** — not
doc-comments, not explainers. Express intent through naming/structure; put
explanations in `.claude/docs/` (gotchas G1+) or `docs/`. Allowed exceptions are
machine directives only: `eslint-disable`, `@ts-expect-error`,
`/// <reference>`, Rust `#[allow]` attributes. When a change needs context,
update the docs — never the code.

### Engine conventions

- Operations that can pause on conflicts return `OpOutcome { status: "ok"|"conflicts"|"up_to_date"|"fast_forward", message }` — never an error for conflicts.
- Command args are **camelCase** matching the TS payloads (`#![allow(non_snake_case)]`).
- Every new engine function gets an integration test in `tests/git_engine.rs`
  (TempRepo fixture creates real repos in temp dirs; uses `angkorgit_lib::test_api`;
  current counts in [testing.md](.claude/docs/testing.md)).
- Destructive ops verify outcomes (e.g. discard returns leftover paths → UI explains submodules).

### Frontend state conventions

- One Zustand store per feature; cross-feature access via `useX.getState()` in handlers,
  hooks in components. No cross-store imports at module top-level that could cycle.
- Persisted stores: `settings` (whole) and `ui` (partialize: view prefs only). Never
  persist transient state (selections, dialogs, centerDiff).
- Mutating git operations that should be undoable MUST go through
  `useUndo.getState().tracked({ path, kind, label, extra, action, shouldRecord })`.
- Every store action that awaits re-validates before `set()` (G26).
- **Never** import `@tauri-apps/*` outside `core/ipc.ts`; the browser and the e2e suite
  run on demo mode ([demo-mode.md](.claude/docs/frontend/demo-mode.md)).

### UI rules in one breath

Colors only via tokens, sentence case, every icon button gets a `Hint`, user-controlled
strings need a wrap or truncate strategy, centered dialogs animate with the centering
translate. Read [design-system.md](.claude/docs/design-system.md) before any UI change.

## Docs index (`.claude/docs/`)

Open the doc for the area you touch. Each file names its source path, and the folder
READMEs list every file with a one-line summary.

| When you work on… | Read |
| --- | --- |
| Any Rust file in `src-tauri/src/` | [engine/README.md](.claude/docs/engine/README.md) → `engine/<module>.md` or `engine/core/<module>.md` (one per source file) |
| Fetch/push/clone auth, accounts, SSH | [engine/credential-chain.md](.claude/docs/engine/credential-chain.md), gotchas G17–G23, G29 |
| Any file in `apps/desktop/src/` | [frontend/README.md](.claude/docs/frontend/README.md) → `frontend/features/<feature>.md`, `components.md`, `shared.md`, `app-entry.md` |
| Demo mode, e2e fixtures, `angkorgit-demo-*` flags | [frontend/demo-mode.md](.claude/docs/frontend/demo-mode.md) |
| Styling, tokens, themes, contrast, layout rules | [design-system.md](.claude/docs/design-system.md) |
| `packages/*`, the website, folder structure | [architecture/monorepo-layout.md](.claude/docs/architecture/monorepo-layout.md) |
| A bug that "should not happen", libgit2/WebKit/platform quirks | [gotchas/README.md](.claude/docs/gotchas/README.md) — G1…G59, grouped by area |
| Writing or locating tests, test counts | [testing.md](.claude/docs/testing.md) |
| Releases, version bumps, CI, signing, website deploy | [release-and-ci.md](.claude/docs/release-and-ci.md) (mandatory version-alignment checklist) |
| License, community files, GitHub repo settings | [open-source.md](.claude/docs/open-source.md) |
| Proposing new features | [backlog.md](.claude/docs/backlog.md) (agreed direction and parked ideas) |

**Old section numbers** still appear in the docs ("see §9", "§6.1"). They map to:
§3 → architecture/monorepo-layout.md · §5 → engine/ · §6 → frontend/ ·
§6.1 → frontend/demo-mode.md · §6.2, §6.5 → this file (§5) · §7 → design-system.md ·
§8 → gotchas/ · §9 → testing.md · §9.5 → open-source.md · §10 → release-and-ci.md ·
§11 → backlog.md · §12 → this file. A bare `GNN` is gotcha
`.claude/docs/gotchas/gNN-*.md`.

## 6. Voice & positioning (for docs/website work)

- Tagline: *"Everyday Git, made delightful."* Motto: *Strength. Simplicity. Craftsmanship.*
- Compare on: size (14 MB download vs ~1 GB), speed (native libgit2), focus (25 features done well).
- Never copy GitKraken assets/layouts; we take workflow inspiration only.
- License: MIT. Attribution to Angkor Wat heritage is part of the brand story.

## Maintaining these docs

- **This file stays short**: project goal, stack, commands, conventions that apply to
  every change, and the index. Anything about one module, feature, release step or
  quirk goes into `.claude/docs/`.
- **Docs mirror the source tree**: `src-tauri/src/<m>.rs` → `engine/<m>.md`,
  `src-tauri/src/core/<m>.rs` → `engine/core/<m>.md`, `src/features/<f>/` →
  `frontend/features/<f>.md`. A new module or feature gets a new file and a row in its
  folder README.
- **Gotchas**: a new one takes the next free number (`gotchas/gNN-<slug>.md`) and a row
  in `gotchas/README.md` under its area. Numbers are stable; never renumber.
- When a change alters architecture or a convention, update the matching doc in the same
  commit (the PR template asks for it). Do not put this context in code comments.
- Do not move docs into `.claude/rules/`: files there load into every session, which is
  what this split avoids.
