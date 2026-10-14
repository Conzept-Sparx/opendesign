---
id: research
title: Research planning and evidence
description: Plan UX research and log evidence (interviews, analytics, support tickets, screenshots, competitor reviews) as EV files. Use when the designer wants to plan research, add interview notes, import data, or back up assumptions with evidence.
---
**Goal:** turn assumptions into evidence, and keep every source citable.

Two modes. Pick by what the designer asks.

**Plan mode** — "plan research", "how do we validate this"
1. Collect every `[assumed]` claim from brief.md, users.md and journeys.md.
2. Rank them by risk: how much the design changes if the assumption is wrong.
3. Write `opendesign/research/plan.md`: research questions (each linked to the claim it tests), methods (interviews, analytics review, support-ticket analysis, usability test, competitor review), participant criteria and count, and a short interview guide when interviews are planned.
4. Keep it achievable: a designer with a week should be able to run it.

**Evidence mode** — the designer shares notes, transcripts, data, screenshots or links
1. Create one file per source: `opendesign/research/evidence/EV-00x-<slug>.md` using the template. Use the next free number.
2. Summarise facts only. Keep quotes short. No interpretation in evidence files.
3. Then update the claims it supports or contradicts in users.md / journeys.md / brief.md: change `[assumed]` to `[research: EV-00x]` or `[observed: EV-00x]`, or rewrite the claim if the evidence contradicts it. List every change you made.
4. If the evidence reveals a new need or edge case, propose it (new goal, EC or REQ) and ask before adding.

Never fabricate evidence or participants. Synthetic or AI-generated "users" are not evidence.
