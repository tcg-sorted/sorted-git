# Engine core: `core/remote.rs`

Source: `apps/desktop/src-tauri/src/core/remote.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── remote.rs         ← credential chain (see below), add/edit/remove/list remotes (add refuses a
│                       duplicate name; the sidebar fetches the new remote in the same action, issue #26),
│                       fetch/pull/push(+branch param)/clone,
│                       PULL MODE (issue #18): pull(path, remote, mode) — Some("rebase")
│                       rebases the local commits onto the upstream, Some("merge") merges,
│                       None follows the repo's effective `pull.rebase` (git semantics:
│                       anything but false/no/off/0/empty means rebase); the rebase only
│                       runs when the branch is BOTH ahead and behind — otherwise the
│                       ff-merge path handles up-to-date and fast-forward exactly like
│                       git pull --rebase would; toolbar Pull is a split button (main =
│                       follow config, menu = Pull with merge / Pull with rebase),
│                       PRE-PUSH (issue #82 PR 2, G55): push(…, no_verify), push_tag(…,
│                       no_verify) and push_specs(path, remote, refspecs, no_verify) (the
│                       generic one; tests use it for deletes) all go through send(), which
│                       runs the hook from libgit2's push_negotiation callback — after the
│                       remote's refs are read, before any object or ref update is sent — so
│                       the stdin carries the remote's ADVERTISED SHAs; an Err from the
│                       callback aborts the push and send() returns the stored
│                       AppError::Hook instead of libgit2's error. push_tag used to skip
│                       rejection collection; through send() a refused tag now fails too.
│                       The up-to-date shortcut below still runs the hook, with empty stdin,
│                       because git does; skipped hooks (no/old git) return status
│                       hooks_skipped with the reason appended to the message. A push whose
│                       connection broke after the hook passed is sent ONCE more and the hook
│                       is skipped for updates it already approved (G55 (7)).
│                       PUSH IS A NO-OP WHEN THE TIP MATCHES THE TRACKING REF (issue #17):
│                       tracking_ref_matches compares refs/heads/<b> with
│                       refs/remotes/<remote>/<b> BEFORE connecting and returns
│                       up_to_date without touching the network — libgit2 sends the
│                       ref command even when old == new (gen_pktline has no skip;
│                       only the packfile is trimmed), so servers saw a push and fired
│                       CI where `git push` prints "Everything up-to-date"; the
│                       tracking-ref rule is what GitHub Desktop does too, a stale
│                       tracking ref only delays the real push until the next fetch;
│                       WITH_TAGS NAMES EVERY TAG (issue #34, PR #35 by noyobo): libgit2
│                       rejects the `refs/tags/*` glob git expands client-side ("not a
│                       valid reference", class Invalid), so push() enumerates refs/tags
│                       via local_tag_names and sends one refs/tags/<t>:refs/tags/<t>
│                       refspec per tag, never forced; a tag the server rejects is still
│                       reported as pushed because no push_update_reference callback is
│                       set (issue #41);
│                       THE SERVER'S OWN WORDS (issue #76, 2026-10-13): push() also
│                       collects sideband_progress bytes (SERVER_MESSAGE_CAP 8 KiB) and
│                       server_lines() turns them into at most SERVER_MESSAGE_LINES 12
│                       trimmed, de-duplicated lines ("remote:" prefix and ===/--- rules
│                       dropped), which rejection_message appends after "The server
│                       said:" — GitHub's "Changes must be made through a pull request"
│                       reaches the toast; Toolbar's run() splits the message at its first
│                       newline into the toast title and a mono whitespace-pre-line
│                       description shown for 12 s. No engine test: libgit2's local
│                       transport runs no hooks, so only the module tests cover it;
│                       REJECTED REFS FAIL THE PUSH (issue #41, 2026-09-24): push() sets
│                       push_update_reference on the callbacks, collects every
│                       (refname, reason) the server refuses and returns
│                       AppError::other(rejection_message(...)) — "origin rejected tag
│                       v1.0 (already exists), branch main (non-fast-forward). Nothing
│                       else from this push was rolled back…" — because libgit2 returns
│                       Ok from remote.push even when receive-pack rejected a ref; the
│                       set_upstream write is skipped on rejection. NOT covered by an
│                       engine test: libgit2's local transport never rejects a
│                       fast-forward tag move (receive-pack's "already exists" rule is
│                       server-side), so only the message formatting has a module test —
│                       verify against a real remote with a moved tag;
│                       with_tags always pushes, set_upstream still applies (see G40),
│                       pull_branch (ff-without-checkout for non-HEAD), push_tag,
│                       credential_approve (git credential approve → OS keychain),
│                       checkout_remote_ref (PR checkout; BOTH paths go through
│                       point_branch_and_checkout: fast-forwards an existing local
│                       branch to the fetched head, refuses a diverged one, safe
│                       checkout_tree BEFORE moving the ref — an earlier track=true
│                       version delegated to checkout_branch, which silently kept a
│                       STALE local branch on re-checkout; track=true fetches
│                       +src:refs/remotes/<remote>/<branch> and sets the upstream,
│                       track=false stages through refs/angkorgit/pr-head),
│                       read_account_bindings (shared with forge.rs)
```
