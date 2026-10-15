// usage: node audit-tokens.mjs store-<key>.json  -> counts colour paints with / without a design token
import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const miss = new Map(); let bound = 0, total = 0;
const note = (spec, kind, p) => { if (!p) return; total++; if (p.tk) { bound++; return; } const k = `${kind} ${p.c}/${p.a}`; const m = miss.get(k) || { n: 0, specs: new Set() }; m.n++; m.specs.add(spec); miss.set(k, m); };
const walk = (spec, n) => {
  if (!n) return;
  if (n.t === "sv" && n.parts) n.parts.forEach((p) => { note(spec, "svg-stroke", p.stroke); note(spec, "svg-fill", p.fill); });
  else if (n.t === "sv") note(spec, "icon", n.color);
  if (n.t === "tx") note(spec, "text", n.f);
  if (n.t === "ps") note(spec, "pseudo", n.bg);
  if (n.st) { note(spec, "fill", n.st.bg); (n.st.bd || []).forEach((b) => note(spec, "border", b)); (n.st.sh || []).forEach(() => {}); }
  (n.ch || []).forEach((c) => walk(spec, c));
};
(d.cells || [{ spec: "root", tree: d.tree }]).forEach((c) => walk(c.spec, c.tree));
console.log(`bound ${bound} / ${total}`);
[...miss].sort((a, b) => b[1].n - a[1].n).slice(0, 25).forEach(([k, m]) => console.log(String(m.n).padStart(5), k, [...m.specs].join(",")));
