# OpenDesign conventions

This folder is the single source of truth for the UX of this project. Agents and people edit
these files; the prototype is generated from them. When the prototype and the spec disagree,
the spec wins: fix the spec, then regenerate.

## Folder

```
opendesign/
  config.json          project settings (name, stack, prototype folder)
  CONVENTIONS.md       this file (owned by OpenDesign, refreshed by `opendesign update`)
  ARTEFACTS.md         catalogue of artefacts the `artefact` workflow can make (owned by OpenDesign)
  explore/             brainstorming notes: scratch space, NOT part of the spec
  brief.md             problem, business goals, constraints, open questions
  research/
    plan.md            research questions, methods, participants
    evidence/          one file per source: EV-001-*.md
  users.md             personas (P1…) and goals (G1…)
  journeys.md          journey maps per persona + edge cases (EC-001…)
  requirements.md      UX requirements (REQ-001…) + open questions (Q1…)
  design-system.md     tokens, allowed components and variants, patterns
  concepts/            divergent design directions (CON-A, CON-B…) + comparison
  decisions.md         design decisions (DEC-001…) with rationale
  ia.md                information architecture: sitemap and navigation
  flows/               interaction flows: FLOW-<slug>.md
  screens/             screen specs: <slug>.md (id SCR-<slug>)
  critique/            critiques of generated screens
  rationale/           stakeholder-facing rationale documents
  wireframes/          low-fidelity HTML wireframes, one per screen
  artefacts/           other artefacts from the catalogue (empathy maps, test plans, copy decks…)
  verify-report.md     written by `opendesign verify`, never edited by hand
```

## IDs

IDs are permanent. Never renumber; retire an ID by marking it `retired`, never reuse it.

| Prefix | Meaning | Lives in |
|---|---|---|
| EV-001 | A piece of evidence (interview, analytics, ticket, screenshot) | research/evidence/ |
| P1 | Persona | users.md |
| G1 | User goal | users.md |
| EC-001 | Edge case or exception | journeys.md |
| REQ-001 | UX requirement | requirements.md |
| Q1 | Open question | requirements.md |
| CON-A | Design concept | concepts/ |
| DEC-001 | Design decision | decisions.md |
| FLOW-x | Interaction flow | flows/ |
| SCR-x | Screen | screens/ |

## Evidence tags

Every claim about users carries one tag:

- `[observed: EV-00x]` seen in the product, analytics, support data or a screenshot
- `[research: EV-00x]` heard in an interview or survey
- `[assumed]` a hypothesis to validate

Never upgrade `[assumed]` to `[observed]` or `[research]` without citing an EV file.
`opendesign verify` fails if a tag cites an EV that doesn't exist, and warns when a persona is
more than half assumption.

## Traceability chain

```
EV  →  P / G  →  EC  →  REQ  →  SCR (covers: [...])  →  code (data-req="REQ-…")
```

- Each REQ names the goals (G) or edge cases (EC) it serves.
- Each screen spec lists the REQs it covers in its frontmatter.
- Each generated element that satisfies a REQ carries `data-req="REQ-001"` (space-separated for several). Requirements in the **Quality** table (accessibility, contrast, design-system use) are the exception: they apply to the whole screen, so they are checked in `critique`, not by tags. Don't tag a wrapper element with them.

## Prototype

- Stack: React + TypeScript + Tailwind CSS + shadcn/ui, unless config.json says otherwise.
- Use only components, variants and tokens listed in design-system.md. If one is missing, add it
  to design-system.md first (and say so), then use it.
- Each screen accepts a `forceState` prop (`"loading" | "empty" | "error"`) so every state can be
  reviewed and screenshotted.
- The prototype is for review and handoff, not production. Developers rebuild from the spec.

## How the workflows fit together

| Kind | Workflows | Changes the spec? |
|---|---|---|
| Think | `explore` | No; writes only to `explore/` |
| Commit | `lock` (add new items), `change` (modify existing items with impact analysis) | Yes, after the designer confirms |
| Look | `view`, `next` | No |
| Make | `brief`, `research`, `users`, `journeys`, `requirements`, `ideate`, `structure`, `screen`, `generate`, `artefact`, `system` | Yes |
| Check | `critique`, `verify`, `rationale` | Writes reviews and reports; spec changes go through `change` |

`opendesign trace <ID>` shows everything linked to an ID; `view` and `change` use it.

## Working rules for agents

1. Read CONVENTIONS.md and config.json before any workflow.
2. Ask before inventing facts about users or the business. When you must assume, tag it `[assumed]`.
3. When generation reveals a gap in the spec, stop and add it to the spec (new REQ or Q) instead of
   silently deciding in code.
4. Keep files in the formats shown in the templates; `opendesign verify` parses them.
5. End every workflow by telling the designer what changed and which workflow comes next.
