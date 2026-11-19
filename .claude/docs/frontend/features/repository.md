# Frontend feature: `features/repository`

Source: `apps/desktop/src/features/repository` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── repository/               ← store (repo/status/branches/tags/stashes/remotes/submodules/
│   │                           statusVersion — a counter bumped on every status write,
│   │                           the DiffPanel's live-reload signal —,
│   │                           conflicts/recents/profileId — the repo's assigned profile,
│   │                           loaded from angkorgit.profile on open, cleared on close,
│   │                           refresh/refreshStatus), CloneDialog prefills the
│   │                           destination from settings.cloneRoot (issue #26: the last
│   │                           folder cloned into is remembered on success; Settings →
│   │                           Git → "Clone destination" card picks/clears it; a CLI
│   │                           preset's `into` still wins), WelcomePage (search Input placeholder is
│   │                           "Search repositories" with the ↑↓/⏎ hints as Kbd beside
│   │                           it — the old placeholder carried the hints and was cut off
│   │                           at the default width, UX audit 2026-09-24; recent rows = icon
│   │                           tile — FolderTree when the path is in ui.worktreeTabs —,
│   │                           name, shortenHome(path) `~/…`, time, hover "…" + right-click
│   │                           menu Open/Reveal/Copy path/Remove; ipc.pathsExist marks
│   │                           moved/deleted repos "folder missing" (dimmed, click toasts,
│   │                           Open/Reveal disabled in the menu); the search Input is
│   │                           autoFocus and ↑/↓/⏎ drive an activeIndex highlight; empty
│   │                           recents render SettingEmpty with Open + Clone; footer shows
│   │                           `AngKorGit v<version>` (ipc.appVersion) + "Check for
│   │                           updates" (lazy updater/check); a FolderSearch icon button
│   │                           at the END of the Recent repositories header (always
│   │                           shown, ml-auto when there are no recents) and a "Scan"
│   │                           button in the empty state call startRepositoryScan →
│   │                           pickDirectory → ui dialog 'scanRepositories' with
│   │                           ScanRepositoriesPreset {scanRoot}; ScanRepositoriesDialog
│   │                           runs ipc.scanRepositories (seq-guarded, G26; "Change…"
│   │                           re-picks and rescans), lists rows name-first with DirName of
│   │                           the path RELATIVE to the root, pre-selects every repo not in
│   │                           recents, shows recents ones disabled + "In recents" Badge,
│   │                           Select all/none, and Add calls ipc.addRecents →
│   │                           recent_add_many WITHOUT opening anything; demo: demoScan
│   │                           answers four repos under the root (two match demoRecents),
│   │                           demoAddRecents mutates demoRecents in place),
│   │                           REPO GROUPS (shipped 2026-10-03, frontend only — the Rust
│   │                           recents JSON is untouched): settings.repoGroups (RepoGroup[])
│   │                           + settings.repoGroupOf {path → id} persisted with the store
│   │                           (addRepoGroup(name, color, paths) / updateRepoGroup /
│   │                           removeRepoGroup also prunes the map / setRepoGroup(path,
│   │                           id|null)); ui.repoGroupsCollapsed {id|'ungrouped' → bool} and
│   │                           ui.worktreeMains {worktree path → main path} (markWorktreeTab
│   │                           now takes mainPath from useRepo.open) are persisted view
│   │                           state. WelcomePage: with ZERO groups the list is exactly the
│   │                           old flat list (opt-in, owner: "optional for someone that
│   │                           wants to keep their current style"); with groups each is a
│   │                           collapsible section — header = chevron + GroupTile (size-5
│   │                           rounded tile tinted hsl(var(--graph-N) / 0.15), the sidebar's
│   │                           icon-tile motif in the group colour; neutral
│   │                           bg-foreground/[0.08] for Other) + name (text-xs font-semibold,
│   │                           NOT uppercase: user-named, "iOS" must stay "iOS") + hover-only
│   │                           w-0/group-hover:w-auto "…" button + a primary dot when any
│   │                           of its repos is an open tab + the sidebar's count Badge;
│   │                           rows under a header get ml-5 so their tile aligns under the
│   │                           header tile (tree look); ungrouped repos sit LAST under an
│   │                           "Other" header (collapsible, no menu); an empty group shows
│   │                           "Drag a repository here, or move one from its menu."; the
│   │                           body grows to max-h-96 with groups. data-group-header=<id>,
│   │                           data-group-section, data-recent-row=<path>, data-group-tile
│   │                           are the e2e hooks. HEADER MENU (right-click or "…"):
│   │                           Fetch all / Pull all (fast-forward only) / Open all
│   │                           in tabs <n> / Close its tabs <open n> / Move up / Move down /
│   │                           Edit group… / Ungroup… — repository/groups.ts openRepoGroup (ipc.pathsExist
│   │                           first, skips missing folders and says so in the toast
│   │                           description, addRepoTab for every present path, opens the
│   │                           first only when the current repo is not in the group, then
│   │                           ensureRepoRoute). GroupUpdateDialog + groupUpdate.ts run Fetch all
│   │                           and Pull all sequentially with live per-repo results: moved refs,
│   │                           commit counts, unchanged repos, skips and failures. The dialog uses
│   │                           flat rows, toned badges and one non-wrapping counts line;
│   │                           classify() keeps badges and counters consistent. Fetch uses
│   │                           RefreshCw and Pull uses ArrowDownToLine, matching the toolbar.
│   │                           groupStart(runId) starts the native run; groupUpdate uses that token.
│   │                           groupCancel returns completed-result receipts before the frontend
│   │                           aborts its wait; groupFinish cleans up. Leaving the page cancels too.
│   │                           Cancel retains completed work, stops queued repos and permits no
│   │                           ref/worktree writes after acknowledgement. It waits for active local
│   │                           writes, not socket I/O; settled rows ignore late responses/errors.
│   │                           Pull's checkout behavior matches toolbar Pull exactly. Group pull
│   │                           follows the configured upstream and only fast-forwards, never
│   │                           merges or rebases.
│   │                           closeRepoGroup, deleteRepoGroup (confirm
│   │                           only when the group has repos; the repos stay in recents),
│   │                           plural(count, noun) handles -y → -ies. DRAG: rows are
│   │                           draggable only while groups exist and no search is active;
│   │                           the whole section (header + body) is the drop zone, the
│   │                           header gets bg-primary/10 + ring while hovered; dropping on
│   │                           Other ungroups. The menu path is primary (G43 Wayland). SEARCH
│   │                           flattens the list (no headers, no indent), matches group
│   │                           names too and shows "· <group>" after the name. KEYBOARD: the
│   │                           ↑/↓/⏎ highlight is tracked by PATH (activePath), not index —
│   │                           an index-based ring jumped to a different repo when a row
│   │                           moved into a group — and walks only VISIBLE rows (collapsed
│   │                           groups skipped). RepoGroupMenu.tsx: RepoGroupSubmenu(path) =
│   │                           "Add to group" / "Move to group" sub with every group (check
│   │                           on the current one, GroupDot otherwise), "New group…" and
│   │                           "Remove from group" (direct mapping only, never for an
│   │                           inherited worktree group) — used by the welcome row menu AND
│   │                           the tab menu. RepoGroupDialog (ui dialog 'repoGroup', context
│   │                           RepoGroupPreset {groupId|null, repoPath|null}; rendered by
│   │                           RepositoryPage and WelcomePage): Name Field (autoFocus, taken
│   │                           → danger hint + disabled button, Enter saves) + a Colour
│   │                           radiogroup of 8 lane swatches named REPO_GROUP_COLOR_NAMES,
│   │                           footer Delete group (edit only) / Cancel / Create group|Save;
│   │                           creating from a repo's menu moves that repo in. TAB STRIP =
│   │                           CHROME-STYLE TAB GROUPS (owner, same day: "on the tabs
│   │                           nothing is there… what we solve is a lot of tabs and easy to
│   │                           identify" — a first cut left the strip untouched because of
│   │                           the 0.20.0 active-tab rejections, and that missed the point):
│   │                           core tabClusters(tabs, groups, groupOf, mains) → clusters in
│   │                           GROUP order (groups with no open tab omitted, ungrouped tabs
│   │                           LAST as group null, ui.repoTabs order kept inside) and
│   │                           orderRepoTabs = the flattened clusters, which useRepoShortcuts
│   │                           feeds tabForKey so ⌘1…9 / ⌘⇧[ ] follow the order ON SCREEN,
│   │                           not ui.repoTabs. Each cluster (data-tab-cluster=<id>,
│   │                           relative, mr-1.5 pr-1) is a LABEL + its tabs under a 2px
│   │                           TOP EDGE in the group colour (span data-tab-cluster-edge,
│   │                           absolute inset-x-0 top-0 h-0.5 rounded-full, full colour)
│   │                           — the motif the conflict resolver's A/B pane headers use.
│   │                           The LABEL is plain text, not a chip: button
│   │                           data-tab-group=<id>, h-8 (same as the tabs) px-2.5
│   │                           text-[11px] font-semibold in the group colour, in the
│   │                           USER'S OWN CASING — an uppercase section-header version
│   │                           shipped for one round and the owner asked for it back
│   │                           ("not always uppercase like that"); aria-expanded; the
│   │                           collapsed count is a mono digit after it. The strip stays ONE FLAT SURFACE.
│   │                           FIVE ROUNDS WITH THE OWNER (2026-10-03/04) got here, each
│   │                           rejected on sight with a real 15-tab screenshot: (1)
│   │                           tinted chip + 60% line UNDER the tabs — "so messy", chips
│   │                           read as tabs; (2) SOLID chip + tinted tray band behind the
│   │                           tabs — "a bit off", four saturated blocks in a UI where only
│   │                           HEAD is solid; (3) tinted Badge pill on the same-hue band —
│   │                           pill blurred into the band and a collapsed group was "a
│   │                           pill inside a box"; (4) uppercase text label on the band —
│   │                           "it isn't about the title": the BANDS were the problem, a
│   │                           patchwork of colour with the active tab reading as a hole
│   │                           cut out of it; (5) label + top edge, no fill — shipped.
│   │                           Rules that survived: one shape per group, nothing gets its
│   │                           own container, colour only on the edge and the label, the
│   │                           label keeps the user's casing;
│   │                           the active tab's bg-background + border pops out of the
│   │                           band. FIRST CUT, rejected on sight by the owner with a
│   │                           17-tab screenshot ("so messy, really confusing"): tinted
│   │                           chips (colour text on a 15% tint) + a 2px line under the
│   │                           cluster — the chips read as more tabs and the line was too
│   │                           faint to show where a group started or ended, so the strip
│   │                           was one long line of words. Trays + solid chips replaced it
│   │                           the same day; do not go back to underline-only. SECOND
│   │                           ROUND ("not bad, but still make it clean and easy"): (1)
│   │                           hairline SEPARATORS between neighbouring tabs in a run
│   │                           (span data-tab-separator, mb-2 h-4 w-px bg-border), hidden
│   │                           by pure CSS next to the active or hovered tab —
│   │                           `[[aria-selected=true]+&]`, `[[role=tab]:hover+&]` and the
│   │                           `:has(+ …)` mirrors — never between a chip and its first
│   │                           tab and never across a tray boundary (renderRun); (2) the
│   │                           shortcut pill was made grey on inactive tabs for two rounds
│   │                           and the owner asked for the 0.20.0 gold pill on EVERY tab
│   │                           back once the trays were gone ("color should be the same
│   │                           as previous") — it is bg-primary/15 inactive, /20 active,
│   │                           text-primary always; do not quiet it again; (3) chip menu gained "Collapse other
│   │                           groups" (collapseOthers: every cluster but this one
│   │                           collapsed via setTabGroupsCollapsed(patch)) and "Expand
│   │                           all groups"; (4) OVERFLOW LIST: a ResizeObserver on the
│   │                           strip sets `overflowing` (scrollWidth > clientWidth) and
│   │                           only then a ChevronDown icon-sm (data-tab-overflow, Hint
│   │                           "All open tabs") appears before "+", opening a menu of
│   │                           every open tab under GroupDot labels (Other for loose
│   │                           tabs, Check on the active one) plus Expand all / Collapse
│   │                           all groups — tabs scrolled off a hidden-scrollbar strip
│   │                           were simply lost before. THIRD ROUND — REORDER GROUPS:
│   │                           settings.moveRepoGroup(id, targetId, position) over the core
│   │                           helper. Strip: chips are draggable (GROUP_DRAG_TYPE
│   │                           'text/angkorgit-repo-group', `draggingGroup` state separate
│   │                           from `draggingTab`); a cluster is the drop target, position
│   │                           = pointer left/right of its midpoint, shown as a 2px inset
│   │                           primary edge (shadow-[inset_±2px_0_0_0_hsl(var(--primary))])
│   │                           on that side; the tab/chip tab-drop handlers return early
│   │                           without preventDefault while a group drags, so the event
│   │                           bubbles to the cluster. Welcome page: group headers are
│   │                           draggable, the section is the target, position = above/
│   │                           below the header midpoint shown as an inset top/bottom
│   │                           primary edge on the header, and the header menu carries
│   │                           Move up / Move down (disabled at the ends) as the no-drag
│   │                           path (G43). The Other section is never a reorder target;
│   │                           ungrouped always sits last. Clicking
│   │                           the chip COLLAPSES the cluster (ui.tabGroupsCollapsed, persisted,
│   │                           separate from the welcome page's repoGroupsCollapsed): only the
│   │                           chip with a count stays, EXCEPT the active tab, which always
│   │                           stays visible next to the chip so you can see where you are;
│   │                           switching into a hidden tab (⌘n, switcher, palette) shows it.
│   │                           DRAG: dropping a tab onto a tab of another cluster moves the
│   │                           REPO into that group (setRepoGroup) as well as reordering,
│   │                           dropping onto a chip adds it to that group at the front, and
│   │                           dropping next to an ungrouped tab removes it from its group —
│   │                           position = group, no toast. CHIP MENU (right-click): Collapse/
│   │                           Expand its tabs, Open the rest in tabs <unopened>, Close its
│   │                           tabs <open> (counts the cluster's OPEN tabs ∪ the group's
│   │                           recents, so a tab that is not a recent is still counted),
│   │                           Edit group…, Ungroup(…). UNGROUP is the only way a group
│   │                           dies (owner 2026-10-04: "should be able to ungroup"): it
│   │                           is deleteRepoGroup — the word was "Delete group" until the
│   │                           owner asked for ungroup, and "delete" read as if repos
│   │                           went too; confirm only when the group has repos, repos
│   │                           stay in recents and open tabs stay open. Welcome header
│   │                           menu and the Edit dialog footer say Ungroup as well. The
│   │                           tab title tooltip ends "· <group>" and the
│   │                           tab menu carries the submenu. RepoTabs' activate/close moved
│   │                           to repository/tabs.ts (activateTab, closeRepoTabs(paths)) so
│   │                           the group actions share them. TOOLBAR RepoSwitcher: with groups,
│   │                           DropdownMenuLabels (GroupDot + name, then "Other") replace
│   │                           the single "Repositories" label; items stay one-click
│   │                           (data-switcher-group=<name>). PALETTE: a "Repository groups"
│   │                           Command.Group before Switch repository with "Open all in
│   │                           <g>" (detail "n repositories") and "Close all in <g>" (only
│   │                           while some are open); Switch repository items carry the
│   │                           group as PaletteItem `detail` and cmdk `keywords`, so typing
│   │                           the group name finds its repos. Demo: a 4th recent
│   │                           billing-service (~/work) so two groups plus Other fit the e2e.
│   │                           NOT built on purpose: nested groups, per-group settings
│   │                           (profiles stay repo-bound, G29), a Settings card,
│   │                           auto-grouping by parent folder),
│   │                           RepositoryPage (layout, shortcuts, watcher subscription,
│   │                           per-repo state reset, RepoLoadingOverlay: content-area
│   │                           bg-background/95 blur + Logo draw loop + repo name while
│   │                           opening/refreshing — shows only after 250ms, stays ≥450ms
│   │                           so fast switches never flash it; auto fetch tries every
│   │                           remote on each tick, marks fetched when any succeeds,
│   │                           records failed remote names, and retries at the configured
│   │                           interval), CloneDialog, RepoDialogs
│   │                           (create branch/tag/stash — the stash dialog takes an
│   │                           optional StashPreset {paths} context (working-copy row menu
│   │                           "Stash this file…" / "Stash n files…"), lists the files name-first and passes
│   │                           them to ipc.stashCreate so only they are stashed —, rename, cherry-pick: commit chip
│   │                           list — single oid string or CherryPickPreset {oids} context,
│   │                           multi applies oldest-first via cherry_pick_many — +
│   │                           "Reference the source commit" checkbox persisted in settings
│   │                           as cherryPickRecordOrigin, confirm button autofocused so
│   │                           Enter picks; outcome via toastOutcome so conflicts warn)
```
