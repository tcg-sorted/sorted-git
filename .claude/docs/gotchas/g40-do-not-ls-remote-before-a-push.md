# G40 — do not ls-remote before a push to detect "nothing to send"

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G40 — do not ls-remote before a push to detect "nothing to send"**: two
  traps killed that approach for issue #17. (1) git2 0.20's `Remote::list()`
  builds a slice from the raw pointer libgit2 returns, which is NULL for a
  remote with zero refs (the first push to an empty bare repo) — debug builds
  abort with a `from_raw_parts` precondition panic inside the test, release
  builds run undefined behaviour; git2 0.21 adds the null check but also drops
  the default `ssh`/`https`/`cred` features, so the bump is its own change.
  (2) `RemoteConnection::default_branch()` is no guard: neither libgit2's local
  transport nor git's receive-pack advertises HEAD in the PUSH direction, so it
  returns not-found for every non-empty remote too. `remote::push` therefore
  compares against the remote-tracking ref offline (`tracking_ref_matches`);
  if a real advertisement check is ever wanted, connect with
  `Direction::Fetch` for the listing and only after the git2 bump.
