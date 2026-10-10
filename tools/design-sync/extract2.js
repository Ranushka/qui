// Tree extractor: walks rendered DOM and records, per element, the layout rules Penpot needs to rebuild it as
// real auto-layout (flex direction / gap / padding / alignment) plus how each element sizes itself
// (fix | hug | fill), its paint (fills, borders, radius, shadows), text runs and svg icons.
//   window.__x2 = { key, cells?: css selector for spec cells, root?: css selector, comps?: [names] }
// POSTs the result to the relay (http://127.0.0.1:8777/put/<key>).
(async () => {
  const cfg = window.__x2 || {};
  const KEY = cfg.key || "x2";
  const specs = window.__quiSpecs || {};
  const COMPS = new Set(cfg.comps || Object.keys(specs));
  const R = (n) => Math.round(n * 100) / 100;
  const nm = (t) => (!t || typeof t === "string" ? null : t.displayName || t.render?.displayName || t.render?.name || t.name || null);
  const hostOf = (f) => { let c = f; while (c) { if (typeof c.type === "string") return c.stateNode; c = c.child; } return null; };

  // ---- colour helpers (canvas normalises oklch / color() / named colours to sRGB) ----
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const cache = new Map();
  const rgba = (c) => {
    if (!c || c === "transparent") return [0, 0, 0, 0];
    if (cache.has(c)) return cache.get(c);
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data; const a = d[3] / 255;
    const v = a > 0 ? [Math.round(d[0] / a), Math.round(d[1] / a), Math.round(d[2] / a), +a.toFixed(3)] : [0, 0, 0, 0];
    cache.set(c, v); return v;
  };
  const hex = (v, k = 1) => ({ c: "#" + v.slice(0, 3).map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")).join(""), a: +(v[3] * k).toFixed(3) });
  const splitTop = (s) => { const out = []; let d = 0, cur = ""; for (const ch of s) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { out.push(cur.trim()); cur = ""; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
  const shadows = (s, k) => {
    if (!s || s === "none") return [];
    return splitTop(s).map((p) => {
      const inset = /\binset\b/.test(p); p = p.replace(/\binset\b/, "").trim();
      const m = p.match(/(rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]{3,8}|[a-z]+)/);
      const tok = m ? m[0] : "#000"; const n = p.replace(tok, "").trim().split(/\s+/).map(parseFloat).filter((x) => !Number.isNaN(x));
      return { inset, x: n[0] || 0, y: n[1] || 0, blur: n[2] || 0, spread: n[3] || 0, ...hex(rgba(tok), k) };
    });
  };
  const px = (v) => { const n = parseFloat(v); return Number.isNaN(n) ? 0 : n; };
  const quad = (cs, p, suffix = "") => ["Top", "Right", "Bottom", "Left"].map((s) => px(cs[p + s + suffix]));

  // ---- layout probes ----
  const withStyle = (el, props, fn) => {
    const saved = el.getAttribute("style");
    for (const [k, v] of Object.entries(props)) el.style.setProperty(k, v, "important");
    try { return fn(); } finally { if (saved === null) el.removeAttribute("style"); else el.setAttribute("style", saved); }
  };
  const hugW = (el, w) => Math.abs(withStyle(el, { width: "max-content", flex: "none" }, () => el.getBoundingClientRect().width) - w) < 0.6;
  const hugH = (el, h) => Math.abs(withStyle(el, { height: "max-content", flex: "none" }, () => el.getBoundingClientRect().height) - h) < 0.6;

  const isFlex = (cs) => cs.display === "flex" || cs.display === "inline-flex";
  const dispKind = (cs) => (isFlex(cs) ? "flex" : cs.display === "grid" || cs.display === "inline-grid" ? "grid" : cs.display === "contents" ? "contents" : /inline/.test(cs.display) ? "inline" : "block");

  function sizing(el, cs, rect, parent, pcs, prect) {
    const out = { w: "fix", h: "fix" };
    const pk = parent ? dispKind(pcs) : "none";
    const prow = pk === "flex" && (pcs.flexDirection === "row" || pcs.flexDirection === "row-reverse");
    const pcol = pk === "flex" && !prow;
    const innerW = prect ? prect.width - px(pcs.paddingLeft) - px(pcs.paddingRight) - px(pcs.borderLeftWidth) - px(pcs.borderRightWidth) : 0;
    const innerH = prect ? prect.height - px(pcs.paddingTop) - px(pcs.paddingBottom) - px(pcs.borderTopWidth) - px(pcs.borderBottomWidth) : 0;
    const grow = px(cs.flexGrow) > 0;
    const stretch = (cs.alignSelf === "auto" || cs.alignSelf === "normal" ? pcs && (pcs.alignItems === "normal" || pcs.alignItems === "stretch") : cs.alignSelf === "stretch");
    const minW = cs.minWidth === "auto" ? 0 : px(cs.minWidth), minH = cs.minHeight === "auto" ? 0 : px(cs.minHeight);
    const hw = hugW(el, rect.width) && !(minW > 0 && Math.abs(rect.width - minW) < 0.6);
    const hh = hugH(el, rect.height) && !(minH > 0 && Math.abs(rect.height - minH) < 0.6);
    // width
    if (prow && grow) out.w = "fill";
    else if (pcol && stretch && !hw) out.w = "fill";
    else if (hw) out.w = "hug";
    else if (pk !== "flex" && pk !== "none" && Math.abs(rect.width - innerW) < 0.6) out.w = "fill";
    else if (prow && Math.abs(rect.width - innerW) < 0.6) out.w = "fill";
    // height
    if (pcol && grow) out.h = "fill";
    else if (prow && stretch && !hh) out.h = "fill";
    else if (hh) out.h = "hug";
    else if (pcol && Math.abs(rect.height - innerH) < 0.6) out.h = "fill";
    return out;
  }

  // ---- outermost qui component rooted at an element ----
  function compOf(el) {
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber$"));
    if (!k) return null;
    let found = null;
    for (let f = el[k]; f; f = f.return) { const n = nm(f.type); if (n && COMPS.has(n) && hostOf(f) === el) found = { name: n, fiber: f }; }
    return found;
  }

  const lucideName = (svg) => { const m = (svg.getAttribute("class") || "").match(/lucide-([a-z0-9-]+)/g); return m ? m[m.length - 1].replace("lucide-", "") : null; };

  function walk(el, origin, parent, pcs, prect) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || el.tagName === "SCRIPT" || el.tagName === "STYLE") return null;
    const rect = el.getBoundingClientRect();
    const rel = { x: R(rect.x - origin.x), y: R(rect.y - origin.y), w: R(rect.width), h: R(rect.height) };
    const tag = el.tagName.toLowerCase();

    if (tag === "svg") {
      const clone = el.cloneNode(true); clone.removeAttribute("class"); clone.removeAttribute("style");
      clone.setAttribute("width", R(rect.width)); clone.setAttribute("height", R(rect.height));
      return { t: "sv", icon: lucideName(el), svg: new XMLSerializer().serializeToString(clone), r: rel, color: hex(rgba(cs.color)), sw: cs.strokeWidth, op: +cs.opacity };
    }

    const comp = compOf(el);
    const kind = dispKind(cs);
    const op = parseFloat(cs.opacity || "1");
    const node = { t: "el", tag, r: rel };
    if (comp) {
      node.comp = comp.name;
      const sp = specs[comp.name];
      if (sp && sp.toVariant) { try { node.variant = sp.toVariant(comp.fiber.memoizedProps || {}, el, comp.fiber); } catch (e) { node.variantError = String(e); } }
      if (sp && sp.canInstance) { try { node.inst = !!sp.canInstance(comp.fiber.memoizedProps || {}, el); } catch (e) { node.inst = false; } } else node.inst = true;
      const pr = {}; for (const [k, v] of Object.entries(comp.fiber.memoizedProps || {})) if (["string", "number", "boolean"].includes(typeof v) && k !== "className") pr[k] = v;
      node.props = pr;
    }
    const st = (node.st = {});
    st.d = kind;
    if (kind === "flex") {
      st.dir = cs.flexDirection; st.wrap = cs.flexWrap !== "nowrap"; st.ai = cs.alignItems; st.jc = cs.justifyContent;
      st.gap = [px(cs.rowGap), px(cs.columnGap)];
    }
    if (kind === "grid") { st.cols = cs.gridTemplateColumns; st.gap = [px(cs.rowGap), px(cs.columnGap)]; st.ai = cs.alignItems; st.jc = cs.justifyContent; }
    st.pad = quad(cs, "padding"); st.bw = ["Top", "Right", "Bottom", "Left"].map((s) => (cs["border" + s + "Style"] === "none" ? 0 : px(cs["border" + s + "Width"])));
    st.mar = quad(cs, "margin");
    st.pos = cs.position;
    if (cs.position === "absolute" || cs.position === "fixed") st.abs = true;
    st.clip = cs.overflowX !== "visible" || cs.overflowY !== "visible";
    st.grow = px(cs.flexGrow); st.shrink = px(cs.flexShrink); st.as = cs.alignSelf;
    st.minW = cs.minWidth === "auto" || cs.minWidth === "0px" ? null : px(cs.minWidth);
    st.maxW = cs.maxWidth === "none" ? null : px(cs.maxWidth);
    const bg = rgba(cs.backgroundColor); if (bg[3] > 0) st.bg = hex(bg, op);
    const bds = ["Top", "Right", "Bottom", "Left"].map((s, i) => (st.bw[i] > 0 ? hex(rgba(cs["border" + s + "Color"]), op) : null)); if (st.bw.some((w) => w > 0)) st.bd = bds;
    const rad = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => { const v = cs["border" + c + "Radius"]; const n = v.endsWith("%") ? (parseFloat(v) / 100) * Math.min(rect.width, rect.height) : px(v); return R(Math.min(n, Math.min(rect.width, rect.height) / 2)); });
    if (rad.some((x) => x > 0)) st.rad = rad;
    const sh = shadows(cs.boxShadow, op); if (sh.length) st.sh = sh;
    if (op < 1) st.op = op;
    if (cs.backgroundImage && cs.backgroundImage !== "none") st.bgImg = cs.backgroundImage.slice(0, 120);
    if (parent) node.sz = sizing(el, cs, rect, parent, pcs, prect); else { const mw = cs.minWidth === "auto" ? 0 : px(cs.minWidth), mh = cs.minHeight === "auto" ? 0 : px(cs.minHeight); node.sz = { w: hugW(el, rect.width) && !(mw > 0 && Math.abs(rect.width - mw) < 0.6) ? "hug" : "fix", h: hugH(el, rect.height) && !(mh > 0 && Math.abs(rect.height - mh) < 0.6) ? "hug" : "fix" }; }

    const ch = (node.ch = []);
    // pseudo elements
    for (const which of ["::before", "::after"]) {
      const ps = getComputedStyle(el, which);
      if (!ps || ps.content === "none" || ps.content === "normal") continue;
      const pw = px(ps.width), ph = px(ps.height), pbg = rgba(ps.backgroundColor);
      if (!(pw > 0 && ph > 0) || pbg[3] === 0) continue;
      const pr = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => { const v = ps["border" + c + "Radius"]; const n = v.endsWith("%") ? (parseFloat(v) / 100) * Math.min(pw, ph) : px(v); return R(Math.min(n, Math.min(pw, ph) / 2)); });
      const centred = ps.position !== "absolute";
      const x = centred ? rect.x + (rect.width - pw) / 2 : rect.x + px(ps.left), y = centred ? rect.y + (rect.height - ph) / 2 : rect.y + px(ps.top);
      const pn = { t: "ps", which, r: { x: R(x - origin.x), y: R(y - origin.y), w: R(pw), h: R(ph) }, rad: pr, bg: hex(pbg, op) };
      (which === "::before" ? ch.unshift(pn) : ch.push(pn));
    }
    const trimAll = kind === "flex" || kind === "grid";
    const rawKids = [...el.childNodes];
    // consecutive text nodes (React renders {"+"}{count} as two) are one run of text
    const kids = [];
    for (const c of rawKids) {
      const last = kids[kids.length - 1];
      if (c.nodeType === 3 && last && last.nodeType === 3) { last.nodes.push(c); last.textContent += c.textContent; }
      else if (c.nodeType === 3) kids.push({ nodeType: 3, nodes: [c], textContent: c.textContent });
      else kids.push(c);
    }
    kids.forEach((c, i) => {
      if (c.nodeType === 3) {
        let txt = c.textContent.replace(/\s+/g, " ");
        const first = i === 0, last = i === kids.length - 1;
        if (trimAll || first) txt = txt.replace(/^ /, "");
        if (trimAll || last) txt = txt.replace(/ $/, "");
        if (!txt.trim()) {
          // a space between two inline siblings occupies real width
          if (!trimAll && i > 0 && i < kids.length - 1 && txt.length) {
            const wr = document.createRange(); wr.setStartBefore(c.nodes[0]); wr.setEndAfter(c.nodes[c.nodes.length - 1]);
            const wrects = [...wr.getClientRects()].filter((r) => r.width > 0);
            if (wrects.length) {
              const fs0 = px(cs.fontSize); const lh0 = cs.lineHeight === "normal" ? fs0 * 1.21 : px(cs.lineHeight);
              const q = wrects[0];
              ch.push({ t: "tx", s: "\u00A0", lines: 1, r: { x: R(q.left - origin.x), y: R(q.top + q.height / 2 - lh0 / 2 - origin.y), w: R(q.width), h: R(lh0) }, f: { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs: fs0, fw: cs.fontWeight, fst: cs.fontStyle, lh: lh0, ls: px(cs.letterSpacing), al: cs.textAlign, ...hex(rgba(cs.color), op) }, space: true });
            }
          }
          return;
        }
        const range = document.createRange(); range.setStartBefore(c.nodes[0]); range.setEndAfter(c.nodes[c.nodes.length - 1]);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
        if (!rects.length) return;
        const l = Math.min(...rects.map((r) => r.left)), t = Math.min(...rects.map((r) => r.top)), r2 = Math.max(...rects.map((r) => r.right)), b = Math.max(...rects.map((r) => r.bottom));
        const lines = new Set(rects.map((r) => Math.round(r.top))).size;
        const fs = px(cs.fontSize);
        let s = txt; if (cs.textTransform === "uppercase") s = s.toUpperCase(); else if (cs.textTransform === "lowercase") s = s.toLowerCase();
        // record the line box (what Penpot's text box is), not the glyph box the Range reports
        const lhPx = cs.lineHeight === "normal" ? fs * 1.21 : px(cs.lineHeight);
        const firstRect = rects.slice().sort((a, b2) => a.top - b2.top)[0];
        const lineTop = firstRect.top + firstRect.height / 2 - lhPx / 2;
        const tn = { t: "tx", s, r: { x: R(l - origin.x), y: R(lineTop - origin.y), w: R(r2 - l), h: R(lhPx * lines) }, lines, f: { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs, fw: cs.fontWeight, fst: cs.fontStyle, lh: cs.lineHeight === "normal" ? null : px(cs.lineHeight), ls: px(cs.letterSpacing), td: cs.textDecorationLine !== "none" ? cs.textDecorationLine : undefined, al: cs.textAlign, ...hex(rgba(cs.color), op) } };
        if (lines > 1 && c.nodes.length === 1) {
          // wrapped text: keep the real line breaks
          const runs = [];
          for (let k = 0; k < c.textContent.length; k++) {
            const rr = document.createRange(); rr.setStart(c.nodes[0], k); rr.setEnd(c.nodes[0], k + 1);
            const q = [...rr.getClientRects()].find((x) => x.width > 0 || c.textContent[k] !== " "); if (!q) continue;
            const top = Math.round(q.top); const last2 = runs[runs.length - 1];
            if (last2 && Math.abs(last2.top - top) < 3) { last2.s += c.textContent[k]; last2.right = Math.max(last2.right, q.right); }
            else runs.push({ top, s: c.textContent[k], left: q.left, right: q.right });
          }
          tn.breaks = runs.map((x) => x.s.replace(/\s+/g, " ").trim()).filter(Boolean);
        }
        if (cs.whiteSpace === "nowrap") tn.nowrap = true;
        ch.push(tn);
      } else if (c.nodeType === 1) {
        const sub = walk(c, origin, el, cs, rect); if (sub) ch.push(sub);
      }
    });
    // input placeholder
    if ((tag === "input" || tag === "textarea") && !el.value && el.placeholder) {
      const ps = getComputedStyle(el, "::placeholder"); const fs = px(cs.fontSize); const lh = px(cs.lineHeight) || fs * 1.2;
      cx.font = cs.fontWeight + " " + fs + "px " + cs.fontFamily;
      const w = cx.measureText(el.placeholder).width; const padL = px(cs.paddingLeft) + px(cs.borderLeftWidth);
      ch.push({ t: "tx", s: el.placeholder, placeholder: true, lines: 1, r: { x: R(rect.x - origin.x + padL), y: R(rect.y - origin.y + (rect.height - lh) / 2), w: R(w), h: R(lh) }, f: { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs, fw: cs.fontWeight, fst: "normal", lh, ls: px(cs.letterSpacing), al: "left", ...hex(rgba(ps.color), op) } });
    }
    return node;
  }

  const t0 = performance.now();
  const out = { dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight };
  if (cfg.cells) {
    out.cells = [...document.querySelectorAll(cfg.cells)].map((cell) => {
      const sel = cell.getAttribute("data-root-sel"); const root = (sel && cell.querySelector(sel)) || cell.firstElementChild; const o = root.getBoundingClientRect();
      return { spec: cell.getAttribute("data-spec"), v: JSON.parse(cell.getAttribute("data-v") || "{}"), tree: walk(root, { x: o.x, y: o.y }, null, null, null) };
    });
  } else {
    const root = typeof cfg.root === "string" ? document.querySelector(cfg.root) : cfg.root || document.getElementById("root");
    const o = root.getBoundingClientRect();
    out.origin = { x: R(o.x), y: R(o.y), w: R(o.width), h: R(o.height) };
    out.tree = walk(root, { x: o.x, y: o.y }, null, null, null);
  }
  out.ms = Math.round(performance.now() - t0);
  const payload = JSON.stringify(out);
  const res = await fetch("http://127.0.0.1:8777/put/" + KEY, { method: "POST", body: payload });
  return { key: KEY, ms: out.ms, bytes: payload.length, cells: out.cells ? out.cells.length : undefined, post: await res.text() };
})();
