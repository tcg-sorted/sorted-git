# Engine: `forge.rs`

Source: `apps/desktop/src-tauri/src/forge.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
forge.rs              ← forge API proxy: forge_request(repoPath, host, request) looks up the
                        connected account for the remote host (repo-bound account first via
                        angkorgit.accounts, then host default; missing_account_message tells
                        "token missing from the system keychain — reconnect" (metadata
                        exists, accounts::has_account) apart from "no connected account",
                        issue #7), injects the auth header per
                        provider (github Bearer + api-version, bitbucket Basic
                        email:token; any other provider is refused) and forwards via
                        http::request_credentialed; checked_request_url parses the URL
                        with the url crate (reqwest::Url) and requires scheme https, no
                        userinfo, host equal to the remote host or its api. subdomain
                        (so evilgithub.com never matches) and the SAME port
                        (port_or_known_default) — tokens never reach the webview and
                        never travel over plain http; the credentialed client in http.rs
                        follows NO redirects (Policy::none), so a 3xx comes back to the
                        provider as a status instead of carrying the token elsewhere;
                        account_check.rs uses the same client; 8 module tests
```
