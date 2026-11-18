# G33 — libgit2 never signs, and empty-string git config must read as unset

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G33 — libgit2 never signs, and empty-string git config must read as unset**:
  git2's `repo.commit()` ignores `commit.gpgSign` completely (it also never reads
  `gpg.format`/`user.signingKey`), so every signable commit goes through
  `sign::create_commit`. Traps found building it: (1) `commit_signed` does NOT
  move any ref — the caller updates HEAD itself, resolving the symbolic target
  first (force-update the branch; unborn HEAD → create the ref; detached →
  `set_head_detached`). Never `repo.reference("HEAD", …)` — that overwrites HEAD
  with a direct ref and detaches the user. (2) Real global gitconfigs carry
  empty-string values (`gpg.format =`, `gpg.ssh.program =`); git CLI itself
  fatals on the empty `gpg.format` during `verify-commit` (integration tests
  isolate with `GIT_CONFIG_GLOBAL=/dev/null`), so `signing_config` filters empty
  strings to defaults instead of erroring. (3) Amend keeps the unsigned path
  byte-identical (`commit.amend`, original committer preserved) and only
  hand-builds the commit when signing is on — the signed amend passes the
  ORIGINAL author and committer to match. (4) A signing failure returns an error
  BEFORE anything moves — index and HEAD stay untouched, matching git CLI's
  block-the-commit behavior; never fall back to committing unsigned.
