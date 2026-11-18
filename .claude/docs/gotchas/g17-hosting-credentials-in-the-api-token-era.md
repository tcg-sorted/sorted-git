# G17 — hosting credentials in the API-token era

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G17 — hosting credentials in the API-token era**: Bitbucket Cloud removed app
  passwords 2026-07-28; the replacement is an Atlassian **API token with scopes**
  (`read:repository:bitbucket` + `write:repository:bitbucket` — write does NOT imply
  read). The identity differs per surface: **git over HTTPS wants the Bitbucket
  username** (case-sensitive) or the static `x-bitbucket-api-token-auth`, while the
  **REST API wants the Atlassian account email**. AccountsTab therefore asks for the
  email, verifies via Basic auth against `api.bitbucket.org/2.0/user`, and stores the
  `username` the API returns — never the email, which fails for git. Related traps:
  API tokens **expire** (app passwords never did), so accounts silently rot and
  nothing warns yet; `accounts::add` keys by host alone and `retain`s away any
  existing row, so adding a second account for the same host **deletes** the first
  (blocks work+personal on one host); the account is only offered on libgit2 attempt
  0, so a wrong username falls through to the credential helper and the account
  silently stops participating. Finally, HTTP **402 is not auth** — a free Bitbucket
  workspace over its 5-user limit turns private repos read-only while public repos
  still accept pushes, and the user count includes per-repo and group grants, not
  just the members list.
