# G38 — confirmDialog labels are user-controlled strings too

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G38 — confirmDialog labels are user-controlled strings too**: confirm.tsx's
  footer is `flex-wrap` and the confirm Button is `min-w-0 max-w-full` with a
  truncating span, so a long confirmLabel can never spill past the dialog edge —
  but the real fix is upstream: keep confirmLabel a short verb phrase and put
  branch/file names in `path` or the description. E2E `double-clicking a
  separated origin chip…` measures the button's right edge against the dialog.
