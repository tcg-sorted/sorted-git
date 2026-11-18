# §11 Backlog (agreed direction, not yet built)

[Back to the index](../../CLAUDE.md)

1. OAuth device-flow "Sign in with GitHub/GitLab" popup (needs registering an OAuth app;
   Accounts tab is the foundation).
2. Provider avatars via connected accounts (GitLab self-hosted `/api/v4/avatar`, GitHub API)
   layered over Gravatar.
3. File-tree view for the working copy (deep C# paths); prev/next-file arrows in DiffPanel.
4. ~~Blame~~ shipped 2026-09-12 (BlamePanel). 5. Worktree follow-ups: start an
   installed AI CLI inside a worktree, per-repo post-create setup command, merged badge with
   one-step cleanup (worktrees themselves shipped in 0.10.0).
7. Forge integrations, remaining scope (PR list/checkout/create + reviewer selection
   shipped in 0.7.0 in `packages/core/src/forge` — NOT a separate
   `packages/forge` package, it mirrors where the ai/ adapters live): possible later
   items are an issue viewer, a read-only PR detail view (commits, CI status, review
   state), Bitbucket Server + Azure DevOps adapters, refreshing the PR list after push.
   **In-app REVIEW (comment threads, approve/request-changes, merge) is deliberately
   PARKED — owner decision 2026-08-27**: reviewing belongs to the forge's web UI (CI
   logs, suggestions, resolved threads); a partial in-app review would violate the
   "25 features done well" ethos and the roadmap non-goal about duplicating forge web
   UIs. Do not re-propose unprompted; "Open in browser" is the review path. The
   browser-link fallback stays for hosts without a connected account (deliberately a
   persistent StatusBar affordance, NOT a post-push toast — transient popups nag
   non-PR users and can't help with a branch pushed yesterday).
8. Plugin host (palette commands, sidebar sections, inspector tabs are list-driven already).
