# Frontend feature: `features/settings`

Source: `apps/desktop/src/features/settings` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── settings/                 ← store (theme, accent, zoom, reduceMotion, interface/code/terminal
│                               font families + terminal size (applyFonts → CSS vars, see the
│                               terminal entry) — applied via a
│                               `reduce-motion` class + MotionConfig, ai config +
│                               aiProfiles (PER-PROVIDER model/baseUrl/apiKey, see G22),
│                               aiStatus (untested/stale/ok/fail, persisted; written ONLY by
│                               the Settings Test connection button via setAiStatus; setAi
│                               moves ok/fail/stale to stale when any AI_CONNECTION_KEYS value
│                               actually changes and setAiProvider always does, while untested
│                               stays untested (staleStatus) — the keyring hydration
│                               writes apiKey through setState directly, so a restart never
│                               resets a good result; never poll or ping on launch),
│                               aiStyle
│                               commit style + branch prefix rules, PROFILES —
│                               IdentityProfile {label,name,email,accounts?: host→username}
│                               — persisted), profiles.ts (applyProfileToRepo writes
│                               user.name/email + angkorgit.profile + angkorgit.accounts
│                               to REPO-LOCAL config; ensureRepoProfile: assigned → keep,
│                               1 profile → silent stamp, ≥2 → pickProfile dialog, cancel
│                               → proceed unassigned; called before commit and push),
│                               SettingCard.tsx (SHARED primitives for every settings
│                               file: Field {label, hint} — hints replace long
│                               "(optional — …)" labels —, SettingCard, SettingRow (title/
│                               description left, control right, for switches inside a
│                               card), SettingEmpty (icon tile + title + line + action,
│                               the same empty-state shape as the sidebar's)),
│                               SettingsDialog has an autofocused Filter settings field (#33):
│                               packages/core/src/settings/filter.ts owns titles + keywords,
│                               AND terms, and section-label matches. Empty categories/cards
│                               are hidden through SettingsFilterContext; Enter selects the
│                               first catalog hit and measures its scroll position before the
│                               locate flash (including an already-visible card, no scrollend).
│                               Escape consumes the key while clearing so an open profile or
│                               account form keeps its draft; close resets, explicit section presets
│                               still win on open, spellcheck/autocorrect are off. Every card
│                               has a required catalog id; settingsFilter.test.ts checks all
│                               JSX card titles against the catalog, including both identity
│                               scopes. Filtering keeps section navigation; N/P stay in Diff.
│                               SettingsDialog (Appearance/Git/AUTHENTICATION/AI/Shortcuts
│                               tabs incl. commit-style card w/ live branch preview +
│                               SshCard (agent switch is a SettingRow; the credential-
│                               helper switch is NOT here any more — it is its own
│                               CredentialHelperCard between Accounts and SSH because it
│                               governs HTTPS accounts); Zoom, the AI Provider Select and
│                               the Commit-style preset Select are header actions; the AI
│                               Provider card ends with a status footer (aiStatus
│                               unknown/ok/fail, reset whenever provider/key/url/agent
│                               change) beside Test connection — toasts alone were not
│                               enough; CliAgentPicker rows are icon-tile cards with an
│                               "In use" Badge, a skeleton while scanning, SettingEmpty
│                               when nothing is found; prefix rules render as a labeled
│                               two-column table ("Branch matches" → "Message starts
│                               with") with a dashed empty hint and a primary-tinted live
│                               preview; SettingCard takes an optional `action` rendered
│                               in the HEADER row — single controls (Switch, Select) go
│                               there, never alone under a paragraph (Reduce motion, Auto
│                               fetch, Pull requests use it); Git tab order: Auto fetch,
│                               Pull requests, Command line tool, External editor (EditorCard: detected
│                               rows like CliAgentPicker, aria-pressed on the active one, Scan again in
│                               the header, SettingEmpty when none; settings.editorId, resolved by
│                               settings/editors.ts preferredEditor → the chosen one or the first
│                               detected; useEditors shares ONE module-level detect promise across the
│                               toolbar, palette and both file menus), Identity (title says the scope — repo or
│                               global — a footnote names the file written, a primary
│                               Badge shows the matching profile), Profiles (owner asked
│                               for a clean redesign 2026-09-05: each profile is a card
│                               with Avatar + label + "In use" Badge + secondary Use
│                               button + "…" menu whose Remove goes through confirmDialog;
│                               account linking keeps the ORIGINAL semantics
│                               (profile.accounts[host] = username means linked; linking
│                               another account on the same host replaces it; unlinked
│                               hosts use the host default) and is rendered as a "Linked
│                               accounts · n of m" list: one row per account (provider
│                               icon tile tinted when linked, `username @ host`, a Switch
│                               with an aria-label) inside a bordered divide-y box, shown
│                               whenever ≥1 account exists — never hidden. A per-host
│                               Select and a "-" no-account engine binding were both
│                               built and REJECTED (owner: keep the old logic, change
│                               only UI/UX); setAccountLinked writes/deletes
│                               profile.accounts[host]; providerIcon is exported from
│                               AccountsTab for this;
│                               "New profile" header button (or the empty-state card's
│                               button) reveals a labeled 3-column form with Cancel/Add,
│                               Enter adds, Escape cancels — never the old inline row of
│                               bare placeholder inputs)),
│                               AccountsTab (GITHUB TOKEN GUIDANCE, issue #31 2026-09-20: the
                               Token field's "Create one on GitHub" link keeps opening the CLASSIC
                               scopes=repo page (owner: the known path stays put) and the
                               footer sentence adds "fine-grained token" as an inline link to
                               the fine-grained page naming its permissions — Contents + Pull
                               requests read and write; nothing in the
                               engine ever rejected fine-grained tokens, /user + Bearer and git
                               over HTTPS accept both, the form just pointed at classic only.
                               TRAP: the Field primitive is a <label> wrapping hint + input, and
                               <button> is LABELABLE, so a button in the hint becomes the
                               label's control (a11y name "Token …", clicking the label opened
                               the page) — hint links are <a href> with preventDefault +
                               openExternal, never buttons; the e2e clicks the "Token" label
                               and asserts the input got focus) (a SettingCard "Accounts" with an "Add
│                               account" header button that reveals a labeled 2-column
│                               form — Provider, Host, Username/Atlassian email, Token
│                               with the "Create one on <provider>" link as the field
│                               hint, footer Cancel/Connect, Escape cancels; the form
│                               shows by itself when there are no accounts; rows read
│                               `username @ host` + default Badge + AccountStatus (the
│                               per-row check result wins over stored `verified`:
│                               'no_token' → "Token missing from the keychain",
│                               'unauthorized' → expired/revoked), with a
│                               visible Reconnect button when unverified OR the check
│                               came back no_token/unauthorized; reconnect() sets
│                               adding=true and focuses the token field from an effect
│                               once the form is mounted (issue #8: it used to focus a
│                               hidden input and nothing happened); RECONNECT IS ITS OWN STATE (owner screenshot 2026-09-28: the form read "Add account" with every field editable): `reconnecting` holds the account, the title reads "Reconnect <user> @ <host>", provider/host/username are locked (the Bitbucket email stays editable only while the stored one is empty), the button says Reconnect and the success toast Reconnected; Cancel, Escape and success clear it through closeForm and the header's Add account goes through startAdd, so a reconnect can never create a second account by a typo; the username's "detected from the token" hint is dropped while locked, and the token link reads "Create one ↗" instead of "Create one on <provider label>" with the form grid at gap-x-6, because the owner's second screenshot showed the hint running into the Token label as one sentence; a first attempt truncated Field hints and CLIPPED the link with no ellipsis (the anchor is a flex element), which the owner caught on sight — Field hints stay untruncated, keep them short instead), and a "…" menu
│                               (make default when the host has several, reconnect,
│                               Remove… via confirmDialog — never a hover-only trash
│                               icon); per-provider token connect, verified-on-connect,
│                               host-matched; auto re-check on open via account_check,
│                               expiry countdown, Reconnect prefill).
│                               Authentication tab = accounts (https://) + SSH keys
│                               (git@) together — see G20
```
