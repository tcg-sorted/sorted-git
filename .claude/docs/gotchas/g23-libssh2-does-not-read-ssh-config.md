# G23 — libssh2 does NOT read ~/.ssh/config

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G23 — libssh2 does NOT read `~/.ssh/config`**: `Host` aliases, `IdentityFile`,
  `Port`, `ProxyCommand` — none of it applies inside AngKorGit, only in the user's
  terminal. Verified: with `~/.ssh/config` mapping github.com to a working key and
  the agent off, auth FAILED; with the agent on holding the same key it succeeded.
  So the SSH agent is the multi-key/per-host path. Without the agent,
  `ssh_key_candidates` offers the configured key, the two defaults, then any other
  keypair discovered in `~/.ssh` (a file with a matching `.pub`), capped at
  `MAX_SSH_KEYS` = 5 because servers refuse after a handful of failed attempts.
