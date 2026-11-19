# Frontend feature: `features/terminal/TerminalPanel`

Source: `apps/desktop/src/features/terminal/TerminalPanel` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── terminal/TerminalPanel    ← xterm.js ↔ PTY events; FONTS (issue #28, 2026-09-20, then widened to
│                               the whole app at the owner's request the same day): settings
│                               interfaceFontFamily / codeFontFamily / terminalFontFamily ('' =
│                               default) + terminalFontSize (TERMINAL_FONT_SIZES 10–20) — the
│                               APP fonts were already CSS vars (tokens.css --font-sans/--font-mono
│                               → tailwind font-sans/font-mono), so settings/store applyFonts()
│                               sets or removes the two vars on document.documentElement.style
│                               (setters + onRehydrateStorage, same shape as applyTheme);
│                               terminal/font.ts interfaceFontStack()/monoFontStack() prepend the
│                               custom family to the token stacks so a missing font still renders;
│                               the TERMINAL uses monoFontStack(terminalFontFamily || codeFontFamily)
│                               — newSession reads the store, an effect re-applies fontFamily/
│                               fontSize to EVERY live session and fits the current one.
│                               settings/FontsCard.tsx (Appearance, after Reduce motion): ONE card,
│                               three FontSelects — Interface (proportional group "Fonts" first),
│                               Code and Terminal (group "Monospace" first) — plus the size Select
│                               beside Terminal, a "Reset fonts" header action only while any is
│                               custom, and a data-terminal-font-preview line in the terminal's
│                               effective font. FontSelect: Radix forbids an empty item value, so
│                               '' is the sentinel DEFAULT_VALUE '__default__'; the default entry
│                               reads "<default> (default)" / "<code font> (same as Code)" and MUST
│                               render with the real token stack (defaultStack) — a bare 'Inter'
│                               is not a system font (the bundle registers "Inter Variable") and
│                               fell to serif; every other item renders in its own face via a
│                               FontName span, which also makes the trigger show the picked face;
│                               a stored family missing from the list stays selectable as "<name>
│                               (not installed)" with a danger Field hint "Not installed here,
│                               using <fallback>"; disabled with placeholder "Reading installed
│                               fonts…" while useInstalledFonts (settings/fonts.ts, module-cached
│                               ipc.fontsList → fonts.rs) loads. A free-text field was built
│                               first and REJECTED by the owner ("manual type is not good UX").
│                               The description carries ONE inline link, "Nerd Fonts" (nowrap) →
│                               nerdfonts.com/font-downloads, the official site. Demo:
│                               demo.demoFonts (7 families, 2 proportional) so the e2e can assert
│                               both groupings. Ligature rendering was NOT verified; the copy
│                               avoids the word. RIGHT-CLICK MENU (issue #26):
│                               onContextMenu on the host opens the positioned-span
│                               DropdownMenu pattern with Copy (disabled without a
│                               selection, writes terminal.getSelection()), Paste
│                               (clipboard.readText → terminal.paste so it flows through
│                               onData to the PTY), Select all, Clear terminal;
│                               onCloseAutoFocus is prevented so focus stays in xterm;
│                               terminal/theme.ts builds the
│                               xterm ITheme from the design tokens at runtime
│                               (getComputedStyle → HSL triplets → hex, ANSI palette
│                               mapped to danger/success/info/graph-5/6/7, cursor +
│                               selection = --primary so accents follow) and the panel
│                               re-applies it to EVERY live session when settings
│                               theme/accent change — never hardcode terminal hex;
│                               sessions are PER-REPO and
│                               persistent: a module-level Map keyed by repo path holds
│                               each xterm + its DOM container, unmount only detaches
│                               (container.remove()), remount re-appends — scrollback and
│                               running processes survive repo switches. Focus after BOTH
│                               fresh-session setup and re-attachment, so opening the panel
│                               accepts typing immediately. A reused-only focus call was
│                               masked by dev StrictMode's second effect run; verify the
│                               focus e2e against a production build served by Vite preview
│                               as well as dev mode. Killed only via
│                               killTerminalSession(path) (RepoTabs close) or shell exit
│                               (exited flag → fresh session on next mount)
```
