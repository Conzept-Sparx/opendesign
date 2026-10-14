---
id: lock
title: Lock into the spec
description: Add agreed outcomes from an exploration or conversation to the spec as numbered, traceable items (goals, edge cases, requirements, questions, decisions, concepts, assumptions). Use when the designer says lock, add to spec, commit this, make it official, or "let's go with that".
---
**Goal:** turn agreed thinking into spec items with permanent IDs, without breaking traceability.

1. **Collect the candidates** from the designer's message, the current conversation, or an explore notes file (default: the most recent one in `opendesign/explore/`).
2. **Classify each one** into exactly one target:

   | Type | Goes to | Format |
   |---|---|---|
   | Goal | `users.md`, under its persona | `- G<n> … [assumed]` |
   | Edge case | `journeys.md`, edge-case table | `\| EC-0xx \| … \|` |
   | Requirement | `requirements.md`, right section | `\| REQ-0xx \| text \| source \| serves \|` |
   | Open question | `requirements.md`, Open questions | `- Q<n> … (affects …)` |
   | Decision | `decisions.md` | `\| DEC-0xx \| … \|` |
   | Concept | `concepts/` via `opendesign new concept <slug>` | template |
   | Assumption | `brief.md`, Assumptions | `- … [assumed]` |
   | Research question | `research/plan.md` | table row |

   Evidence is never created here; it only comes from a real source through the `research` workflow.
3. **Check before proposing:** duplicates or overlaps with existing items, conflicts with existing requirements or decisions, honest evidence tags (anything from brainstorming is `[assumed]` unless an EV file exists), and a Serves link for every requirement.
4. **Show the proposal** as a table: New ID · Type · Text · File · Links · From (explore note). Point out conflicts. Ask the designer to confirm, edit or drop items. Don't write before they confirm.
5. **Write** the confirmed items with the next free IDs, in the exact formats. Never renumber existing items.
6. **Mark them in the explore notes** as `→ locked as REQ-021`, leaving everything else untouched.
7. **Run `opendesign verify`** and report what was added and what it now affects, for example "REQ-021 isn't covered by any screen yet: add it with `screen` or `change`".

To modify something already in the spec, use the `change` workflow instead.
