# G22 — AI settings are per provider

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G22 — AI settings are per provider**: `ai` holds the ACTIVE config, `aiProfiles`
  keeps one `AiProfile` (model/baseUrl/apiKey/cliAgent/cliPath) per `AiProviderKind`.
  `setAi` write-through-caches into the active provider's profile; `setAiProvider`
  saves the outgoing profile and restores the incoming one (preset defaults on first
  use). Never reset model/baseUrl inline in the UI on provider change — that was the
  original bug, and it also carried one provider's API key over to the next. Old
  persisted settings with no `aiProfiles` are seeded from `ai` in `onRehydrateStorage`.
