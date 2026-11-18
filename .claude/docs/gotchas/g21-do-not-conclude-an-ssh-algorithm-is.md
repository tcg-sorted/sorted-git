# G21 — do NOT conclude an SSH algorithm is unsupported from the absence of a build define.

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G21 — do NOT conclude an SSH algorithm is unsupported from the absence of a
  build define.** `libssh2-sys` never sets `LIBSSH2_ED25519`, but it does not need
  to: `crypto.c` includes `openssl.c`, and `openssl.h` derives the define from the
  OpenSSL version (`>= 1.1.1` → 1). With `vendored-openssl` (3.6.x) **ed25519 and
  ECDSA are fully supported** — verified with `nm` on
  `target/*/build/libssh2-sys-*/out/build/libssh2.a` (23 ed25519 symbols) and by an
  end-to-end probe. An earlier release briefly shipped an "SSH keys must be RSA"
  gate based on this wrong inference; it was removed. To diagnose SSH auth for real,
  add a temporary `#[ignore]`d test in `remote.rs` that calls
  `remote.connect_auth(Direction::Fetch, Some(make_callbacks()), None)` against a
  real host (fast — authenticates without fetching objects) and vary key/URL via env
  vars. Remember the final `Err` in `make_callbacks` MASKS libgit2's own message, so
  never diagnose from the toast alone. WINDOWS IS THE EXCEPTION (PR #29, 2026-09-16):
  `libssh2-sys` compiles libssh2 with the WinCNG backend there unless its
  `openssl-on-win32` feature is set, and WinCNG has `LIBSSH2_ED25519 0` and no ECDSA,
  so a known_hosts entry holding only an ed25519/ECDSA host key (GitLab's default)
  failed with "failed to set hostkey preference" before authentication (libgit2
  #6612, still open upstream). Cargo.toml therefore carries a
  `[target.'cfg(windows)'.dependencies] libssh2-sys` with `openssl-on-win32` +
  `vendored-openssl`; feature unification flips the transitive libssh2 to OpenSSL.
  Costs to remember: libgit2-sys only depends on openssl-sys on unix (Windows uses
  WinHTTP for HTTPS), so this ADDS a from-source OpenSSL build to every Windows
  compile — the Windows CI job went from under 3 min to 23 min on a cold cache, local
  Windows builds need Perl on PATH (NASM optional, openssl-src falls back to no-asm),
  and the Windows binary grows by a static libcrypto/libssl (unmeasured).
