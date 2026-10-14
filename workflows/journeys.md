---
id: journeys
title: Journey mapping and edge cases
description: Map user journeys per persona and list exceptions and edge cases (EC ids) in opendesign/journeys.md. Use when the designer asks for a journey map, user flow at the experience level, pain points, or edge cases.
---
**Goal:** see the experience end to end, and find where it breaks before a screen exists.

1. Read users.md and brief.md. Confirm with the designer which persona and which journey (one journey per key goal).
2. For each journey add `## J<n> — P<n>: <name>` with the stage table: Stage · Doing · Thinking/feeling · Pain points · Opportunity. Tag pain points with evidence where it exists.
3. Run a systematic edge-case pass across the journey. Check at least: no data / first use, too much data, slow or no network, partial failure, permission denied, wrong or expired input, concurrent changes, interruption and resume, time zones and dates, accessibility needs (screen reader, keyboard only, low vision), localisation (long text, RTL), and role differences.
4. Add each real one to the Edge cases table with the next EC id: Situation · Where it happens · Impact · Source (`[assumed]` or evidence).
5. Highlight the 3 edge cases with the highest impact.
6. Recommend `requirements` next.
