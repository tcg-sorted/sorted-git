# G27 — conflict markers are exactly 7 chars; the parser must be lossless

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G27 — conflict markers are exactly 7 chars; the parser must be lossless**:
  `startsWith('=======')` once consumed legitimate content (setext/RST underlines,
  `========` dividers) as the separator and silently deleted it on resolve. parse.ts
  now matches `/^={7}\r?$/` etc. (7 chars + space-or-EOL), stores the RAW marker
  lines on each block (`markers.open/base/separator/close`), and serializes
  unresolved blocks from those raw lines — preserving diff3 base labels, CRLF, and
  bare markers byte-for-byte. A close marker without a separator is malformed and
  falls back to plain text. Never rebuild marker lines from labels.
