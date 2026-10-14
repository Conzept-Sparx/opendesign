---
id: verify
title: Verify traceability
description: Run opendesign verify to check requirement coverage, design-system compliance and evidence quality, then explain and fix the results. Use when the designer asks to verify, check, validate or prove traceability.
---
**Goal:** prove the design does what the spec says, mechanically.

1. Run `opendesign verify` in the terminal. It writes `opendesign/verify-report.md`.
2. Explain the result in plain language: PASS or FAIL, how many requirements are covered in specs and tagged in code, design-system violations, evidence share, open questions.
3. For each failure, propose the fix and where it belongs:
   - REQ in a screen's `covers` but not tagged in code → tag the element that satisfies it, or regenerate.
   - Tag in code for a REQ that doesn't exist → fix the tag or add the REQ.
   - Off-system component or variant → use an allowed one, or add it to design-system.md if the designer agrees.
   - Evidence citing a missing EV file → add the evidence or change the tag to `[assumed]`.
4. With the designer's go-ahead, apply the fixes and rerun until it passes. Warnings can stay, but list them.
5. Never edit verify-report.md by hand.
