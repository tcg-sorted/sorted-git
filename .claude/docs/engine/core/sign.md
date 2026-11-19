# Engine core: `core/sign.rs`

Source: `apps/desktop/src-tauri/src/core/sign.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── sign.rs           ← config-driven commit signing, zero in-app setup: reads
│                       commit.gpgSign/gpg.format/user.signingKey/gpg.program/
│                       gpg.ssh.program from git config (ssh → `ssh-keygen -Y sign
│                       -n git`, openpgp → `gpg -bsau`, x509 refused; literal
│                       "ssh-…"/"key::" signingKeys written to a temp .pub, ~
│                       expanded); create_commit is the signed-or-plain commit
│                       chokepoint (commit_create_buffer → external signer →
│                       commit_signed → manual HEAD update) used by commit, amend
│                       and merge — rebase/cherry-pick/revert stay unsigned on
│                       purpose (mirrors rebase.gpgSign default; see G33); 60s
│                       kill-on-timeout via ai_cli::capture, failures BLOCK the
│                       commit with errors naming the cause (ssh-agent for
│                       passphrases, graphical pinentry for gpg)
```
