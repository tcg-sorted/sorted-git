# G47 — a DOM selection does not survive virtualized rows; keep it in data space

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G47 — a DOM selection does not survive virtualized rows; keep it in data space**:
  the diff rows are absolutely positioned and unmount as they leave the overscan
  window, and per the DOM live-range rules a selection boundary inside a removed
  node collapses to (parent, childIndex) — after the rows remount, that index points
  at a DIFFERENT row, so "select a few lines, scroll, the highlight moved" (owner
  report 2026-09-16). `features/diff/diffSelection.ts` (`useStableSelection`, called
  by VirtualInlineDiff and VirtualSplitDiff) records the selection as {layer, row
  index from `data-diff-row`, character offset} per endpoint on every user
  `selectionchange`, and a no-deps `useLayoutEffect` re-projects it onto the mounted
  rows after EVERY commit: an unmounted endpoint is parked on a SENTINEL — each layer
  renders an invisible 1px ` ` span (`SelectionSentinel`, class `.diff-sentinel`,
  `data-diff-sentinel="start"|"end"`) as its first and last child, and an endpoint
  above the mounted window goes to the start sentinel, one below to the end sentinel
  (both off screen → a range across that one character, direction preserved), so
  nothing visible changes while the lines are off screen and they light up again once
  they scroll back. The sentinels exist because the first version clamped to
  `(layer, childIndex)`, which PASSED in Playwright's WebKit and FAILED in the shipped
  WKWebView (owner test 2026-09-16, same day): (a) a selection whose rows were all off
  screen collapsed to a caret, and macOS greys out Edit → Copy for a caret in
  non-editable content, so ⌘C never reached the page; (b) WKWebView canonicalises a
  `(layer, k)` boundary onto the first mounted row's TEXT, that read as a user change
  and overwrote the stored anchor — the shifted highlight. A parked endpoint must
  therefore be a real text position, and the DOM range must NEVER collapse while
  lines are selected. Traps: (1)
  `selectionchange` is an async, coalesced task, so a sync "applying" flag cannot
  tell our own writes apart — the effect stores BOTH the signature it wanted and the
  one it READ BACK right after `setBaseAndExtent` (the browser's canonical form) and
  the handler ignores a selection matching the read-back; a collapsed selection
  inside the layer is ignored too (a click already cleared the state on mousedown),
  and mouseup with a collapsed DOM selection clears it; (2) the browser's
  collapse happens synchronously in the same React commit that removed the node,
  BEFORE the layout effect, so the logical state must come from earlier
  selectionchange events, never from the DOM in the effect; (3) during a mouse drag
  only the anchor is re-projected and the DOM focus is kept (the focus lags one
  coalesced event behind); (4) a left mousedown inside the scroller clears the
  logical state (new gesture) unless shift is held, and a change to `rows` resets it;
  (5) a native ⌘C copies only MOUNTED rows, so the hook also owns the `copy` event and
  builds the text from `rows` between the endpoints — `diffSelectionText(scrollEl)`
  gives the two context menus the same text (WeakMap registry keyed by the scroll
  element, like panControllers); a cross-pane selection in split view falls back to
  the browser. Gutters, markers and hunk headers in the virtual path are
  `select-none` so a drag that crosses them stays inside the code layer. Regression
  e2e: `a diff selection keeps its lines after scrolling away and back` (verified to
  fail with the hook removed: the copy came back empty; scrolls the rows out BOTH
  ways and asserts `getSelection().type === 'Range'` while they are gone), passes on
  Chromium and WebKit — but Playwright's WebKit is NOT the system WKWebView, so a
  selection change here must also be checked in the installed app.
  DRAG PAST THE EDGE (user report 2026-09-22, "select over the screen size … copy not
  working, scroll back to top didn't work"; reproduced in Playwright WebKit): dragging
  below the scroller autoscrolls, but the browser's focus lands on whatever element sits
  under the pointer OUTSIDE the scroller, `locate` said 'outside', the hook dropped its
  logical selection, and once the anchor row unmounted the DOM anchor collapsed onto a
  random node — copy gave one line and the highlight jumped. While `dragging` and the
  pointer (tracked by a capture mousemove) is above/below the root's box, the hook now
  CLAMPS the focus to the first/last visible row of the anchor's layer (edgeEndpoint,
  offset 0 or the row's text length; over the gutter it picks the row under the pointer
  and start-or-end by x) and re-applies on every selectionchange, mousemove and render,
  so the selection grows editor-style as rows scroll in; 'outside' still clears the
  state when no drag is in progress (a selection elsewhere in the app must not hijack
  copy). Regression e2e: `dragging a diff selection past the bottom edge keeps growing it
  and copies every line` (verified to fail without the clamp: the copy came back as one
  line). Playwright WebKit reproduced this one, but the shipped WKWebView still needs a
  hands-on check like every other selection change.
  DRAG PAST THE RIGHT EDGE (owner report 2026-10-04, "select and drag to scroll to the
  right didn't scroll at all"): the panes are `overflow-hidden` and panned by transform
  (G46), so WebKit's own selection autoscroll never fires sideways. The hook now owns it:
  `pastEdge(root, layer, pointer)` is vertical OR horizontal, where
  `horizontalOvershoot` measures the pointer against the anchor layer's `[data-diff-pane]`
  box and returns 0 when the point sits inside ANOTHER pane (split view: dragging into
  the other half stays the browser's cross-pane fallback). While dragging past the side,
  `edgePanStep` runs a rAF loop that calls the pane's panControllers entry with a speed of
  EDGE_PAN_MIN 4 + overshoot/3 px per frame, capped at EDGE_PAN_MAX 40, then `sync()`s;
  the focus endpoint comes from `caretEndpoint`, `document.caretRangeFromPoint` at the
  pointer clamped 1px inside the pane and the root, located back to a row + offset — so
  the selection grows to the character under the pointer as the lines slide (a row is
  `width: max-content` with `min-width: 100%`, so a point past the text end resolves to
  the end of the row). The old vertical branch of `edgeEndpoint` is unchanged and wins
  when the pointer is above or below the root. The loop stops on mouseup, blur, when the
  pointer comes back inside, and on unmount. `panControllers` and `PANE_SELECTOR` moved
  to `features/diff/pan.ts` (VirtualDiff re-exports panControllers for diffSearch)
  because the hook needed them and VirtualDiff already imports the hook. Regression e2e:
  `dragging a diff selection past the right edge pans the long lines and extends the
  selection` (verified to fail without the hook change: the layer never moved).
