# G41 — the local gate is macOS; two things only CI catches

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G41 — the local gate is macOS; two things only CI catches**: (1) an import used
  solely inside a `#[cfg(target_os = "macos")]` item is an unused import on Linux
  and Windows, and clippy runs with `-D warnings` there — qualify the type inline
  (`std::path::PathBuf`) or gate the `use` with the same cfg. (2) A test fixture
  that shells out to `git clone` gets Windows git's `core.autocrlf=true` checkout,
  so setting autocrlf off AFTER the clone is too late: the next `commit_all` in
  the clone silently commits the CRLF file and a rebase onto LF content reports
  conflicts on Windows only. Clone with `git -c core.autocrlf=false clone …`
  (see `clone_of` in tests/git_engine.rs). A SUBMODULE repo made by `git submodule
  add` / `update --init` needs the same pin in its OWN config (`git config
  core.autocrlf false` inside the submodule folder, see SubmoduleFixture): libgit2's
  later checkout in it reads the system autocrlf and wrote `two\r\n` on the PR #80
  Windows job. Reproduce on a Mac by running the test binary with HOME pointing at a
  folder whose .gitconfig sets `core.autocrlf = true`. Both broke the 0.13.0 release commit's
  CI on 2026-09-12 and were fixed in follow-up commits; the Release workflow only
  runs `tauri build`, so the tagged artifacts were unaffected.
