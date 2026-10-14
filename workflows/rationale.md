---
id: rationale
title: Design rationale for stakeholders
description: Write a stakeholder-facing design rationale that explains decisions, trade-offs and evidence, traced to requirements. Use when the designer needs to present, justify or hand off a design to clients, managers or developers.
---
**Goal:** a document a stakeholder can read in five minutes and understand why the design is the way it is.

1. Ask who the audience is (client, leadership, developers) and what decision or approval they need to give. Tone and depth follow from that.
2. Read brief.md, users.md, decisions.md, the relevant screens and flows, the latest critique and verify-report.md.
3. Write `opendesign/rationale/<topic>.md`:
   - **The problem and who it's for**, in plain language, citing evidence strength honestly ("based on 3 interviews and support data" or "based on assumptions we haven't tested yet").
   - **What we're proposing**, screen by screen or flow by flow, with a link to the prototype.
   - **Key decisions**: each DEC with the options considered and why this one won.
   - **How we know it works**: requirement coverage from verify, critique findings resolved, research done.
   - **Risks and open questions** that need the audience's input.
   - For developers, add a handoff section: screens, states, components, and where the spec files live.
4. No jargon the audience wouldn't use. No overclaiming: every claim should be traceable to a file in opendesign/.
