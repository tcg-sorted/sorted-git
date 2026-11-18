# G20 — accounts are HTTPS-only; SSH remotes never consult them

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G20 — accounts are HTTPS-only; SSH remotes never consult them**:
  `accounts::host_of_url` parses only `://` URLs (scp-style `git@host:path` returns
  `None`) and the lookup lives inside the `USER_PASS_PLAINTEXT` branch, which the
  SSH transport does not offer. A user who adds a verified account and then pushes
  an SSH remote gets `class=Ssh; code=Auth` and no hint that the account was never
  involved. Keep the Accounts and SSH cards clearly separated in copy.
