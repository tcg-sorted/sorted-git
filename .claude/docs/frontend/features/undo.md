# Frontend feature: `features/history/undoStore.ts`

Source: `apps/desktop/src/features/history/undoStore.ts` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── history/undoStore.ts      ← undo/redo: tracked() records before/after HEAD snapshots;
│                               kinds commit/checkout/merge/cherryPick/rebase/reset/revert/
│                               branchCreate/Delete/Rename; validation guards (repo moved,
│                               dirty tree for hard kinds)
```
