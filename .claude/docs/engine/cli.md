# Engine: `cli.rs`

Source: `apps/desktop/src-tauri/src/cli.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
cli.rs                ← `angkorgit` CLI (GitHub Desktop-shaped): bare / `open [path]`
                        opens a folder; `clone [-b branch] <url|owner/repo>` opens the
                        in-app clone dialog prefilled (url, cwd, branch) so progress and
                        cancel stay in the UI — IN PLACE when a repo tab is open, on the
                        welcome page otherwise (App.tsx openClone); RepositoryPage's
                        CloneDialog onCloned OPENS the clone (it used to only refreshAll,
                        so a toolbar clone never opened the new repo — fixed with the CLI
                        follow-up 2026-09-12); `--help` lists commands. Shim in
                        cli/angkorgit.sh (.cmd on Windows) plus an `akg` ALIAS (owner
                        2026-09-12: the full name is long to type): a relative symlink
                        akg → angkorgit next to the shim on unix, a second akg.cmd on
                        Windows; status reports aliasPath when the alias reads as our
                        shim, uninstall removes the alias BEFORE the shim (a dangling
                        symlink no longer reads as ours); the full name stays the
                        documented one, help ends with "akg is a short alias"; missing path exits 1 (capture
                        resolve before launch); install dest is /usr/local/bin then
                        ~/.local/bin (never Homebrew's prefix — when that fallback is
                        used the Settings card shows the `export PATH` line, a static
                        hint, NOT a detected claim, see review of #12); on WINDOWS
                        install/uninstall add/remove %LOCALAPPDATA%\angkorgit\bin from
                        the USER Path through a hidden PowerShell
                        [Environment]::SetEnvironmentVariable call (cli::user_path,
                        untested on a real Windows machine as of 2026-09-12 — CI only
                        compiles it); app takes `--open` /
                        `--clone` / RunEvent::Opened + single-instance forward; 7 module tests
```
