---
id: change
title: Change with impact analysis
description: Change something already in the spec (a requirement, goal, edge case, decision, persona detail, design-system rule or screen) and update everything that depends on it. Use when the designer says change, update, revise, rename, remove, "the client changed their mind", or asks "what happens if we change X".
---
**Goal:** change one thing and keep the whole chain consistent.

1. **Pin down the item and the change.** If the designer describes it loosely, find the ID first.
2. **Trace it:** run `opendesign trace <ID>` and read the files it lists. Build the impact list:
   - **Upstream:** what it serves or cites (goals, edge cases, evidence).
   - **Downstream:** requirements, flows, screen specs, code elements tagged with it, decisions, wireframes, critiques and rationale that mention it.
3. **Show the impact** as a table: Artefact · What changes · Effort (edit / regenerate / review). Flag knock-on risks, such as losing the only requirement that handles an edge case, contradicting a decision, or needing a screen regenerated. If the designer only asked "what happens if…", stop here.
4. **On confirmation, apply it:**
   - Keep the ID when the meaning stays the same. When the meaning changes substantially, retire the old ID (`retired — replaced by REQ-0xx`) and create a new one.
   - Log notable changes in `decisions.md` with the reason.
   - Update dependent spec files and wireframes.
   - For screens with generated code, regenerate the affected parts following the `generate` workflow rules.
   - Don't rewrite history in critiques or rationale; add a line noting the change and that the item may be out of date.
5. **Run `opendesign verify`** and summarise what changed, what was regenerated, and what needs a human look.
