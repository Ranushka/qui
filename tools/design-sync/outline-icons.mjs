// usage: node outline-icons.mjs [icons-tabler.json]  -> icons-outlined.json: one 24x24 svg per Tabler name, every stroke
// outlined to a filled path by Inkscape (stroke-to-path), fills = currentColor, so a resized Penpot instance scales the
// line weight like the browser does (2px at 24 -> 1.17px at 14). Push it with ./push.sh icons-outlined.json icons-outlined.js
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const INK = "/Applications/Inkscape.app/Contents/MacOS/inkscape";

// Tabler draws closed shapes as open paths that end where they start (`…l0 -4` back to the M point). In the
// browser the two round caps overlap invisibly, but Inkscape's stroke-to-path leaves a dent at that seam (the
// outer corner dips to r≈1.85 instead of 2). Closing such a sub-path with `Z` turns the seam into a proper join.
// Only where the path runs on smoothly through its start point (seams, circles, rounded corners): a loop that meets
// itself at a sharp tip (the sparkles stars) outlines worse when closed, so it stays open.
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
const SMOOTH = Math.cos((25 * Math.PI) / 180);
// start and end directions of an elliptical arc (SVG spec F.6.5 centre parameterisation)
function arcDirs(x1, y1, rx, ry, deg, fa, fs, x2, y2) {
  const ph = (deg * Math.PI) / 180, co = Math.cos(ph), si = Math.sin(ph);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, xp = co * dx + si * dy, yp = -si * dx + co * dy;
  rx = Math.abs(rx); ry = Math.abs(ry);
  const lam = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp, den = rx * rx * yp * yp + ry * ry * xp * xp;
  const k = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (k * rx * yp) / ry, cyp = (-k * ry * xp) / rx;
  const t1 = Math.atan2((yp - cyp) / ry, (xp - cxp) / rx), t2 = Math.atan2((-yp - cyp) / ry, (-xp - cxp) / rx);
  const dir = (t) => { const sg = fs ? 1 : -1, ux = -rx * Math.sin(t) * sg, uy = ry * Math.cos(t) * sg; return [co * ux - si * uy, si * ux + co * uy]; };
  return [dir(t1), dir(t2)];
}
function closeLoops(d) {
  const toks = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
  let out = "", x = 0, y = 0, sx = 0, sy = 0, open = false, i = 0, cmd = "", first = null, last = null;
  const unit = (v) => { const l = Math.hypot(v[0], v[1]); return l < 1e-9 ? null : [v[0] / l, v[1] / l]; };
  const seal = () => {
    if (open && first && last && Math.abs(x - sx) < 1e-3 && Math.abs(y - sy) < 1e-3 && first[0] * last[0] + first[1] * last[1] > SMOOTH) out += "Z";
    open = false; first = last = null;
  };
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    else if (cmd === "M") cmd = "L"; else if (cmd === "m") cmd = "l"; // implicit lineto after a moveto
    const C = cmd.toUpperCase(), rel = cmd !== C, n = ARGS[C];
    if (C === "Z") { out += cmd; x = sx; y = sy; open = false; first = last = null; continue; }
    const a = toks.slice(i, i + n).map(Number); i += n;
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === "M") { seal(); x = ox + a[0]; y = oy + a[1]; sx = x; sy = y; out += `${cmd}${a.join(" ")}`; continue; }
    out += `${cmd}${a.join(" ")}`; open = true;
    let ex = x, ey = y, d0, d1;
    if (C === "H") { ex = rel ? x + a[0] : a[0]; d0 = d1 = unit([ex - x, 0]); }
    else if (C === "V") { ey = rel ? y + a[0] : a[0]; d0 = d1 = unit([0, ey - y]); }
    else {
      ex = ox + a[n - 2]; ey = oy + a[n - 1];
      if (C === "L" || C === "T") d0 = d1 = unit([ex - x, ey - y]);
      else if (C === "C") { d0 = unit([ox + a[0] - x, oy + a[1] - y]) || unit([ox + a[2] - x, oy + a[3] - y]); d1 = unit([ex - ox - a[2], ey - oy - a[3]]) || unit([ex - ox - a[0], ey - oy - a[1]]); }
      else if (C === "S" || C === "Q") { d0 = unit([ox + a[0] - x, oy + a[1] - y]); d1 = unit([ex - ox - a[0], ey - oy - a[1]]); }
      else if (C === "A") [d0, d1] = arcDirs(x, y, a[0], a[1], a[2], a[3], a[4], ex, ey).map(unit);
    }
    if (d0 && !first) first = d0;
    if (d1) last = d1;
    x = ex; y = ey;
  }
  seal();
  return out;
}
const src = JSON.parse(fs.readFileSync(process.argv[2] || "icons-tabler.json", "utf8"));
const byName = {};
for (const it of src) byName[it.icon] = byName[it.icon] || it.svg;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qui-outline-"));
const out = [];
for (const name of Object.keys(byName).sort()) {
  const svg = byName[name].replace(/\swidth="[\d.]+"/, ' width="24"').replace(/\sheight="[\d.]+"/, ' height="24"').replace(/currentColor/g, "#000000")
    .replace(/(<path\b[^>]*?\sd=")([^"]+)"/g, (m, pre, d) => pre + closeLoops(d) + '"');
  const i = path.join(tmp, name + ".svg"), o = path.join(tmp, name + ".out.svg");
  fs.writeFileSync(i, svg);
  execFileSync(INK, [i, `--actions=select-all:all;object-stroke-to-path;export-plain-svg;export-filename:${o};export-do`], { stdio: "pipe" });
  const res = fs.readFileSync(o, "utf8");
  if (/<(circle|rect|ellipse|line|polyline|polygon|use|text)\b/.test(res)) throw new Error(name + ": non-path element left after outlining");
  const paths = [];
  for (const m of res.matchAll(/<path\b([^>]*?)\/?>/g)) {
    const a = m[1];
    const d = (a.match(/\sd="([^"]+)"/) || [])[1];
    const style = (a.match(/\sstyle="([^"]*)"/) || [])[1] || "";
    if (!d) continue;
    // the invisible 24x24 bounding box (Tabler's `M0 0h24v24H0z`, stroke none) is no part of the drawing
    if (/fill:\s*none/.test(style) && !/stroke:\s*#/.test(style)) continue;
    if (/^M\s*0[ ,]0\s*h\s*24\s*v\s*24\s*H\s*0\s*z$/i.test(d.trim())) continue;
    if (/stroke:\s*#/.test(style) && !/stroke:\s*none/.test(style)) throw new Error(name + ": a stroke was left after outlining");
    const rule = (style.match(/fill-rule:\s*(evenodd|nonzero)/) || [])[1];
    paths.push(`<path fill="currentColor"${rule === "evenodd" ? ' fill-rule="evenodd"' : ""} d="${d.replace(/\s+/g, " ").trim()}"/>`);
  }
  if (!paths.length) throw new Error(name + ": no path after outlining");
  out.push({ icon: name, size: 24, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${paths.join("")}</svg>` });
  process.stdout.write(name + ":" + paths.length + " ");
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync("icons-outlined.json", JSON.stringify(out));
console.log("\n" + out.length, "icons ->", "icons-outlined.json", (fs.statSync("icons-outlined.json").size / 1024).toFixed(1) + " KB");
