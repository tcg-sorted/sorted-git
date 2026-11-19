# Engine: `ai_cli.rs`

Source: `apps/desktop/src-tauri/src/ai_cli.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
ai_cli.rs             ← installed AI-CLI transport: detect (which_in over augmented PATH +
                        login-shell fallback, per-agent --version) and run (allowlisted
                        binaries only, stdin prompt, {OUTPUT_FILE} placeholder → temp file,
                        neutral cwd, NO_COLOR/TERM=dumb env, kill-on-timeout); capture =
                        spawn_piped + capture_child (kills the child only); hooks use
                        spawn_tree(command, track_descendants) + run_tree(tree, stdin, timeout, retain)
                        → TreeRun {captured, timed_out, exit_unconfirmed}. A timeout
                        signals the process tree and returns the output so far. For group pull,
                        the runner keeps a handle for background processes it can identify.
                        Cancel monitors tracked processes while the current pull finishes
                        and reports when exit cannot be confirmed. Empty Unix groups finish
                        quietly (pidfd signal 0, else killpg signal 0); live groups without
                        a pidfd warn immediately. Detached children are outside this tracking.
                        See G55 (8). OUTPUT IS DRAINED, NOT
                        JOINED (PR #85 reviews): the readers stream into shared buffers and, once
                        the process has exited, get at most OUTPUT_DRAIN 1 s before collect()
                        returns what was read — a background process that inherited
                        stdout/stderr (a hook's `cmd &`) kept the old read_to_end joins blocked,
                        so Push never finished (see §9 for tests). After capture, readers
                        keep draining inherited pipes without saving further output.
                        WINDOWS BATCH LAUNCHERS (issue #43 follow-up, 2026-09-30): Cursor
                        installs `cursor-agent.cmd` (→ .ps1 → versions\<v>\node.exe
                        index.js) and is the ONE agent whose prompt is a positional ARG
                        (promptVia 'arg'); Rust's std refuses to spawn a .cmd/.bat with an
                        argument containing a newline (the CVE-2024-24576 guard, error
                        "batch file arguments are invalid"), so every AI request failed on
                        Windows while the npm .cmd shims of the stdin-prompt agents were
                        fine. launch_command(program) therefore runs
                        `<launcher dir>\versions\<newest YYYY.MM.DD[-…]-hash>\node.exe
                        index.js` directly (cursor_node_launch, CURSOR_INVOKED_AS set like
                        the real launcher) when the program is a cmd/bat Cursor launcher
                        and that layout exists, else the plain program — the same
                        resolution the reporter's Go bridge did. Deliberately NOT
                        cfg(windows): the helpers compile and are unit-tested on every
                        OS (G41), and a .cmd never appears on unix anyway. Untested on a
                        real Windows machine as of 2026-09-30; the reporter verifies
```
