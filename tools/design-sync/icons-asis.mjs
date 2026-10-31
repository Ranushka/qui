// usage: node icons-asis.mjs [icons-outlined.json]  -> icons-asis.json (item 9b3, user decision 2026-10-31)
// Tabler's own outline svg files exactly as drawn: 24x24 grid, 2px stroke. Only the class list (markup) and
// whitespace go. Penpot gets one "Icon" component with a Name variant per icon; size comes from resizing the instance. The files come from the @tabler/icons that
// @qui/ui's @tabler/icons-react depends on (same version, 3.50.0). Push: ./push.sh icons-asis.json icons-asis.js
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const names = JSON.parse(fs.readFileSync(process.argv[2] || path.join(HERE, "icons-outlined.json"), "utf8")).map((x) => x.icon);

// resolve @tabler/icons through @tabler/icons-react (pnpm keeps it as that package's own dependency)
const fromUi = createRequire(path.join(HERE, "../../packages/ui/package.json"));
const reactPkg = fromUi.resolve("@tabler/icons-react/package.json");
// (its exports map hides package.json, so take the sibling folder pnpm links next to icons-react)
const iconsPkg = path.join(fs.realpathSync(path.dirname(reactPkg)), "..", "icons", "package.json");
const version = JSON.parse(fs.readFileSync(iconsPkg, "utf8")).version;
const dir = path.join(path.dirname(iconsPkg), "icons", "outline");

const out = [];
for (const icon of names) {
  const src = fs.readFileSync(path.join(dir, icon + ".svg"), "utf8");
  if ((src.match(/stroke-width="2"/g) || []).length !== 1) throw new Error(icon + ": expected one root stroke-width=\"2\"");
  if (!src.includes('d="M0 0h24v24H0z"')) throw new Error(icon + ": no 24x24 box rect");
  const svg = src.replace(/\s*class="[^"]*"/, "").replace(/\s+/g, " ").replace(/> </g, "><").trim();
  out.push({ icon, svg });
}
fs.writeFileSync(path.join(HERE, "icons-asis.json"), JSON.stringify(out));
console.log(`@tabler/icons ${version}: ${out.length} svgs -> icons-asis.json`);
