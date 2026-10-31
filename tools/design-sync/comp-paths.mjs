// Scans packages/ui/src/{atoms,molecules,organisms} for exported React components and writes comp-paths.json:
// { "<Component>": { level: "Atoms|Molecules|Organisms", file: "<File>" } }. The builder reads it (pushed as
// comp-paths.js) to pick each set's page and its component path: "<Level> / <Component>" when the file holds only that
// component, else "<Level> / <File> / <Component>" (B.folderOf in builder2.js).
// usage: node comp-paths.mjs  (from tools/design-sync)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "../../packages/ui/src");
const LEVELS = { atoms: "Atoms", molecules: "Molecules", organisms: "Organisms" };
const out = {};
for (const [dir, level] of Object.entries(LEVELS)) {
  for (const f of readdirSync(join(src, dir)).filter((x) => /^[A-Z].*\.tsx$/.test(x)).sort()) {
    const file = f.replace(/\.tsx$/, "");
    const code = readFileSync(join(src, dir, f), "utf8");
    // `export const X = …` / `export function X(` with a PascalCase name; skips CONSTANTS and contexts
    for (const m of code.matchAll(/^export\s+(?:default\s+)?(?:const|function)\s+([A-Z][A-Za-z0-9]*)\b/gm)) {
      const name = m[1];
      if (/^[A-Z0-9_]+$/.test(name) || /Context$/.test(name)) continue;
      if (out[name] && out[name].file !== file) console.warn(`duplicate ${name}: ${out[name].level}/${out[name].file} and ${level}/${file}`);
      out[name] = { level, file };
    }
  }
}
writeFileSync(join(here, "comp-paths.json"), JSON.stringify(out, null, 1) + "\n");
console.log(Object.keys(out).length + " components → comp-paths.json");
