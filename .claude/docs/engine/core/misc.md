# Engine core: `core/misc.rs`

Source: `apps/desktop/src-tauri/src/core/misc.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── misc.rs           ← stash (list/create/apply/pop/drop), tags; stash_create
│                       takes `paths`: empty → libgit2 stash_save2, non-empty → stash_paths
│                       BUILDS THE STASH IN MEMORY (see G37): three git2::Index objects
│                       seeded from the HEAD tree — index tree gets the real index entry of
│                       each selected path, worktree tree gets a fresh blob of the file
│                       (workdir_entry: mode from the exec bit, symlinks as 120000),
│                       untracked tree collects selected WT_NEW files — committed as
│                       git's exact shapes ("index on …", "untracked files on …", "WIP on
│                       <branch>: <short> <summary>" or "On <branch>: <msg>"), refs/stash
│                       updated + reflog appended by hand when libgit2 did not log it,
│                       then ONLY the selected paths are reset (checkout_tree HEAD with a
│                       path filter, or index.remove_path + delete for paths new to HEAD).
│                       stash_apply/stash_pop fall back to `git stash apply|pop stash@{n}`
│                       when libgit2 refuses with "uncommitted changes exist in the index"
│                       — libgit2 demands a clean index, git does not, and stashing one
│                       file while others are staged makes that the normal case;
│                       stash_files(index) = diff::files_of_commit on the stash commit
│                       (tracked) + every blob of the THIRD parent's tree when its
│                       message starts "untracked files on " (status "new",
│                       source_oid = that parent so the diff opens as an addition);
│                       stash_restore_files(index, paths) writes each blob from the
│                       stash tree (or the untracked tree) straight into the workdir —
│                       never the index, never `stash apply` — deletes a file the
│                       stash had deleted, errors on a path not in the stash, and
│                       leaves the stash in place; CommitFileInfo.source_oid is
│                       skip_serializing_if None so plain commits are unchanged
```
