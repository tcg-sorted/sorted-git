# Frontend: Shared components (tabs, toolbar, palette, status bar, dialogs…)

Source: `apps/desktop/src/components/` (from §6 Frontend). [Back to the index](../../../CLAUDE.md)

```text
components/                   ← RepoTabs (MISSING FOLDERS + SAME NAMES, owner report
                                2026-10-03: two same-named tabs, one pointing at a folder the
                                owner had MOVED — tabs are persisted path strings and were
                                never re-checked): an effect keyed on the joined tab paths
                                runs ipc.pathsExist and closeRepoTab + killTerminalSession
                                for every missing one EXCEPT the open repo, with one info
                                toast naming them (description = the paths); repo shortcuts
                                are kept in case the folder comes back. Labels come from core
                                git/tabLabels tabLabels(paths) → {name, hint}: hint is null
                                unless another tab shares the folder name (case-insensitive),
                                then it is the SHORTEST parent suffix that is unique in that
                                group ("shared-services", or "work/client" when the
                                parents collide too); rendered after the name as a faint
                                10px rtl-truncated span (data-tab-hint, name wins; its
                                wrapper has a min(hint length, HINT_MIN_CH 4) ch floor —
                                without it a squeezed hint collapsed to its LAST LETTER
                                with no room for the ellipsis, which the owner read as a
                                stray "t" next to the shortcut pill, 2026-11-08), tab
                                max-w-56; SHRINK TO FIT (user request via the owner 2026-10-16, "the
                                top head should behave like a browser" on a small
                                screen): tabs are flex `shrink` with a CONTENT-BASED floor
                                (`min-w-min`) and the clusters `shrink` too. The fixed
                                floors that shipped first (min-w-12 / min-w-20 with a
                                shortcut pill / min-w-28 active) ignored what the tab
                                holds: in FULL mode the padding, the pill and the
                                invisible-but-present X slot of an inactive tab add up to
                                ~80px, so a short repo name next to a pill shrank to a
                                sliver of its first letter (owner screenshot 2026-11-06,
                                app zoom 0.8 keeps the strip in full mode with 19 tabs).
                                The name span now carries an inline minWidth of
                                min(name length, TAB_NAME_MIN_CH 4 / ACTIVE_NAME_MIN_CH 8)
                                ch, so the floor is padding + those letters + pill + X in
                                whichever mode is on. The same-name HINT is a sizer pair:
                                an aria-hidden `invisible h-0 break-all` copy gives the
                                tab its natural width but a one-character min-content, and
                                the visible rtl `absolute inset-0 truncate` span
                                (data-tab-hint) draws over it; a plain truncate hint would
                                put its whole width into the tab's min-content, and
                                `contain: inline-size` drops it from the natural width too
                                (both tried and measured). e2e `a short tab name keeps its
                                letters next to a shortcut pill…` verified to fail on the
                                fixed floors; the name span is
                                `line-clamp-1 break-all`, NOT `truncate`, because a nowrap
                                span's min-content is the whole name and the clusters never
                                got narrower (measured: tabs only lost the compact padding);
                                COMPACT mode (data-tab-strip=compact) comes from a
                                ResizeObserver on the OUTER bar — never the strip, whose
                                width changes with the overflow chevron and would loop —
                                when bar.clientWidth / (shown tabs + 0.6 per group label) <
                                COMPACT_TAB_WIDTH 112: tabs go px-2 and the inactive tabs' X
                                is `hidden` (the active tab keeps it; middle-click and the
                                menu still close); below the floor the strip still scrolls
                                and the overflow list appears; a wide window is unchanged;
                                e2e `tabs shrink to share a narrow window…` verified to fail
                                on the old strip (no data-tab-strip); the groups e2e now
                                narrows to 300px for the overflow list because two tabs fit
                                at 380px; tab strip is overflow-x-auto with the
                                scrollbar HIDDEN via .scrollbar-none — a visible 8px
                                scrollbar inside the fixed h-9 bar covered the tabs;
                                wheel deltaY scrolls horizontally, active tab
                                scrollIntoView on switch; RIGHT-CLICK MENU (2026-09-30):
                                Keyboard shortcut… / Copy path / Close tab / Close other
                                tabs via the positioned-span DropdownMenu pattern; a tab
                                with a repo shortcut shows it as a 9px mono PILL
                                (bg-primary/15 text-primary, data-tab-shortcut) after the
                                name on EVERY tab, active or not — a bordered Kbd chip
                                and then plain faint text both read as odd to the owner
                                (2026-09-30); the ACTIVE TAB is UNCHANGED — the plain
                                dark bg-background fill — after two rejected variants
                                the same day: a bg-primary/10 + text-primary tint like
                                the HEAD branch row ("looks really bad") and then a 2px
                                primary top edge ("just like previous one better"). Do
                                not decorate the active tab.
                                REPO SHORTCUTS (owner idea 2026-09-30, "map ALLA to A"):
                                core shortcuts/chord.ts is the pure layer — KeyChord
                                {key, ctrl, alt, shift, meta}, chordFromEvent reads the
                                key from event.CODE for letters/digits/F-keys (macOS
                                ⌥A reports key 'å'; anything else — punctuation,
                                Escape — is unsupported and ignored), chordId
                                'ctrl+alt+shift+meta+key' canonical order, chordLabels
                                (⌃⌥⇧⌘ on mac, Ctrl/Alt/Shift/Win elsewhere),
                                chordProblem = 'no_modifier' (shift alone does not
                                count: a bare letter would fire while typing and
                                collide with n/p/[/]) | 'reserved' (reservedChordIds:
                                every mod+key the app or the OS uses, mod = ⌘ on mac
                                else Ctrl — including mod+1…9 and mod+shift+z) |
                                null; repoForChord(map, event). settings.repoShortcuts
                                {path → chordId} (persisted with the store;
                                setRepoShortcut(path, id|null) also evicts any OTHER
                                path holding the same id, so a chord is never shared).
                                features/repository/useRepoShortcuts (mounted once in
                                App Shell, inside the router): ONE window keydown
                                listener — skipped for repeats, defaultPrevented,
                                targets inside .xterm (ctrl combos must reach the PTY)
                                and while ui.dialog/conflictFile is set — handles
                                mod+P (toggles ui.repoSwitcherOpen) and mod+T
                                (openRepositoryInNewTab: pickDirectory → useRepo.open →
                                /repo, the SAME helper RepoTabs' + button calls) — plain
                                mod only, read from e.code KeyP/KeyT; owner request
                                2026-10-03, ⌘P used to be a second ⌘K, now ⌘K alone opens
                                the palette (RepositoryPage's mod+p entry is gone);
                                features/repository/RepoQuickOpen (mounted in App Shell
                                after the splash, so it works on the welcome page): a cmdk
                                Command.Dialog (label "Switch repository", shouldFilter
                                false) over EVERY recent — core filterFiles on the path,
                                then name exact/prefix/substring ranking, capped at 100 —
                                rows show name + shortened parent, "Current" / "Open tab"
                                (data-repo-tab-state), folder missing (pathsExist on
                                open, selecting it toasts), repo chord Kbds; Enter →
                                switchToRepo (useRepo.open switches to an existing tab or
                                adds one); ui.setPaletteOpen(true) and
                                setRepoSwitcherOpen(true) close each other. TRAP for e2e:
                                cmdk puts role=dialog on an unstyled zero-size wrapper, so
                                getByRole('dialog').toBeVisible() fails — assert on the
                                input placeholder or [data-repo-switcher];
                                mod+1…9 (nth ui.repoTabs entry, e.code Digit*),
                                mod+shift+BracketLeft/Right (cycle tabs, wraps, needs
                                ≥2 tabs; e.code because shift+] reports '}') and then
                                the custom chords; ⌘W / Ctrl+W (user request via the
                                owner 2026-10-04, GitKraken parity) closes the CURRENT tab
                                through closeRepoTabs from RepositoryPage's useShortcuts
                                list — skipped inside .xterm because Ctrl+W is the shell's
                                delete-word; the last tab closing lands on the welcome
                                page via useRepo.close(); 'w' was already in APP_MOD_KEYS so
                                the repo-shortcut capture box reports it reserved;
                                switchToRepo closes the palette,
                                useRepo.open()s (opens an unopened recent too) and
                                navigates to /repo only when not already there (a
                                MemoryRouter push per switch would pile up). These
                                fire inside inputs on purpose (⌘1 in a browser does
                                too); a ⌃-only chord in a textarea is the user's
                                choice. RepoShortcutDialog (ui dialog 'repoShortcut',
                                context RepoShortcutPreset {repoPath} — the worktree
                                dialog's context guard excludes 'repoPath'): a
                                role=textbox capture box (aria "Shortcut keys",
                                autoFocus, data-shortcut-capture,
                                data-shortcut-problem) that preventDefault +
                                stopPropagation on every key so ⌘K shows as
                                "reserved" instead of opening the palette; Backspace
                                clears, Enter saves, Escape/Tab pass through; hint
                                line below (danger for problems, primary when the
                                chord currently belongs to another repo — "Saving
                                moves it here"); footer Remove shortcut (ghost,
                                text-danger, only when one exists) / Cancel / Save.
                                Rendered by RepositoryPage AND WelcomePage; opened
                                from the tab menu, the welcome recent-row menu and the
                                palette ("Keyboard shortcut for this repository…").
                                The chord shows on the tab, the welcome row
                                (data-recent-shortcut), the toolbar RepoSwitcher rows
                                and the palette's Switch repository items (PaletteItem
                                `keys` prop, arbitrary Kbds next to the mod-based
                                `shortcut`). Settings → Shortcuts gained the tab rows
                                and a RepoShortcutsCard (data-repo-shortcuts: name,
                                path, Kbds, X remove; SettingEmpty when none). Demo:
                                ipc.openRepository/repoInfo answer demo.demoRepoAt(path)
                                — a repo shaped after the requested path — so a second
                                tab is a real second tab in the e2e),
                                Toolbar (fetch/pull/push split-button, undo/redo,
                                REMOTE CHOICE (issue #61, 2026-10-08): the default
                                remote is core git/remotes pickRemote(remotes,
                                headUpstream) — the HEAD branch's upstream remote, then
                                origin, then the first (pickForgeRemote delegates to it;
                                the palette and CommitGraph's pushRemoteFor use it too)
                                — it used to be remotes[0], which in a many-remote repo
                                was not the upstream; with >1 remotes the Pull and Push
                                menus end with a "Pull from" / "Push to"
                                DropdownMenuLabel and one DropdownMenuCheckboxItem per
                                remote, the default ticked; "Push to <other>" passes
                                set_upstream = pushSetsUpstream(headUpstream, name),
                                false when the branch tracks a different remote so the
                                upstream is not silently re-pointed; engine pull()
                                merges the upstream only when it lives on the chosen
                                remote, else that remote's same-name branch
                                (pull_source; "<remote> has no branch <b>" otherwise),
                                which also lets a branch without an upstream pull;
                                the palette lists Pull from / Push to <remote> entries,
                                PUSH REQUEST (PR #85 review, 2026-11-01): every toolbar
                                push goes through runPush(label, PushRequest {repoPath,
                                remote, branch = repo.headBranch AT CLICK TIME, force,
                                withTags, setUpstream, noVerify}) — passing `undefined`
                                let the engine resolve HEAD again, so a "Push without
                                hooks" retry after a checkout during the failing hook
                                published the OTHER branch unverified; the hook retry
                                re-runs the same request with noVerify, and the palette
                                passes headBranch explicitly too.
                                PUSH REJECTED DIALOG (issue #40): run()'s catch routes a
                                NON-FORCED push to the default remote whose error has
                                code non_fast_forward (or a non-fast-forward message from
                                the rejection callback) to components/PushRejectedDialog,
                                and keeps that PushRequest as `pushRejected` — two option
                                rows, "Pull with rebase" (autofocus, safe) and "Force
                                push" (danger), each with a one-line when-to-use —
                                instead of a toast; Force push continues the stored
                                request with force=true, so the branch and a "Push
                                without hooks" bypass carry over (it used to start a
                                fresh request and the failing hook reopened its
                                dialog); Pull with rebase uses the stored request too
                                (ipc.pull(rejected.repoPath, rejected.remote, 'rebase'))
                                and runs ONLY while the current repo is that repoPath and
                                its HEAD is that branch (rebaseBlocker, re-checked on
                                click): engine pull rebases the CHECKED-OUT branch, so a
                                branch switch during the hook used to rebase the other
                                branch under a dialog naming the pushed one (PR #85
                                review); otherwise the row is disabled with a
                                data-pull-blocked line ("Check out main first: a pull
                                rebases the checked-out branch.") and Cancel takes the
                                autofocus, never Force push; Force push is plain force (libgit2 has no
                                --force-with-lease), the copy says what is lost —
                                OPEN IN EDITOR split-button after the stash pair — main
                                button opens the repo in preferredEditor, the chevron
                                lists every detected editor, disabled with a hint when
                                none is found (never hidden); the palette mirrors it as
                                "Open repository in <editor>" and both file menus add
                                "Open in <editor>" under Edit file —,
                                stash + POP buttons — Archive opens the dialog,
                                ArchiveRestore pops stash index 0 in one click, its
                                Hint names the latest stash, disabled when none; a
                                split-button menu was built first and REPLACED by the
                                plain button at the owner's request 2026-09-07; palette
                                mirrors "Pop latest stash" —,
                                CommandPalette footer shows ↑↓ move / ⏎ run / esc
```
