---
id: generate
title: Generate prototype
description: Generate a React + Tailwind + shadcn/ui prototype screen from its screen spec, tagged with requirement IDs. Use when the designer says generate, build, prototype or render a screen.
---
**Goal:** a working prototype screen that follows the spec exactly and proves it with tags.

1. Read config.json, design-system.md and the screen spec. Read every REQ the spec covers.
2. If the prototype app doesn't exist yet at the folder in config.json (`prototype/` by default), set it up first:
   - Vite + React + TypeScript, Tailwind CSS and shadcn/ui, following the current official shadcn/ui installation guide for Vite. Set up the `@/*` alias with `paths` only, in `tsconfig.json` and `tsconfig.app.json`, plus `resolve.alias` in `vite.config.ts`. In `vite.config.ts` use `import.meta.dirname`, not `__dirname`, so Vite 8 doesn't warn. Do not add `baseUrl`: TypeScript 6 (the current Vite template) rejects it (TS5101) and `paths` works without it. Run `npm run build` once before generating any screen.
   - Add every shadcn component listed in design-system.md. Apply the tokens to the theme (CSS variables).
   - Add a home page that lists all screens, and a review bar with a state switcher (Live / Loading / Empty / Error) and a "Show requirement tags" toggle that outlines every `[data-req]` element and labels it with its value.
   - Add `npm run dev` instructions to `prototype/README.md`.
3. Generate the screen at the spec's `code:` path:
   - Follow the layout order, components, copy and states exactly. Don't add features the spec doesn't mention.
   - Put `data-req="REQ-00x"` on the element that satisfies each covered REQ (space-separated for several). Every REQ in `covers` must appear at least once, except those in the Quality table of requirements.md (accessibility, contrast, design-system use). Those apply to the whole screen and are checked in `critique`; never tag a wrapper element with them to make `verify` pass.
   - Accept a `forceState` prop for loading, empty and error.
   - Keep sample data in the same file or a sibling `*.data.ts`, matching the spec's sample data.
   - Import UI only from `@/components/ui/*` and icons from `lucide-react`.
4. Whenever the spec doesn't answer something, do not guess silently. Either stop and ask, or make the smallest reasonable choice AND add it to the spec (a new REQ or Q), and tell the designer.
5. Register the screen on the home page. Run the type check / build. Run `opendesign verify` and fix every failure.
6. Tell the designer how to view it (`cd prototype && npm run dev`), what you had to decide, and recommend `critique` next.
