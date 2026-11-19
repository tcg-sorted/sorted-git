# Frontend feature: `features/ai/client.ts`

Source: `apps/desktop/src/features/ai/client.ts` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── ai/client.ts              ← binds settings AI config + Rust HTTP/CLI transports to
│                               @angkorgit/core providers ('cli' = installed AI CLI:
│                               Claude Code/GitHub Copilot CLI/Codex/Gemini CLI/OpenCode/Antigravity/Cursor CLI via ai_cli.rs —
│                               user's own login + quota, no API key; plus OpenAI/
│                               Anthropic/Gemini/Ollama/LM Studio); capabilities:
│                               commit msg, explain diff/conflict, PR description,
│                               summarize, review. Settings AI tab: detected-CLI
│                               picker (scan/select/rescan, optional model override)
```
