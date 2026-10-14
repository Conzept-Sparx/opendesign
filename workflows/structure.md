---
id: structure
title: Information architecture and interaction flows
description: Define the information architecture (opendesign/ia.md) and interaction flows (opendesign/flows/FLOW-*.md) for the chosen direction. Use when the designer asks for a sitemap, navigation, IA, user flows, task flows or screen inventory.
---
**Goal:** know every screen, how people move between them, and what happens when things go wrong.

1. Read decisions.md (chosen concept), requirements.md, journeys.md and users.md.
2. Update `opendesign/ia.md`:
   - **Sitemap** as an indented list of screens with SCR ids (SCR-<slug>).
   - **Navigation**: where each screen is reached from, primary and contextual.
   - **Content model**: main objects, key fields, relationships.
3. For each key task, create `opendesign/flows/FLOW-<slug>.md` from the template: trigger, step table (Screen · User action · System response · REQ), and branches/failures referencing EC ids.
4. You may add a Mermaid flowchart to a flow file when it helps; keep the step table as the source of truth.
5. List any screen in the sitemap that has no flow, and any REQ that no flow touches.
6. Recommend `screen` next, starting with the screen on the most important flow.
