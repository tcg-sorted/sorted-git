# Engine: `fonts.rs`

Source: `apps/desktop/src-tauri/src/fonts.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
fonts.rs              ← INSTALLED FONT LIST (issue #28, 2026-09-20): fonts_list() →
                        Vec<FontFamily {family, monospaced}> via the pure-Rust fontdb crate
                        (load_system_fonts: macOS/Windows font dirs, fontconfig XML on
                        Linux, no C deps); one entry per family (first family name of each
                        face, monospaced = any face fixed-pitch), '.'-prefixed hidden
                        macOS families dropped, sorted case-insensitively; ~150 ms on a
                        Mac with ~400 fonts, so the frontend caches it per session
                        (settings/fonts.ts loadInstalledFonts, same shape as editors.ts);
                        WKWebView has no Local Font Access API, hence Rust; 1 module test
```
