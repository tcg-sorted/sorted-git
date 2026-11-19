# G26 — every store action that awaits MUST re-validate before set()

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G26 — every store action that awaits MUST re-validate before set()**: a slow
  response resolving after a repo switch/newer request used to overwrite fresh state —
  a stale `refresh()` flipped the whole app back to the previous repo, `loadMore`
  appended repo A's page under repo B, older filter results replaced newer ones, and
  an in-flight watcher handler (closure over `repoPath`) reloaded the old repo's graph
  after `unlisten()`. The convention now: capture a module-level sequence token
  (`++seq`) before the await and bail if it moved or `get().repo?.path !== path`
  after; repository/store.ts (openSeq/fullSeq/statusSeq — statusSeq is shared between
  refresh and refreshStatus so an older full refresh can't clobber a newer status;
  open() re-checks openSeq before its deferred `import().then(addRepoTab)`, or a
  ⌘W right after a tab switch closed the tab and the late add put it back — the
  tab e2e failed ~1 in 5 runs on main before the guard),
  graph/store.ts (requestSeq + `get().layout !== layout` before mutating the shared
  GraphLayout), DiffPanel (requestSeq ref), and RepositoryPage's watcher handler
  (`stillCurrent()` after every await + trailing `pending` re-run instead of dropping
  events mid-refresh) all follow it. Apply the same pattern to any new async store
  action. Related: the `void listen(...).then((fn) => unlisten = fn)` pattern leaks
  the subscription if cleanup runs first — always `if (cancelled) fn(); else unlisten = fn`.
