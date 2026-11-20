# §10 Distribution & CI

[Back to the index](../../CLAUDE.md)

- **Local**: `pnpm tauri:build` → `Sorted Git.app` + `Sorted Git_x.y.z_aarch64.dmg`;
  `pnpm install:mac` installs. Locally-built apps aren't Gatekeeper-quarantined; shared
  dmg recipients need right-click → Open (unsigned).
- **CI** (`.github/workflows/ci.yml`): frontend typecheck+unit+build · Playwright ·
  Rust fmt/clippy/test on ubuntu+macos+windows.
- **Release** (`release.yml`, sorted-git flow since 2026-11-19): a push to the
  `release` branch (in practice: merging a PR into it) cuts a release in
  `tcg-sorted/sorted-git`. Jobs:
  1. `prepare` reads `version` from `apps/desktop/src-tauri/tauri.conf.json`,
     fails unless root `package.json`, `apps/desktop/package.json` and `Cargo.toml`
     say the same, fails if tag `v<version>` or its release already exists (a
     forgotten bump never overwrites a release). It also reads
     `bundle.createUpdaterArtifacts`: when true it requires the
     `TAURI_SIGNING_PRIVATE_KEY` secret and turns on the updater outputs below.
     The auto-updater is currently disabled in this fork (see CLAUDE.md), so
     today the flag is false and releases carry only the installers: no `.sig`
     files, no `.app.tar.gz`, no `latest.json`.
  2. `build` (macos-latest `--target universal-apple-darwin`, ubuntu-22.04,
     windows-latest; fail-fast) wipes old `release/bundle` dirs restored by the
     rust cache, runs `pnpm tauri:build` in the runner's default shell (never
     `shell: bash`: on Windows Git Bash's Perl cannot build the vendored OpenSSL,
     G61), then copies each bundle to a fixed,
     space-free name (below) and uploads them as a workflow artifact. A step
     fails if a pattern matches zero or several bundles.
  3. `publish` merges the artifacts, writes `latest.json` itself with jq (only
     when the updater flag is on (no
     tauri-action, so no race between matrix jobs over the manifest)), and runs
     `gh release create v<version> --target <merged sha> --generate-notes --latest`,
     which creates the tag. The release is published, not a draft, because the
     updater endpoint `releases/latest/download/latest.json` only resolves to the
     newest published, non-prerelease release.
  The workflow also has `workflow_dispatch` (re-run on the `release` branch
  only; any other ref fails in `prepare`). Runs share a `release` concurrency
  group and queue instead of cancelling.
- **Release asset names.** Tauri names bundles after `productName`, which may
  contain spaces ("Sorted Git"). GitHub rewrites unsupported characters in
  uploaded asset names (a space becomes `.`), so the workflow renames every file
  itself before upload. `prepare` derives `<P>` from `productName` by replacing
  every character outside `[A-Za-z0-9_-]` with `.` (the same rule GitHub uses):
  `Sorted.Git` for the product name "Sorted Git". The
  release title is `<productName> v<version>`. `latest.json` URLs are built from
  the same names:

  | Platform | Asset (`X.Y.Z` = version, `<P>` = prefix above) |
  | --- | --- |
  | macOS universal installer | `<P>_X.Y.Z_universal.dmg` |
  | macOS updater bundle (updater on only) | `<P>_X.Y.Z_universal.app.tar.gz` (+ `.sig`) |
  | Windows installer (NSIS) | `<P>_X.Y.Z_x64-setup.exe` (+ `.sig`) |
  | Windows installer (MSI) | `<P>_X.Y.Z_x64_en-US.msi` (+ `.sig`) |
  | Linux AppImage | `<P>_X.Y.Z_amd64.AppImage` (+ `.sig`) |
  | Linux deb | `<P>_X.Y.Z_amd64.deb` (+ `.sig`) |
  | Linux rpm | `<P>-X.Y.Z-1.x86_64.rpm` (+ `.sig`) |
  | Updater manifest (updater on only) | `latest.json` |

  The `.sig` files exist only while the updater is on.

  Download URLs: `https://github.com/tcg-sorted/sorted-git/releases/download/vX.Y.Z/<asset>`,
  or `.../releases/latest/download/<asset>` for the newest release. `latest.json`
  maps `darwin-aarch64`/`darwin-x86_64` (+ `-app`) to the universal `.app.tar.gz`,
  `windows-x86_64` and `-nsis` to the setup.exe, `-msi` to the msi,
  `linux-x86_64` and `-appimage` to the AppImage, plus `-deb` and `-rpm`.
- **Re-enabling the updater (one-time owner setup, never done by an assistant).**
  Only needed if the fork turns the auto-updater back on: restore the updater
  plugin, its capability and startup check, set `bundle.createUpdaterArtifacts`
  to true, add `plugins.updater` with the endpoint
  `https://github.com/tcg-sorted/sorted-git/releases/latest/download/latest.json`
  and a pubkey from a key the company owns (never upstream's). The bundles are
  then signed with a minisign key held in two repo secrets. On the owner's machine:
  1. Generate the key pair (choose a password when prompted):
     `pnpm tauri signer generate -w ~/.tauri/sorted-git.key`
     This writes `~/.tauri/sorted-git.key` (private) and
     `~/.tauri/sorted-git.key.pub` (public). Back the private key up in the
     company password manager: losing it means installed apps can never be
     updated again.
  2. Store the secrets (bash / PowerShell):
     `gh secret set TAURI_SIGNING_PRIVATE_KEY --repo tcg-sorted/sorted-git < ~/.tauri/sorted-git.key`
     `Get-Content -Raw ~/.tauri/sorted-git.key | gh secret set TAURI_SIGNING_PRIVATE_KEY --repo tcg-sorted/sorted-git`
     `gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo tcg-sorted/sorted-git`
     (prompts for the password; GitHub rejects empty secrets, so with an empty
     password just skip this one and the build sees an empty value).
  3. Set `plugins.updater.pubkey` in `apps/desktop/src-tauri/tauri.conf.json`
     to the single-line contents of `~/.tauri/sorted-git.key.pub`, and commit
     that before the first release that ships the updater.
  Installs of upstream AngKorGit builds (upstream identifier and pubkey) will not
  update to this fork's releases; that is expected.
- **Release branch (one-time).** Create `release` once from `main`
  (`git push origin origin/main:refs/heads/release`) and protect it so it only
  changes through PRs.
- **Cutting a release.** On a work branch off `main`: bump the version through the
  checklist below, open the PR into `main`, merge it, then open a PR from `main`
  into `release` and merge that. The merge triggers the workflow; when it is
  green, edit the generated release notes into the house template below. To
  re-try a failed run, fix the problem on `main`, merge into `release` again
  (the version is still free because nothing was published) or re-run the
  workflow.
- **Windows code signing is off.** Upstream's `sign-windows` job submitted the
  installers to SignPath Foundation under upstream's organization and the
  `angkorgit` project (approval is per open-source project and its repo), so it
  cannot work for `tcg-sorted/sorted-git` and was removed. Windows installers
  ship unsigned (SmartScreen warns). `.github/signpath/artifact-configuration.xml`
  and docs/Distribution.md §2b remain as reference for a future signing setup of
  our own; re-adding it means signing the setup.exe and msi between `build` and
  `publish`, then re-running `tauri signer sign` on the signed bytes so the
  `.sig` files match.
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
  9. (upstream only, not done in this fork) `cheat2001/homebrew-tap` repo — `Casks/angkorgit.rb` `version` + `sha256`
     (`shasum -a 256` of the new universal dmg, AFTER the release artifacts are
     published; see docs/Distribution.md §4)
  After the release workflow publishes: check the release assets.
- **Release notes follow a fixed house template** (see any published release, e.g.
  v0.3.0 — the owner rejects ad-hoc formats): (1) themed opening line ("The X
  release. …") (the old standing updater sentence "Your app will offer this
  update by itself" is dropped while the updater is disabled);
  (2) `## Highlights` — emoji-prefixed bold titles written as user benefits in
  narrative voice, NOT changelog Added/Changed categories; (3) `## Fixed` — plain
  bullets, lead with the user-visible symptom; (4) optional `## Removed` /
  `## Notes`; (5) `## Install` — Platform/File table with this version's exact
  artifact names; (6) footer line: first-launch guide · changelog · issues links.
  Never paste raw CHANGELOG sections as release notes.
- Repo: `tcg-sorted/sorted-git` (public), a fork of upstream `cheat2001/angkorgit`.
  Never push to or open PRs against upstream; pass `--repo tcg-sorted/sorted-git`
  to `gh`.
