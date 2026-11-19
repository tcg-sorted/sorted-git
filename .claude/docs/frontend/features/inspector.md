# Frontend feature: `features/inspector`

Source: `apps/desktop/src/features/inspector` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── inspector/                ← COMPARE (issue #55, 2026-11-09, the owner's own spec in the
│                               thread: "select two commits, Compare, same file list and diff
│                               panel as a single commit"): graph store `compare {from, to}`
│                               (transient; select/toggleSelect/rangeSelect/goToMatch and a repo
│                               switch clear it) is set by the commit menu's "Compare these
│                               commits" (GitCompareArrows, data-compare-commits), shown only
│                               when exactly two loaded commits are selected; from = the one
│                               lower in the graph (older). Inspector loads both commits and
│                               ipc.commitFiles(to, from), labels itself "Compare" and renders
│                               CommitDetails for `to` with compareFrom (null while loading, so
│                               the panel never flashes the single-commit view): the message /
│                               meta / AI block is replaced by CompareHeader (data-compare-
│                               header, From/To rows data-compare-row with short oid, summary,
│                               age; a Swap button that flips the range) and every file open
│                               passes `base`; CenterDiffTarget.base flows into DiffPanel (file
│                               diff, sibling list, [ / ] stepping, cache keys, header badge
│                               data-diff-range `older..newer`, the AI context names the range
│                               instead of one commit) and AllChangesView (keyed by base..oid).
│                               The inspector closes an open diff whose oid/base no longer
│                               match the comparison. Not built: a palette entry, a merge-base
│                               (A...B) mode, comparing a commit with the working copy.
│                               FILE VIEW MODES (user request 2026-09-22, "view all files
│                               like GitKraken"): ui.fileView 'list' | 'tree' | 'all'
│                               (persisted; the persist merge maps the old boolean fileTree
│                               → 'tree'), three aria-pressed header buttons List/FolderTree/
│                               FolderOpen (lucide `Files` was tried first and read as a
│                               copy icon, owner 2026-09-22). 'all' renders EVERY file — commit: ipc.treeFiles
│                               (engine files.rs) unioned with the change list via core
│                               allFiles (deleted files stay, keyed by path); working copy:
│                               ipc.indexFiles ∪ status paths, reloaded on statusVersion
│                               (conflicted files stay in their own section) — as a FileTree
│                               whose folders WITHOUT changes start collapsed
│                               (FileTree.defaultCollapsed, evaluated on mount; core
│                               foldersWithChanges) so a 5k-file repo shows the top level
│                               plus the changed branches; changed rows are the normal rows
│                               (badge, counts, checkbox, menus), plain rows are text-muted
│                               with a faint lucide File icon centred in the badge slot (w-5
│                               in CommitDetails, w-7 in the working copy — its Badge measures
│                               28px) and a spacer where the stash/stage checkbox would sit
│                               so names align — the working copy DROPS that spacer when
│                               nothing is changed (a clean tree read as a column of dead
│                               space, owner screenshot 2026-09-22) — and open the
│                               file READ-ONLY: openCenterDiff({…, unchanged: true}) →
│                               DiffPanel loads ipc.fileContents, shows a neutral "unchanged"
│                               Badge, hides +/−, Stage file and hunk actions, and switches
│                               to the real diff if the file gains a status entry while
│                               open; header reads "Files n · m changed" ("n of m" while
│                               filtering), the fold button works, ↑/↓ still walk changed
│                               files only; the commit file menu is keyed {path, oid,
│                               deleted, changed} so plain rows get Edit/History/Blame/
│                               Reveal/Copy but never the stash Apply entries.
│                               CHANGE-KIND FILTER (same request): the M/A/D/R summary
│                               tokens in CommitDetails' FILES header are aria-pressed
│                               buttons (ChangeFilter, kindFilter state reset per commit)
│                               preceded by "All"; a picked kind narrows shownDiffs AND the
│                               all-files entries (unchanged files hide), the other tokens dim
│                               to opacity-60, clicking the active one or All resets;
│                               aria-labels stay "<n> <label>" so getByLabel('4 modified')
│                               keeps working. The working copy has no kind tokens, so no
│                               kind filter there.
│                               FILE FILTER (issue #5): HIDDEN BY DEFAULT behind a Search
│                               icon-sm toggle in the Inspector h-9 header (before the
│                               list/tree toggles, aria "Filter files"/"Hide file filter",
│                               active = bg-surface-raised) driving the TRANSIENT
│                               ui.fileFilterOpen — the owner judged an always-visible box
│                               as clutter most users never touch (2026-09-07); both panels
│                               clear their query when it closes, Escape clears text first
│                               and closes the box when empty. FOCUS ONCE, NOT PER MOUNT:
│                               setFileFilterOpen(true) bumps ui.fileFilterFocusSeq and
│                               FileFilterInput focuses only when that seq is one it has not
│                               consumed yet (module-level consumedFocusSeq) — a plain
│                               `autoFocus` re-fired every time the Inspector swapped
│                               WorkingCopyPanel ⇄ CommitDetails and stole the keyboard from
│                               the graph, so ↑/↓ stopped moving the commit selection (owner
│                               bug report 2026-09-07).
│                               components/FileFilterInput (Search
│                               icon + h-7 Input styled like the sidebar's "Filter refs…",
│                               clear X, Escape clears/closes via onClose) over core git/fileFilter.ts —
│                               filterFiles(items, pathOf, query): lowercase, whitespace-
│                               split terms, ALL must be substrings of the path. Used by
│                               CommitDetails (input under the Files header, state reset
│                               per commit oid, "n of m" count, "No files match" row) and
│                               WorkingCopyPanel (input above the list scroller when any
│                               file exists, reset on repo switch; Changes/Staged headers
│                               count "n of m"; all-list actions — Discard all, Stage all,
│                               Unstage all — keep acting on the UNFILTERED lists
│                               (allUnstaged/allStaged) so a filter never hides what a
│                               bulk button touches; shift-click ranges follow the
│                               filtered visibleOrder). The demo commit reports 5 files
│                               (demoCommitFiles adds four metadata-only entries) so the
│                               e2e can filter it.
│                               STASH VIEW (owner request 2026-09-07): Inspector loads
│                               ipc.stashFiles when the selected oid is one of
│                               useRepo.stashes (else commitFiles); CommitDetails finds
│                               the stash by oid, prints a one-line hint under Files, and
│                               each row (now a group div: diff button + trailing icon
│                               button, no nested buttons) shows a hover ArchiveRestore
│                               "Restore <path> from the stash" that calls
│                               ipc.stashRestoreFiles for that one file, refreshes status
│                               and toasts; rows open their diff with sourceOid ?? oid.
│                               MULTI-RESTORE (owner: one-by-one "not good yet"): stash rows
│                               carry a leading Checkbox (aria "Select <path> to restore"),
│                               shift-click on the checkbox or the row extends a range over
│                               the FILTERED order from pickAnchor, ⌘-click toggles; the
│                               hint bar becomes "n of m selected · Clear · Apply n files"
│                               (the wording is APPLY everywhere, matching git's verb —
│                               "restore" read as unclear to the owner); right-clicking a
│                               stash file row opens a small menu: Apply this file / Apply n
│                               selected / Copy path
│                               (or "Select all" while nothing is picked) and calls
│                               stashRestoreFiles with every picked path in one go; picked
│                               resets per commit oid and prunes paths that vanish.
│                               EVERY commit file row answers right-click (owner request
│                               2026-09-12, issue #18 asked for Reveal too): ONE fileMenu
│                               {x,y,file} for plain commits and stashes — the stash Apply
│                               entries sit first behind a separator when the commit is a
│                               stash — then the working copy's non-mutating entries: Edit
│                               file, File history, Open in external app, Show in Finder,
│                               Copy path (repo-relative) + Copy absolute path (owner request
│                               2026-09-12, the working copy menu has both too); Edit/Open/Show
│                               are disabled for a file the commit
│                               deleted. Stage/discard/stash have no meaning here and stay
│                               out; "checkout this file at this commit" is not built.
│                               Inspector (working copy ⟷ commit details; the h-9 header
│                               carries the label, list/tree toggles and — in commit
│                               mode — the "Back to working copy" X, so CommitDetails
│                               has NO close button of its own; it deliberately does NOT
│                               host tree fold controls — the owner rejected that as
│                               hard to find, so the fold button sits in EACH LIST'S OWN
│                               header row: components/FileTree exports
│                               FileTreeFoldButton (one smart button: "Collapse all
│                               folders" or "Expand all folders" from the reported
│                               state, hidden when the list has no folders) plus the
│                               per-instance `fold` prop {epoch, mode} and
│                               `onFoldState` callback; the Changes, Staged and commit
│                               Files headers each keep their own fold state in
│                               component state — never a global signal), CommitDetails
│                               (owner
│                               asked for a calm, professional look 2026-09-05: h2
│                               semibold summary; sans body clamped with line-clamp-[8]
│                               (clean line cut, NO gradient fade — the owner found the
│                               fade ugly) behind a ghost "Show full message"/"Show less"
│                               chevron button when > 8 lines or 600 chars; ONE meta
│                               card (surface-raised/50) = 28px avatar + name + "3d ago ·
│                               full date" (+ "committed by" when committer ≠ author) +
│                               hash chip, and a second line with Parent(s) chips and ref
│                               badges that reuse the GRAPH's icon+tone mapping — tag
│                               primary+Tag, remote info+Cloud, local success+Monitor;
│                               "Explain with AI" is a right-aligned ghost sm button;
│                               file rows are PLAIN rows with the working copy's ChangeMark
│                               (M/A/D/R), name first, DirName after, +/− counts ending at
│                               pr-3 — NO chevron: a permanent one read as noise and a
│                               hover-only one still reserved 22px, which the owner read as
│                               "padding from the right a bit long" (both 2026-09-24); the
│                               open file is marked by its row highlight alone; the FILES
│                               header carries `border-b border-border-subtle pb-2 mb-1`
│                               so the kind-filter tokens sit on a divider (owner request,
│                               same day) and their text ends at px-2 + token px-1 = 12px,
│                               matching the rows' pr-3 — never the old bordered-card rows; section header "FILES n" with the
│                               per-status summary right-aligned as COMPACT tokens — colored
│                               mark + count ("M 24 · A 6 · D 6 · R 3", label in the
│                               title/aria-label) on one nowrap line; the worded form
│                               wrapped to two lines on a commit with all four kinds and
│                               pushed FILES down (owner screenshot 2026-09-07);
│                               EDIT MESSAGE IN PLACE (2026-09-20): when the commit is
│                               not a stash (PUSHED COMMITS TOO since 2026-09-30, a user
│                               suggestion relayed by the owner: `pushed` = not in
│                               useRepo.unpushed; saveMessage then opens a destructive
│                               confirmDialog "Rewrite a pushed commit?" naming the force
│                               push and the reset for anyone who pulled, and the Pencil
│                               Hint says so; the graph menu entry is never disabled any
│                               more; the SUMMARY field is a rows=1 Textarea auto-grown
│                               to its scrollHeight in a useLayoutEffect so a long first
│                               line WRAPS — the old <input> scrolled the start out of
│                               reach and only arrow keys got there, owner 2026-09-30),
│                               the h2 and body take
│                               a double-click (cursor-text, title hint) and a ghost Pencil
│                               icon-sm button (aria "Edit commit message") sits at the
│                               RIGHT END of the h2 title line — it moved out of the actions
│                               row on 2026-09-24 when "Review with AI" made that row three
│                               buttons wide and it wrapped unevenly (owner: "the arrangement
│                               feels off"); the row below now holds only the two AI buttons,
│                               left-aligned — disabled with the Hint "Already pushed to a
│                               remote" (wrapped in a span so the tooltip fires on a disabled
│                               button) rather than hidden; the editor replaces the h2/body with the commit
│                               box's two-field group (summary input → Enter focuses the
│                               description, Backspace on an empty description returns; the
│                               description opens with rows = its line count clamped 3–12 and the
│                               editor box ends in a DRAG HANDLE (role separator "Resize
│                               description", the commit box's handle markup: h-3 strip, w-10
│                               pill that is border at rest, primary/60 on hover, primary while
│                               dragging, double-click resets) that sets an explicit textarea
│                               height clamped DESCRIPTION_MIN 72 – DESCRIPTION_MAX 360 — the
│                               native textarea corner grip was shipped first and REJECTED by the
│                               owner as "web based input"; owner 2026-09-20: long messages need
│                               room, but never an unbounded drag —,
│                               ⌘/Ctrl⏎ saves, Esc cancels; both stopPropagation so the
│                               window shortcuts stay quiet), footer "⌘⏎ to save · Esc to
│                               cancel" + Cancel + "Save message" (disabled while the summary
│                               is empty or the draft equals the original); Save goes through
│                               useUndo.tracked kind 'reword' (undo = SOFT reset like a
│                               commit — the tree never changed, so nothing can be lost) →
│                               ipc.reword → refresh + graph reload + select(newOid); editing
│                               state resets on commit.oid. AI REWORD: the summary row
│                               carries the working copy's Sparkles icon-sm ("Generate
│                               commit message with AI", absolute right-1.5, the summary
│                               reserves pr-9) that sends ipc.diffCommit → patchTextOfAll
│                               of THIS commit to aiCapabilities.generateCommitMessage with
│                               the commit style + the current branch for prefix rules and
│                               replaces the draft; stoppable (local messageAiRunRef token,
│                               Logo loop while busy, both fields readOnly + Save disabled,
│                               and generateDraftMessage focuses the summary first — G54),
│                               and Cancel, Save and a commit.oid change all bump the token so
│                               a late answer never lands in another editor. The graph commit menu's "Edit
│                               commit message…" (disabled when pushed) selects the commit and
│                               calls ui.requestEditMessage(oid) — the request CARRIES THE OID
│                               and CommitDetails consumes it only when it shows that commit
│                               (focusRequests.editMessageConsumed), because the same
│                               CommitDetails instance still renders the previous commit for
│                               a frame and would otherwise open, then reset, the editor.
│                               Demo: demoReword mutates the shared CommitInfo in place,
│                               demoUnpushed = everything above the first remoteBranch ref.
│                               Explain with AI AND Review with AI (owner 2026-09-24:
│                               "we have review, but not yet commit, only staged"):
│                               runCommitAi(kind) loads ipc.diffCommit → patchTextOfAll,
│                               builds CommitChangeContext {oid, summary, files} and calls
│                               aiCapabilities.explainCommitChanges /
│                               reviewCommitChanges (the review reads .angkorgit/review.md
│                               + global instructions like the other reviews; both carry
│                               commitChangeContextLines — commit line + up to 30 file
│                               names + "a symbol that disappears from one file may
│                               reappear in another"); results live in ai/workStore's
│                               EXPLAIN slots keyed explainKeyFor(repo, oid) and
│                               commitReviewKeyFor(repo, oid) (= explain key + "\nreview",
│                               same run/busy/stop machinery, so a review finishes in the
│                               background and survives selection changes); the buttons
│                               toggle to "Stop explaining"/"Stop reviewing" while busy
│                               (Review is hidden for stashes); each result renders in its
│                               own features/ai/AiResultPanel card (busy phrase, full-view
│                               dialog, dismiss) — the old inline AiText card + Maximize2
│                               dialog are gone. Quoted lines do not jump here (no single
│                               diff is open); a follow-up could open the file diff that
│                               contains the snippet)
```
