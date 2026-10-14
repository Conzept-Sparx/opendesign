---
id: ideate
title: Ideation and comparative evaluation
description: Generate divergent design concepts (CON ids), compare them against the requirements, and record the chosen direction in decisions.md. Use when the designer wants ideas, options, alternatives, or to compare approaches.
---
**Goal:** real alternatives, compared honestly, so the chosen direction is a decision and not a default.

This is the one workflow where variety matters more than consistency.

1. Read requirements.md, users.md and journeys.md. Confirm which problem or screen area to ideate on.
2. Write 3 genuinely different concepts in `opendesign/concepts/CON-<letter>-<slug>.md` using the template. Different means a different mental model or structure (for example, list vs calendar vs timeline), not three colour variants. Push at least one concept away from the obvious.
3. For each concept: the idea, how it serves the key REQs, risks and trade-offs, and a region-by-region sketch in words. Optionally generate a quick throwaway exploration in `prototype/src/explorations/` (no data-req tags needed there).
4. Write `opendesign/concepts/comparison.md`: a table of concepts against the most important REQs and goals (meets / partly / doesn't, with a reason each), plus effort and risk. End with a recommendation and what would change it.
5. Ask the designer to choose (or combine). Record the choice in decisions.md as a DEC row: decision, options considered, why, affects.
6. Recommend `structure` next.
