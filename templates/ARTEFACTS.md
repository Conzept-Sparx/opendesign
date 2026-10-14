# OpenDesign artefact catalogue

Used by the `artefact` workflow. Each entry says what the artefact is, what it's made from, and where it goes.
Entries marked **→ workflow** are made by that dedicated workflow. Everything else goes to the location shown.
This file is owned by OpenDesign and refreshed by `opendesign update`.

## Discover

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Design brief | brief, problem statement | client material | → `brief` |
| Stakeholder map | stakeholders, power-interest | brief | `artefacts/stakeholder-map.md`: table of stakeholders, interest, influence, what they need from the design; optional Mermaid diagram |
| Research plan | research plan | brief, assumptions | → `research` |
| Interview guide | discussion guide, interview script | research plan, users | `artefacts/interview-guide-<slug>.md`: goals, warm-up, core questions (open, non-leading) mapped to research questions, probes, wrap-up |
| Survey | questionnaire | research plan | `artefacts/survey-<slug>.md`: objective, audience, questions with answer types, mapping to assumptions |
| Competitive analysis | competitor review, benchmark | brief, requirements | `artefacts/competitive-analysis.md`: competitors × criteria table, patterns worth borrowing, gaps. Screenshots the designer provides become EV files |
| Evidence | research notes, findings | real sources | → `research` |

## Understand users

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Proto-personas | personas, user profiles | brief, evidence | → `users` |
| Empathy map | empathy | users, evidence | `artefacts/empathy-map-<persona>.md`: Says / Thinks / Does / Feels, each line evidence-tagged |
| Jobs to be done | JTBD, job stories | users, evidence | `artefacts/jtbd.md`: "When ___, I want to ___, so I can ___" per goal, with linked G ids |
| User stories | stories | users, requirements | `artefacts/user-stories.md`: "As P1, I want…, so that…" with acceptance criteria and REQ links |

## Map the experience

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Journey map | customer journey | users | → `journeys` |
| Edge-case register | exceptions, edge cases | journeys | → `journeys` |
| Service blueprint | blueprint | journeys, ia | `artefacts/service-blueprint-<slug>.md`: lanes for customer actions, frontstage, backstage, support processes, evidence per stage |
| Storyboard | scenario, story | users, journeys | `artefacts/storyboard-<slug>.md`: 6–8 frames, each with scene, action, feeling, and the REQ it motivates |

## Define

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| UX requirements | requirements, acceptance criteria | users, journeys | → `requirements` |
| How might we | HMW, problem framing | brief, journeys | `artefacts/hmw.md`, or explore it first with `explore` |
| Design principles | principles | brief, users, evidence | `artefacts/design-principles.md`: 3–5 principles, each with what it means, an example, and the goal or evidence behind it |

## Ideate and decide

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Concepts and comparison | ideas, options, alternatives | requirements | → `ideate` |
| Moodboard brief | mood, visual direction | brief, design system | `artefacts/moodboard-brief.md`: visual direction in words, references the designer supplies, how it fits the design system |

## Structure

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Sitemap and IA | information architecture, navigation | decisions, requirements | → `structure` |
| User flow | task flow, flow diagram | ia, requirements | → `structure` |
| Task analysis | task breakdown | users, flows | `artefacts/task-analysis-<task>.md`: goal → subtasks → steps, with decision points and error points |
| Content inventory | content audit | ia, existing product | `artefacts/content-inventory.md`: page/screen × content items, owner, status |

## Design

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Design system | tokens, components | product, code | → `system` |
| Screen spec | spec, screen definition | flows, requirements | → `screen` |
| Wireframes | wireframe, wires, lo-fi, low-fidelity | screen spec (required) | `wireframes/<screen-slug>.html`: one self-contained HTML file per screen built from `wireframes/_template.html`. Greyscale only, no brand colours or design-system styling. Real labels and copy from the spec, regions in spec order, every state from the spec as a tab, numbered annotation markers on elements listed in a side panel with the REQ each satisfies. No external resources |
| UX copy deck | microcopy, content spec, copy | screen specs | `artefacts/copy-deck.md`: per screen, every label, message, error, empty state and confirmation with its REQ; tone notes |
| Prototype | hi-fi, clickable prototype | screen spec, design system | → `generate` |

## Evaluate

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Design critique | review, heuristic evaluation | prototype, spec | → `critique` |
| Accessibility audit | a11y audit, WCAG review | prototype, screen specs | `artefacts/accessibility-audit-<screen>.md`: WCAG 2.2 AA criteria checked, pass/fail per element, fixes, REQ links |
| Usability test plan | test plan, usability study | prototype, requirements | `artefacts/usability-test-plan.md`: goals, participants, tasks (each tied to G and REQ ids), success criteria, script, metrics |
| Usability test findings | test results | test sessions | Raw notes become EV files via `research`; synthesis goes to `artefacts/usability-findings-<date>.md` citing those EV ids |

## Communicate

| Artefact | Aliases | Made from | Location and format |
|---|---|---|---|
| Design rationale | rationale, design decisions doc | everything | → `rationale` |
| Developer handoff | handoff | screens, design system | → `rationale` (developer audience) |
| Presentation outline | deck outline, review agenda | rationale | `artefacts/presentation-<audience>.md`: slide-by-slide outline with the message, evidence and visual for each slide |
