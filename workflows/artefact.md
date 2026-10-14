---
id: artefact
title: Create an artefact
description: Create any UX artefact by name, such as wireframes, proto-personas, journey map, empathy map, user stories, storyboard, service blueprint, sitemap, user flow, competitive analysis, interview guide, usability test plan, heuristic evaluation or UX copy deck. Use when the designer asks for a specific deliverable by name, or without a name to see what's available.
---
1. **Read the catalogue** in `opendesign/ARTEFACTS.md`. If no type was given, show the catalogue compactly, grouped by phase, and ask which one.
2. **Match the request** to an entry by name or alias (for example wireframe, wires, lo-fi). If it's ambiguous, offer the 2–3 closest entries.
3. **If the entry names a dedicated workflow** (proto-personas → `users`, journey map → `journeys`), follow that workflow instead.
4. **Otherwise, create it as the entry describes:**
   - Read the inputs it lists. If an input is missing or thin (for example wireframes without a screen spec), say so and offer to create the input first, or proceed and mark the gaps.
   - Write to the location and format in the entry. Start from `opendesign/artefacts/_template.md` for Markdown types and `opendesign/wireframes/_template.html` for wireframes.
   - Reference spec IDs throughout (P1, G2, EC-003, REQ-006, SCR-x) so the artefact stays traceable. Tag claims about users with evidence tags; never invent evidence, quotes or participants.
   - If making it reveals new goals, edge cases, requirements or questions, list them at the end under **Candidate spec items** and suggest `lock`. Don't edit the spec directly.
5. **Tell the designer** where the file is and how to view it (wireframes and other HTML: open the file in a browser).
