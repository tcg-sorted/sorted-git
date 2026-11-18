# G1 — libgit2 pathspecs are fnmatch

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G1 — libgit2 pathspecs are fnmatch**: `"*"` matches everything, `"."` matches NOTHING
  (unlike git CLI). Caused the unstage-all bug.
