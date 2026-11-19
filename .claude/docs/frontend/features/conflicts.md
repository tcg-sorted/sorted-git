# Frontend feature: `features/conflicts/ConflictResolver`

Source: `apps/desktop/src/features/conflicts/ConflictResolver` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── conflicts/ConflictResolver← 2026-09-10 REWORK (users found it hard to use): ONE row
│                               renderer per pane (renderPaneRow / renderOutputRow) shared
│                               by the virtualized and plain paths — the plain path maps the
│                               same PaneRow/OutputRow models, so A/B stay aligned when a line
│                               wraps; picks are NORMALIZED (normalizePicks: current before
│                               incoming, by line) so the result follows FILE order, never
│                               click order; the middle-line side checkbox is TRI-STATE
│                               ('indeterminate' while only some lines of that side are
│                               picked); block headers carry a "resolved"/"edited by hand"
│                               tag and the first unresolved preview row a "Conflict n ·
│                               unresolved" tag; the panes/result split is a vertical
│                               react-resizable-panels group (autoSaveId angkorgit-conflict);
│                               KEYBOARD on the overlay div (onKeyDown, skipped inside
│                               inputs): ↑/↓ jump, A/B toggle a whole side of the active
│                               conflict, ⌘⏎ save, Escape dismisses the AI overlay first,
│                               then requestClose; ⌘⏎/⌘Z are stopPropagation'd so the commit
│                               box and repo undo under the overlay never fire (⌘Z keeps
│                               native text undo inside textareas — no preventDefault);
│                               RepositoryPage's global Escape RETURNS while conflictFile is
│                               set so the overlay's confirm is the only close path; LEAVE
│                               GUARD confirmLeave (any pick/edit/manual text) before close
│                               and file switch, discardManual confirms before dropping the
│                               whole-file textarea; FILE FLOW: header "File n of m" ‹ ›
│                               switcher over useRepo.conflicts when >1, save() opens the
│                               next conflicted file (after the current one, wrapping) with a
│                               "n more files to resolve" toast, or closes with finishHint
│                               (commit / continue rebase / cherry-pick) on the last one;
│                               sideHint tooltips on the current/incoming captions explain
│                               the sides per RepoState (rebase swaps them); LineNo width is a
│                               --gutter CSS var sized from the last line number (data-line-no
│                               is the e2e hook). The DEMO has TWO conflicted files
│                               (drawGraph.ts 1 conflict, laneColors.ts 3 incl. an empty
│                               incoming side) in a mutable DEMO_CONFLICT_FILES map that
│                               resolveDemoConflict drains, so the next-file flow is testable.
│                               ORIGINAL DESIGN NOTES (still true): a SOLID full-window surface (bg-background, no blur or
│                               alpha — the owner found the translucent overlay wrong for
│                               editor-like work); header = danger GitMerge tile + "RESOLVE CONFLICTS" overline +
│                               basename bold / dirname dimmed (name-wins rule) + a
│                               progress bar (primary → success when complete) + "n of m
│                               resolved"; A/B pane headers carry a 2px top edge in
│                               info/success and a "current"/"incoming" overline; each
│                               block header shows a `#n` chip (position in
│                               conflictIndices); non-active block borders are
│                               border-subtle so the active primary ring is the only
│                               strong edge; the bottom pane label reads "Result"
│                               (owner: UI looked rough, behaviour unchanged); LINE
│                               NUMBERS (owner request, "like a real merge tool"):
│                               buildPaneRows returns lineStart: Map<block, {a, b}> —
│                               text blocks advance both counters, conflict blocks advance
│                               a by current.length and b by incoming.length — and text
│                               rows carry `li`; the Result pane numbers come from
│                               outputStarts (Map<block, first line>, recomputed from
│                               picks/blockEdits/editingBlock/editDraft: text = lines,
│                               edit = its line count or 0, unresolved = preview length,
│                               picks = kept lines) and are baked into OutputRow.lineNo
│                               for the virtualized path and computed inline for the
│                               plain path; the LineNo gutter is a w-9 tabular-nums span
│                               and renders EMPTY for deleted-section rows and for the
│                               shorter side of a conflict block; row order in A/B is
│                               CHECKBOX → LineNo → code (owner preference), and plain text
│                               rows carry a w-4 spacer where the checkbox would be so code
│                               columns stay aligned; the "Conflict n of m" ↑/↓ nav lives
│                               IN the Result header (a bordered pill after the label) —
│                               the old floating pill on the divider covered the panes'
│                               last line, and the top scroller has pb-6 so its last row
│                               can always scroll fully into view;
│                               COLOR DISCIPLINE (owner: "looks like a kid made it" when
│                               everything was tinted): side cells carry a 2px left edge
│                               in info/success and NO full tint; only picked lines tint
│                               (/10); block header bg surface-raised/40 with "CONFLICT n"
│                               caption + muted "Take all from A/B" labels + the AI button
│                               as a plain icon-sm at the row's right (pr-8 reserves the
│                               space); Result rows mark A/B with a slim 0.5×2.5 colored
│                               bar in the w-4 gutter slot instead of bold letters and tint
│                               at /5 — add color only where it carries meaning;
│                               aligned A/B panes; PICK CONTROLS (owner design): per side
│                               of a block exactly ONE Checkbox, rendered on the MIDDLE
│                               line (floor((n-1)/2)) of that side by renderLineControl —
│                               it toggles the whole side (toggleBlockSide, aria-label
│                               "Take all lines from A/B for this conflict" — e2e relies
│                               on it) and stopPropagation()s so the row click does not
│                               also toggle the line; every other line shows a hover
│                               `Plus` button (group/line) that becomes a colored `Check`
│                               once picked, and clicking the row itself toggles the line
│                               (toggleLine); the whole-side checkbox in the PANE HEADER
│                               remains; the old take-all header row is REMOVED — the
│                               block header (PaneRow kind 'header' in virtualized mode) is
│                               just the "CONFLICT n" caption and carries the AI explain
│                               button; the explanation opens
│                               in a floating bottom-right overlay with a busy state,
│                               never inline at the pane bottom), prev/next nav as a
│                               "Conflict n of m" control in the Result header
│                               (scrolls BOTH panes, visible from 1 conflict up),
│                               auto-jump to the first conflict on open, clean Output
│                               pane (A/B tags, no markers) that auto-scrolls to the
│                               block just resolved (lastTouched state → effect);
│                               unresolved blocks render as DIMMED PREVIEW rows behind
│                               a red stripe (unresolvedPreview: base if diff3 else
│                               side A), all-EMPTY_SIDE picks and empty edits render a
│                               "(section deleted)" row (never zero rows — blockRow
│                               must stay clickable/scroll-targetable); PER-BLOCK hand
│                               editing in the Output (blockEdits map: mousedown+
│                               preventDefault on any block — resolved prefills picks,
│                               unresolved prefills A+B lines — opens its inline
│                               editor and scrolls the top panes there — the editor is
│                               SEAMLESS (owner: no "message box"): a flex row of a live
│                               gutter column (LineNo per draft line + a slim primary bar
│                               in the w-4 slot) and a borderless, transparent,
│                               overflow-hidden textarea with rows = draft line count, so
│                               it is indistinguishable from the rows around it; every
│                               result row carries data-line (offset within its block) and
│                               lineFromEvent(e) feeds startEdit(index, caretLine) so the
│                               ref callback places the caret on the clicked line via
│                               setSelectionRange after focusing; preventDefault
│                               is LOAD-BEARING: the browser's post-mousedown focus
│                               default would blur+close the just-focused textarea;
│                               NO pencil edit buttons, hover RotateCcw discards; the
│                               editor is LIVE — write-through on change, no Save
│                               button, blur/⌘Enter keeps, Esc REVERTS via
│                               editSessionRef {block,before,focused} which also
│                               focuses once per session so virtualizer remounts
│                               don't scroll-jack; disk write only on Mark resolved;
│                               edits count as resolved, save re-adds \r per block on
│                               CRLF files (blockUsesCrlf/editSaveLines — textareas
│                               normalize CRLF→LF), marker guard is line-anchored
│                               MARKER_LINE not substring, ONE atomic guardEdits
│                               confirm replaces manual+block edits so cancel never
│                               half-applies) + whole-file editing
│                               behind the header pencil (manual-edit guard, marker
│                               guard); files over VIRTUAL_THRESHOLD (1500) paired rows
│                               render virtualized (paired-row flatten keeps A/B
│                               aligned, scrollToIndex nav, editor row measured),
│                               smaller files keep the plain path
```
