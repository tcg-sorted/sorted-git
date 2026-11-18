# Engine: `terminal.rs`

Source: `apps/desktop/src-tauri/src/terminal.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
terminal.rs           ← real PTY per session (portable-pty), events term-data-{id}/term-exit-{id};
                        ALT+UP/DOWN (issue #45, 2026-09-28): xterm 5.5 Keyboard.ts rewrites
                        ESC[1;3A/B into ESC[1;5A/B (Ctrl+arrow) on every platform BUT macOS, so
                        Codex's "Alt+Up to answer" never fired on Linux/Windows; the frontend
                        terminal/keys.ts altArrowSequence + TerminalPanel's altArrowHandler
                        (attachCustomKeyEventHandler on the real AND the demo session) write the
                        Alt sequence to the PTY themselves on keydown and return false so xterm
                        skips its mapping — unconditionally, because on macOS the result is
                        byte-identical to xterm's own, which is what the owner verified with
                        `cat -v` (^[[1;3A) and what makes the code path exercisable on a Mac;
                        Linux/Windows still need the reporter's confirmation; unit tests in
                        tests/unit/terminalKeys.test.ts (relative import, no alias needed);
                        LOGIN-SHELL ENV + UTF-8 LOCALE (issue #37, 2026-09-24): the first
                        session probes `$SHELL -ilc 'echo MARK; env; echo MARK'` ONCE per
                        process (OnceLock, ai_cli::capture, 5 s cap, proc::hidden) and
                        parse_marked_env keeps only the block between the marks (profile
                        chatter ignored, `=` inside values kept, TERM/_/SHLVL/PWD/OLDPWD
                        dropped); every session gets that env, then LANG = utf8_locale
                        (keep *.UTF-8/*.utf8, zh_CN → zh_CN.UTF-8, C/POSIX/empty →
                        en_US.UTF-8, @modifier preserved), a non-UTF-8 LC_ALL is upgraded
                        the same way, TERM=xterm-256color and COLORTERM=truecolor; a
                        Dock-launched app has no .zprofile PATH and zsh picks MULTIBYTE
                        from the locale it is exec'd with, which was the CJK-as-U+FFFD
                        report; 3 module tests; the probe, its constants, helpers, the OnceLock/Duration imports AND the test module are all `cfg(not(target_os = "windows"))` — the first push failed the Windows clippy job with eight dead-code errors (G41, 2026-09-24)
```
