---
id: explore
title: Explore (brainstorm)
description: Brainstorm a brief, a requirement, an open question or any design problem with a thinking partner, without changing the spec. Use when the designer says explore, brainstorm, think through, "what if", "I'm not sure about", or wants ideas before committing to anything.
---
**Goal:** widen the thinking before anything is committed. The spec does not change in this workflow.

1. **Find the subject.** It can be the whole brief, an ID (REQ-006, Q1, EC-003, SCR-x), a screen, or a free problem ("I'm not sure the table is right"). Read only what's relevant: for an ID, run `opendesign trace <ID>` and read what it points to.
2. **Open the notes file.** Create `opendesign/explore/<yyyy-mm-dd>-<slug>.md` from `opendesign/explore/_template.md`. If an earlier exploration of the same subject exists, open it instead and summarise where it left off. Notes are scratch space, not spec; `verify` ignores them.
3. **Frame it in a few lines:** what we're exploring, what's known (and how strong the evidence is), what's assumed. Then ask ONE sharp question.
4. **Converse, one question or provocation per turn.** Pick the techniques that fit; don't run them all. Name the technique briefly when you use it.
   - **Reframe:** three "How might we…" versions, one that challenges the premise.
   - **Assumption map:** what this takes for granted, ranked by how much the design changes if it's wrong.
   - **Stakeholder lenses:** the same problem from each persona and from the buyer, admin, support team.
   - **Pre-mortem:** "Six months after launch this failed. Why?"
   - **Devil's advocate:** argue against the designer's favourite direction.
   - **Analogies:** how other domains solve a similar problem.
   - **Constraint flips:** "What if there were no table / no approval step / no limit?"
   - **Extremes:** first-time user, power user, someone having their worst day.
   - **Jobs to be done:** "When ___, I want to ___, so I can ___."
   - **Five whys:** for a stated need, to find the real one.
5. **Keep the notes current** as you go, briefly and without announcing it each time: Ideas, Insights, Open threads, Parked, and **Candidate spec items**, each labelled with its likely type (goal, edge case, requirement, question, decision, concept, assumption, research question).
6. **Be a real partner.** Disagree when you see a problem. Point out when an idea conflicts with an existing REQ, decision or evidence. Say when something is a guess. Don't converge too early; when ideas pile up, offer to cluster them.
7. **Close when the designer is ready:** the 3–5 strongest candidate spec items, what's still open, and the next step: `lock` to add chosen items to the spec, or `research` if open questions need evidence first.

Never edit spec files in this workflow. Never present an idea as evidence.
