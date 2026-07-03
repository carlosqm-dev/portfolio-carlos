# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

`AGENTS.md` is the entry index. The authoritative docs live in `docs/` and **must be read before implementing**:

- `docs/DECISIONS.md` — 10 ADRs (architecture, data, i18n, icons, diagrams, structure). No change may contradict an ADR without updating it first.
- `docs/DESIGN.md` — design system: color/typography rules by role (not a token dump — explains _why_ and _when_).
- `docs/CONTEXT.md` — goal, value proposition, tone. Read before proposing copy or UI wording.

When code implements a documented decision, reference it inline: `// Ver ADR-003`.

## Commands

```bash
pnpm dev              # Astro dev server
pnpm build            # static build
pnpm preview          # serve the built site
pnpm diagrams         # regenerate Mermaid SVGs from content into public/diagrams/
pnpm format           # prettier --write .
pnpm format:check     # prettier --check .
```

No test runner is configured. Correctness is enforced at build time by Zod schema validation (a missing required field fails `pnpm build`, not the UI).

## Architecture

Static Astro 7 site (pnpm, deploy Vercel). Zero runtime JS by default; no UI framework, no SSR. Bilingual ES/EN. Path alias `@/*` → `src/*`.

Data flows one direction: **`content/` (Zod-validated) → `features/` → rendered UI**. `components/ui/` are shared primitives that never know about content. `features/` consume `content/` and `components/ui/`, never the reverse.

Key invariants (full rationale in the ADRs):

- **Zero hardcoding (ADR-002).** Every visible string, link, or datum lives in a `src/content/` collection validated by Zod. UI-chrome strings (nav labels, "Más información →", "email copiado!!") go in the `ui` collection. Components only consume via `getCollection()`/`getEntry()`.
- **Bilingual (ADR-003).** Every text field uses the `{ es, en }` shape (`localized` helper in `src/content.config.ts` — the single source of that shape). Render it exclusively through `src/components/ui/T.astro`; never access `.es`/`.en` directly in a component. Both languages ship in the HTML; visibility is toggled **only by CSS** (`html[data-lang='en'] [data-lang='es'] { display:none }`) — never the `hidden` attribute. An inline `<head>` script sets `data-lang` before first paint to avoid a language flash.
- **Types from Zod.** Derive with `z.infer` / `CollectionEntry<'…'>`; never hand-duplicate a schema type.
- **Icons (ADR-005).** `astro-icon` only: `<Icon name="simple-icons:x" />` or `<Icon name="local:x" />` (SVGs in `src/icons/`). Never PNG, never a runtime CDN.
- **Diagrams (ADR-007).** Each project stores one direction-less Mermaid string in its collection entry. `pnpm diagrams` generates `{slug}-desktop.svg` (LR) and `{slug}-mobile.svg` (TB) into `public/diagrams/`, which are committed. If you edit a Mermaid string, run `pnpm diagrams` before committing.
- **Color by role (DESIGN.md).** Never pick a color by eye. Identify the element's role; the role carries its token. Tokens live in `src/styles/global.css` `@theme` (exposed as Tailwind 4 utilities like `bg-surface`, `text-text-primary`). A missing role means a missing token, not a new color.

Client scripts (`src/scripts/`) are vanilla, minimal, single-responsibility: the language toggle does not touch the menu; the menu does not copy email.

## Conventions

- Astro components `PascalCase.astro`; scripts/utilities `kebab-case.ts`; collection data `kebab-case.json`; local icons `kebab-case.svg`. A project's data filename is its slug (`gestor-cotizaciones.json` → `/proyectos/gestor-cotizaciones`).
- Comments in Spanish, only where the code doesn't explain itself (non-obvious decisions, workarounds, invariants). Never comment the obvious.
- One component per file; decompose growth within the feature, not into one giant file. Prefer early return over nesting.

## Current state & build order

Scaffolded: `content.config.ts` (schemas), bilingual system (`T.astro`, `global.css`, `lang-toggle.ts`), `Icon.astro`, `BaseLayout.astro`, `hamburger.ts`, `pages/index.astro`. The `features/` and `src/content/` data files are largely not yet built. Follow the build order in `docs/DECISIONS.md` (bilingual system → Header/Hero → Stack → Projects → Experience/About → polish). Out of scope for the MVP: blog, secondary-language SEO, i18n routes, backend/contact forms.
