# G19 — credential preferences reach the engine through a process-global

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G19 — credential preferences reach the engine through a process-global**, not
  through command arguments: `make_callbacks()` takes no parameters, so `App.tsx`
  pushes `{sshKeyPath, sshUseAgent, useCredentialHelper}` via
  `ipc.setCredentialPrefs` → `commands::credential_prefs_set` →
  `remote::set_credential_prefs` (an `OnceLock<RwLock<CredentialPrefs>>`), mirroring
  `accounts::CONFIG_DIR`. Any new credential setting goes in that struct. The SSH
  branch is **attempt-aware**: attempt 0 tries the agent (when enabled), later
  attempts walk `ssh_key_candidates()` one key per retry — without that, a
  present-but-useless agent credential is re-offered forever and the configured key
  is never reached; the candidate index shifts by one when the agent is disabled.
  `Cred::ssh_key` passes `None` for the passphrase, so **passphrase-protected keys
  only work via the agent**. `ssh_key_generate` shells out to `ssh-keygen -t ed25519
  -N ""` and REFUSES to overwrite an existing file — never relax that.
