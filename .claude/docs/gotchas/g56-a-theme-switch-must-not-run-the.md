# G56 — a theme switch must not run the hover fades

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G56 — a theme switch must not run the hover fades**: inputs, buttons, menu items,
  checkboxes and tabs carry `transition-colors` (150 ms) for hover, and that transition
  also fires when the whole palette changes, so after dark ↔ light the search boxes,
  toolbar buttons and checkboxes faded from the old colours while everything else had
  already switched (owner report 2026-11-09, "flick, not smooth"; measured 15 elements
  lagging up to 19 frames in Chromium, 9 in WebKit). settings/store withoutTransitions()
  wraps applyTheme and applyAccent: it adds `.no-transitions` to <html> (globals.css:
  `transition: none !important` on every element and pseudo-element), applies the
  classes, forces a style flush with getComputedStyle and removes the class two frames
  later, the next-themes disableTransitionOnChange technique. The class name must not
  start with `theme-`, applyTheme strips those. TRAP for e2e/probes that
  `import('/src/…/store.ts')` from the page: after a source file is edited under a
  RUNNING dev server, Vite serves the app's copy with a `?t=` query and the raw import
  gets a second store instance, so tests that seed state that way fail until the dev
  server is restarted (looked like four broken group-update tests on 2026-11-09).
