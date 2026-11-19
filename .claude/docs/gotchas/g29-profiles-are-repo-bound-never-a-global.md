# G29 — profiles are REPO-BOUND, never a global mode switch

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G29 — profiles are REPO-BOUND, never a global mode switch**: a profile
  (identity + per-host account picks) is assigned to a repo once and stored in
  that repo's local config (`angkorgit.profile` = id, `angkorgit.accounts` =
  `host=username,...`) — deliberately NOT GitKraken's global active-profile
  model (G6), so "forgot to switch profiles" cannot happen. The credential
  callback has no repo context (G19: `make_callbacks()` takes no params), so
  each remote op (fetch/push/push_tag; clone clears) calls
  `prime_account_bindings(&repo)` which parses `angkorgit.accounts` into a
  **thread_local** — safe because libgit2 invokes the credentials callback on
  the same spawn_blocking thread as the operation; a process-global here would
  race concurrent ops on different repos. Related invariants: accounts are
  keyed (host, username) with keyring entries `acct:<host>:<username>` — the
  legacy bare-host entry migrates on first read ONLY when a single account owns
  that host (ambiguous = skip, never guess a token's owner); every host keeps
  exactly ONE `isDefault` (ensure_defaults runs on every load/save);
  `ensureRepoProfile` runs before commit and push — assigned repo → no-op,
  exactly one profile → silent stamp (existing single-profile users never see
  the dialog), two+ → ask once, cancel → proceed unassigned without blocking
  the action. The SILENT stamp never clobbers a manual identity: if the repo's
  effective user.email differs from the global one (a deliberate repo-local
  override set outside AngKorGit), applyProfileToRepo runs with
  preserveIdentity and writes only the profile id + account bindings. account_check flips `verified` on 401 ONLY — network errors and
  odd statuses never mark an account broken (offline must not rot accounts);
  Bitbucket re-checks need the stored Atlassian `email` (G17) and are skipped
  without it.
