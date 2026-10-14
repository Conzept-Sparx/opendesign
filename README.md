# OpenDesign

**Spec-driven UX for AI coding agents.** Brainstorm a brief, gather evidence, define users, journeys and requirements, then generate React prototypes that trace every element back to a requirement.

OpenDesign does for UX what [OpenSpec](https://github.com/Fission-AI/OpenSpec) does for code: it puts a lightweight, versioned spec in your repo so you and your AI agent agree on *what* to design and *why* before anything is built. The agent does the thinking and writing. The CLI sets up the spec, wires the agent commands and checks the result.

```
brief → research → users → journeys → requirements → ideate → structure → screen → generate → critique → verify → rationale
              explore ⇄ lock at any step · view and trace any time · change with impact analysis
```

> **Status: 0.1 preview.** The workflow and file formats may still change.

## Why

AI tools generate screens that look finished but only cover the happy path, ignore the design system and can't explain why anything is there. OpenDesign fixes that at the source:

- **Evidence you can see.** Every claim about users is tagged `[observed]`, `[research]` or `[assumed]` and cites its source. Proto-personas show how much is actually known.
- **Requirements with permanent IDs.** Each requirement names the user goal or edge case it serves.
- **Screen specs precise enough to repeat.** Layout, components, copy, states and sample data, so different agents build structurally the same screen.
- **Your design system, enforced.** Generated code may only use the components and variants you list.
- **Traceability that's tested, not claimed.** Every generated element that satisfies a requirement carries `data-req="REQ-007"`; `opendesign verify` fails when a requirement is missing.

## How it works

| Layer | What it is |
|---|---|
| `opendesign/` folder | Markdown spec files: brief, evidence, users, journeys, requirements, design system, concepts, decisions, IA, flows, screens, critiques, rationale |
| Agent workflows | Skills and slash commands installed into Claude Code, Codex and OpenCode |
| Prototype | React + TypeScript + Tailwind + shadcn/ui, generated from screen specs |
| CLI | `init`, `update`, `status`, `verify`, `new` |

The prototype is for review and handoff, not production. Developers rebuild from the spec with their own tools (it pairs well with OpenSpec for the build).

## Install

Requires Node.js 18+ and at least one of Claude Code, Codex or OpenCode. Full step-by-step guide, including installing the agents and troubleshooting: [docs/INSTALL.md](docs/INSTALL.md).

```bash
# Until the package is published, install from source:
git clone <repo-url> opendesign && cd opendesign
npm install && npm run build && npm link
opendesign --version
```

## Quick start

```bash
cd your-project
opendesign init                        # all three agents; or --tools claude
```

Then, in your coding agent:

```
/od:next                               # Claude Code: where are we, what's next?
/od:explore <paste the client brief>   # brainstorm before committing to anything
/od:lock                               # add what you agreed to the spec
/od:brief                              # write up the brief properly
/od:artefact wireframes SCR-checkout   # any artefact by name
/od:view REQ-006                       # why does this requirement exist, and where is it used?
```

| Workflow | Claude Code | OpenCode | Codex | What it does |
|---|---|---|---|---|
| Next step | `/od:next` | `/od-next` | `$opendesign-next` | Status and the recommended next workflow |
| Explore | `/od:explore` | `/od-explore` | `$opendesign-explore` | Brainstorm a brief, requirement or problem with a thinking partner; writes only scratch notes |
| Lock | `/od:lock` | `/od-lock` | `$opendesign-lock` | Add agreed ideas to the spec as numbered, traceable items, after you confirm |
| View | `/od:view` | `/od-view` | `$opendesign-view` | Read-only overview of the spec, one artefact, or one ID and everything linked to it |
| Change | `/od:change` | `/od-change` | `$opendesign-change` | Change a locked item and update everything that depends on it |
| Artefact | `/od:artefact` | `/od-artefact` | `$opendesign-artefact` | Create any artefact by name: wireframes, empathy map, user stories, test plan… |
| Design system | `/od:system` | `/od-system` | `$opendesign-system` | Capture tokens, components, variants, patterns |
| Brief analysis | `/od:brief` | `/od-brief` | `$opendesign-brief` | Brainstorm the brief; expose assumptions and questions |
| Research | `/od:research` | `/od-research` | `$opendesign-research` | Plan research; log evidence as EV files |
| Users | `/od:users` | `/od-users` | `$opendesign-users` | Users, goals and evidence-tagged proto-personas |
| Journeys | `/od:journeys` | `/od-journeys` | `$opendesign-journeys` | Journey maps and systematic edge-case analysis |
| Requirements | `/od:requirements` | `/od-requirements` | `$opendesign-requirements` | Traceable UX requirements |
| Ideate | `/od:ideate` | `/od-ideate` | `$opendesign-ideate` | Divergent concepts and comparative evaluation |
| Structure | `/od:structure` | `/od-structure` | `$opendesign-structure` | Information architecture and interaction flows |
| Screen | `/od:screen` | `/od-screen` | `$opendesign-screen` | Screen specs a generator can follow exactly |
| Generate | `/od:generate` | `/od-generate` | `$opendesign-generate` | React prototype with requirement tags |
| Critique | `/od:critique` | `/od-critique` | `$opendesign-critique` | Severity-rated critique; refine through the spec |
| Verify | `/od:verify` | `/od-verify` | `$opendesign-verify` | Run and explain `opendesign verify` |
| Rationale | `/od:rationale` | `/od-rationale` | `$opendesign-rationale` | Stakeholder-facing design rationale |

## CLI

```
opendesign init [--tools claude,codex,opencode] [--name <project>] [--prototype <dir>]
opendesign update [--tools ...]     refresh agent files and CONVENTIONS.md; never touches your spec
opendesign status                   what exists, what's thin, what's next
opendesign verify [--json]          traceability, design system and evidence checks
opendesign trace <ID>               everything linked to an ID: what it serves, where it's used, code tags
opendesign new screen|flow|concept|evidence <slug>
opendesign workflows                list the agent workflows
```

`verify` writes `opendesign/verify-report.md` and exits non-zero on failures, so it can run in CI.

| Check | Fails when | Warns when |
|---|---|---|
| Traceability | a screen covers an unknown REQ; a covered REQ isn't tagged in its code; code tags an unknown REQ; duplicate IDs | a REQ isn't in any screen; a REQ serves no goal or edge case; an edge case has no REQ |
| Design system | code imports a component not in design-system.md | code uses a variant not in design-system.md |
| Evidence | a tag cites an EV file that doesn't exist | a persona is more than half assumption |

## Artefacts

Each workflow writes Markdown into `opendesign/`; `generate` writes React into `prototype/`. Beyond the core spec files, `/od:artefact <name>` creates around 25 more from a catalogue (`opendesign/ARTEFACTS.md`): wireframes, empathy maps, jobs to be done, user stories, storyboards, service blueprints, stakeholder maps, interview guides, surveys, competitive analyses, design principles, task analyses, UX copy decks, accessibility audits, usability test plans and more. Wireframes are self-contained greyscale HTML files, one per screen, with every state and numbered annotations linked to requirements.

## What gets installed

```
opendesign/                          your spec (commit this)
.claude/skills/opendesign-*/         Claude Code skills
.claude/commands/od/*.md             Claude Code slash commands
.codex/skills/opendesign-*/          Codex skills
.opencode/skills/opendesign-*/       OpenCode skills
.opencode/commands/od-*.md           OpenCode commands
CLAUDE.md, AGENTS.md                 a managed block pointing agents at the spec
```

## Roadmap

- Screenshot every screen state with Playwright as part of `verify`
- Consistency score: generate the same spec several times and compare structure
- Import tokens from Figma Variables / Tokens Studio exports
- More agents (Cursor, GitHub Copilot, Gemini CLI)

## License

MIT
