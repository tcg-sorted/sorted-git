# Engine: `http.rs`

Source: `apps/desktop/src-tauri/src/http.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
http.rs               ← AI/HTTP proxy (reqwest, rustls) — keeps CORS + keys out of webview;
                        the credentialed client (request_credentialed for forge.rs,
                        credentialed_client for account_check.rs) follows NO redirects (Policy::none), so a 3xx comes back
                        to the provider as a status instead of carrying the token elsewhere
```
