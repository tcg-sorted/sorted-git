# G35 — diff highlighting is PER LINE, so multi-line comments need carried state

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G35 — diff highlighting is PER LINE, so multi-line comments need carried
  state**: hljs is run on each diff line alone (cache-friendly, virtualizer-
  friendly), which rendered the inner lines of a `/** … */` block as code (issue
  seen on a TS enum's JSDoc). hljs 11 dropped the public `continuation`
  parameter, so `highlightLineState(code, lang, startsInComment)` fakes it:
  when a line starts inside a block comment it highlights `opener + code`
  (`/*` or `<!--` per language, BLOCK_COMMENT_OPENERS) and strips the opener's
  escaped text from the first span; whether a line ENDS inside a comment comes
  from the result's `_top` mode chain (walk `parent`s for scope 'comment') and
  the mode's `endRe` must NOT match the empty string — that is what separates
  `/* */` from `//` (whose end is `$`), and it also keeps TS's JSDoc mode
  (`/**` begin) in scope, which an "opener matches beginRe" check missed.
  `diffShared.prepareLineStates(diff, language)` (was prepareCommentStates; called from DiffViewer's
  render, memoised per diff in a WeakMap, capped at 8000 lines) walks each hunk
  with SEPARATE old/new running states (deletions advance old, additions new,
  context both) and stores per-DiffLine flags in a WeakMap that CodeLine and the
  word-diff segment renderer read; state resets at every hunk boundary, so a
  hunk that starts mid-comment still misrenders unless whole-file view is on.
  Languages without a block opener (python, yaml, bash, json, markdown, ruby)
  ignore the flag. FALSE-POSITIVE GUARD (owner found SettingsDialog.tsx greyed
  out from a JSX text node `feature/*` — same symptom in GitKraken): hljs has
  no JSX grammar, so `/*` inside JSX text opens a "comment"; `openerGluedToCode`
  reads the text before the last `hljs-comment` span in hljs's own output and
  refuses to carry the state when that opener is glued to a word char, `/` or
  `>` (real comments follow whitespace/punctuation — `foo(/*`, `; /*` and
  line-start `/*` still carry). The line itself still renders as hljs paints
  it; only the continuation is suppressed. Unit tests: `tests/unit/
  highlight.test.ts` (vitest aliases `@/shared/highlight` and `highlight.js` to
  the desktop package for this).
