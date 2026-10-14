// usage: node split-specs.mjs store-<key>.json  -> spec-<Name>.json per spec, ready for push.sh
import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const by = {}; d.cells.forEach((c) => (by[c.spec] = by[c.spec] || []).push(c));
for (const [name, cells] of Object.entries(by)) { fs.writeFileSync(`spec-${name}.json`, JSON.stringify({ vw: d.vw, vh: d.vh, cells })); console.log(name, cells.length); }
