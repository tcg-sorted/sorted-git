# G60 — an overflow: hidden app shell can still be scrolled; use overflow: clip

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G60 — an `overflow: hidden` app shell can still be scrolled; use `overflow: clip`**
  (2026-11-19): `html, body, #root` in `app/globals.css` were `overflow: hidden`. That
  hides the scrollbar but keeps the element a scroll container, so script,
  `scrollIntoView`, focus and drag autoscroll can still move it. When the repo toolbar is
  wider than the window (800 px: it reaches about 887 px), `#root` had 87 px of hidden
  scroll range. In CI the `a trackpad pan moves the long-line diff…` e2e test drags the
  diff scrollbar thumb, the Linux runner shifted the whole app 87 px left (the failure
  screenshot shows the sidebar cut off and an empty strip on the right), and the final
  track click landed at x = −5, so the test failed all three attempts in several runs.
  `overflow: clip` (with `overflow: hidden` kept before it as the fallback for engines
  without `clip`) makes the shell no longer a scroll container, so nothing can shift it.
  Inner scroll areas are their own scroll containers and are unaffected. Regression e2e:
  `the app shell never scrolls sideways when its toolbar is wider than the window` sets
  `#root.scrollLeft` and calls `scrollIntoView` on the Toggle terminal button. Before the
  fix it read back 50 and 15; it must read 0. The shipped window's `minWidth` is 960, but
  a long branch name or a wide font can overflow the toolbar there too.
