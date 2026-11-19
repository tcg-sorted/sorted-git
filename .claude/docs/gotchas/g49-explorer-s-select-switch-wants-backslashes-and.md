# G49 — Explorer's /select, switch wants backslashes and its own quotes

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G49 — Explorer's `/select,` switch wants backslashes and its own quotes**:
  `commands::reveal_path` on Windows ran `explorer /select,<path>` with the path the
  frontend builds as `<repo>/<git path>` (forward slashes), and Rust's `Command::arg`
  wraps an argument containing a space in quotes as a WHOLE (`"/select,C:\a b\f"`),
  which Explorer does not parse — it opened a default folder instead of selecting the
  file (Christian on Windows 11, #26, 2026-09-16; macOS `open -R` and Linux
  `xdg-open <parent>` never saw it). The Windows arm now replaces `/` with `\` and
  passes the switch through `CommandExt::raw_arg` as `/select,"<path>"`. Cannot be run
  from macOS; the windows CI job compiles it (G41), the behaviour is verified by the
  reporter.
