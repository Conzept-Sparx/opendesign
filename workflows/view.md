---
id: view
title: View the spec
description: Show what's in the spec in readable form: an overview of the whole project, one artefact, or one item with everything linked to it. Use when the designer says view, show me, what's in the spec, summarise, where are we on X, or asks about an ID such as REQ-006, P1 or SCR-my-attendance.
---
**Read-only.** Never edit files in this workflow.

- **No argument:** run `opendesign status`, then give a one-screen overview: the problem (from the brief), personas with their evidence share, counts of goals, edge cases, requirements and open questions, the chosen concept, screens and their generation status, the last verify result, and the three biggest gaps.
- **An artefact name** (requirements, personas, journeys, edge cases, decisions, concepts, flows, screens, questions, evidence, design system): summarise it. For long tables, group and count first, then list items compactly. Give the file path for the full version.
- **An ID** (REQ-006, P1, G2, EC-003, DEC-001, Q1, EV-001, SCR-x, FLOW-x): run `opendesign trace <ID>` and present the chain: what it is, why it exists (upstream), where it's used (downstream), its status (covered, tagged, open), and anything inconsistent.
- **"changes" or "recent":** if the project is a git repository, summarise `git log` and `git diff --stat` for `opendesign/`.

Keep it scannable. End with one suggested next action, not a list.
