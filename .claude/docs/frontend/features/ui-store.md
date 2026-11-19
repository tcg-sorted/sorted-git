# Frontend feature: `features/ui/store.ts`

Source: `apps/desktop/src/features/ui/store.ts` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
└── ui/store.ts               ← layout state (sidebar/terminal/palette/dialogs/centerDiff/
                                diff view prefs) — view prefs PERSISTED via partialize;
                                openCenterDiff folds the sidebar away via the TRANSIENT
                                sidebarHiddenForDiff (persisted sidebarOpen stays the user's
                                preference, so quitting mid-diff cannot poison it),
                                closeCenterDiff clears it, and toggleSidebar with a diff open
                                ALWAYS closes the diff and shows the sidebar (unconditional
                                by owner request — an earlier version skipped this when the
                                user had hidden the sidebar themselves and that read as
                                broken); consumers use the derived `sidebarVisible` selector
```
