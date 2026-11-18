# G51 — macOS overlay title bar: the tab strip IS the title bar

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G51 — macOS overlay title bar: the tab strip IS the title bar** (user request via
  the owner 2026-10-16, "the header on top of tabs should be like a browser"):
  tauri.conf.json sets `titleBarStyle: Overlay` + `hiddenTitle` +
  `trafficLightPosition {14, 13}` — the lights are centred in a bar of
  TITLE_BAR_HEIGHT 38 LOGICAL px, so RepoTabs sets `height: 38 / zoom` on the bar
  (CSS px scale with the webview zoom, the lights do not); the first cut kept the h-9
  bar and the owner found the lights sitting low and crowded ("feels a bit off") (all macOS-only keys, ignored elsewhere, so Windows/
  Linux keep native decorations) and capabilities add
  `core:window:allow-start-dragging` + `allow-internal-toggle-maximize` — without the
  first a `data-tauri-drag-region` element silently does nothing. Three surfaces carry
  the drag region and a left inset for the lights: RepoTabs (outer bar AND the inner
  strip, so empty strip space drags; tabs are HTML5-draggable and never start a window
  drag), WelcomePage (an absolute h-9 strip over the page padding) and the
  ConflictResolver header (it is a fixed inset-0 surface over the tabs). The inset comes
  from shared/useTitleBarInset: `overlayTitleBar` (ipc: isTauri && Mac — NOT isMac alone,
  the browser demo on a Mac must not indent) → TRAFFIC_LIGHT_INSET 80 / settings.zoom
  (the lights live in logical px, the webview zoom scales CSS px) and 0 while the
  window is fullscreen (ipc.fullscreenState on `tauri://resize`; the lights hide there
  and an 80px hole stayed). Double-click on empty bar space zooms the window (Tauri's
  drag-region script). No e2e: demo mode has no Tauri window; verify in the installed
  app, incl. fullscreen in and out.
