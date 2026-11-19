# G30 — the diff auto-jump must be pre-paint AND virtualizer-reset-proof

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G30 — the diff auto-jump must be pre-paint AND virtualizer-reset-proof**:
  the "open at first change" jump looked fine in code twice and was broken both
  times in the running app; the failure chain (found by frame-tracing scrollTop
  via Playwright, not by reading code): (1) `setDiff` (.then) and
  `setLoading(false)` (.finally) resolve in DIFFERENT microtasks → separate
  commits, so an effect gated only on `diff` fires while the scroller still
  shows the loading spinner (scrollHeight = clientHeight, jump silently
  no-ops) — gate on `!loading` too; (2) the jump must be a `useLayoutEffect` +
  instant `behavior: 'auto'`, or the user watches the top of the file paint
  first and then travel (the original useEffect+rAF+smooth version); (3)
  tanstack `useVirtualizer._willUpdate` calls `_scrollToOffset(cached ?? 0)`
  whenever its scroll element (re)attaches — under StrictMode double-effects
  in dev this re-attach runs right after the parent's jump and silently
  resets scrollTop to 0, so the jump re-asserts once on the next
  animation frame (no-op in production builds). Regression e2e:
  `clicking a file opens the diff already at its first change` — it traces
  scrollTop every frame from before the click and fails on ANY intermediate
  value, so it catches both smooth-scroll regressions and lost jumps; the
  demo repo's `src/data/palette-seed.sql` (change ~480 rows deep) exists for
  this test.
