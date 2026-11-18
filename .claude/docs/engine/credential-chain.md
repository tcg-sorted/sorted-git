# Engine: credential chain

From §5 Rust engine. See also `engine/core/remote.md`, `engine/core/accounts.md` and gotchas G17–G23, G29. [Back to the index](../../../CLAUDE.md)

**Credential chain** (remote.rs `make_callbacks`, in order):
1. App **accounts** matched by remote host (accounts::candidates — a token is only offered
   to its own host, and accounts::host_of_url only matches https:// remotes, so a plain
   http remote never receives an account token): the repo's profile-bound account first (angkorgit.accounts repo config, read
   into a thread_local by prime_account_bindings at each fetch/push/push_tag/clone entry —
   see G29), then the host default, then remaining accounts — one per retry, each offered once
2. SSH agent → `~/.ssh/id_ed25519`/`id_rsa` key files
3. `git credential fill` subprocess (real keychain/manager, GIT_TERMINAL_PROMPT=0)
4. libgit2 credential_helper → default. Retry-guarded (>6 attempts → descriptive error);
   when an offered account was refused the give-up error names it, suggests token expiry,
   and marks it unverified.
