# §7 Design system rules

[Back to the index](../../CLAUDE.md)

- **Colors only via tokens** (`bg-surface`, `text-muted`, `text-danger`…) — hex values in
  components are a review blocker. Tokens: packages/design-system/src/tokens.css.
- **Text contrast tiers hold in every theme** (2026-11-08): against `--background` AND
  `--surface`, `--foreground` ≥ 7:1, `--muted-foreground` ≥ 5.5:1, `--faint-foreground`
  ≥ 4.5:1, strictly in that order. Before this every theme's faint text sat at 1.7–3.4:1
  (Nord 1.68) and four themes' muted text was under 4.5:1, which users read as "hard to
  look at". Values were lifted by lightness only (hue and saturation kept), measured
  against background and surface, NOT surface-raised: in Nord the raised colour is so
  light that meeting it pushed faint to 75% and flattened the tiers. tests/unit/
  themeContrast.test.ts enforces it for all 16 palettes; a new theme must pass it.
  CODE COMMENTS have their own `--syntax-comment` (globals.css `.hljs-comment`), set to
  each theme's ORIGINAL faint value: in the ported themes that value is the official
  comment colour (One Dark Pro #5c6370, Dracula #6272a4, Tokyo Night #565f89…), so code
  still looks exactly like the editor theme while the UI text got lighter. Verified in
  WebKit across all 16 themes: comment, keyword, string, background, surface and
  accent colours are byte-identical to before; only plain code text moved, in One Dark
  Pro, Catppuccin Latte and Ayu Light, whose body text was lifted to 7:1.
- 8px spacing rhythm (Tailwind scale); `rounded-md` controls, `rounded-lg` surfaces.
- Motion: 150–250ms, `cubic-bezier(0.16,1,0.3,1)`; **centered dialogs must animate with
  the centering translate** — use `animate-dialog-in` (see gotcha G7).
- Graph lane colors: `--graph-0…9`. Diff backgrounds: `bg-diff-add/15`, `bg-diff-del/15`.
- Every icon button gets a `Hint` tooltip; destructive menu items use `destructive` prop.
  Exception: an icon button INSIDE a row that already carries a `Hint` loses its own —
  Radix opens both roots at once (verified: two tooltips over the working-copy discard
  button), so the row tooltip wins and the button keeps only its `aria-label`.
- **User-controlled strings (paths, branch names, URLs) need a wrap or truncate
  strategy** wherever they render: dialog copy wraps via the primitives (G32),
  menu labels truncate (`max-w-64 truncate`), toasts inherit sonner's
  `overflow-wrap: anywhere`. In FILE ROWS (working copy + commit details)
  the NAME wins: name is `max-w-full shrink-0 truncate`, the dimmed dir after
  it is `min-w-0 flex-1 truncate`, so the path gives way first and the name
  only ellipsizes when it alone exceeds the row (owner rule 2026-09-05).
  The dir is rendered by components/DirName: `dir="rtl"` + `text-left` + `<bdi>` so the
  ellipsis lands at the FRONT and the tail (the nearest folder) stays visible — a
  48-file commit used to read "Coloris.Core/Coloris.Core.Tes…" on every row (owner
  screenshot 2026-09-24). Use it wherever a file row shows a dimmed directory; never a
  plain truncate span.
- Sentence case for all UI text.
