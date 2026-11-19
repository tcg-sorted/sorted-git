# G32 — break-words is NOT enough inside a flex container; use overflow-wrap: anywhere

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G32 — `break-words` is NOT enough inside a flex container; use
  `overflow-wrap: anywhere`**: a file path has no spaces, so it is one
  unbreakable word and bleeds straight out of a fixed-width dialog (issue #2,
  the "Discard changes?" popup). The subtlety that cost a second round: CSS
  `overflow-wrap: break-word` breaks a long word visually but **does not
  reduce the element's min-content width**, while `anywhere` does. Dialog
  descriptions are plain blocks, so `break-words` fixed them — but
  `DialogTitle` in `confirm.tsx` is `flex items-center gap-2` (it holds the
  warning icon), and its bare text node becomes an anonymous flex item whose
  `min-width: auto` resolves to min-content, so `break-words` left
  `Delete "<long path>"?` overflowing by 225px. Both primitives therefore use
  `[overflow-wrap:anywhere]`. Sonner already sets that property on the toast
  container and it inherits, so toasts were never affected. Dropdown menus
  clip instead (`overflow-hidden`) and their path labels already truncate
  (`max-w-64 truncate`), so they widen rather than bleed. Regression e2e:
  `long paths stay inside confirmation dialogs` — it measures every `h2`/`p`
  in the dialog for both `scrollWidth - clientWidth` and spill past the
  dialog's right edge, covering the title and the description, and it was
  verified to fail with either primitive's class removed. The demo repo
  carries a deeply nested untracked file for it.
