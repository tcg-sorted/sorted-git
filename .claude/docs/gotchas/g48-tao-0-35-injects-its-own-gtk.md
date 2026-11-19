# G48 — tao 0.35 injects its own GTK header bar on Wayland; we shrink it, we do not replace it

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G48 — tao 0.35 injects its own GTK header bar on Wayland; we shrink it, we do
  not replace it**: the tao that stable tauri 2 pins (0.35.x via tauri-runtime-wry
  2.11) installs a GtkHeaderBar inside an EventBox as the window titlebar on Wayland
  (tao #979), so GNOME users saw a 46px empty bar above the toolbar. Contributor PR
  #25 (2026-09-13, the Debian/GNOME Wayland user from #20) adds a Linux-only `gtk`
  0.18 dependency (tauri does NOT re-export gtk; the version matches tauri's own, so
  the lock only gains an edge) and `compact_wayland_titlebar` in lib.rs: it tags the
  titlebar with `.angkorgit-compact-titlebar` and installs a screen-wide CSS provider
  scoped to that class (headerbar min-height 28px, titlebuttons 24px). The EventBox
  is the drag surface, so removing the titlebar is not an option, and `setup` runs
  after the window is realized, so replacing it is too late. It is BEST-EFFORT
  (`let _ = …` around a helper returning Result) because a cosmetic tweak must never
  stop the app from starting; on X11 `titlebar()` is None and it is a no-op. Upstream
  reverted the injected header bar in tao #1218 (tao 0.36.0, 2026-07-29), but
  `cargo update` cannot reach it while tauri 2 requires 0.35 — once tauri pins tao ≥
  0.36 the helper becomes a no-op and should be DELETED together with the gtk
  dependency. Only compiled by the ubuntu CI job; macOS cannot check the
  `cfg(target_os = "linux")` body (see G41).
