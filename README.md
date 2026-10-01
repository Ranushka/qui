# qui

A reusable, atomic-design React component library, built to visually and behaviorally match
[Plane](https://github.com/makeplane/plane)'s design system — pixel-for-pixel where feasible —
for use across other projects.

## On matching Plane's design

Plane's own UI (both the `plane` monorepo and its published component library,
[`@makeplane/propel`](https://www.npmjs.com/package/@makeplane/propel)) is licensed
**AGPL-3.0**, which is copyleft: shipping their source in a library used by other (closed)
projects would carry that obligation forward.

**qui does not depend on or embed propel's source code.** It's an independent implementation
under its own license, built by:

- Extracting propel's **design tokens** (colors as OKLCH values, spacing, radii, shadows, motion
  curves) from the published npm package — functional design data, not copyrightable expression —
  into `packages/tokens`.
- Writing qui's own component implementations against those tokens (Base UI + Tailwind CSS v4 +
  class-variance-authority — the same stack propel uses), referencing propel's compiled output to
  match its exact class composition and behavior, but authored fresh.

This is the same approach [`atsak`](https://github.com/Ranushka/atsak) (Qashio's design system)
takes toward its own reference designs.

## Structure

```
qui/
├── packages/
│   ├── tokens/   — design tokens (OKLCH palette, spacing, radii, shadows, motion), extracted from propel
│   └── ui/       — the component library: Base UI + Tailwind v4 + CVA, atoms/molecules/organisms
└── apps/
    └── playground/ — component gallery
```

## Status

**Phases 1 and 2 are complete**, and Phase 3 has begun — 37 components total. A components gallery (`apps/playground`,
auto-generated from `__DOC` comments in each component's source — see below) renders all of them,
each with a props panel listing its options (from a matching `__PROPS` comment).

Propel ships ~60 components; the rest are being ported incrementally, phased roughly:

1. **Atoms** — done ✅: Button, IconButton, Badge, Pill, Avatar(+Group), Tooltip, Separator,
   Spinner, Icon, Input, TextArea, NumberField, Checkbox, Radio(+Group), Switch, Skeleton,
   CircularProgress, LinearProgress
2. **Molecules** — done ✅: Field, Breadcrumb, Pagination, Tabs, Accordion, Popover, Menu,
   ContextMenu, Select, Combobox, Autocomplete, Dialog, AlertDialog, Drawer, Toast
3. **Organisms** (in progress — Table, Banner done ✅): NavigationMenu, Toolbar, Calendar, Charts, virtualized List

## Refreshing tokens from a newer propel release

```bash
npm pack @makeplane/propel
tar xzf makeplane-propel-*.tgz
# strip comments from package/dist/styles/{variables,animations}.css, diff against
# packages/tokens/src/ before replacing
```

## Development

```bash
pnpm install
pnpm build            # builds packages/*
pnpm --filter playground dev
```

## Session progress / restart notes (as of 2026-09-30)

**Repo state**: local git repo, commits so far:
- `aae6853` — initial scaffold: tokens + Button
- `04f1b5e` — this restart-notes section
- `0f6ea1a` — ported `generate-components-page.mjs` from atsak (see below); added `__DOC` blocks
- `48575c5` — added `Tooltip` and `IconButton` atoms, extracted shared `lib/control-chrome.ts`

Not yet pushed — no GitHub remote configured. To push to `https://github.com/Ranushka/qui`:
1. Run `! gh auth login` yourself (Claude won't handle credentials).
2. Then: `gh repo create Ranushka/qui --private --source=. --remote=origin --push`
   (or create it empty on GitHub first and `git remote add origin ... && git push -u origin main`).

**Verified working**:
- `packages/tokens` (real propel OKLCH tokens, comments stripped, font family switched to
  `"Inter"` for Google Fonts) builds to `dist/tokens.css`.
- `packages/ui`'s `Button`, `IconButton`, `Icon`, `Spinner`, `Tooltip` all render pixel-correct
  against Plane's real chrome — confirmed via a live `apps/playground` render in Chrome, zero
  console errors. Tooltip's hover-open/positioning verified too (Base UI's `restMs`-based open
  delay is ~600ms — don't assume a tooltip failed to appear from a screenshot taken sooner than
  that after hovering).
- The full `apps/playground` lifecycle now works end-to-end: `pnpm --filter playground dev` /
  `build` runs `predev`/`prebuild` → `scripts/generate-components-page.mjs` → regenerates
  `src/pages/ComponentsPage.tsx` from every `__DOC`/`__DOC_BLOCK` comment found in
  `packages/ui/src/{atoms,molecules,organisms}` → `vite dev`/`build`. This was previously broken
  (see below) and is now fixed and committed.
- For a public preview, the playground dev server can be tunneled with `ngrok http 5174`; its
  `vite.config.ts` already has `server.allowedHosts: [".ngrok-free.app"]` so ngrok's dynamic
  hostnames aren't blocked by Vite's host check.
- Each demo can also show a props panel: add a `__PROPS {...} PROPS__` comment next to the
  `__DOC` block, a JSON object mapping prop name → either an array of accepted literal values or
  the string `"boolean"`. The generator renders it as a table beside the demo. All 35 current
  components have one; add one to every new component going forward. A file defining several
  components (e.g. `Menu.tsx`) can key its block with `"ComponentName.propName"` when one flat
  namespace would be ambiguous — see `Menu.tsx`'s `__PROPS` block for the pattern.

**Known not yet done**:
- Phases 1 and 2 (atoms + molecules) are complete. Next up is Phase 3 (organisms): Table,
  NavigationMenu, Toolbar, Calendar, Charts, virtualized List, Banner.
- The 15 molecules (`Field`, `Breadcrumb`, `Pagination`, `Tabs`, `Accordion`, `Popover`, `Menu`,
  `ContextMenu`, `Select`, `Combobox`, `Autocomplete`, `Dialog`, `AlertDialog`, `Drawer`, `Toast`)
  were built via 5 parallel subagents plus `Popover` built directly — each is solid (typechecked,
  built, and click-verified with zero console errors in Chrome), but they haven't had the same
  multi-session real-world usage the atoms have. Watch for rough edges as they get used.
- `@makeplane/propel`'s compiled npm package (`npm pack @makeplane/propel && tar xzf ...`) is the
  fastest way to check a component's real class composition/behavior before writing qui's own
  version — e.g. `dist/elements/<name>/variants.js` for the cva shape, `dist/components/<name>/
  <name>.js` for how the ready-made composes elements. Re-pack fresh each session; nothing from
  it is kept in the repo (AGPL — see licensing note above).

**Licensing approach to keep following** (already applied to tokens/Button):
extract propel's design **token values** only (colors, spacing, radii,
shadows, motion — not copyrightable), then hand-write each component's
implementation against those tokens using Base UI + Tailwind v4 + CVA,
referencing propel's compiled/minified output only to match exact class
composition and behavior — never copying its literal source. This avoids
inheriting propel/Plane's AGPL-3.0 copyleft.

**Separate, unrelated open item** (in the `atsak` repo, not this one): the
user flagged `atsak`'s DataTable as "very bad, needs a lot of work" but
declined to specify what, and asked to stop and wait rather than be asked
clarifying questions. No further detail has been given — pick this up only
once the user specifies what's wrong.
