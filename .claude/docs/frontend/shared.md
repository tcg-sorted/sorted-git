# Frontend: Shared hooks and helpers (shortcuts, selection, highlighting)

Source: `apps/desktop/src/shared/` (from §6 Frontend). [Back to the index](../../../CLAUDE.md)

```text
shared/                       ← useShortcuts (mod-combos, skipInInput; the handler runs
                                BEFORE event.preventDefault() — PR #60 review 2026-10-07:
                                it used to prevent first, so every handler that gates on
                                `event.defaultPrevented` (DiffPanel's and AllChangesView's
                                window-level ←/→ for a focus-on-body click into the diff)
                                saw its own hook's preventDefault and never fired; the
                                list-focused keyboard flow hid it because CommitDetails'
                                handlers take that path; e2e `after a click into a file
                                diff, ← closes it and returns to the graph`,
                                verified to fail on the old order; an Escape whose
                                keydown arrives defaultPrevented was consumed by a Radix
                                layer — menu/dialog — and is ignored, so Esc closes only
                                the menu, not the diff under it), useKeepSelection
                                (captureSelectionRanges + restore-on-clear: WebKit clears
                                the document selection every time a Radix menu focuses
                                itself or an item, so the diff/file-history line menus
                                capture the ranges at contextmenu and re-add them on
                                selectionchange while open and once on close; both menus
                                also preventDefault onCloseAutoFocus — the trigger is an
                                invisible positioning span, and refocusing it would clear
                                the just-restored selection), highlight.ts
                                (EMBEDDED LANGUAGES, owner request 2026-09-28, two rounds
                                the same day: `.astro` maps to the pseudo language 'astro'
                                whose GRAMMAR is xml (grammarOf, used by highlightLineState,
                                the cache key and supportsBlockComments); for EVERY file on
                                the xml grammar (astro, svelte, vue, html, svg) embedStep
                                walks lines with a mode machine — astro's `---` fence on
                                line 1 opens typescript until the next fence; a `<script`
                                opener without its closer on the same line opens typescript
                                (astro, or lang="ts") or javascript until `</script>`; a
                                `<style` opener opens css / scss / less (lang attr) until
                                `</style>`; the closer line itself stays markup. A hunk that
                                starts mid-file is 'unknown' until it meets a fence or a
                                closer, which then marks the lines BEFORE it (fence →
                                frontmatter, </script> → script language, </style> → css),
                                while an opener discards them as template, so a compact
                                diff is only right up to that first marker (whole-file view
                                always is). embeddedDiffLanguages (per hunk, per side) feeds
                                diffShared.prepareLineStates, which stores the per-line
                                override in a WeakMap that CodeLine reads through
                                lineLanguage and resets the comment state at a language
                                switch; BlameView uses the text form embeddedLanguages over
                                the whole file. The owner's first screenshot showed the
                                frontmatter fixed and the <script> block still plain, hence
                                round two. `{expr}` in templates stays plain: hljs xml has
                                no expression syntax. `.svelte` → xml and `.toml` → ini
                                reuse grammars already bundled, so no size cost),
                                SHEBANGS (issue #81 by noyobo, 2026-10-28): languageOf(path,
                                firstLine?) falls back to languageOfShebang when neither the
                                basename nor the extension maps — `#!` + interpreter basename,
                                `env` skipped together with its flags (-S) and VAR=val words,
                                trailing version digits dropped (python3.11 → python), table
                                SHEBANG_TO_LANG (python, sh/bash/zsh/ksh/dash → bash, node/
                                deno/bun → javascript, ts-node/tsx → typescript, ruby, php,
                                swift; perl is not bundled so it stays null); DiffViewer
                                passes diffFirstLine(diff) — the new side's line 1, else the
                                old side's for a deleted file, null when the compact diff
                                starts further down, so a mid-file hunk of an extensionless
                                script is plain text until whole-file view — and BlameView
                                passes blame.lines[0]; 7 unit tests in highlight.test.ts
                                (hljs lib/core + languageOf; highlightLineState carries
                                BLOCK-COMMENT state across lines — see G35), utils
                                (timeAgo, modKey…)
```
