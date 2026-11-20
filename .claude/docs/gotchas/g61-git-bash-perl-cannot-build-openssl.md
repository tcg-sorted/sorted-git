# G61 — Git Bash's Perl cannot build the vendored OpenSSL on Windows

**Where:** `.github/workflows/release.yml` (the "Build the bundles" step) and any Windows
build that compiles `libssh2-sys` / `git2` with `vendored-openssl`.

**Symptom:** the Windows release build fails inside `openssl-sys`'s build script. OpenSSL's
`Configure` stops with `Can't locate Params/Check.pm` / `IPC/Cmd.pm`.

**Cause:** on Windows, `openssl-src` runs OpenSSL's `Configure` with the first `perl` on
`PATH`. A step with `shell: bash` runs under Git Bash, whose `/usr/bin/perl` is a stripped
build without those core modules. The default PowerShell shell on the GitHub Windows
runner finds Strawberry Perl first, which is complete. This is why CI's Rust job (default
shell) passed while the first v0.28.0 release run (`shell: bash`) failed.

**Rule:** run `cargo` / `pnpm tauri:build` on Windows in the runner's default shell, not
`shell: bash`. Keep bash only for steps that do not compile Rust (renaming and collecting
assets). Locally, use Strawberry Perl on `PATH` (see `docs/Development.md`), or set
`OPENSSL_SRC_PERL` to a full Perl.
