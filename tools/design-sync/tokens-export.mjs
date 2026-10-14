// Reads packages/tokens/src/variables.css and writes tokens.json: the colour tokens as Penpot token sets.
//   primitives-light / primitives-dark : literal OKLCH palettes (neutral, brand, blue, ... ) as hex
//   semantic                           : bg-*, txt-*, border-*, label-* ... as {references} to primitives
//   semantic-dark                      : only the semantic tokens the dark theme re-points
// Token names group on the first hyphen (bg-layer-2 -> bg.layer-2); palette steps use a dot (neutral-200 -> neutral.200).
import fs from "node:fs";
const css = fs.readFileSync(new URL("../../packages/tokens/src/variables.css", import.meta.url), "utf8");
const i = css.indexOf("@variant dark {");
const base = css.slice(css.indexOf(":root"), i);
const rest = css.slice(i + "@variant dark {".length);
// dark block ends at the first line that is only "    }"
const dark = rest.slice(0, rest.search(/\n    }\n/));
const decls = (t) => { const o = {}; for (const m of t.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)) o[m[1].slice(2)] = m[2].trim(); return o; };
const B = decls(base), D = decls(dark);

const lin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const oklch = (s) => {
  const m = s.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/); if (!m) return null;
  const L = +m[1] / (m[2] ? 100 : 1), C = +m[3], h = (+m[4] * Math.PI) / 180, A = m[5] === undefined ? 1 : +m[5] / (m[6] ? 100 : 1);
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, ss = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss, g = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss, bl = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * ss;
  const hx = (v) => Math.round(Math.max(0, Math.min(1, lin(v))) * 255).toString(16).padStart(2, "0");
  return "#" + hx(r) + hx(g) + hx(bl) + (A < 1 ? Math.round(A * 255).toString(16).padStart(2, "0") : "");
};
const isPrim = (n) => B[n] !== undefined ? !/^var\(/.test(B[n]) : D[n] !== undefined && !/^var\(/.test(D[n]);
const tname = (n) => { if (isPrim(n) && /^(.*)-(\d+)$/.test(n)) return n.replace(/-(\d+)$/, ".$1"); return n.replace("-", "."); };
const lit = (v) => (v === "transparent" ? "#00000000" : oklch(v));
const val = (v) => { const m = v.match(/^var\(--([a-z0-9-]+)\)$/); if (m) return "{" + tname(m[1]) + "}"; return lit(v); };
const out = { "primitives-light": {}, "primitives-dark": {}, semantic: {}, "semantic-dark": {} };
const skip = [];
for (const [n, v] of Object.entries(B)) { const x = val(v); if (!x) { skip.push(n + "=" + v); continue; } (isPrim(n) ? out["primitives-light"] : out.semantic)[tname(n)] = x; }
for (const [n, v] of Object.entries(D)) { const x = val(v); if (!x) { skip.push("dark:" + n + "=" + v); continue; } (isPrim(n) ? out["primitives-dark"] : out["semantic-dark"])[tname(n)] = x; }
fs.writeFileSync(new URL("./tokens.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Object.keys(v).length])), "skipped:", skip.length, skip.slice(0, 8));
