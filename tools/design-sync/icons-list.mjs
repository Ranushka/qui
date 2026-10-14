// usage: node icons-list.mjs store-a.json store-b.json ...  -> icons.json: every (lucide name, size) with its svg
import fs from "node:fs";
const acc = {};
const walk = (n) => { if (!n) return; if (n.t === "sv" && n.icon) acc[n.icon + "@" + Math.round(n.r.w)] = { icon: n.icon, size: Math.round(n.r.w), svg: n.svg }; (n.ch || []).forEach(walk); };
for (const f of process.argv.slice(2)) { const d = JSON.parse(fs.readFileSync(f, "utf8")); (d.cells || [{ tree: d.tree }]).forEach((c) => walk(c.tree)); }
const list = Object.values(acc).sort((a, b) => a.size - b.size || a.icon.localeCompare(b.icon));
fs.writeFileSync("icons.json", JSON.stringify(list));
console.log(list.length, "icons;", list.map((i) => i.icon + "@" + i.size).join(" "));
