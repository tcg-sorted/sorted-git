# Engine: `editors.rs`

Source: `apps/desktop/src-tauri/src/editors.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
editors.rs            ← OPEN IN EXTERNAL EDITOR (issue #18, 2026-09-12): a static
                        EDITORS spec list (id/label/bin/mac app — VS Code, Insiders,
                        Cursor, Windsurf, Zed, Sublime, IntelliJ, WebStorm, PyCharm,
                        Rider, Fleet, Nova, Xcode via `xed`, GNOME Builder, Kate);
                        detect() = which_in over ai_cli::search_path (same augmented
                        PATH as the AI CLIs, G16) for EVERY name in spec.bins (Zed ships
                        as `zeditor` on Arch/Fedora, issue #18 follow-up), a macOS
                        fallback to /Applications + ~/Applications bundles (launch
                        "app" → `open -a`) and a LINUX fallback to the Flatpak export
                        wrappers /var/lib/flatpak/exports/bin/<app id> and
                        ~/.local/share/flatpak/exports/bin/<app id> (spec.flatpak);
                        editor_dirs() appends per-OS default install folders to the
                        search PATH (Windows: %LOCALAPPDATA%\Programs\<editor>\bin,
                        JetBrains Toolbox scripts, %ProgramFiles%; macOS/Linux: the
                        Toolbox scripts dir, /opt/sublime_text, /snap/bin) because a
                        Windows editor installed without its launcher was invisible; open(editorId, target) RE-DETECTS and refuses an id that
                        is not installed — the frontend never hands the engine a
                        program path, same allowlist principle as ai_cli (a custom
                        command was deliberately NOT built); spawns through
                        proc::hidden with stdio null + augmented PATH; 4 module tests
```
