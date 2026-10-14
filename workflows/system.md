---
id: system
title: Design system
description: Capture or update the design system in opendesign/design-system.md from code, tokens, Figma exports, screenshots or a description. Use before generating any screen, or when the designer says "set up the design system" or "use our components".
---
**Goal:** a design-system.md that a generator can follow without guessing.

1. Find the sources, in this order of trust: the designer's instructions → an existing component library in the repo (`components/ui`, `tailwind.config.*`, CSS variables) → exported tokens (Tokens Studio / Figma Variables JSON) → screenshots of the current product → a verbal description.
2. Extract:
   - **Tokens:** colours, type (family, sizes), radius, spacing, shadows. Name them as CSS variables. Note the source of each (`[observed: EV-00x]` for a screenshot saved as evidence, or the file path).
   - **Components:** the shadcn/ui components the product will use, with import paths. If the product has its own library, list those imports instead.
   - **Variants:** every variant a generator may use, one table row per component+variant. Include semantic status variants (success, warning, destructive, neutral) when the product shows status.
   - **Patterns:** recurring layouts (list page, form, detail page, empty state) described in terms of the components.
3. Check contrast of text tokens against their backgrounds (WCAG 2.2 AA, 4.5:1 for body text). Flag failures; propose a compliant value but keep the original noted.
4. Write `opendesign/design-system.md` using the existing table formats exactly; `opendesign verify` parses the Components and Variants tables.
5. Tell the designer what you captured, what you had to guess (mark guesses `[assumed]`), and suggest `brief` next if no brief exists.

Rules: never invent brand colours; if there is no source, ask. Keep the list to what this product needs.
