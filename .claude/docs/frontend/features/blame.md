# Frontend feature: `features/blame/BlameView.tsx`

Source: `apps/desktop/src/features/blame/BlameView.tsx` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── blame/BlameView.tsx       ← the BLAME PANE of FileHistoryPanel (owner 2026-09-12, after a
│                               GitKraken screenshot: "should have the commit list as well"
│                               — a standalone BlamePanel was built first and FOLDED INTO file
│                               history the same day): props {file, rev, onOpenCommit,
│                               onBlameAt, onResolvedRev}; a useVirtualizer list of 22px rows
│                               with a w-72 gutter shown ONLY on the first line of each hunk
│                               (Avatar 16 + author + timeAgo + short hash as one role=button
│                               "Open commit <short>"; hunk boundaries carry a border-t), line
│                               number, highlightLine code; hovering tints every row of the
│                               same commit; right-click: Open commit / Blame at this commit /
│                               Blame before this commit (rev `<oid>^`) / Copy hash, disabled
│                               on the uncommitted hunk; the fetch is skipped when the rev
│                               equals the last RESOLVED rev (FileBlame.rev), and a rev that
│                               resolves elsewhere (`<oid>^`) reports back via onResolvedRev
│                               so the commit list highlights the real parent. Root carries
│                               data-blame-pane (e2e). ENTRY POINTS all call ui.openBlame(file,
│                               rev?) which opens FILE HISTORY with fileHistoryPreset
│                               {pane:'blame', rev} (consumed once by the panel's preset
│                               effect, pendingRev keeps the history load from re-selecting
│                               the newest commit): DiffPanel header UserRoundSearch button
│                               (blames the commit the diff shows, else the working copy),
│                               working copy file menu "Blame", commit file menu "Blame at this
│                               commit" (sourceOid ?? commit oid), palette "Blame…" through the
│                               shared file picker (mode commands | fileHistory | blame).
│                               Demo: demoBlame synthesises hunks over demoConflictContent
│                               with the last hunk uncommitted when rev is null
```
