# Engine core: `core/history.rs`

Source: `apps/desktop/src-tauri/src/core/history.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── history.rs        ← revwalk pagination + search/author/branch filters (list still
│                       supports them for the engine tests; the UI no longer filters by
│                       text or author), ref decorations; open_walk(repo, branch) builds
│                       the ONE walk list/position/search share;
│                       search(HistorySearchQuery{search, author?, branch?}) →
│                       HistorySearch{matches: [{index, oid}], truncated} = positions in
│                       the displayed walk of commits matching the text (summary+body+oid)
│                       AND the author (name+email) when given — either alone works, both
│                       blank → no matches —, cap SEARCH_MATCH_CAP 1000; the frontend's
│                       find-in-graph (2026-09-10) is built on it;
│                       STASHES ON THE GRAPH (owner request 2026-09-07): the unfiltered
│                       walk and `position` push every refs/stash reflog entry
│                       (push_stashes) and SKIP its helper parents — the "index on …" ^2
│                       and "untracked files on …" ^3 commits — while iterating (never
│                       `walk.hide`: hide marks ALL ancestors uninteresting and would
│                       erase the base commit's history); stash commits are decorated
│                       kind "stash", name `stash@{n}` (n = reflog position), shorthand
│                       = the stash message, and their `parents` is truncated to the
│                       first so the layout never waits for a lane that will not come;
│                       a branch-filtered walk carries no stashes;
│                       unpushed(path) → oids reachable from HEAD but from NO refs/remotes/*
│                       ref (hide_glob, cap 1000) — the frontend's "may I rewrite this?" set,
│                       loaded by useRepo.refresh as `unpushed`; the rule is "on any remote",
│                       not "ahead of upstream", so a commit pushed to a second remote counts
│                       as published too
```
