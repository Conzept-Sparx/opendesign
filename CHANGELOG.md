# Changelog

## 0.1.1 — 2026-10-14
Fixes from a dry run of every workflow on a synthetic brief.
- `generate`: set up the `@/*` alias with `paths` only (TypeScript 6 rejects `baseUrl`), use `import.meta.dirname` in the Vite config, run a build before generating.
- `verify`: design-system variants are checked per component (`Button variant="secondary"` is flagged when only Badge lists it) and are read inside JSX expressions.
- `verify`: warns when a screen still covers a retired REQ, mentions a REQ it doesn't list in `covers`, or names a flow or pattern that doesn't exist.
- `verify`: Quality requirements are no longer proven by tags (a tag on a wrapper proved nothing); they are checked in `critique`.
- `new screen` fills `flow` and `pattern` when there is exactly one, or from `--flow` and `--pattern`.
- `trace` shows what a decision affects, and a persona's goals, serving requirements and screens.
- `status` counts critiques, rationale, explore notes, wireframes and artefacts, and no longer suggests `critique` after one exists.
- `screen` workflow: every conditional element needs its own state row.

## 0.1.0 — 2026-10-14 (preview, not yet published)
- `opendesign init`, `update`, `status`, `verify`, `trace`, `new`, `workflows`.
- 19 agent workflows for Claude Code, Codex and OpenCode: next, explore, lock, view, change, artefact, system, brief, research, users, journeys, requirements, ideate, structure, screen, generate, critique, verify, rationale.
- Artefact catalogue (ARTEFACTS.md) with about 25 artefact types, including low-fidelity HTML wireframes.
- Templates for every artifact, with permanent IDs and evidence tags.
- `verify` checks requirement coverage in specs and code (`data-req`), design-system compliance, evidence citations and persona evidence share.
