---
id: requirements
title: UX requirements
description: Define traceable UX requirements (REQ ids) in opendesign/requirements.md from goals, journeys and edge cases. Use when the designer asks for requirements, acceptance criteria, or "what must the design do".
---
**Goal:** a testable list of what the design must do, each line traceable to a user need.

1. Read users.md, journeys.md, brief.md and existing requirements.md.
2. Write requirements as observable behaviour from the user's side ("Changing the month updates the list immediately"), never as solutions in disguise ("Use a dropdown") unless the solution is itself a constraint.
3. Add rows to the right table (Core, States and edge cases, Quality) in the exact format `| REQ-00x | Requirement | Source | Serves |`.
   - **Source**: observed / research / assumed / constraint, with EV id when there is one.
   - **Serves**: goal and edge-case ids, for example `G1, EC-003`. Every REQ must serve something.
4. Make sure every high-impact EC has at least one REQ, and include quality requirements for accessibility (WCAG 2.2 AA) and design-system use.
5. Put unresolved questions under Open questions as `- Q<n> question (affects REQ-00x)`.
6. Never renumber existing REQs. To drop one, change its text to `retired — reason`.
7. Run `opendesign verify` and report anything orphaned. Recommend `ideate` next (or `structure` if the direction is already clear).
