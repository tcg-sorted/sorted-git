# Engine core: `core/accounts.rs`

Source: `apps/desktop/src-tauri/src/core/accounts.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── accounts.rs       ← app-managed hosting accounts, MULTIPLE per host keyed by
│                       (host, username): tokens in OS keyring (service "AngKorGit";
│                       LINUX uses keyring's `sync-secret-service` + `crypto-rust`
│                       — Freedesktop Secret Service via libdbus, so GNOME Keyring /
│                       KWallet — NOT `linux-native`: that is the kernel keyutils
│                       keyring, which is per-session and lost tokens while
│                       accounts.json still said verified (issue #7); Linux builds
│                       and CI apt lists therefore need libdbus-1-dev),
│                       entry "acct:<host>:<username>"; legacy bare-host entries
│                       migrate on first read, only when the owner is unambiguous),
│                       metadata accounts.json (host/username/provider/verified +
│                       email/verifiedAt/expiresAt/isDefault, all serde-default so
│                       older files still parse); exactly one default per host
│                       (ensure_defaults), candidates(host, preferred) for auth
│                       ordering, update_check/mark_unverified for health. Pure
│                       list-manipulation helpers (upsert/ordered_for_host) are
│                       module-tested without keyring (see G29); a token is only
│                       offered to its own host, and host_of_url only matches
│                       https:// remotes, so a plain http remote never receives an
│                       account token; stored gitlab/gitlab-self accounts are
│                       dropped when accounts.json loads (GitLab was removed)
```
