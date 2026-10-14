---
id: screen
title: Screen specification
description: Write a screen spec (opendesign/screens/<slug>.md) that a generator can turn into a near-identical prototype every time. Use when the designer asks to spec, define or detail a screen, or before generating one.
---
**Goal:** a spec precise enough that two different agents would build structurally the same screen.

1. Read the relevant flow, requirements.md, design-system.md, users.md and ia.md. If the designer shared a screenshot of an existing screen, save it as evidence and critique it first: list concrete problems and map each to an existing or new REQ.
2. Run `opendesign new screen <slug>` (or copy `screens/_template.md`) and fill it:
   - **Frontmatter**: id, persona, flow, pattern, `covers: [REQ-…]`, and `code:` path for the generated file.
   - **Layout**: regions top to bottom. For each element: the exact design-system component, its content (real copy, not lorem ipsum), and the REQ it satisfies.
   - **Interactions**: what every control does, including disabled and validation rules.
   - **States**: default, loading, empty, error, plus every edge-case state this screen owns (from EC ids).
   - **Sample data**: realistic rows that exercise every state and status.
   - **Accessibility**: headings, labels, keyboard order, live regions, focus handling.
3. Remove every decision a generator would otherwise have to make. If you can't decide something, add a Q to requirements.md and mark the element `pending Q<n>`.
4. Use only components and variants in design-system.md. If one is missing, propose adding it.
5. Run `opendesign verify` and fix anything it reports for this screen. Recommend `generate` next.
