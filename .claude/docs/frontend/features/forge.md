# Frontend feature: `features/forge`

Source: `apps/desktop/src/features/forge` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── forge/                    ← store.ts (per-repo forge state with a SESSION CACHE:
│                               snapshots keyed `${repoPath}|${remoteUrl}` in a module
│                               Map — switching repo tabs restores the cached PR list
│                               instantly (no loading flash) and revalidates in the
│                               background when older than 60s; a fetch error keeps the
│                               stale list visible under the error row; inFlight set
│                               dedupes concurrent loads AND load() re-points the flat
│                               state at the current key BEFORE the inFlight early
│                               return (A→B→A while A's first load is in flight used to
│                               leave B's PRs displayed under A); post-await writes are
│                               guarded by a PER-KEY seq + "store still points at this
│                               key" check, so reset() (settings toggle off) kills
│                               in-flight resurrection; hasAccount:false snapshots are
│                               NEVER treated as fresh, and RepositoryPage force-reloads
│                               when the Settings dialog closes without an account —
│                               otherwise connecting an account dead-ended on the 60s
│                               cache; accountList + PR fetch run in parallel;
│                               consumers gate on forgeRepoPath === repo.path so a tab
│                               switch never mixes repos (G9); PICKED remote — core
│                               pickForgeRemote: the HEAD branch's upstream remote first,
│                               then 'origin', then the first; NEVER remotes[0] blindly —
│                               a two-remote repo (github + bitbucket) once routed PR
│                               creation to the wrong host — parsed remote + remoteUrl,
│                               PR list, hasAccount, loading/error, 60s freshness window
│                               keyed to repo path AND remote url, G26 seq guard;
│                               forgeProviderFor binds a core provider to
│                               ipc.forgeRequest so the Rust side attaches the token;
│                               loaded by a RepositoryPage effect keyed on repo path +
│                               remotes fingerprint + HEAD upstream AND gated on the
│                               settings.showPullRequests toggle (off → reset, section
│                               hidden, create button falls back to the browser page);
│                               transport failures store BOTH a friendly error ("Could
│                               not reach <host>…", matched on ^request failed:/error
│                               sending request — never on provider errors, whose
│                               "GitLab request failed (409)" must stay verbatim) and
│                               errorDetail (raw, shown in the row tooltip);
│                               StatusBar/palette browser-link fallback uses the same
│                               picked remoteUrl),
│                               CreatePrDialog.tsx (notes under the form render through
│                               DialogNote — a surface-raised row with an Info (info) or
│                               AlertTriangle (attention = primary) icon, replacing three
│                               identical blue text lines; titleFromBranch returns '' for
│                               TRUNK_BRANCHES so main/master/develop never pre-fill
│                               "Main" as the title; UX audit 2026-09-24) (ui dialog kind
│                               'createPullRequest': source = HEAD; FORK → UPSTREAM (issue
│                               #26, 2026-09-15): core forgeTargets(remotes, sourceRemote)
│                               lists every same-kind same-host remote once and
│                               defaultForgeTarget prefers `upstream`; with >1 target an
│                               "Into repository" Select appears, the PROVIDER is bound to
│                               the TARGET remote (base branches, default branch and
│                               reviewers come from it) and createPullRequest gets
│                               sourceRepo = the fork's owner/repo — github head
│                               `owner:branch`, gitlab POSTs on the SOURCE project with
│                               target_project_id fetched from the target, bitbucket
│                               source.repository.full_name; the sidebar PR LIST still
│                               shows the picked remote's PRs, not upstream's —, base
│                               Select from the target remote's branches pre-picked via
│                               provider.defaultBranch,
│                               title prefilled from the branch name, description textarea
│                               with a stoppable AI generate button — commits from
│                               rebaseCommits(base) with history fallback —, reviewer
│                               multi-select (DropdownMenuCheckboxItem w/ onSelect
│                               preventDefault so the menu stays open; avatars; the
│                               connected account is filtered OUT of the candidates —
│                               Bitbucket rejects the whole create when the author is a
│                               reviewer; defaultBranch + members are session-cached per
│                               repo+remote so reopening is instant), draft checkbox,
│                               disabled + hint while the branch has no upstream (the
│                               guard is ALSO in submit() — Enter/⌘Enter must not bypass
│                               a disabled button); the not-pushed note carries a "Push
│                               <branch> to <remote>" Button (issue #54: Christian filled
│                               the form, then found Create disabled and had to close,
│                               push and retype) — pushBranch runs ensureRepoProfile →
│                               ipc.push(sourceName, setUpstream, head.name) →
│                               useRepo.refresh so head.upstream appears and Create
│                               enables with the draft intact; a failure lands in the
│                               dialog's error line; base initializes in a separate
│                               effect keyed on baseOptions + fetched default branch
│                               with a baseTouched ref (the open-effect closure sees a
│                               stale empty baseOptions when branches load late);
│                               success toast carries an Open action)
```
