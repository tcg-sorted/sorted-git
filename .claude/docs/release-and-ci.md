# §10 Distribution & CI

[Back to the index](../../CLAUDE.md)

- **Local**: `pnpm tauri:build` → `Sorted Git.app` + `Sorted Git_x.y.z_aarch64.dmg`;
  `pnpm install:mac` installs. Locally-built apps aren't Gatekeeper-quarantined; shared
  dmg recipients need right-click → Open (unsigned).
- **CI** (`.github/workflows/ci.yml`): frontend typecheck+unit+build · Playwright ·
  Rust fmt/clippy/test on ubuntu+macos+windows.
- **Release** (`release.yml`): push tag `v*` → tauri-action builds macOS (universal),
  Windows, Linux; attaches to draft GitHub release. WINDOWS CODE SIGNING
  (issue #49, SignPath Foundation approved 2026-10-08, wired 2026-10-09): the
  Windows build job uploads the NSIS setup.exe + .msi as a flat `windows-unsigned`
  workflow artifact and a `sign-windows` job (needs: build, so `latest.json`
  already carries every platform) submits it through
  `signpath/github-action-submit-signing-request@v3` (org id + project slug
  `angkorgit` + artifact configuration slug `Windows_installers` hardcoded,
  policy from repo variable SIGNPATH_SIGNING_POLICY_SLUG
  falling back to `test-signing`; secret SIGNPATH_API_TOKEN), verifies with
  Get-AuthenticodeSignature (Valid + CN=SignPath Foundation only under
  `release-signing`), re-runs `tauri signer sign` so the updater `.sig`s match
  the signed bytes, `gh release upload --clobber`s the four assets and rewrites
  the Windows signatures in `latest.json` by URL suffix. Artifact configuration
  in `.github/signpath/artifact-configuration.xml` (uploaded to the SignPath
  project by hand). The SignPath GitHub App must be installed on the repo
  (the first test run failed with "Failed to retrieve GitHub App token"). Only the installers are signed, the inner angkorgit.exe is
  not. `release-signing` needs a manual approval in the SignPath UI per release
  (the job waits up to 5 h; on timeout deny the stale request and re-run the
  job). Owner setup steps and the switch to production live in
  docs/Distribution.md §2b; the first test run is still pending.
- **Version-alignment checklist (MANDATORY on every release/bump)** — the version
  lives in more places than the manifests; a release is not done until ALL of
  these say the new version. Verify with
  `grep -rn "<OLD_VERSION>" --exclude-dir={node_modules,target,test-results} .`
  (only CHANGELOG history and genuinely historical notes may match):
  1. `package.json` (root) + `apps/desktop/package.json`
  2. `apps/desktop/src-tauri/tauri.conf.json` + `Cargo.toml` + `Cargo.lock`
     (the `name = "angkorgit"` entry)
  3. `.github/ISSUE_TEMPLATE/bug_report.yml` version placeholder
  4. `CHANGELOG.md` — roll `[Unreleased]` into the new version WITH a themed
     summary paragraph, and extend the compare links at the bottom (they have
     been forgotten before — 0.5.0/0.6.0 were missing until 0.6.1)
  5. `README.md` — the three pinned install commands (macOS dmg, Windows exe,
     Linux AppImage)
  6. `docs/Distribution.md` — Homebrew cask example
  7. `docs/Roadmap.md` — "Updated for vX" header + "Shipped" range, and move
     newly shipped items out of "Next"
  8. The AI docs — test counts in `.claude/docs/testing.md` and the `.claude/docs/engine/`
     and `.claude/docs/frontend/` files for any feature that shipped
  9. `cheat2001/homebrew-tap` repo — `Casks/angkorgit.rb` `version` + `sha256`
     (`shasum -a 256` of the new universal dmg, AFTER the release artifacts are
     published; see docs/Distribution.md §4)
  Before publishing: approve the SignPath signing request and wait for the
  `sign-windows` job to go green (the draft's Windows assets are unsigned until
  then).
  After publishing: confirm the updater offered the release (installed app
  version flips).
- **Release notes follow a fixed house template** (see any published release, e.g.
  v0.3.0 — the owner rejects ad-hoc formats): (1) themed opening line ("The X
  release. …") + the standing updater sentence "Already on AngKorGit? **Your app
  will offer this update by itself** — one click, signature-verified. 🏛️";
  (2) `## Highlights` — emoji-prefixed bold titles written as user benefits in
  narrative voice, NOT changelog Added/Changed categories; (3) `## Fixed` — plain
  bullets, lead with the user-visible symptom; (4) optional `## Removed` /
  `## Notes`; (5) `## Install` — Platform/File table with this version's exact
  artifact names; (6) footer line: first-launch guide · changelog · issues links.
  Never paste raw CHANGELOG sections as release notes.
- Repo remote: `git@github.com:cheat2001/angkorgit.git` (SSH). The owner's key is
  `~/.ssh/angkorgit_rsa`, selected for github.com via `~/.ssh/config`.
