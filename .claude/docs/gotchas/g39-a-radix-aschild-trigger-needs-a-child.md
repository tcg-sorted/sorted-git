# G39 — a Radix asChild trigger needs a child that FORWARDS ITS REF

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G39 — a Radix `asChild` trigger needs a child that FORWARDS ITS REF**: the graph's
  `+n` HoverCard opened but its content sat at `transform: translate(0, -200%)` — the
  popper's "not positioned yet" parking spot — because `Badge` was a plain function
  component, so Slot could not attach the anchor ref and floating-ui never measured
  the trigger. Playwright reported the chips as "outside of the viewport" while
  `toBeVisible` passed. `Badge` is `forwardRef` now; any design-system primitive used
  as an `asChild` trigger (Tooltip, DropdownMenu, HoverCard) must be too. Debugging tip:
  read the popper wrapper's inline style — `translate(0, -200%)` means "no anchor".
