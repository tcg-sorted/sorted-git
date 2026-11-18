# G14 — website (Astro) SVG/script gotchas

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G14 — website (Astro) SVG/script gotchas**: Astro components do NOT camelCase SVG
  attrs like React does — always kebab-case (`stroke-width`, `stroke-linecap`). The
  `<script>` in `Base.astro`'s head must stay `is:inline` or Astro defers it → theme
  FOUC. Component props named `class` (not `className`) for styling. Screenshots live
  in `docs/assets/*.png`; regenerate `apps/website/public/screenshots/*.webp` via
  `pnpm website:images` (never commit raw 2 MB PNGs to the site).
