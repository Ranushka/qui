# design-sync (code -> Penpot)

Generates the Penpot component library and example screens from what the qui code actually renders, so design and
code cannot drift. Local tooling, not part of the published packages.

## How it works
1. **Spec sheet** (`apps/playground/src/spec`, route `#/spec`): every component rendered in every variant and state
   (hover / focus / pressed are forced through cloned CSS rules). Each cell is tagged `data-spec` / `data-v`.
2. **extract2.js** walks the rendered DOM and records the element tree with real layout rules (flex direction, gap, padding,
   alignment), how each element sizes itself (fix / hug / fill), paint (fills, borders, radius, shadows), text lines and svg
   icons, plus the qui component and variant each element is (read from React fibers via each spec's `toVariant`).
3. **builder2.js** (runs inside Penpot through the MCP `execute_code`) rebuilds that tree as auto-layout boards, creates one
   icon component per (lucide name, size) on the `Icons` page, turns each spec into a Penpot variant set, and builds screens
   from instances of those sets with text / icon / colour overrides. Every shape's geometry is read back and compared with the
   browser's (`B.check` / `B.libCheck`).

## Running it
- `node server.mjs` starts a CORS relay on :8777; run extract2.js in the page with `window.__x2 = { key, cells | root, comps }`.
- Penpot's plugin can only fetch its own origin: `push.sh <file> <name.js>` copies a file into the penpot-frontend container
  (`/var/www/app/qui-tmp/`); delete that folder when finished.
- Penpot only relayouts on geometry changes: boards are built bottom-up, then the root is nudged once (`B.poke`).
- Build each component on its own fresh page; large pages make shape creation crawl. Keep the Penpot tab focused and avoid
  switching tabs while building or the plugin connection drops (restart `penpot-mcp`, reload, click MCP > Connect).
