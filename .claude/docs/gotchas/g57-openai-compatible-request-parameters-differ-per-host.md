# G57 — OpenAI-compatible request parameters differ per host and model

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G57 — OpenAI-compatible request parameters differ per host and model** (issue #86,
  2026-11-09): OpenAI's reasoning models reject `max_tokens` ("Use
  'max_completion_tokens' instead") and any temperature but the default, while LM
  Studio, DeepSeek and other compatible hosts still expect `max_tokens`. Test
  connection only lists /models, so it said Reachable while every request failed.
  providers.ts openAiCompatible therefore starts from `max_completion_tokens` for
  api.openai.com and `max_tokens` elsewhere, and on a 400/422 that names an adjustable
  parameter (error.param first, else the first of max_completion_tokens / max_tokens /
  temperature in an "unsupported / unrecognized" message) adjusts it and retries:
  temperature dropped, the token name swapped AT MOST ONCE. The working ChatShape is
  remembered per `baseUrl|model` in a module Map (resetChatShapes for tests), so the
  rejection costs one request per session. A reasoning model that spends its whole
  budget thinking returns empty content with finish_reason length and
  usage.completion_tokens_details.reasoning_tokens > 0; that gets ONE retry with
  max(REASONING_MIN_TOKENS 8192, 4 × budget) and the floor is remembered too; a length
  stop without reasoning tokens says so instead of "returned no content". No model name
  lists anywhere: the host's own error decides, so new models need no release.
