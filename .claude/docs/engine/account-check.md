# Engine: `account_check.rs`

Source: `apps/desktop/src-tauri/src/account_check.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
account_check.rs      ← re-verifies a stored account token against its provider (GitHub /user
                        + expiry header, Bitbucket 2.0/user via stored email; other providers
                        report unsupported); only 401 flips verified=false,
                        network errors never do; writes verifiedAt/expiresAt via update_check
```
