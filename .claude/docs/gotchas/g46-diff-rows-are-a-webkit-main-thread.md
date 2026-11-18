# G46 — diff rows are a WebKit main-thread budget, measured 2026-09-15

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G46 — diff rows are a WebKit main-thread budget, measured 2026-09-15**: two
  reports looked alike ("scrolling the diff is slow") and had different causes, both
  verified in Playwright's WebKit build (same WebCore as WKWebView) against
  SYNTHETIC files of the same shape — never the reporters' real files. (1) Issue #27,
  a minified bundle with 86 lines over 5k chars and one of 337k: vertical scroll
  froze up to 1.05 s per frame on WebKit, 67 ms worst on Chromium. Not the giant
  line alone (a lone 337k-char text node paints in ~80 ms); it is the virtualizer
  BURST — one wheel event mounts ~20 long rows and WebKit shapes each row's whole
  text through its complex-text path because JetBrains Mono has ligatures. A 60-row
  burst: as shipped 349 ms, ligatures off 100 ms, 5,000-char cap 50 ms, cap + no
  ligatures = frame floor. Hence core `clipRenderedLine` (MAX_RENDERED_LINE 5000,
  CodeLine appends a "… n more characters" tag, `rowContents` measures the clipped
  text so the layer is ~36k px instead of 2.4M px), `[font-variant-ligatures:none]`
  on CodeLine, and overscan 8. TRAP: a clipped row is exactly 5,000 chars, which is
  UNDER highlight.ts's `code.length > MAX_HIGHLIGHT_LENGTH` skip, so the first cut
  highlighted every minified row into ~1,000 spans and frames were still 130–250 ms
  — clipped rows render with language null (plain escaped text) on purpose. Copy
  (⌘A/⌘C, diffCopy) builds from diff data, not the DOM, so it is unaffected; a
  search match past the cap counts in "n of m" but draws no mark (rangeRect finds
  no text node and returns null). (2) The owner's case, ordinary 200–400-char table
  rows in split view, "slow horizontal scroll that a restart cures": the horizontal
  pan is a wheel listener + rAF translateX on the main thread, and without a
  compositing hint WebKit REPAINTED the text layer every frame (Chromium trace: 78
  paints per 80 events → 15 with will-change), so any accumulated main-thread load
  hits sideways scrolling first while vertical scrolling stays on the scrolling
  thread. useHorizontalPan therefore sets `willChange: 'transform'` on the layers
  and caches the pan limit per gesture (a ResizeObserver on the panes invalidates
  it) instead of forcing layout twice per wheel event; with a 12 ms/frame busy loop
  the 80-event delivery went 2.1 s → 1.4 s. No frontend leak was found (30 cycles of
  open/close/reload/select/palette: listeners and DOM flat, heap +89 KB/cycle from
  the highlight LRU filling). What remains: a fast flick in SPLIT view over a
  2,000-line SQL seed file (avg 164 chars, 22 lines over 300) still shows ~40 ms
  frames on WebKit — that is layout of two panes' worth of new rows, and passive
  wheel listeners, ligatures and overscan did not move it; inline view and Chromium
  are at the floor. Measurement harness: drive `pnpm dev` demo mode with
  Playwright's `webkit`, add the synthetic file to demo.ts TEMPORARILY, sample rAF
  gaps while dispatching `page.mouse.wheel`, and put the mouse over the VISIBLE
  scroller rect — the diff auto-jump scrolls the pane, so a pane-relative y lands
  off screen and every event silently misses. A sticky horizontal scrollbar proxies
  the pan offset in inline and split views (both split panes stay synchronized);
  Shift+wheel also pans. Keep this bar inside the virtual diff root so it stays at
  the viewport bottom during vertical scrolling. THE SCROLLBAR IS A MIRROR, NOT A
  SOURCE (owner report 2026-10-04, "0.21.0 horizontal scroll feels heavy and
  glitchy"): the contributor's first wiring had `apply` write `scrollbar.scrollLeft`
  and the scrollbar's `scroll` listener write `x.current` back from `scrollLeft`.
  Scroll events are dispatched in the NEXT frame's rendering step, before rAF, so
  with one wheel event per frame the echo of frame N overwrote the delta frame N+1
  had just added: measured +2.4 / −0.4 / +2.4 / −0.4 … and a 96px gesture moved 40px
  (Playwright WebKit and Chromium agree). useHorizontalPan now remembers the value it
  read back right after its own write (`echoed`) and the scroll listener ignores an
  event carrying exactly that value; it only writes scrollLeft when the pan drifted a
  full pixel from it. A user drag, arrow key or Shift+wheel on the bar still lands
  because its value differs from the echo. Regression e2e: `a trackpad pan moves the
  long-line diff by the whole gesture without stepping back` (one wheel event per
  frame, asserts no negative step and the full sum). THE BAR DRAWS ITS OWN THUMB (owner
  report the same day: "click and drag to the right didn't work at all"): globals.css
  sets `scrollbar-width: thin` on `*`, and WebKit on macOS 26 (like Chromium 121+)
  honours the standard property and IGNORES `::-webkit-scrollbar` once it is set, so
  every scrollbar in the shipped app is a native overlay one that fades out when idle;
  the owner's screenshot showed the 12px band with nothing in it. HorizontalScrollbar
  is now a wrapper (data-diff-scrollbar, sticky bottom-0 h-3 bg-surface) around the
  ENGINE — the focusable `overflow-x-auto` div that keeps the aria-label, the keyboard
  scrolling and the `scroll` event the hook listens to, with its native bar hidden via
  `.scrollbar-none` — plus a sibling thumb (data-diff-scrollbar-thumb, h-1.5 rounded,
  bg-foreground/20, /35 on bar hover, /45 while data-dragging; pointer-events-none so
  the wrapper gets every pointer event). useHorizontalPan's placeThumb sizes it
  track²/(track+limit) with THUMB_MIN 24 and positions it from x/limit on EVERY apply,
  and measureLimit toggles the WRAPPER's height (SCROLLBAR_H 12 or 0). Pointer down on
  the thumb captures and maps pointer dx to scrollLeft by (scrollWidth − clientWidth) /
  (track − thumb); pointer down on the track pages by clientWidth toward the click;
  wheel over the bar scrolls the engine (deltaX, or deltaY with Shift). All of it goes
  through the engine's scrollLeft so the hook stays the single place that moves the
  layers. The same e2e drags the thumb 60px, checks the layers follow scrollLeft exactly
  and clicks the track back to 0. The wider lesson for globals.css: with
  `scrollbar-width`/`scrollbar-color` set, the `::-webkit-scrollbar` rules below them
  are dead on current WebKit and Chromium; any scrollbar that must stay grabbable has to
  be drawn by the app.
