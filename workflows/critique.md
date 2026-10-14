---
id: critique
title: Design critique and refinement
description: Critique a generated screen against its spec, usability heuristics and accessibility, with severity ratings, then refine through the spec. Use when the designer asks for a review, critique, feedback, audit or improvements.
---
**Goal:** find what's wrong before users do, and fix it at the source.

**Critique**
1. Read the screen spec, its REQs, users.md and the generated code. If you can run the prototype, look at every state.
2. Review against:
   - **Spec fidelity**: anything built that the spec doesn't describe, or described but missing.
   - **Requirements**: each covered REQ: met, partly met, not met. Quality requirements (accessibility, contrast, design-system use) are not proven by `data-req` tags, so check each one here: measure contrast, tab through the screen, and read the code for off-system components.
   - **Usability**: Nielsen's 10 heuristics, applied to concrete elements.
   - **Accessibility**: WCAG 2.2 AA (contrast, labels, keyboard, focus, status not by colour alone).
   - **Persona fit**: would P<n>, with their context, succeed at their goals here?
   - **Design system**: off-system components, variants or tokens.
3. Write `opendesign/critique/<slug>-<yyyy-mm-dd>.md` as a table: ID (CR-01…) · Severity (critical / major / minor) · Where · Problem · Why it matters · Proposed fix · Affects (REQ/spec section). Lead with the three most important findings. Be blunt and specific; no praise padding.

**Refine** (when the designer picks findings to act on)
1. Change the spec first: update the screen spec, add or edit REQs, update design-system.md if needed. Log notable choices in decisions.md.
2. Regenerate the affected parts of the screen from the updated spec.
3. Run `opendesign verify`. In the critique file, mark each acted-on finding as resolved with the spec change that resolved it.
