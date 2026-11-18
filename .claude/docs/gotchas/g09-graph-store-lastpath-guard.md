# G9 — graph store lastPath guard

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G9 — graph store `lastPath` guard**: switching repos resets commits/filters/selection
  atomically; CommitGraph is keyed by repo.path to reset input drafts. Prevents one repo's
  history showing under another's header. Same class of bug hit the commit box (drafts
  leaked across repos) and the AI explanations (stuck to the previous commit/conflict):
  any state that is conceptually per-<something> must not outlive that something —
  commit drafts + amend live in `features/commit/draftStore.ts` keyed by repo.path
  (drafts persisted, amend transient single-active); ConflictResolver is keyed by
  file so its aiText dies with the selection. AI review and commit-explain results
  moved the other way BY DESIGN (owner request): they live in
  `features/ai/workStore.ts` keyed by repo path / repo+oid, so navigating away does
  NOT kill them — the keying is what prevents cross-contamination, not the
  component lifetime.
