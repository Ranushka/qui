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

Early scaffold. Built so far: `Button` (all 6 variants × 4 sizes, loading/disabled states),
`Spinner`, `Icon`, `QuiProvider` (direction + tooltip context).

Propel ships ~60 components; the rest are being ported incrementally, phased roughly:

1. **Atoms**: Button ✅, IconButton, Badge/Pill, Avatar(+Group), Input/TextArea/NumberField,
   Checkbox/Radio/Switch, Tooltip, Separator, Spinner ✅, Skeleton, Progress (circular/linear)
2. **Molecules**: Select/Combobox/Autocomplete, Menu/ContextMenu, Popover,
   Dialog/AlertDialog/Drawer, Tabs, Accordion, Breadcrumb, Pagination, Toast, Field wrappers
3. **Organisms**: Table, NavigationMenu, Toolbar, Calendar, Charts, virtualized List, Banner

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

**Repo state**: local git repo initialized, one commit so far (`aae6853`,
"Initial scaffold: tokens + Button, pixel-matching Plane's propel design
system"). Not yet pushed — no GitHub remote configured. To push to
`https://github.com/Ranushka/qui`:
1. Run `! gh auth login` yourself (Claude won't handle credentials).
2. Then: `gh repo create Ranushka/qui --private --source=. --remote=origin --push`
   (or create it empty on GitHub first and `git remote add origin ... && git push -u origin main`).

**Verified working**: `packages/tokens` (real propel OKLCH tokens, comments
stripped, font family switched to `"Inter"` for Google Fonts) builds to
`dist/tokens.css`. `packages/ui`'s `Button` (6 variants × 4 sizes,
loading/disabled) renders pixel-correct against Plane's real button chrome —
confirmed via a live `apps/playground` render in Chrome, zero console errors,
checked twice.

**Known broken / not yet done**:
- `apps/playground/package.json`'s `predev`/`prebuild` scripts reference
  `scripts/generate-components-page.mjs`, which **does not exist yet** — this
  breaks the normal `pnpm --filter playground dev` / `pnpm build` flow with
  `MODULE_NOT_FOUND`. It needs to be ported from
  `~/projects/atsak/apps/playground/scripts/generate-components-page.mjs`
  (adapt away the `QDS`/`Finance` namespace split — qui only has one
  `packages/ui`, not a separate finance-ui package). Until it's ported, run
  the playground directly with `npx vite --port 5174` from
  `apps/playground/`, bypassing the lifecycle hook.
- No `__DOC` / `__DOC_BLOCK` comment annotations added to `Button.tsx` yet
  (needed once the gallery generator above exists).
- Everything past Button in the Phase 1 atoms list above is still unbuilt:
  IconButton, Badge/Pill, Avatar(+Group), Input/TextArea/NumberField,
  Checkbox/Radio/Switch, Tooltip, Separator, Skeleton, Progress. Then Phase 2
  (molecules) and Phase 3 (organisms).

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
