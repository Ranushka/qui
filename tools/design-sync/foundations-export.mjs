// Reads packages/tokens/src/variables.css (+ tokens.json from tokens-export.mjs) and writes foundations.json: everything the
// Penpot Foundations page needs besides colours — spacing / radius / border-width / font-size / font-weight scales,
// the text styles (h1-h6, body-*, caption-* x weight) and the shadow scale.
//   usage: node tokens-export.mjs && node foundations-export.mjs && ./push.sh foundations.json foundations-data.js
import fs from "node:fs";
const css = fs.readFileSync(new URL("../../packages/tokens/src/variables.css", import.meta.url), "utf8");
const decls = {};
for (const m of css.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)) if (!(m[1].slice(2) in decls)) decls[m[1].slice(2)] = m[2].replace(/\s+/g, " ").trim();
const px = (v) => (v.endsWith("rem") ? parseFloat(v) * 16 : parseFloat(v));
const resolve = (v) => { const m = v && v.match(/^var\(--([a-z0-9-]+)\)$/); return m ? resolve(decls[m[1]]) : v; };

const core = {
  // Tailwind's spacing step is 0.25rem; qui uses the 4px scale everywhere
  // plus Tailwind's 1px step (p-px / gap-px), used by Switch, NumberField and ProjectHeader
  spacing: { "space.px": "1", ...Object.fromEntries([0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => ["space." + String(n).replace(".", "_"), String(n * 4)])) },
  // Tailwind v4 defaults plus qui's --radius-3xl
  radius: { "radius.xs": "2", "radius.sm": "4", "radius.md": "6", "radius.lg": "8", "radius.xl": "12", "radius.2xl": "16", "radius.3xl": String(px(decls["radius-3xl"])), "radius.full": "9999" },
  borderWidth: Object.fromEntries(Object.entries(decls).filter(([k]) => /^border-width-/.test(k)).map(([k, v]) => ["border-width." + k.slice(13), String(px(v))])),
  fontSizes: Object.fromEntries(Object.entries(decls).filter(([k]) => /^text-\d+$/.test(k)).map(([k, v]) => ["font-size." + k.slice(5), String(px(v))])),
  fontWeights: Object.fromEntries(Object.entries(decls).filter(([k]) => /^font-weight-/.test(k)).map(([k, v]) => ["font-weight." + k.slice(12), v])),
  control: Object.fromEntries(Object.entries(decls).filter(([k]) => /^control-(height|padding-x|gap|radius|glyph)-/.test(k)).map(([k, v]) => [k.replace(/^control-([a-z]+(?:-x)?)-/, "control.$1."), String(px(v))])),
};

// text styles: every --text-<role>-<weight> with its line-height / letter-spacing / font-weight companions
const typo = [];
for (const [k, v] of Object.entries(decls)) {
  const m = k.match(/^text-((?:h\d)|(?:body|caption)-[0-9a-z]+)-(regular|medium|semibold|bold)$/); if (!m) continue;
  const size = px(resolve(v)); const lh = parseFloat(decls[k + "--line-height"] || "1.2");
  const ls = resolve(decls[k + "--letter-spacing"] || "0em"); const fw = resolve(decls[k + "--font-weight"] || "400");
  typo.push({ role: m[1], weight: m[2], size, lh, ls: parseFloat(ls) * size, fw: Number(fw) });
}
const order = (r) => (r[0] === "h" ? 0 : r.startsWith("body") ? 1 : 2);
const sz = ["3xs", "2xs", "xs", "sm", "md", "lg"];
typo.sort((a, b) => order(a.role) - order(b.role) || (a.role[0] === "h" ? a.role.localeCompare(b.role) : sz.indexOf(b.role.split("-")[1]) - sz.indexOf(a.role.split("-")[1])) || a.fw - b.fw);

// shadows: each layer parsed from "x y blur spread rgb(r g b / a)"
const shadows = {};
for (const [k, v] of Object.entries(decls)) {
  if (!/^shadow-(raised|overlay|direction)-/.test(k)) continue;
  shadows[k.slice(7)] = v.split(/,(?![^(]*\))/).map((l) => {
    const m = l.trim().match(/^(-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
    if (!m) throw new Error("shadow " + k + ": " + l);
    const hex = "#" + [m[5], m[6], m[7]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
    return { x: +m[1], y: +m[2], blur: +m[3], spread: +m[4], color: hex, opacity: +m[8] };
  });
}
const colors = JSON.parse(fs.readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
fs.writeFileSync(new URL("./foundations.json", import.meta.url), JSON.stringify({ colors, core, typo, shadows }));
console.log(Object.fromEntries(Object.entries(core).map(([k, v]) => [k, Object.keys(v).length])), "typo", typo.length, "shadows", Object.keys(shadows));
