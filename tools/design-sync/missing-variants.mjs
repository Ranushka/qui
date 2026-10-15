// usage: node missing-variants.mjs store-<spec sheet>.json [store-<screen>.json ...]
// Lists every nested component instance (in spec cells and screens) whose variant is not one of its set's variants —
// the combinations the app actually renders that the one-property-at-a-time rule left out. Add them as `extras`.
import fs from "node:fs";
const [specFile, ...screens] = process.argv.slice(2);
const sheet = JSON.parse(fs.readFileSync(specFile, "utf8"));
const have = {};
for (const c of sheet.cells) (have[c.spec] = have[c.spec] || new Set()).add(JSON.stringify(c.v));
const miss = {};
const walk = (n, where, top) => {
  if (!n) return;
  if (!top && n.t === "el" && n.comp && n.variant && n.inst !== false && have[n.comp]) {
    const k = JSON.stringify(n.variant);
    if (!have[n.comp].has(k)) { const m = (miss[n.comp] = miss[n.comp] || {}); (m[k] = m[k] || new Set()).add(where); }
  }
  (n.ch || []).forEach((c) => walk(c, where, false));
};
sheet.cells.forEach((c) => walk(c.tree, c.spec, true));
for (const f of screens) { const d = JSON.parse(fs.readFileSync(f, "utf8")); walk(d.tree, f.replace(/^store-|\.json$/g, ""), false); }
for (const [comp, m] of Object.entries(miss)) {
  console.log(comp);
  for (const [k, w] of Object.entries(m)) console.log("   ", k, "<-", [...w].join(","));
}
