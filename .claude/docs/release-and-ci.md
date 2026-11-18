# §10 Distribution & CI

[Back to the index](../../CLAUDE.md)

- **Local**: `pnpm tauri:build` → `AngKorGit.app` + `AngKorGit_x.y.z_aarch64.dmg`;
  `pnpm install:mac` installs. Locally-built apps aren't Gatekeeper-quarantined; shared
  dmg recipients need right-click → Open (unsigned).
- **CI** (`.github/workflows/ci.yml`): frontend typecheck+unit+build · Playwright ·
  Rust fmt/clippy/test on ubuntu+macos+windows.
- **Website** (`.github/workflows/website.yml`): builds the Astro site (re-runs
  `website:images`) and deploys to **GitHub Pages** via `actions/deploy-pages`.
  The install-section version is fetched from the latest GitHub release at build
  time (`site.ts`, hardcoded fallback). Triggers: push to main (website paths),
  release published, nightly cron, manual dispatch. **Gotcha**: release-published
  runs execute on the tag ref — even with a `v*` tag policy on the github-pages
  environment (added 2026-08-09), Pages was observed to keep serving the older
  main-ref deployment despite the tag deployment reporting success. The nightly
  cron (runs on main) self-heals this; for an instant flip after publishing a
  release, manually dispatch the Website workflow. Pages CDN caches HTML for
  10 min (`max-age=600`) with no owner-facing purge.
  Served at `https://angkorgit.app/` (custom domain; `public/CNAME` holds it and the
  workflow pins `SITE_URL=https://angkorgit.app`, `SITE_BASE=/`). Repo must have Pages
  source set to "GitHub Actions", and the DNS for `angkorgit.app` must point at GitHub
  Pages (A records `185.199.108.153`/`.109`/`.110`/`.111`). The retired temporary
  URL `https://cheat2001.github.io/angkorgit/` (base `/angkorgit/`, env `SITE_BASE`)
  is no longer used — the GitHub Pages site is built at root base for the custom domain.
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
  6. `apps/website/src/lib/site.ts` — `FALLBACK_VERSION`
  7. `docs/Distribution.md` — Homebrew cask example
  8. `docs/Roadmap.md` — "Updated for vX" header + "Shipped" range, and move
     newly shipped items out of "Next"
  9. `CLAUDE.md` itself — test counts in §9 and the §6/§5 subsystem map for any
     feature that shipped
  10. `cheat2001/homebrew-tap` repo — `Casks/angkorgit.rb` `version` + `sha256`
     (`shasum -a 256` of the new universal dmg, AFTER the release artifacts are
     published; see docs/Distribution.md §4)
  Before publishing: approve the SignPath signing request and wait for the
  `sign-windows` job to go green (the draft's Windows assets are unsigned until
  then).
  After publishing: confirm the updater offered the release (installed app
  version flips), and that angkorgit.app shows the new version (manually
  dispatch the Website workflow if the release-triggered deploy served stale).
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
