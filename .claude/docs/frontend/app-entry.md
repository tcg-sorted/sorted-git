# Frontend: App entry, splash, IPC boundary and demo data

Source: `main.tsx`, `app/`, `core/ipc.ts`, `core/demo.ts` (from §6 Frontend). [Back to the index](../../../CLAUDE.md)

```text
main.tsx · app/App.tsx        ← providers, MemoryRouter, splash→welcome (or /repo when
                                launched via `angkorgit open|clone`), ConfirmHost,
                                Toaster (bottom-left, per-type accents), zoom shortcuts
```

```text
app/SplashScreen.tsx          ← animated logo draw, dismissed when recents load (600ms floor,
                                1.6s fallback, reduce-motion skips both floor and fade); the
                                overlay is absolute so the app renders under the exit fade
```

```text
app/globals.css               ← tokens import (RELATIVE path!), scrollbars, hljs palette
```

```text
core/ipc.ts                   ← THE typed IPC boundary — only place calling invoke();
                                demo-mode fallback (browser) per command; openExternal;
                                listen() wrapper for Tauri events
```

```text
core/demo.ts                  ← deterministic 400-commit synthetic repo for demo mode
```

```text
│                                close-or-back as Kbd hints and Refresh carries ⌘R (UX
```

```text
│                                audit 2026-09-24); RepoSwitcher dropdown (recents list scrolls inside a
                                viewport-capped menu — max-h min(70vh, radix available
                                height), open/clone/profile actions stay pinned below)
                                + "Profile" submenu — assigns the
                                FULL profile via applyProfileToRepo, chip after branch
                                name shows the assignment; push goes through runPush →
                                ensureRepoProfile, sidebar toggle), CommandPalette (cmdk),
                                Avatar (FORGE AVATARS ONLY, initials fallback — NO GRAVATAR:
                                a security review flagged the SHA-256 email hash sent to
                                gravatar.com for every author, so it was removed 2026-11-18
                                and no author email or hash may leave the machine except
                                through the authenticated forge proxy): the `oid` prop —
                                GraphRow, CommitDetails, FileHistoryPanel and BlameView pass
                                the commit oid — feeds features/forge/avatars.ts
                                forgeAvatarFor(email, sha), which asks the picked remote's
                                ForgeProvider.authorAvatar (github: /repos/{o}/{r}/commits/
                                {sha} author.avatar_url, bitbucket: /repositories/{o}/{r}/
                                commit/{sha} author.user avatar, both via forge_request) ONLY when the
                                forge store has an account and settings.showPullRequests is
                                on, never for unpushed or all-zero (uncommitted blame) oids.
                                Requests go through core forge/avatarResolver.ts
                                createAvatarResolver: one resolver per forge host, cache by
                                normalized email in memory AND localStorage
                                `angkorgit-avatars:<host>` (hits 7 days, misses — author not
                                linked to a forge user — 1 day, 5000 entries, oldest
                                evicted), ONE in-flight request per email whatever the sha,
                                at most 4 concurrent, a 404/422 (commit not on the forge)
                                lets the next commit of that author try (3 shas max per
                                session), a 403 rate limit / 429 pauses every lookup for 15
                                min, other failures back the email off for 5 min, non-https
                                URLs dropped; sizedAvatarUrl adds `s=<2×size>` on
                                githubusercontent URLs. Avatar re-runs when forgeAvatarKey
                                (repo + host + account) changes, so rows rendered before the
                                forge store loaded pick their avatar up; an Avatar without an
                                oid (Settings profiles) shows a cached avatar for that email
                                or initials; an image that fails is remembered in brokenUrls
                                and shows initials; a layout effect checks img.complete because a
                                cache-restored image can finish before onLoad attaches —
                                remounted graph rows after a diff round-trip stayed
                                transparent without it), confirm.tsx (promise-based confirmDialog +
                                ConfirmHost — ConfirmOptions.path renders the file path in a
                                monospace panel breaking at `/` via <wbr>, dirs dimmed, NOT inside
                                the title or the prose), profilePrompt.tsx (promise-based
                                pickProfile + ProfilePromptHost — same pattern),
                                StatusBar ("Fetched 2m ago" hint, issue #18: users could
                                not tell that switching tabs already fetches — useRepo
                                .lastFetchAt is set by markFetched() from the auto-fetch
                                tick (RepositoryPage), toolbar and palette Fetch/Pull,
                                reset to null on open/close so a tab switch shows the
                                fresh fetch; a 30s interval re-renders timeAgo; the Hint
                                names the exact time and the auto-fetch cadence, or says
                                auto fetch is off; failed remotes get a separate faint
                                "Fetch incomplete" hint naming only the remote names,
                                without hiding the last successful fetch time; AI CHIP
                                (issue #23, trimmed from the
                                proposal: no last-used time): ALWAYS visible (owner
                                2026-09-13, after a hide-until-tested version: "keep display
                                there, when not configured clicking opens the config"),
                                a Sparkles icon TINTED by state (success/danger/faint — no
                                separate dot: the owner found icon + dot "off" next to the
                                bar's other icon + text items) + the PROVIDER NAME as the
                                label (AI_PROVIDER_PRESETS label, or the CLI_AGENTS label for
                                the cli provider) — the owner rejected judgement labels ("AI
                                not tested" read as unprofessional): the bar's other items
                                name facts, so the chip names the provider and the icon tint
                                plus the Hint carry ok/fail/untested/stale; "Set up AI" when
                                not configured (same rule as ai/client aiConfigured, computed
                                reactively from settings.ai; data-ai-status="unconfigured");
                                data-ai-status carries the PERSISTED settings.aiStatus for the
                                e2e, click →
                                openDialog('settings', { section: 'ai' }) — the SettingsPreset
                                dialog context the SettingsDialog consumes on open)
```
