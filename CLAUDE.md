# CLAUDE.md — developing OpenDesign

This file is for working on the OpenDesign tool itself. (It is not the `CLAUDE.md` block that
`opendesign init` writes into users' design projects.)

## What this is

OpenDesign is spec-driven UX for AI coding agents, modelled on OpenSpec. A designer keeps a
versioned Markdown spec in `opendesign/` (brief, evidence, personas, journeys, requirements,
design system, concepts, decisions, IA, flows, screen specs), and the coding agent generates
React prototypes from it. Every generated element that satisfies a requirement carries
`data-req="REQ-…"`, and `opendesign verify` checks the chain mechanically.

The agent does the thinking and writing (via workflow instructions installed as skills and slash
commands). The CLI sets up the spec, installs those instructions, and checks the result.

- Published on npm as `@conzept-sparx/opendesign` (0.1.0). Public repo: github.com/Conzept-Sparx/opendesign. MIT.
- Status: preview. The workflows have NOT yet been run end to end inside a real agent session.

## Layout

```
src/            TypeScript CLI (compiled to dist/, CommonJS, no runtime dependencies)
  cli.ts        argument parsing and command dispatch
  constants.ts  tool name, command prefix, spec folder name, version — rename the tool here
  agents.ts     renders workflows into skills, slash commands and the CLAUDE.md/AGENTS.md block
  init.ts       init and update (copies templates, writes config, refreshes tool-owned files)
  model.ts      parses a design project's spec files into a model (the parsing contract)
  verify.ts     checks on the model; writes verify-report.md
  trace.ts      `opendesign trace <ID>`: definition, upstream, downstream, code tags
  status.ts     project overview and suggested next workflow
  new.ts        scaffolds screen / flow / concept / evidence files
workflows/      one .md per agent workflow (frontmatter: id, title, description; body = instructions)
templates/      copied into a user's opendesign/ folder on init
scripts/smoke-test.mjs   end-to-end self-test (npm test)
docs/INSTALL.md          user installation guide
```

## How the pieces connect

- **Workflows → agents.** `agents.ts` reads `workflows/*.md` and writes, per tool:
  - Claude Code: `.claude/skills/opendesign-<id>/SKILL.md` and `.claude/commands/od/<id>.md` → `/od:<id>`
  - OpenCode: `.opencode/skills/opendesign-<id>/SKILL.md` and `.opencode/commands/od-<id>.md` → `/od-<id>`
  - Codex: `.codex/skills/opendesign-<id>/SKILL.md` only → `$opendesign-<id>`
  These paths follow OpenSpec's documented conventions. The display order of workflows is the
  `ORDER` array in `agents.ts`; add new workflow ids there.
- **Managed block.** `CLAUDE.md` / `AGENTS.md` in user projects get a block between
  `<!-- OPENDESIGN:START -->` and `<!-- OPENDESIGN:END -->`, replaced on every init/update.
- **Tool-owned files.** `CONVENTIONS.md` and `ARTEFACTS.md` are overwritten on init/update. All
  other spec files belong to the user: `copyMissing` never overwrites them.
- **Parsing contract.** `model.ts` relies on exact formats in the templates:
  - requirements: table rows `| REQ-001 | text | source | serves |`; questions `- Q1 …`
  - users: `## P1 — name`; goals `- G1 …`; evidence tags `` `[observed: EV-001]` ``, `` `[research: EV-001]` ``, `` `[assumed]` ``
  - journeys: edge cases `| EC-001 | … |`; decisions `| DEC-001 | … |`
  - screens: frontmatter `id`, `covers: [REQ-…]`, `code: path`
  - design-system: components `` `@/components/ui/x` ``; a `## Variants` table with `` `variant` `` in the second column
  - evidence files named `EV-001-*.md`; files starting with `_` are templates and ignored
  **If you change a template's format, update `model.ts` and the smoke test in the same change.**

## Commands

```bash
npm install          # installs dev deps and builds (prepare script)
npm run build        # tsc
npm test             # builds nothing; runs scripts/smoke-test.mjs against dist/
npm link             # use the local build as the global `opendesign` command
```

Try changes in a separate scratch folder (`mkdir /tmp/od-test && cd /tmp/od-test && opendesign init`).
**Never run `opendesign init` in this repo's root**: it would install the agent commands and a
managed block into the tool's own repository.

## Conventions

- Node 18+, TypeScript strict, CommonJS output, zero runtime dependencies. Keep it that way.
- User-facing text (CLI output, workflows, docs): plain, direct sentences; say what happened and
  what to do next. Workflows are instructions to an agent: numbered steps, explicit file formats,
  explicit "never" rules.
- Every behaviour change gets a check in `scripts/smoke-test.mjs`. The test builds its own fixture
  project in a temp folder; it must not depend on files outside the repo.
- When adding or renaming a workflow: add the file in `workflows/`, add the id to `ORDER`, update
  the README workflow table, the "How the workflows fit together" table in
  `templates/CONVENTIONS.md`, the CHANGELOG, and the smoke test's file checks.
- Never commit client or product material (screenshots, real specs). Demo material is kept in a
  separate private kit, outside this repo.

## Releasing

```bash
npm version patch            # or minor for new features; creates a commit and tag
git push --follow-tags
npm publish                  # prepublishOnly runs the tests; 2FA confirmation in the browser
```

A published version number can never be reused. Update `VERSION` in `src/constants.ts` to match
`package.json` before releasing (they are currently kept in sync by hand).

## Decisions so far (and why)

- **Prototype stack is React + TypeScript + Tailwind + shadcn/ui only.** One stack keeps generated
  output consistent; other stacks would be exports later.
- **Prototype is for review and handoff, not production.** Developers rebuild from the spec (it
  pairs with OpenSpec for the build).
- **The spec wins.** Refinement happens by changing the spec and regenerating, never by patching
  generated code silently. Gaps found during generation become new REQs or Qs.
- **Evidence tags are mandatory.** Proto-personas are honest about what's assumed; `verify` fails
  on citations to missing evidence and warns when a persona is over half assumption.
- **Design tools (Figma, Claude Design) were dropped as targets** in favour of code output, because
  coding agents share a file-based standard and code makes verification mechanical.
- **Codex gets skills only, no slash commands**, matching OpenSpec.
- **Package is scoped** (`@conzept-sparx/opendesign`) because the unscoped `opendesign` name is
  taken on npm. Installing straight from a git URL is not supported: npm skips dev dependencies in
  that mode, so the TypeScript build fails.
- **Command families:** think (`explore`), commit (`lock`, `change`), look (`view`, `next`),
  make (the rest), check (`critique`, `verify`, `rationale`). Only `lock` and `change` modify
  existing spec items, and only after the designer confirms.

## Open issues and next work

In rough priority order:

1. **Dry-run every workflow in Claude Code** on a real brief and fix what breaks. Highest priority
   before the designer sessions. `/od:generate` prototype scaffolding (Vite + Tailwind + shadcn) is
   the riskiest step.
2. **Name decision.** open-design.ai is an existing open-source project in the same space, and the
   unrelated npm package `opendesign` may install a clashing `opendesign` command. Renaming means
   changing `constants.ts`, `package.json` (`name`, `bin`), docs, and publishing a new package.
3. Deprecate the stray `0.0.0-stage` version on npm.
4. `verify`: screenshot every screen state with Playwright; a consistency score (generate the same
   spec several times and compare structure).
5. Accept `artifact` as an alias for the `artefact` workflow.
6. `status` doesn't yet count explore notes, wireframes or artefacts.
7. Variant detection in `model.ts` is a simple regex; it will miss variants set through objects
   or helpers.
8. Import tokens from Figma Variables / Tokens Studio exports into `design-system.md`.
9. More agents: Cursor, GitHub Copilot, Gemini CLI.
10. Windows: install and CLI behaviour are untested.
