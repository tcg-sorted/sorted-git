# G31 — on Windows every Command needs CREATE_NO_WINDOW

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G31 — on Windows every `Command` needs `CREATE_NO_WINDOW`**: AngKorGit is a
  GUI-subsystem process with no console, so spawning a console-subsystem child
  (`git.exe`, `ssh-keygen`, an AI CLI) makes Windows allocate one — and on
  Win11 22H2+ that opens the *default terminal application*, i.e. a real
  Windows Terminal/PowerShell window that flashes on screen and **steals
  keyboard focus** (issue #1). The reported "PowerShell window every ~20
  seconds" was a feedback loop, not a timer: auto-fetch's `window.focus`
  handler (RepositoryPage, 30s throttle) fetches → the credential chain falls
  through accounts/SSH to `credentials_from_git_cli`'s `git credential fill`
  → the console flash steals focus → the user clicks back into the app →
  focus event → another fetch ~30s later. So a flashing child process is
  self-sustaining; fixing the flash fixes the frequency. All spawns therefore
  go through `proc::hidden()`. Notes: `git2`'s own `Cred::credential_helper`
  already sets the flag (verified in git2-0.20.4 `src/cred.rs`), so step 4 of
  the credential chain was never the culprit; `portable_pty`'s ConPTY child is
  also fine. The guard is a source-scan module test in `proc.rs`
  (`every_spawn_goes_through_hidden`) because the real symptom is invisible on
  macOS/Linux CI — it was verified to fail by temporarily adding a bare
  `Command::new` elsewhere. Cross-compiling to check the `cfg(windows)` arm
  isn't possible locally (no Windows target/SDK); CI's windows clippy job is
  the gate.
