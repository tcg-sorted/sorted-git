# Frontend feature: `features/history/FileHistoryPanel`

Source: `apps/desktop/src/features/history/FileHistoryPanel` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── history/FileHistoryPanel  ← EMPTY STATES are SettingEmpty cards (icon tile + title +
│                               line: "No uncommitted changes", "Nothing changed in this
│                               commit", "Pick a commit") centred in the diff pane instead
│                               of a bare sentence (UX audit 2026-09-24);
│                               N / P PREV-NEXT CHANGE (issue #44, 2026-09-28): the diff
│                               pane folds changeBlocks over the loaded diff and calls
│                               useChangeJump + ChangeNavButtons from diff/changeNav.tsx,
│                               so the keys and the header chevrons + "n changes" count
│                               behave exactly as in DiffPanel (blocks are empty in the
│                               blame pane, so the keys are inert there); the scroller
│                               carries data-history-diff-scroller for the e2e;
│                               DIFF / BLAME pane toggle in the header (segmented pair,
│                               aria-pressed, aria-labels "Diff view"/"Blame view"; the
│                               inline/split/word/wrap/whole-file buttons show only in the
│                               diff pane) and a "WORKING COPY" row (data-working-copy-row,
│                               Pencil tile) pinned above the virtualized commit list —
│                               selected = WORKING_COPY sentinel: the diff pane shows
│                               ipc.diffFile(staged=false) or "No uncommitted changes to this
│                               file", the blame pane blames the file on disk with uncommitted
│                               lines marked; the diff effect is skipped while the blame pane
│                               is showing; openCommitOid(oid) mirrors openCommit(commit) for
│                               blame hunks;
│                               commit rows are role=button divs: click selects (diff on the
│                               right), DOUBLE-CLICK / hover GitCommitHorizontal button
│                               ("Open commit <short>") / right-click menu "Open commit with
│                               all its files" close the panel and call
│                               useGraph.revealCommit (issue #9: users wanted the whole
│                               commit, not just this file's hunk); the menu also copies
│                               the hash
```
