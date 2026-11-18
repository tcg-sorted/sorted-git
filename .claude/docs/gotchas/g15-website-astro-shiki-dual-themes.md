# G15 — website (Astro) Shiki dual themes

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G15 — website (Astro) Shiki dual themes**: to theme code blocks per site theme, set
  `markdown.shikiConfig.themes = { dark: 'github-dark', light: 'github-light' }` in
  astro.config.mjs AND add CSS in global.css that swaps the inline vars when the site's
  class-based toggle is on (`html.dark .astro-code { background-color: var(--shiki-dark-bg) !important; color: var(--shiki-dark) !important }` + the `span` variant for token colors). Shiki only emits the CSS *variables* — nothing applies them, and it keys on `prefers-color-scheme`, not the app's `html.dark` class. Also never force `color: hsl(var(--foreground))` on `pre code` — it overrides the highlighter and makes diagrams dark-on-dark in light theme.
