# G50 — an unsigned .app can never keep a macOS folder permission

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G50 — an unsigned .app can never keep a macOS folder permission**: users reported
  the "AngKorGit would like to access files in your Desktop folder" dialog on every
  return to the window even after clicking Allow (2026-09-20). tccd keys a grant on
  the bundle id plus a code requirement and validates the bundle's static code against
  it on EVERY access; releases through 0.15.0 had only the linker's `adhoc,
  linker-signed` signature on the arm64 executable (Info.plist not bound, no resource
  seal, x86_64 slice unsigned), `codesign -d -r-` on the bundle said "not signed at
  all", and the daemon log (`/usr/bin/log show --info --debug --predicate 'process ==
  "tccd"'`; note `log` is a zsh builtin, call the binary) showed Allow → `TCCDEvent
  type=Create` → 9 ms later `MacOS error: -67062` → "Failed to match existing code
  requirement" → prompt again. Auto-fetch on window focus is what touches the Desktop
  repo, hence "when I come back". Fix: `bundle.macOS.signingIdentity: "-"` (bundler
  runs `codesign --force -s -` on frameworks then the .app; `hardenedRuntime` is
  explicitly false so an ad-hoc build behaves like the old unsigned one) — one prompt
  per installed build, remembered. A second cause stacks on top: a binary replaced
  on disk under a running process (updater, dmg drag, install:mac) can never match,
  which is the owner's launch-time "loop" (seven prompts in five seconds, one per
  startup thread). Untested follow-up: a custom designated requirement `identifier
  "dev.angkorgit.app"` (codesign accepts it on an ad-hoc signature) would make the
  grant survive updates; Tauri has no config for it, so it needs a post-bundle re-sign
  plus re-tar/re-sign of the updater artifact and a live tccd test before shipping.
