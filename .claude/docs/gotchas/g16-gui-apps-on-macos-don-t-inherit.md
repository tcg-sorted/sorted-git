# G16 — GUI apps on macOS don't inherit the shell PATH

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G16 — GUI apps on macOS don't inherit the shell PATH**, so `which claude` from the
  webview/Rust would miss CLIs installed via npm/homebrew/nvm when the app is launched
  from Finder. `ai_cli.rs::search_path` augments PATH with well-known install dirs
  (~/.local/bin, ~/.npm-global/bin, /opt/homebrew/bin, ~/.nvm/versions/node/*/bin,
  ~/.opencode/bin, pnpm homes, mise shims, …) and falls back to a
  `$SHELL -lc 'command -v …'` login-shell lookup — but note `-lc` is login
  NON-interactive: zsh reads .zprofile, NOT .zshrc, so a CLI whose installer only
  adds PATH to .zshrc (OpenCode's curl installer does exactly this, installing to
  ~/.opencode/bin) is invisible to BOTH nets unless its dir is in the well-known
  list. When a "CLI not detected" report arrives, ask HOW it was installed and add
  the installer's dir; don't switch the fallback to `-lic` (interactive rcs can be
  slow/noisy and would break under the timeout); `run()` reuses the
  augmented PATH (npm shims need `node` resolvable) and prepends the binary's own dir.
  Windows also adds `%LOCALAPPDATA%\Microsoft\WinGet\Links` explicitly so a newly
  installed GitHub Copilot CLI is visible before the desktop app inherits an updated
  user PATH.
  Also: killing a timed-out CLI can leave a grandchild holding the stdout pipe — never
  join the reader threads on the timeout path or the kill blocks until the grandchild
  exits. And the `{OUTPUT_FILE}` placeholder must be substituted only when an argument
  IS the placeholder (exact match, never `contains`) — prompts passed as args can
  legitimately contain the literal text, e.g. a staged diff of ai_cli.rs/cliAgents.ts
  themselves (regression test: `leaves_prompt_args_containing_placeholder_text_untouched`).
