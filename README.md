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
