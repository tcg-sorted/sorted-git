# G43 — sidebar drag-and-drop does not work on Linux under Wayland

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G43 — sidebar drag-and-drop does not work on Linux under Wayland**: a user on
  Debian sid / GNOME 50 / Mutter (Wayland) reported that dragging `upstream/main`
  onto `main` shows GTK's no-drop X cursor and never opens the drop dialog (issue
  #20, 2026-09-13). Our drop target is gated on React state, not on dataTransfer
  types, and with `dragDropEnabled: false` wry attaches no GTK drag handlers, so
  WebKitGTK's own HTML5 DnD is in charge — and that has been unreliable under
  Wayland for years. Nothing to fix in the app; every drag gesture must have a menu
  equivalent (merge, rebase and fast-forward all live in the branch right-click
  menu, which is what the user settled on). Untested on X11.
