# Frontend feature: `features/diff`

Source: `apps/desktop/src/features/diff` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── diff/                     ← ACTIVE CHANGE MARKER (issue #75, 2026-10-13): ChangeBlock
│                               carries start/end (logical row indices, the same list
│                               flattenDiff builds, so logicalRows pushes a header row ONLY
│                               when hunk.header is set); useChangeJump keeps `active`
│                               (index | null) in state — set by anchor() (the auto-jump),
│                               step() (→) and jump() (n/p); the state stores the `blocks`
│                               array it was set for and reads as null once a different
│                               list is rendered. NEVER reset it from a useEffect on
│                               `blocks` (owner screenshot 2026-10-13, "2 changes" instead
│                               of "1 of 2" on open): in the installed app the diff and
│                               its blocks land in the SAME commit as the auto-jump's
│                               layout effect, so a passive reset ran after anchor(0) and
│                               wiped it; the demo's two-commit load hid it in the e2e —
│                               and DiffPanel/FileHistoryPanel pass blocks[active] as
│                               DiffViewer `activeRows`: the row's GUTTER cell (inline) or
│                               the OLD-side gutter (split) and the wrapped rows get
│                               ACTIVE_CHANGE_CLASS (inset 3px primary bar, data-change-
│                               active) and ChangeNavButtons reads "2 of 7 changes"
│                               (data-change-count). n/p now go INDEX-BASED while the
│                               cursor is settled (same rule as →, settledCursor): the
│                               scroll-based jump skipped from change 1 to 3 in a short
│                               diff because the first blocks sit above the 35% line once
│                               scrollTop clamps to 0, which the counter made visible;
│                               after a manual scroll they fall back to position. VIEW
│                               OPTIONS STAYS OPEN (issue #67): every checkbox item carries
│                               onSelect keepOpen (preventDefault), the Graph display menu
│                               already did; Escape or a click outside closes it.
│                               SPLIT HUNK HEADERS stay in the LEFT half only (text +
│                               hunk button, right half an empty band): a full-width
│                               overlay version was built and REVERTED within the hour on
│                               2026-09-24 — the owner preferred the old look ("make it
│                               boring"). Leave it.
│                               BLANK BANDS (issue #42): the empty side of a split pair
│                               renders a placeholder row (data-diff-blank, data-diff-row,
│                               aria-hidden, text-transparent) holding ONE zero-width
│                               space in both the virtual path (VirtualSplitDiff) and the
│                               wrapped path (WrappedSplitHunk), so the caret has a
│                               position inside the gap and a downward drag no longer
│                               snaps back up to the nearest text; copy is built from row
│                               data (lineOf → null → skipped), so the anchor never
│                               reaches the clipboard.
│                               ROW PAIRING BY SIMILARITY (issue #62, 2026-10-08):
│                               core diff/linePairs.ts owns pairHunkLines (diffShared
│                               re-exports it): a change run (deletions then additions
│                               between context lines) pairs a deletion with the FIRST
│                               later addition whose unique-word Dice similarity is
│                               ≥ PAIR_SIMILARITY 0.6 (punctuation ignored, symbol-only
│                               lines compared as text), so an inserted line stays on
│                               its own row instead of stealing the next deletion; a run
│                               of exactly one deletion and one addition always shares a
│                               row; past PAIR_SCAN_CAP 4000 candidate pairs it falls
│                               back to the old positional zip. 0.4 was tried first and
│                               paired two unrelated `import … from` lines on the
│                               keywords alone. Split rows AND the inline word-diff
│                               counterpart map use the same pairs, and so does
│                               DiffMinimap's split-view row list (PR #63 by noyobo,
│                               2026-10-08: the minimap had its own positional zip, so
│                               its mixed/added/removed marks no longer matched the rows
│                               — taken from the PR together with the demo `load` hunk
│                               and its unit cases). The PR's own pairing was NOT taken:
│                               its tokenizer counted whitespace runs and punctuation,
│                               so `import { ROW_HEIGHT } from './constants'` scored
│                               0.74 against the unrelated useVirtualizer import and the
│                               demo's first hunk mispaired, verified on the branch with
│                               a probe test before closing it. Word-only tokens are
│                               what make the threshold mean anything. The demo
│                               CommitGraph.tsx diff has both shapes (a comment block
│                               inserted before a rewritten line, and the issue's
│                               `load` hunk) and the e2e asserts the row indices across
│                               data-diff-pane old/new for each.
│                               COPY LOCATION (issue #90, 2026-11-09): the line menu in
│                               DiffPanel and FileHistoryPanel adds "Copy path and line" (MapPin,
│                               faint basename preview, data-copy-location) after Copy line;
│                               core diff/location.ts lineLocation(file, line, side, column)
│                               picks the old number + oldPath for a deletion or the split old
│                               pane, else the new one; diff/lineLocation.ts menuLocation reads
│                               the caret under the pointer (caretRangeFromPoint, else
│                               caretPositionFromPoint), steps back one character when the
│                               pointer is over that character's right half, and counts the row
│                               text before it; columnAt drops the column past the text or past
│                               the 5,000-character render cap. Characters, not bytes (VS Code
│                               and Zed `-g` count characters). Only the no-wrap path has a line
│                               menu, as before. Verified in WebKit: columns 1, 7 and 21 for
│                               clicks on the right part of those characters.
│                               READABILITY PASS (owner 2026-11-08, users comparing with
│                               GitKraken found the app "hard to look at" and code review
│                               hard): changed ROWS use bg-diff-add-row / bg-diff-del-row =
│                               the diff colour at --diff-row-alpha (0.08 dark, 0.12 light;
│                               was a flat /15) so syntax colours show through, while the
│                               WORD highlight stays /40 and carries the change; Inline,
│                               Split, History and Blame carry TEXT LABELS while the header
│                               is full (DiffViewControls `labelled`, DiffPanel passes
│                               !compact; AllChangesView stays icon-only), icon-only in
│                               compact mode; the header path keeps the FILE NAME whole and
│                               truncates the folder from the front (rtl span + basename,
│                               title = full path) because the labels take its room. The
│                               mockup was approved as one before/after image first.
│                               HEADER FITS NARROW PANELS (UX audit 2026-09-24): the h-10
│                               header is `overflow-hidden whitespace-nowrap`, word diff /
│                               wrap / whole file / ignore whitespace live in ONE "View
│                               options" DropdownMenu of checkbox items, each with an ICON IN
│                               THE LEFT SLOT and the tick at the RIGHT END: the design-system
│                               DropdownMenuCheckboxItem takes an `icon` prop — with it the item
│                               lays out like DropdownMenuItem (px-2 gap-2, size-4 muted icon) and
│                               renders the ItemIndicator as a trailing text-primary Check;
│                               without it the old check-left pl-7 layout stays (Graph display
│                               menu). PR #48 put icons AFTER the check slot, which read as a
│                               double icon column next to the AI actions menu; a check + label
│                               version without icons was tried next and the owner asked for the
│                               icons back, aligned with the other menus (2026-09-30). The notes
│                               (large-file wrap, whitespace staging) render through DiffPanel's
│                               MenuNote — a bg-surface-raised row with an Info icon, the DialogNote
│                               motif — because a bare faint paragraph under a separator "looked
│                               bad" to the owner once the items carried icons (2026-09-30)
│                               (SlidersHorizontal trigger, tinted primary when any is on), and
│                               useCompactHeader (ResizeObserver on the
│                               header, COMPACT_HEADER_WIDTH 960, data-diff-header
│                               compact|full) hides the "n changes" text, sr-only's the "n
│                               of m" counter and drops the Stage/Unstage label (icon +
│                               Hint) — at 1100 px the counters used to wrap to two lines
│                               inside the fixed-height bar.
│                               SINGLE-FILE AI (owner request 2026-09-23, "this generation
│                               reviews by itself, AI help would be great"): the header
│                               ends its view-toggle group with a Sparkles icon button
│                               (aria "AI actions") opening a DropdownMenu — "Explain
│                               changes" / "Review changes" — for the file on screen:
│                               working copy (staged or unstaged) or a commit file;
│                               disabled with a Hint when the diff is binary/image/
│                               unchanged/empty, shows the Logo loop while a run is busy,
│                               tints text-primary when a result exists. The patch is
│                               core patchTextOf(loaded diff) — or a fresh compact fetch
│                               when whole-file view is on — and goes to
│                               aiCapabilities.explainFileChanges / reviewFileChanges
│                               (the review shares reviewPrompt with the staged review:
│                               same conventions, same .angkorgit/review.md read). The
│                               answer renders in diff/DiffAiStrip, a FLAT STRIP BETWEEN
│                               THE HEADER AND THE SCROLLER (bg-surface, border-b, h-8
│                               header row: icon + title, then Copy / Maximize2 full view /
│                               fold chevron (aria "Fold the …"/"Show the …", data-ai-folded;
│                               FOLDED the row shows the VERDICT as coloured dot + text, or
│                               an explanation's first sentence truncated — unfolded it
│                               shows neither, the body already has them) / X = dismiss, or
│                               Logo loop + useWaitMessage phrase + X = stop while busy;
│                               body data-ai-body max-h min(40vh, 22rem) scrolls inside;
│                               data-ai-result-panel busy|done). PLACEMENT HISTORY, one
│                               day (2026-09-23): a compact card strip + modal full view
│                               shipped first; the owner found the modal hard to review
│                               against the code, so a RESIZABLE SIDE PANE (PanelGroup
│                               diff|ai) replaced it; the owner then rejected the pane
│                               because it took width from the diff ("I don't like it")
│                               and delegated the choice — the strip keeps the diff at
│                               full width and the quoted-line jump lands in the code
│                               right below it. Do not bring the side pane back. The
│                               body is features/ai/AiReport over core parseAiReport
│                               (ai/report.ts: `**Label**` lines open sections, "- "
│                               bullets, a leading Bug|Risk|Nit becomes severity,
│                               continuation lines fold into the previous block, Verdict
│                               section → tone success/danger/attention by wording;
│                               unstructured text falls back to AiText) — labels as 10px
│                               uppercase overlines, Bug = danger Badge, Risk = primary,
│                               Nit = neutral, verdict = coloured dot + text;
│                               AiResultPanel (staged review card) and AiResultDialog
│                               render through AiReport too, and the dialog takes an
│                               optional `locate` (the strip's full view closes itself
│                               before jumping). JUMP TO LINE: every `code` span that core
│                               locateDiffLine(diff, snippet) finds (exact substring in an
│                               addition, then deletion, then context; then
│                               whitespace-squashed containment; snippets under 3 chars
│                               never match) renders as a dotted-underlined button;
│                               DiffPanel.locateSnippet puts a SearchRanges entry with
│                               current:true into `located` (merged as `search ?? located`
│                               into DiffViewer, so the row gets the search tint and
│                               data-search-mark="current") and calls
│                               diffSearch.scrollDiffToLine (extracted from useDiffFind:
│                               flattenDiff offsets in the virtual path, data-search-current
│                               scrollIntoView when wrapped, horizontal pan reveal), then
│                               clears it after LOCATE_HIGHLIGHT_MS 2500 or on diff change. State lives in workStore fileAi keyed
│                               fileAiKeyFor(repo, {path, oid|staged}) — ONE slot per file
│                               holding {kind, patchHash, text}, busy kind per key, run
│                               tokens for stop. LEAVING THE FILE CLEARS IT (owner 2026-09-23,
│                               after testing: "when change to somewhere the AI should be
│                               gone"): a DiffPanel effect keyed on aiKey stops the run and
│                               deletes the slot in its cleanup, so switching files ([ ]),
│                               closing the diff or switching repos dismisses the answer — a
│                               first version kept it per file across reopen and was
│                               REPLACED; the hash check still clears a working-copy result
│                               when the reloaded compact diff differs, and a result landing
│                               after the file changed mid-flight is dropped with a toast.
│                               CONTEXT FOR TRUST (same feedback: the review called code
│                               that moved to a new sibling file "removed"): core
│                               FileChangeContext {file, location working-copy staged|commit
│                               oid+summary (ipc.commitInfo at run time), otherFiles =
│                               DiffPanel's siblings} → fileChangeContextLines names where
│                               the file sits and lists up to 30 other changed files with
│                               "moved or removed, check <file>" wording. PROMPT SHAPES live
│                               in capabilities.ts: EXPLAIN_SHAPE (**What it does** /
│                               **Changes** / **Worth checking**) and REVIEW_SHAPE
│                               (**Summary** / **Findings** as Bug|Risk|Nit + quoted line +
│                               what is wrong + fix / **Verdict**), shared by the staged
│                               review and the commit explanation; SYSTEM allows ** ONLY for
│                               those labels and forbids line numbers (quote the line
│                               instead — checkable by the reader). TOKEN BUDGET: every
│                               provider defaulted to 1024 output tokens and Gemini 2.5
│                               spends its thinking inside maxOutputTokens, so answers
│                               stopped mid-sentence (owner screenshots 2026-09-23);
│                               LONG_ANSWER_TOKENS 4096 goes on explain/review/PR/summary,
│                               commit messages keep the default.
│                               Demo: the CLI provider answers via demoCliRun (e2e).
│                               LONG-LINE RULES live in G46 (5,000-char render cap, no ligatures,
│                               overscan 8, composited pan); SELECTION RULES in G47 (diffSelection.ts:
│                               the selection is tracked per row index + column and re-projected
│                               onto the mounted rows after every render; copy builds from diff
│                               data, so off-screen selected lines still copy).
│                               ALL FILES LAYOUT (owner request 2026-10-03, "list all the
│                               file changes like GitLab"): ui.diffLayout 'file' | 'all'
│                               (persisted) set by diff/DiffViewControls DiffLayoutToggle
│                               (aria "Show one file"/"Show all files", only for commit
│                               targets that are not `unchanged`); RepositoryPage renders
│                               diff/AllChangesView (keyed by oid) instead of DiffPanel when
│                               the layout is 'all' and centerDiff has an oid — the working
│                               copy keeps the single-file view (staging actions are per
│                               file). AllChangesView: ipc.commitFiles → one <section
│                               data-file-path> card per file with a STICKY h-9 header
│                               (collapse chevron, ChangeMark via the shared statusMeta now
│                               exported from components/ChangeMark, name + DirName, "from
│                               <old>" for renames, +/−, "Open in file view" = setDiffLayout
│                               ('file') + openCenterDiff); bodies load LAZILY — one
│                               IntersectionObserver (root = scroller, rootMargin 1200px)
│                               feeds a queue of at most 4 parallel ipc.commitFileDiff
│                               calls, a generation counter drops stale answers when
│                               ignore-whitespace / whole-file / oid change (G26); files over
│                               LARGE_FILE_LINES 1500 changed lines start collapsed with a
│                               "Show diff" row; an unloaded body is a spinner at an
│                               ESTIMATED height (changed lines × 20px, capped) and a
│                               ResizeObserver compensates scrollTop when a section ABOVE the
│                               viewport changes height (WebKit has no CSS scroll
│                               anchoring); target.path changes scroll that section to the
│                               top (layout effect), and USER scrolling (wheel/touch/pointer/
│                               key on the scroller — programmatic jumps never count, or a
│                               short last file would yank the highlight back) syncs the
│                               file at the top into centerDiff via openCenterDiff, with
│                               syncedFromScroll skipping the re-scroll, so the inspector
│                               highlight follows; [ / ] step files; header = "Changes" +
│                               oid + file count + totals, the layout toggle, the SHARED
│                               DiffViewControls (inline/split + View options, extracted
│                               from DiffPanel, same aria labels), Collapse/Expand all,
│                               "n of m". Bodies render DiffViewer `stacked`: never the
│                               virtualized path (one scroller holds many files), inline
│                               honours Wrap (no-wrap = min-w-max rows inside an
│                               overflow-x-auto body), side by side always wraps so both
│                               halves stay aligned (a MenuNote says so). No minimap, find
│                               or AI strip on this page — those stay per file. REVIEW
│                               FOLLOW-UPS (PR #60 review, 2026-10-07): the scroll-sync
│                               marker is READ AND CLEARED by the layout effect — the PR
│                               compared it without clearing, so once scrolling had reached
│                               a file, clicking that file in the inspector later did
│                               nothing (e2e `clicking a file in the inspector still jumps
│                               to it after scrolling reached it once`, verified to fail on
│                               the PR code); ← inside the page closes it and focuses the
│                               graph like DiffPanel's window-level arrowleft (same
│                               arrowKeysBelongHere gate, rootRef on the section); STASH
│                               TARGETS NEVER GET THE LAYOUT: CenterDiffTarget.stash is set
│                               by CommitDetails for stash files, DiffPanel hides the
│                               toggle and RepositoryPage keeps DiffPanel — the stash view
│                               is built on stashFiles + sourceOid and an untracked stash
│                               file's oid is the helper commit, so commitFiles on it would
│                               have listed the wrong set.
│                               DiffPanel (center view, header toggles, minimap, prev/next
│                               change; LIVE RELOAD: working-copy targets fold
│                               useRepo.statusVersion — bumped by every refresh/
│                               refreshStatus set — into statusSignature, so a watcher
│                               event after an editor save (or staging a second hunk,
│                               which leaves the status kinds unchanged) refetches the
│                               diff in place without a spinner or re-jump; the owner
│                               used to switch files and back to see the new content
│                               (2026-09-07) —,
│                               change, prev/next FILE across the source list — working-
│                               copy side or commit file set — via `[`/`]` + header
│                               arrows + "n of m", auto-close when file leaves working
│                               copy, prev/next CHANGE via `p`/`n` + header chevrons —
│                               jumpToChange / useChangeJump / ChangeNavButtons live in
│                               diff/changeNav.tsx and are SHARED with FileHistoryPanel
│                               (issue #44) —,
│                               AUTO-JUMPS to the first change when a new file
│                               target loads — keyed by path/oid/staged so view or
│                               whole-file toggles never re-jump; a History icon button
│                               after the whole-file toggle opens ui.openFileHistory for
│                               the file on screen, which swaps the center panel to
│                               FileHistoryPanel — the third way in, next to the
│                               working-copy row menu and the palette),
│                               DiffViewer (wrap vs VIRTUALIZED no-wrap), VirtualDiff
│                               (inline + synced split columns), DiffMinimap, diffShared
```
