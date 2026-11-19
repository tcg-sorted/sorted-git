# Frontend feature: `features/sidebar/Sidebar.tsx`

Source: `apps/desktop/src/features/sidebar/Sidebar.tsx` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── sidebar/Sidebar.tsx       ← SECTION HEADERS = GOLD ICON TILE + COUNT BADGE (user
│                               feedback 2026-09-22, "hard to identify" the sections; the
│                               owner picked this from four CSS-only mockups): the header
│                               stays a flat row (gap-2 between sections, label in
│                               text-foreground/80, hover bg-surface-raised) but its icon
│                               sits in a size-5 rounded bg-primary/15 text-primary tile
│                               (data-sidebar-section-icon — the SAME tile motif as
│                               SidebarEmpty/SettingEmpty/CliAgentPicker) and the count is a
│                               neutral Badge overridden to border-transparent
│                               bg-foreground/[0.08] h-4 text-[10px] (the plain Badge
│                               neutral's bg-surface-raised is invisible on light themes);
│                               rows keep faint plain counts, so headers read as headers
│                               without lines or cards. The badge is RIGHT-ALIGNED at the
│                               header's edge (owner 2026-09-22, "align together") and the
│                               hover action slot sits BEFORE it; since the UX audit
│                               (2026-09-24) the slot is `flex w-0 overflow-hidden
│                               group-hover:w-auto group-focus-within:w-auto` — it takes
│                               NO width until the header is hovered or focused, because
│                               the reserved slots used to shrink the label to "W…"/"P…"
│                               in a narrow sidebar; it stays RENDERED (w-0, never
│                               display:none) so the 28px icon button keeps the row height
│                               constant — a `hidden group-hover:flex` version made every
│                               header grow on hover (owner screenshot, same day);
│                               e2e tests must HOVER the header before clicking a section
│                               action (Playwright treats a display:none button as not
│                               visible); the badge is outside the toggle button and gets
│                               its own onClick. data-sidebar-section-header / -body
│                               exist for the e2e that pins this down. FOUR decorated
│                               versions were built and REJECTED by the owner the SAME DAY,
│                               in this order: a hairline `border-t` per section ("use
│                               background or something instead"), a tinted header pill
│                               (collapsed it read as a stack of buttons in an empty
│                               column), a faint bg-foreground/[0.035] card around each open
│                               body (a short list on a card with a void below "still
│                               weird"), and that card stretched to fill the free height like
│                               VS Code ("didn't suit our UI"). Do not bring lines, pills or
│                               cards back into the sidebar; the panel language is flat.
│                               Also learned: bg-surface-raised/N tints are invisible on the
│                               light themes (surface-raised 99% over surface 100%), so any
│                               future tint must be foreground-relative.
│                               ACCORDION LAYOUT (owner request 2026-09-05, VS Code
│                               Explorer style): the sections container is a flex column
│                               (overflow-y-auto only as a fallback); Section root is
│                               `flex flex-col` + `min-h-[5.5rem] shrink` when open or
│                               `shrink-0` when collapsed, its header is shrink-0 and its
│                               body `min-h-0 flex-1 overflow-y-auto` — so each open
│                               section scrolls inside itself and collapsed headers stay
│                               visible; a `min-h-0 flex-1` SPACER is rendered right after
│                               the LAST open section (spacerAfter(id), computed from the
│                               visible section order incl. the conditional pull-request
│                               and submodule sections) so headers below it pin to the
│                               bottom while short open sections keep their content
│                               height instead of stretching; nothing open → headers
│                               stack at the top. SECTION STATE lives in ui.sidebarSections (persisted map
│                               id → open; SIDEBAR_SECTIONS lists the ids, sectionDefaults
│                               in the component supplies the fallback — Branches/
│                               Worktrees/PRs open, Stashes open only when non-empty, the
│                               rest closed); Section is CONTROLLED (open/onToggle), never
│                               owns state. "Collapse all" (ChevronsDownUp beside the
│                               filter box, disabled when nothing is open; palette
│                               "Collapse sidebar sections") calls
│                               ui.collapseSidebarSections(ids) which also bumps
│                               sidebarCollapseEpoch so the Sidebar effect clears the
│                               local expandedFolders set — branch folders stay local
│                               state on purpose (per-repo, not worth persisting).
│                               WORKTREES section (always shown, right under Branches:
│                               count badge, "+" opens the dialog, an Eraser prune
│                               action appears when any folder is missing; with a single
│                               working tree the body is SidebarEmpty (the sidebar's dashed
│                               empty-state card: gold icon tile, title, one-line body,
│                               optional full-width action — shared by Worktrees "Two
│                               branches, two folders"/New worktree, Tags "No tags yet"/New
│                               tag, Stashes "Nothing stashed"/Stash changes, Remotes "No
│                               remotes" without action; bare grey "Nothing here." text is
│                               no longer acceptable for a section), otherwise
│                               two-line rows — name + Home icon for the main worktree /
│                               Lock / danger triangle for missing / brand-gold dot for
│                               uncommitted changes, branch or `detached @ oid`
│                               subtitle — HeadMark tick on the CURRENT one; click or
│                               Enter switches tabs via useRepo.open, menu: switch /
│                               Reveal in Finder / Copy path / Remove… (confirm with the
│                               path panel; dirty → "Delete changes and remove" passes
│                               force; removing the CURRENT worktree first opens the
│                               main one, closes the tab + kills its terminal session,
│                               then removes) or "Forget missing worktree"); branch
│                               rows whose branch lives in ANOTHER worktree carry a
│                               FolderTree marker, double-click switches to that
│                               worktree instead of checking out, and their menu swaps
│                               Checkout for "Switch to worktree <name>" — every other
│                               non-HEAD branch gets "Open in new worktree…"; the same
│                               held-branch map reaches the graph (CommitGraph passes
│                               worktreeBranches to CommitRow → RefCell swaps the local
│                               Monitor glyph for FolderTree and double-click on that
│                               chip switches to the worktree) and the tab strip
│                               (ui.worktreeTabs, persisted, marked by useRepo.open
│                               from RepositoryInfo.isWorktree — a FolderTree glyph
│                               before the tab name); the create toast carries a
│                               description reminding that ignored files such as
│                               node_modules are not copied;
│                               PULL REQUESTS section (shown when the first remote parses
│                               to a known forge; count badge, refresh + create actions,
│                               connect-account hint that opens Settings, rows with draft
│                               badge and a menu: checkout via provider.checkoutSpec →
│                               ipc.prCheckout — bitbucket fork PRs have no fetchable ref
│                               and toast instead —, open in browser, copy URL),
│                               branch FOLDER TREE (buildBranchTree); the CHECKED-OUT
│                               branch row is not just a tick — it carries bg-primary/10
│                               (/20 when it is also the graph filter, hover a step
│                               deeper), font-medium text-primary and an absolute
│                               `before:` 3px primary bar on its left edge (absolute so
│                               the measured name alignment is untouched); HeadMark reserves a
│                               fixed tick gutter so names align with each other AND with
│                               folder labels at the same depth (remote rows carry the empty
│                               slot for the same reason), right-click context
│                               menu (checkout/merge/rebase/pull/push/create-branch-here/
│                               rename/delete), drag-and-drop merge/rebase, tags/stashes/
│                               remotes/submodules sections. Remotes: the top-level
│                               FOLDER row of each remote (origin, upstream…) IS the
│                               remote — Cloud icon, hover "…" and right-click open the
│                               remote menu (fetch/OPEN IN BROWSER via core remoteWebUrl, issue #24/edit/remove); remotes with no fetched
│                               branches render as a chevron-less row with the same
│                               menu; there is no separate remote list under the tree
│                               (owner request 2026-09-05). ADD REMOTE (issue #26,
│                               2026-09-15): the section header "+" and the empty-state
│                               button open the SAME dialog as Edit remote with
│                               original === null (title/button/copy switch on that),
│                               name prefilled "origin" for a remote-less repo, and the
│                               act() runs remoteAdd THEN fetch so branches appear at once. ROW-MENU INVARIANT (owner
│                               request 2026-09-05): every row type — branch, remote
│                               branch, remote folder, worktree, stash, tag, pull
│                               request, submodule — answers BOTH the hover "…" button
│                               and right-click with the SAME positioned menu (state
│                               {x,y,item} + fixed-span DropdownMenuTrigger, the pattern
│                               branchMenu started); never use an inline DropdownMenu
│                               trigger on a row, it only answers the button. Stash and
│                               tag rows also select their commit in the graph on click
```
