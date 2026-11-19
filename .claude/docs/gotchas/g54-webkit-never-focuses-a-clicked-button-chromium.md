# G54 — WebKit never focuses a clicked button (Chromium does), and a disabled field cannot hold focus

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G54 — WebKit never focuses a clicked button (Chromium does), and a disabled
  field cannot hold focus**: clicking the inspector editor's AI sparkle in
  WKWebView/WebKitGTK left nothing inside data-message-editor focused, so the
  container's keydown (Esc, ⌘⏎) went dead until the user clicked back into a
  field; the e2e missed it because Chromium focuses the clicked button (it sits
  inside the container, so keydown still bubbles). Any click handler that starts
  a mode with keyboard handling must refocus the field itself —
  generateDraftMessage calls draftSummaryRef.current?.focus() first, on both the
  start and the stop click. Same trap, other half: locking the textareas with
  disabled while the AI runs killed focus-within (the editor's ring dropped) and
  the design-system Textarea's disabled:opacity-50 dimmed them — busy locks on
  inputs are readOnly, never disabled. Found by the owner in WebKit while reviewing PR #83.
