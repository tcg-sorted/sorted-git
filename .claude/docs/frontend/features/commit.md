# Frontend feature: `features/commit`

Source: `apps/desktop/src/features/commit` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── commit/                   ← COMMIT HOOKS (issue #82, 2026-10-28, G55): features/repository/
│                               useRepoHooks(path) (ipc.repoHooks, re-read on repo switch and every
│                               statusVersion; Toolbar and the palette use it for pre-push too)
│                               filtered to pre-commit/commit-msg; when it lists any, a
│                               "Skip hooks" checkbox (data-skip-hooks, ShieldOff, aria "Skip hooks")
│                               sits beside Amend in one mr-auto group — absent for repos without
│                               hooks, transient, cleared after each commit and on repo switch; the
│                               Commit button reads "Running hooks…" while it commits with hooks
│                               on. ipc.commit/amend take noVerify and return CommitOutcome {oid,
│                               hookWarning}; a warning replaces the success toast with a 12 s
│                               warning toast "<Committed|Commit amended> without running hooks".
│                               An error with code hook_failed goes to components/hookFailure
│                               reportHookFailure({repoPath, operation, error, retry}), a store of
│                               PENDING failures keyed by repo path; ONE HookFailureHost (mounted in
│                               App next to ConfirmHost, so it shows whatever the inspector holds)
│                               shared by commit, amend and every push path renders the current
│                               repo's one through components/HookFailedDialog
│                               (data-hook-failed=<operation>: "A hook stopped the
│                               commit|amend|push", the engine message + "Nothing was committed." /
│                               "Nothing was pushed.", the output in a data-hook-output pre with
│                               ANSI stripped by core cleanCliOutput, Copy output /
│                               <Commit|Amend|Push> without hooks = retry() / Close in
│                               a data-hook-actions footer — the Dialog's own X is ALSO named
│                               "Close", so an e2e locator must be scoped to that footer or it
│                               hits a strict-mode violation, which failed PR #84's first CI run);
│                               the draft is kept. A COMMIT BELONGS TO ITS REPOSITORY (PR #84
│                               review, P1): features/commit/commitWork.ts runCommit(CommitRequest
│                               {repoPath, message, amend}, noVerify, hooksPresent) uses repoPath
│                               for every call (profile, ipc, undo, draft, amend flag, AI review)
│                               and refreshes status + graph ONLY while that repo is still current
│                               — the first handler read the current tab, so A's hook failing after
│                               a switch opened the dialog in B and "Commit without hooks" committed
│                               B's draft unverified, and reloadGraph(A) pulled A's history under
│                               B. THE RUN LIVES OUTSIDE THE PANEL (PR #84 maintainer review): the
│                               inspector swaps WorkingCopyPanel for CommitDetails when a graph
│                               commit is selected, so panel state lost a failure that landed
│                               meanwhile and re-enabled Commit for a second hook run on the same
│                               index; useCommitWork (zustand, like ai/workStore) holds running
│                               {path → {hooks}} (single-flight per repo; the button label reads
│                               "Running hooks…" only when THAT run verifies, so a Commit without
│                               hooks retry no longer claims it) and skipHooks {path → bool}
│                               (cleared after a successful commit). A failure for a repo that is
│                               not on screen also toasts "Nothing was committed in <repo>" /
│                               "Nothing was pushed from <repo>" + "The hook output is waiting
│                               there." and its dialog shows on return;
│                               the dialog never renders in another repo and its retry re-runs
│                               the stored request. A successful commit clears the draft ONLY
│                               when it still equals the message that was sent, so text typed
│                               during a long hook survives. isCurrent() is checked again
│                               before EACH of refreshStatus and graph reload (PR #84 review,
│                               P2): a switch during the status await otherwise let reload(A)
│                               replace B's graph.
│                               SUBMODULE DRIFT ROW (2026-10-21, G53): an unstaged row whose
│                               FileStatus.submodule is set (checked-out commit ≠ recorded)
│                               carries data-submodule-drift, a two-line Hint (path + "Submodule
│                               checked out at <short>, this repository records <short>"), a
│                               ListRestart hover button "Update submodule <path>" IN PLACE OF
│                               the trash, and the row menu gains "Update submodule to <short>"
│                               while "Discard changes…" is hidden (discard = the same update);
│                               updateSubmodule → ipc.submoduleUpdate(path, file.path) (libgit2
│                               looks a submodule up by name OR path) → refreshStatus + toast
│                               "Checked out <short> in <path>". A submodule with only edited
│                               files has no `submodule` field and keeps the old "discard inside
│                               the submodule" message.
│                               FOLDER CHECKBOXES (issue #65 by chrismo80, 2026-10-13): in
│                               tree mode every folder row carries the checkbox its files
│                               have. components/FileTree takes `folderControl?(folder:
│                               TreeFolder<T>)`; with it FolderRow renders a div
│                               (data-tree-folder=<path>) holding a chevron BUTTON (aria
│                               "Collapse/Expand <name>", -mr-1 so the control lands on
│                               the file rows' checkbox column: 8 + depth×14 + 12 + 6 − 4
│                               = treeIndent's +14), the control, and a second button for
│                               icon + name + count — a Radix Checkbox is itself a button,
│                               so the old single-button row could not host it; without the
│                               prop the row is unchanged (CommitDetails). exported
│                               folderFiles(folder) walks the files recursively.
│                               WorkingCopyPanel: Changes folders are unticked and stage
│                               every non-conflicted file inside (stageMany, ONE engine
│                               call via PR #71's stage_files), Staged folders are ticked
│                               and unstage all, All files folders are indeterminate when
│                               the folder holds both staged and unstaged changes and tick
│                               stages the rest; a folder with no stageable change gets no
│                               control. aria "Stage every change in <path>" /
│                               "Unstage every change in <path>", data-folder-checkbox.
│                               CHANGE MARKS (owner 2026-09-24, "the M/A badges feel off"):
│                               components/ChangeMark is a size-4 rounded-[4px] tinted
│                               square (bg-<tone>/15 + coloured 10px mono letter, title =
│                               the word) used by WorkingCopyPanel.statusBadge, the
│                               conflict rows and CommitDetails' file rows — the round
│                               Badge pill was too heavy repeated fifteen times; the
│                               plain-row File icon slot shrank with it (w-4 in both
│                               panels). The row's full-path Hint stays side="left"
│                               (max-w 34rem, mono) — DO NOT MOVE IT: on 2026-09-24 a
│                               side="bottom" version covered the next row's text and a
│                               chip-over-the-row version (negative sideOffset, trigger-
│                               width cap, pointer-events-none) was rejected on sight
│                               ("looks really bad"); the owner never minded the left
│                               placement. Hint kept the align/sideOffset/alignOffset
│                               props it grew for that attempt. A commit box that FOLDED to its summary line while
│                               nothing was staged and opened on focus was built and
│                               REJECTED the same day ("I don't like the click then expand");
│                               the box is always the full two-field group. The STAGED
│                               header carries `border-t border-border-subtle pt-3`
│                               (data-staged-header) — the owner asked for a divider
│                               between the Changes list and Staged — and an empty Staged
│                               section renders components/EmptyCard (the dashed
│                               icon-tile card that used to be Sidebar's private
│                               SidebarEmpty, now shared: data-empty-card) titled "Nothing
│                               staged" — a bare grey sentence read as boring. Review is
│                               disabled with "Stage some changes to review them with AI"
│                               whenever Commit would be, the description placeholder is
│                               "What changed and why" and the Commit button's Hint
│                               carries ⌘⏎. CLEAN TREE = ONE CARD (owner screenshot
│                               2026-09-24: two zero-count headers, a divider, a "tick a
│                               file above" card with no files above and an "Amend last
│                               commit…" link floating at the bottom "looks weird"):
│                               cleanTree (status loaded, no files, no conflicts, no
│                               filter) renders a single EmptyCard tone="success" (Check
│                               tile, "Working tree clean", "Nothing to commit. Edits you
│                               make show up here.") with the Amend button INSIDE the card
│                               as its action; the Changes/Staged headers, the Staged
│                               divider, the empty-Staged card and the bottom bar are all
│                               skipped in that state — the panel is the card and nothing
│                               else. ROW RHYTHM: both virtualized lists use ONE
│                               FILE_ROW_HEIGHT (32) — Changes used 36 and Staged 30, so the
│                               two lists had visibly different spacing (owner 2026-09-24).
│                               WorkingCopyPanel + draftStore (PER-REPO commit drafts,
│                               persisted; amend transient); MULTI-SELECT (owner request
│                               2026-09-07, same gestures as the graph): shift-click
│                               selects a range from ui.selectedFile within ONE side
│                               (Changes or Staged — never across), ⌘/ctrl-click toggles,
│                               plain click clears and opens the diff; state is a local
│                               `multi {staged, paths}` (cleared on repo switch, pruned
│                               when files leave the status, Escape clears), rows in it
│                               render as selected; the SINGLE-FILE MENU keeps both
│                               destructive entries — Discard changes… and Delete file… —
│                               together at the END behind one separator (UX audit
│                               2026-09-24: a red item mid-list and another at the bottom
│                               read as scattered); right-clicking a selected row shows
│                               the BULK menu — Stage/Unstage n, Stash n… (StashPreset),
│                               Discard n… (unstaged side, one confirm, leftovers toasted
│                               like discardAll) — instead of the single-file menu —
│                               the draft is ONE string;
│                               the box renders it as two fields via core
│                               splitCommitMessage/joinCommitMessage (summary = first
│                               line, body = rest after an optional blank line; join
│                               always writes summary + blank line + body and folds
│                               newlines out of the summary) inside a single bordered
│                               group with focus-within ring: summary `<input>`
│                               text-sm font-medium (Enter → focus description),
│                               description Textarea text-xs (Backspace on empty →
│                               back to summary), 50/72 counter on the summary row,
│                               AI sparkle on the summary row; commit is disabled on an
│                               EMPTY SUMMARY, not an empty message (git would promote
│                               the body's first line otherwise); the box is RESIZABLE
│                               from its top edge (a 2px-high handle over the border-t,
│                               cursor-row-resize, gold bar on hover/drag) — drag sets
│                               ui.commitBoxHeight (persisted, 72–600px) which replaces
│                               the auto-grow (72–260px) until a double-click on the
│                               handle resets it to null; the height is applied BOTH in
│                               the [body, commitBoxHeight] effect AND in a callback ref
│                               (attachMessageBox) because the box unmounts while a repo
│                               loads (status null → spinner) and remounts with identical
│                               deps, so an effect alone left it at the default after a
│                               tab switch (owner bug report 2026-09-05) —
│                               staged/changes lists (VIRTUALIZED flat lists: two
│                               useVirtualizer instances sharing one scroll container
│                               via measured scrollMargin; tree mode unvirtualized),
│                               stage/unstage/discard(+all) on BOTH lists — staged rows
│                               get the hover Trash button (onDiscard → requestDiscard(file,
│                               true) → ipc.discardStagedFile), the single and bulk menus a
│                               "Discard changes…" entry; the confirm copy says the file
│                               goes back to the last commit, index included. SECTION
│                               HEADERS carry ONE primary text button (Stage all / Unstage
│                               all) plus a Trash2 icon-sm "Discard all (staged) changes"
│                               that is text-muted and turns danger on hover, confirm before
│                               acting — two red "Discard all" TEXT buttons were built first
│                               and rejected as loud, then a "…" overflow menu was built
│                               and rejected as hiding the action (owner, 2026-09-07): the
│                               agreed shape is a quiet icon, never red text, never hidden,
│                               auto-grow commit box (hidden when clean; amend link),
│                               50/72 summary counter, AI message button, AI review
│                               button (reviewStagedChanges on the staged patch →
│                               dismissible panel above the commit box, expandable
│                               into a large centered dialog with copy via the
│                               Maximize2 header button; both render through
│                               features/ai/AiText.tsx over core parseAiTextSegments,
│                               which formats **bold** and `code` spans from provider
│                               output — strict full-token match only, so stray
│                               markers stay literal; result
│                               keyed to repo path + buildStagedReviewSignature (core:
│                               staged paths + staged/unstaged status kinds, JSON-
│                               escaped per entry) per G9 — editing an already-staged
│                               file invalidates it, hunk-level restaging that leaves
│                               status kinds unchanged is caught by an async backstop
│                               (review stores hashText(patch); on status refresh
│                               while current, stagedPatch is re-hashed and a
│                               mismatch clears it); clears on commit or staged-set
│                               change but SURVIVES repo switches while still valid
│                               (single slot: a review finished in repo B replaces
│                               repo A's); a result arriving after the staged set
│                               changed mid-flight is dropped with an info toast;
│                               while waiting, the panel shows the brand Logo drawing
│                               itself on a 2.6s loop (Logo animated="loop"; the
│                               logo-draw-loop class renders it static under
│                               reduce-motion) + rotating status phrases (6s cycle)
│                               and a Stop button
│                               (run token in workStore: discards the in-flight
│                               result, frees the UI — the provider request itself
│                               is not aborted); review state + busy + run tokens
│                               live in features/ai/workStore.ts keyed per repo
│                               path, NOT component state — the panel unmounts when
│                               a commit is selected (Inspector swap), so reviews
│                               keep running in the background and reappear (result
│                               or loading state) when the user returns;
│                               .angkorgit/review.md read errors other than
│                               not_found warn and continue without project rules
│                               (error.rs maps io NotFound → code "not_found");
│                               every AI action is stoppable while it runs — the
│                               review panel X, the message sparkle button (hint
│                               flips to "Stop generating", local aiRunRef token),
│                               commit-explain ("Stop explaining", explainRuns token
│                               in workStore) and the conflict overlay X — stopping
│                               discards the in-flight result, never aborts the
│                               provider request; review is disabled while
│                               committing, but commit never waits on a review);
│                               conflicted files live in a CONFLICTS section INSIDE the
│                               list scroller above Changes (same header style as
│                               Changes/Staged but text-danger, a Resolve ghost button
│                               opening the first file, a one-line hint naming the
│                               merge/rebase, rows with a `!` Badge + name-first path +
│                               hover "Resolve") and are FILTERED OUT of unstagedFiles so
│                               they never appear twice (the owner saw the banner AND red
│                               rows in Changes and called it messy); during a
│                               merge the commit box stays visible even with a clean
│                               status and shows "Abort merge" beside Commit — both it
│                               and the toolbar state badge call the SHARED
│                               repository/merge.ts abortMergeFlow (confirm →
│                               mergeAbort → clear merge draft → refresh; refresh
│                               failures toast separately, never as "Abort failed")
```
