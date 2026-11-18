# Engine: `forge.rs`

Source: `apps/desktop/src-tauri/src/forge.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
forge.rs              ← forge API proxy: forge_request(repoPath, host, request) looks up the
                        connected account for the remote host (repo-bound account first via
                        angkorgit.accounts, then host default; missing_account_message tells
                        "token missing from the system keychain — reconnect" (metadata
                        exists, accounts::has_account) apart from "no connected account",
                        issue #7), injects the auth header per
                        provider (github Bearer + api-version, gitlab PRIVATE-TOKEN,
                        bitbucket Basic email:token) and forwards via http.rs; the URL host
                        must equal the remote host or its api. subdomain (dot-anchored, so
                        evilgithub.com never matches) — tokens never reach the webview;
                        6 module tests
```
