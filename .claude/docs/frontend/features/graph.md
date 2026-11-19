# Frontend feature: `features/graph`

Source: `apps/desktop/src/features/graph` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── graph/                    ← KEYBOARD FLOW (owner/user feedback 2026-09-07): ↑/↓/Home/End
│   │                           move the selected commit (global shortcuts, inert while a
│   │                           center view is open); → calls ui.focusInspector() — a
│   │                           transient inspectorFocusSeq that CommitDetails consumes by
│   │                           focusing its "Commit files" container (tabIndex 0, ring on
│   │                           focus-visible) and opening the FIRST file's diff (or waiting
│   │                           for the list to load via wantFirstFile); the consumed marker
│   │                           is MODULE-LEVEL and shared by both panels (ui/store
│   │                           focusRequests) so a panel that mounts after the key press —
│   │                           CommitDetails remounts per commit — still honours the one
│   │                           pending request exactly once; inside that list ↑/↓ open the
│   │                           previous/next file (data-active-file scrolled into view),
│   │                           →/Enter re-open the active one, ← closes the diff and calls
│   │                           ui.focusGraph() — ALWAYS: ← is the way back to the graph
│   │                           and must never be taken for diff navigation (owner, third
│   │                           round 2026-09-30: "if we do this we cannot go back to the
│   │                           graph"). While a diff is open → instead steps to the NEXT
│   │                           CHANGE (owner request the same day, "→ can do like N")
│   │                           through diff/changeNav stepOpenDiffChange, a module-level
│   │                           stepper the mounted DiffPanel registers (useChangeJump
│   │                           arrowKeys: true); it returns 'stepped' | 'edge' | 'none' —
│   │                           the steps WRAP inside the file (second round: "shouldn't
│   │                           move to the next file, loop on the file diff until the user
│   │                           clicks arrow down" — a first version rolled → into the next
│   │                           file, and a version where ← stepped BACK a change was also
│   │                           REPLACED), 'edge' only happens for a diff with no change
│   │                           blocks (binary/unchanged: → does nothing), and 'none' (no
│   │                           panel) keeps the old open-the-file behaviour; while a diff
│   │                           is open ↑/↓ change files and ← or Escape closes it.
│   │                           The stepper is INDEX-BASED, not scroll-based: a
│   │                           ChangeCursor {blocks, index, top, at} remembers the change
│   │                           last jumped to (the auto-jump anchors index 0) and is trusted
│   │                           while scrollTop still sits at its target (±2px) or the smooth
│   │                           scroll is under 600ms old, else the position derives the
│   │                           index — so a diff that FITS the pane (no scrolling possible)
│   │                           still walks its changes; n/p keep the scroll-based
│   │                           jumpToChange and reset the cursor (step(-1) is still
│   │                           implemented, nothing calls it). `ready: false`
│   │                           (diff still loading) swallows the key so a slow load never
│   │                           skips a file. DiffPanel also owns window-level arrowright/
│   │                           arrowleft shortcuts for when focus is on body or inside the
│   │                           panel (after a click into the diff; → steps, ← closes), gated on no palette/
│   │                           dialog/conflict and !defaultPrevented so Radix menus keep
│   │                           their arrows; the list handlers stopPropagation so the two
│   │                           never double-fire. Shortcuts tab lists the row.
│   │                           (graphFocusSeq → the graph scroll container,
│   │                           tabIndex -1, takes focus so the list stops receiving keys;
│   │                           the commit stays selected). List handlers stopPropagation so
│   │                           the window-level shortcuts never double-fire. WorkingCopyPanel
│   │                           mirrors it: → from the graph with no commit selected focuses
│   │                           the changed-files list and opens the first file, ↑/↓ OPEN the
│   │                           previous/next changed file's diff (moveFileSelection calls
│   │                           showDiff, not selectFile — an earlier version only moved the
│   │                           highlight and the diff stayed on the clicked file, user
│   │                           report 2026-09-11; the multi-select is cleared like a plain
│   │                           click), ← goes back. Listed in Settings → Shortcuts.
│   │                           store (revealCommit(path, oid): ipc.historyPosition → ensureLoaded →
│                           select + pendingScrollIndex + locatedOid — the way OTHER panels
│                           land on a commit (FileHistoryPanel "Open commit", issue #9);
│                           locatedOid lives in the store, set by goToMatch/revealCommit and
│                           cleared by every select/toggleSelect, so the glow follows the
│                           selection without component state;
│                           pagination, filters {branch} — the only filter left,
│   │                           it narrows the walk; SEARCH AND AUTHOR ARE FIND, NOT FILTER
│   │                           (owner 2026-09-10: the flattened, laneless graph "felt off",
│   │                           then asked for the author box to match): `find` {text, author,
│   │                           matches: HistoryPosition[], truncated, active, loading} filled
│   │                           by ipc.historySearch → engine history::search, which walks the
│   │                           SAME walk the graph shows (branch-filtered, stash helpers
│   │                           skipped), treats text and author as match criteria (either or
│   │                           both) and returns every match position, capped at
│   │                           SEARCH_MATCH_CAP 1000 → truncated ("m+"); setFind runs the
│   │                           search then goToMatch(0); goToMatch ensureLoaded()s pages up
│   │                           to the match index (fetchMore/appendPage shared with
│   │                           loadMore), selects the commit and sets pendingScrollIndex;
│   │                           stepFind wraps ±1; setFilters re-runs the find after its
│   │                           reload so indices stay valid; findSeq guards stale results
│   │                           (G26); A LATE RESULT NEVER STEALS THE SELECTION (owner
│   │                           report 2026-10-08, "click the second match and it goes
│   │                           back to the first, only the first time per repo"): the
│   │                           first search in a repo is slow (cold object cache, the
│   │                           engine reads every commit message), the debounce fires a
│   │                           search per typing pause, and the final query's result used
│   │                           to land AFTER the user had clicked another row and run
│   │                           goToMatch(0) over it; a module-level selectSeq is bumped by
│   │                           select/toggleSelect/rangeSelect (user actions), goToMatch
│   │                           writes the selection WITHOUT bumping it, and setFind skips
│   │                           the auto-jump when selectSeq moved while the search was in
│   │                           flight (the matches and pill still land; withActiveMatch
│   │                           points `active` at the selected commit when it is a match).
│   │                           ONLY MATCHES (opt-in, teammate idea relayed by the owner 2026-11-07,
│   │                           "search into staging gives 1 of 1000+, return only the matches"): find
│   │                           stays the default; a ListFilter icon-sm after the n-of-m pill (aria "Show
│   │                           only matching commits", aria-pressed, data-only-matches, primary tint when
│   │                           on, shown while a find is active) flips graph-store onlyMatches (transient,
│   │                           reset per repo like filters); while it is on and a find exists, reload/
│   │                           fetchMore pass the find's search/author to ipc.history (the engine's
│   │                           filtered list walk, same text_matches/author_matches and walk order as
│   │                           history::search, so match k IS list row k and goToMatch uses k directly),
│   │                           matchesOnly snapshots that query so pages stay consistent, the layout is
│   │                           fed parents: [] (no half-drawn lanes) and rowsOf repaints every node in
│   │                           lane colour 0 with isMerge from the real parents, so merges keep their small
│   │                           dot; the per-row match bar is dropped (every row matches) and the count reads
│   │                           "n matching commits" (data-matching-count). Turning it off reloads the full
│   │                           graph and revealCommit()s the selected commit; clearing the search box
│   │                           reloads too; a changed query relists only when it differs from matchesOnly.
│   │                           The September flat-list rejection was about FIND BEING a filter; this keeps
│   │                           the graph as the default. e2e `Only matches narrows the graph…` verified to
│   │                           fail without it. Clicking a match row also sets `active` to it, so the pill
│   │                           reads "k of m" and Enter continues from there. Demo: the
│   │                           localStorage key angkorgit-demo-search-delay (ms) slows
│   │                           ipc.historySearch for the e2e; hashes and prefixes match because the engine haystack
│   │                           includes the oid, so the old jumpTo/history_position path is
│   │                           gone from the UI (the command + its test remain).
│   │                           CommitGraph: ONE 300ms debounce over both drafts → setFind;
│   │                           in either box Enter/↓ next, Shift+Enter/↑ previous, Escape
│   │                           clears that box (onFindKeyDown); a `n of m` pill with
│   │                           ChevronUp/Down sits after the box, "No matches" in danger when
│   │                           empty, spinner while the first search runs; every match row
│   │                           carries data-search-match ("active" for the located one) and a
│   │                           2px inset primary/45 bar, the located row the animate-locate
│   │                           glow (locatedOid, cleared when another commit is selected —
│   │                           the QUERY STAYS so the user can keep stepping); lastPath guard vs
│   │                           cross-repo leaks; pendingScrollIndex
│   │                           scrolls it centered; the located row gets
│   │                           `animate-locate` (preset keyframe: primary/42 glow + outer halo easing
│   │                           to primary/10 over 1.1s) plus a lasting inset 3px primary bar —
│   │                           `.reduce-motion .animate-locate` in globals.css skips the animation
│   │                           and paints the settled state; the owner found the old ring boring),
│   │                           CommitGraph (virtualized, context menu incl. revert; the
│                           REF CHIP MENU MIRRORS THE SIDEBAR'S (owner request 2026-11-06,
│                           "delete branch or merge like on the left sidebar"): branch chips
│                           add Open in new worktree… (not for the HEAD branch or one held by
│                           another worktree), Create branch here…, and for locals Rename… and
│                           Delete (undoable kind branchDelete, no confirm, like the sidebar);
│                           Checkout/Merge/Fast-forward/Rebase/Delete are disabled on the
│                           checked-out branch and Pull without an upstream; tag chips get
│                           Checkout (detached), Push to remote (pre-push hook retry, picked
│                           remote) and Delete; e2e `graph branch and tag chips offer the
│                           sidebar actions…` verified to fail on the old menu; the
│                           commit menu lists "Push <branch> ↑n" for every LOCAL branch
│                           whose tip is that commit (owner request 2026-09-10), via
│                           pushBranch — ensureRepoProfile → ipc.push to
│                           pushRemoteFor(branch): the branch's upstream remote when it
│                           exists, else remotes[0] like the toolbar — and then a forge
│                           PR reload; the ref-chip menu's Push shares it; the
│                           ref column is a FIXED REF_COL_WIDTH — an adaptive width was
│                           built and REJECTED by the owner (the layout shifting read as
│                           broken), chips fit or fold instead; header "Graph display"
│                           Settings2 menu of DropdownMenuCheckboxItems toggles
│                           ui.graphColumns {refs, message, author, hash, date}
│                           (persisted; the persist `merge` fills new keys from
│                           DEFAULT_GRAPH_COLUMNS so an older saved object never hides a
│                           column that did not exist yet) — `author` is an AUTHOR NAME
│                           column (AUTHOR_COL_WIDTH, after the message), NOT an avatar
│                           toggle: node avatars always render (owner: avatars need no
│                           switch); the GitMerge icon belongs to the message column and
│                           hides with it; GUTTER_GAP (10px marginRight on the graph
│                           gutter, the WIP svg and the header cell) keeps lanes off the
│                           message text; rows, header and WIP banner end with pr-4 so
│                           the graph never touches the inspector divider; with the
│                           message OFF the flex-1 spacer moves to the END so author/
│                           hash/date pack next to the graph (left-aligned) instead of
│                           pinning to the far right — the header mirrors both rules; a static h-6 COLUMN HEADER
│                           row sits between the filter bar and the scroll container
│                           (outside it, so the sticky WIP banner stays first inside),
│                           mirroring the row layout exactly — REF_COL_WIDTH with the
│                           same -mr-2, gutterWidth, flex-1, w-14, w-[4.5rem] — and
│                           hiding a header with its column; GRAPH LOOK REWORK (owner, 2026-11-06,
│                           "our graph looks messy next to GitKraken", picked option C from a
│                           labelled mock of four): LANE_WIDTH is a FIXED 22px — it was 20 with a
│                           laneWidthFor() that squeezed lanes down to 11px to keep the gutter
│                           under 190px, and in a 12-lane repo the 27px avatar nodes then covered
│                           the lines on both sides (owner screenshot of core.api: 13px lanes);
│                           gutterWidthFor(maxLane, lw, limit) caps the column at the USER'S WIDTH —
│                           ui.graphWidth (persisted, null = GUTTER_DEFAULT_WIDTH 190, clamped
│                           GUTTER_MIN_WIDTH 60 to GUTTER_MAX_WIDTH 600 by clampGraphWidth) set by
│                           dragging the data-graph-resize handle on the Graph header's right edge
│                           (2px border bar, primary/60 on hover, primary while dragging; double-
│                           click resets) — a narrower repo still shrinks the column to its lanes;
│                           the first cut capped at a fixed 250 and core.api's 10 lanes (238px) all
│                           fit, so the owner found "nothing can scroll" — and lanes past
│                           it SCROLL SIDEWAYS (owner, same day, after GitKraken screenshots "able to
│                           scroll"): gutterOverflowFor = full lane width − cap; each row's lines sit
│                           in an HTML LAYER (data-graph-lanes, left −overflow, width total + 2 ×
│                           overflow, svg content under a static translate(overflow), will-change:
│                           transform when overflow > 0) and GraphScrollbar's apply() writes
│                           translate3d(−offset) STRAIGHT onto every layer in the scroller (plus the
│                           data-graph-scroll-x attribute the e2e reads) and re-applies in a no-deps
│                           layout effect so rows mounted by vertical scrolling pick it up. NOT a CSS
│                           variable on the scroller: the first version set --graph-scroll-x there and
│                           translated an SVG <g>, and the owner felt the pan lag (2026-11-08) —
│                           measured on the 14-lane demo, an inherited var restyles every element of
│                           every row and an SVG <g> transform cannot be composited, so each wheel step
│                           cost ~3 ms of style recalc at 4× CPU plus ~2 repaints, WebKit p95 35 ms /
│                           worst 55–106 ms; the layer version is style 26–70 ms per 80 steps, ~0
│                           paints, WebKit p95 18 ms / worst ~25 ms. The band rect and chip connector
│                           still reach the fixed edges; the TAIL_EDGE bar is a span OUTSIDE the
│                           layer. STICKY NODES (owner request the same day, GitKraken screenshot):
│                           avatars and merge dots (now an HTML span, data-graph-node with
│                           data-node-x/min/max) are separate composited spans; apply() shifts each
│                           by stickyNodeShift so a node whose lane is scrolled off — or sits past the
│                           column at rest — pins to the left or right edge while its lines scroll
│                           under it; a static 1.5px segment from the gutter edge to the min node
│                           position keeps the chip connector touching a left-pinned node; e2e
│                           `graph nodes whose lanes leave the column pin to its edges…`; the bar (data-graph-scrollbar,
│                           absolute bottom-0 under the gutter: left 4 + REF_COL_WIDTH or 16, width
│                           gutterWidth, only when overflow > 0) DRAWS ITS OWN THUMB for the G46
│                           reason (macOS hides native bars), drag maps pointer dx by overflow /
│                           travel, a track click pages by the column width, and a native non-
│                           passive wheel listener on the scroller pans on deltaX when it beats
│                           deltaY (or Shift+wheel) and leaves vertical scrolling alone; offset
│                           resets per repo and clamps when the overflow shrinks; demo flag
│                           angkorgit-demo-busy-graph = 1 builds a 14-lane history for the e2e
│                           `a graph with more lanes than its column scrolls sideways…` (verified to
│                           fail without the feature);
│                           the 190 cap existed because the owner disliked "a really long gap"
│                           before the message (2026-09), which is why the default went back to 190
│                           with the drag handle (e2e `dragging the graph header edge resizes the
│                           column…` verified to fail without it); LINES ARE
│                           RAILS: railIn/railOut draw vertical → RAIL_RADIUS 6 quadratic corner
│                           → horizontal, replacing the S-shaped cubic béziers whose diagonals
│                           tangled when lanes crossed (e2e asserts no ' C ' in any row path); option
│                           D (keep the squeeze, dots instead of avatars when lanes < 20px) was
│                           the runner-up; laneX takes
│                           laneWidth (WipRow's laneX(0) is width-independent); nodes are
│                           20px avatars with a double ring (NODE_HALO 1.5px background
│                           + NODE_RING 2px lane color via two box-shadows); each row
│                           draws a TAIL — a FLAT rect (no rx since 2026-11-06) from the node to the end of the
│                           gutter (the gutter div is width + GUTTER_GAP wide, no margin)
│                           filled with `url(#graph-tail-N)`, ten linearGradients
│                           (lane color 0.18 → 0.07 → 0.03 — was 0.28/0.12, dialled down 2026-09-07 after a many-lane repo read as a striped wall) rendered once by GraphTailDefs
│                           inside the CommitGraph section, painted BEFORE the lane lines
│                           so lines stay crisp over it (owner asked for a colored band
│                           from avatar to next column); it ends in a solid 2px lane-colour
│                           EDGE (TAIL_EDGE, data-graph-tail-edge) at the gutter's right side, the
│                           "border right" the owner asked for 2026-09-07 — it replaced the
│                           stroked rounded right cap and its graph-tail-edge gradients/token;
│                           the whole band is behind ui.graphTail (persisted, default ON,
│                           "Lane color band" checkbox at the bottom of the Graph display
│                           menu, same list as the columns with NO separator (a separator
│                           read as an uneven gap) — owner 2026-09-07: some users won't want the color, respect
│                           the preference; CommitRow prop `showTail`, rects carry
│                           data-graph-tail for the e2e) —
│                           CommitRow takes `columns`, WipRow `showRefs`; with refs off
│                           rows AND the WIP banner
│                           switch pl-1 → pl-4 so lanes don't hug the sidebar divider
│                           (owner feedback); empty state offers "Clear filters"
│                           when any filter is active),
│                           WipRow: the uncommitted banner's marker is a dashed
│                           "WIP" chip (replaced the `// WIP` monospace text that read
│                           as a glitch, UX audit 2026-09-24); GraphTailDefs stop
│                           opacities come from tokens --graph-tail-start/mid/end
│                           (0.18/0.07/0.03 dark, 0.34/0.14/0.06 in .light —
│                           the band was invisible on light themes); the banner is OPAQUE (bg-surface
│                           with the primary/10 selected/hover tint as a background-image) — a
│                           bg-primary/10 replaced bg-surface/95 when selected and rows scrolled
│                           visibly under it;
│                           GraphRow (per-row SVG lanes; REF CHIPS: groupRefs merges
│                           local+remote of the same name, DROPS 'head' refs when a local
│                           branch sits on the commit (the tick on that chip is the HEAD
│                           mark) and renders a primary "HEAD" chip only when detached,
│                           sorts local → remote → tag → stash; STASH rows (any ref of
│                           kind 'stash'): the node is an Archive glyph in the lane color
│                           with a dashed inner outline instead of the avatar (role img,
│                           aria "Stash"), the chip is neutral + border-dashed with the
│                           message as label CAPPED at max-w-[11rem] and WITHOUT the
│                           hover:shrink-0 expansion branch chips get — a "WIP on main:
│                           <hash> <summary>" stash grew over the graph and the message
│                           column on hover (owner 2026-09-07); the full message lives in
│                           the title —, double-click does nothing (row click selects and
│                           the Inspector shows the stash files), right-click on the chip
│                           OR the row (onContextMenu routes a commit carrying a stash ref
│                           to refMenu instead of the commit menu) opens the ref menu's
│                           stash branch — Apply (keep) / Pop / Drop… with a confirm —
│                           using stashIndexOf(ref.name); fitGroups greedily shows whole
│                           chips by ESTIMATED width (6.4px/char + padding + 14px per
│                           icon) reserving room for the "+n" badge — a lone chip may
│                           still ellipsize if longer than the column, never two
│                           crushed chips; the "+n" badge is NOT decoration (user report
│                           2026-09-11: "+1 — I don't know what that is"): it is a
│                           role=button (aria "n more refs", title lists them); when a
│                           row has folded refs the WHOLE RefCell span becomes the
│                           trigger of a design-system HoverCard (Radix hover-card,
│                           openDelay 200 / closeDelay 150, clicking the badge also opens
│                           it via the controlled `more` state) whose content
│                           (data-more-refs) is a flex-col panel that OVERLAYS THE ROW —
│                           sideOffset −ROW_HEIGHT and alignOffset −5 put its first chip
│                           exactly on top of the row's first chip (e2e measures ≤2px) —
│                           and stacks EVERY group one per line, GitKraken-style
│                           (owner screenshot 2026-09-11), rendered with the SAME
│                           RefChip component the row uses — double-click checks out /
│                           resets, right-click opens the ref menu, identical titles; a
│                           click-to-menu list and then a floating card under the badge
│                           were built first and REPLACED ("should display like
│                           GitKraken when hover"); the content stopPropagation()s
│                           click/dblclick/contextmenu because React portals bubble
│                           synthetic events to the row and would select it; the ref
│                           menu (refMenu carries
│                           the commit). THE CHECKED-OUT BRANCH COMES FIRST: groupRefs
│                           takes `headBranch` (CommitGraph derives it from
│                           useRepo.branches isHead, passed through CommitRow) and
│                           groupRank puts that local group before every other local,
│                           and headOf gives the tick ONLY to that label — before this,
│                           the first local ref in commit.refs order got the tick and the
│                           real HEAD branch could sit folded behind "+1" while its
│                           sibling wore the check (owner screenshot 2026-09-11, core.api:
│                           `demo ✓ +1` with `staging` checked out); with no headBranch
│                           (demo/other callers) it falls back to first-local; the demo
│                           puts `hotfix/lane-colors` BEFORE `main` in commit 0's refs so
│                           the e2e proves main still wins; refMenu carries
│                           the commit now) also gained "Reset <local> to this…"
│                           (refMenuResetTarget: remote ref whose base name is in
│                           resettableBranches and whose local is NOT on this commit →
│                           resetToRemote) so a folded separated origin chip can be reset
│                           from the card; the demo puts `release/0.4` next to
│                           `feature/diff-viewer` on commit 7 so the fold is real; the
│                           CHECKED-OUT branch chip is a SOLID
│                           fill instead of the tint every other chip gets — the tick alone
│                           was not enough to spot where you stand; SINCE 2026-11-06 EVERY CHIP
│                           WEARS ITS ROW'S LANE COLOUR (inline style: lane/0.16 bg, lane/0.45
│                           border, lane text; the checked-out one solid lane with background
│                           text; data-lane-chip=<lane>) instead of the kind tones (local green,
│                           remote blue, tag primary) — a green `demo ✓` on an orange lane did
│                           not say which line it was; the icons still tell local/remote/tag
│                           apart; stash chips stay neutral and dashed; the chip→node connector
│                           is 1.5px at 0.85 opacity (was 1px/0.45); a remote-only chip
│                           whose base name matches an existing local branch is
│                           SEPARATED (local and origin sit on different commits;
│                           resettableBranches is passed down
│                           from CommitGraph — ONLY local branches with ahead > 0, so a
│                           branch that is merely behind keeps the plain double-click
│                           checkout, which fast-forwards it): DOUBLE-CLICK opens a destructive
│                           confirmDialog — SHORT title/confirmLabel ("Reset branch to its
│                           remote?" / "Reset branch"), the local branch in the `path` panel,
│                           the remote + oid in the description; the first version put both
│                           branch names in the title AND the button and a long branch name
│                           pushed the button out of the dialog (owner screenshot 2026-09-07) —
│                           confirmDialog offering to hard-reset that local branch to
│                           the chip's commit instead of the usual checkout (single
│                           click stays plain row selection — an earlier single-click
│                           version fought the double-click gesture), and when the
│                           branch is NOT HEAD the flow checks
│                           it out first as a SEPARATE tracked('checkout') entry before
│                           the tracked('reset') one, so undoing twice restores both
│                           steps (one combined entry would hard-reset the wrong branch);
│                           a branch held by another worktree is refused with a toast;
│                           merge-commit summaries are text-muted unless
│                           selected; hash is a copy button, time carries the full date
│                           as title), WipRow (uncommitted banner)
```
