# G36 — react-resizable-panels saves ONE layout per SET of panels

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G36 — react-resizable-panels saves ONE layout per SET of panels**: the
  `autoSaveId` layout is keyed by the ids/order of the panels currently
  mounted, so conditionally rendering the Sidebar `<Panel>` (folded away for a
  diff) or the Inspector (file-history focus mode) created two or three
  independent layouts and the inspector "remembered" a different width in each
  (owner report 2026-09-05). RepositoryPage therefore keeps all three panels
  MOUNTED with stable ids (`sidebar`/`center`/`inspector`), marks the outer two
  `collapsible collapsedSize={0}`, and drives them through
  `ImperativePanelHandle.collapse()/expand(default)` from effects on
  `showSidebar` / `focusMode`; only the panel CONTENT and the resize handle
  are conditional (`hidden` class). Collapsing hands the freed space to the
  neighbouring center panel, so the inspector's share never moves. The
  autoSaveId was bumped to `angkorgit-main-v2` so stale per-set layouts are
  ignored. `onCollapse` on the sidebar syncs `ui.setSidebarOpen(false)` when the
  user drags it shut (guarded so the programmatic diff-fold does not flip the
  persisted preference — see the ui store notes on sidebarHiddenForDiff).
  `expand(minSizeOverride)` is used because a panel restored collapsed from
  storage has no remembered pre-collapse size and would otherwise open at
  minSize. TRAP (owner report 2026-09-07, "sidebar off after every new
  install/relaunch"): the library fires `onCollapse` while RESTORING a saved
  layout, so quitting with a diff open (sidebar folded → layout saved at 0)
  made the next launch's restore-collapse run the handler at a moment when
  `sidebarHiddenForDiff` had already reset to false — it wrote
  `sidebarOpen=false` to the persisted store and the sidebar stayed hidden
  until ⌘B. The handler now trusts a collapse ONLY while the sidebar handle is
  being dragged (`sidebarDragging` ref set from `PanelResizeHandle.onDragging`)
  and otherwise re-expands on the next frame when the store wants the sidebar
  visible. Regression e2e: `the sidebar comes back after a relaunch that
  happened with a diff open` (opens a diff, reloads, asserts the sidebar is
  visible AND `angkorgit-ui.state.sidebarOpen` is still true). The mirror
  image (owner report 2026-09-10): dragging the sidebar shut and back open in
  ONE gesture re-expanded the panel while `sidebarOpen` stayed false, so an
  empty column sat where the sidebar belonged until ⌘B — `onExpand` now flips
  `sidebarOpen` back on when the drag caused it. INSPECTOR: `collapsible` is
  `{focusMode}`, not always on — a collapsible panel snaps to 0 once a drag
  crosses half its minSize (library `resizePanel`), and nothing re-expanded
  it inside the same repo. With collapsible off the library clamps the drag
  at `INSPECTOR_MIN_SIZE`; when file history opens the prop flips true and
  the effect collapses it; when it closes, the Panel's own layout effect
  (`reevaluatePanelConstraints`, child-first) resizes it to minSize and
  RepositoryPage's useLayoutEffect then `resize()`s it to the width captured
  before the collapse (`expand()` is a no-op on a non-collapsible panel).
  Regression e2e: `the inspector stops at its minimum width when dragged and
  comes back after file history`, `dragging the sidebar shut and back open
  shows its content again`.
