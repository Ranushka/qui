// Penpot-side builder: turns an extract2 tree into real auto-layout boards (flex direction, gap, padding,
// fix/hug/fill sizing), text, and icon component instances. Load in the plugin with:
//   (0, eval)("(()=>{" + await (await fetch("/qui-tmp/builder2.js?" + Date.now())).text() + "})()")
(() => {
  const B = (globalThis.__B = globalThis.__B || {});
  B.shapes = B.shapes || [];

  const inter = () => penpot.fonts.all.find((f) => f.name === "Inter");
  const fill = (o) => [{ fillColor: o.c, fillOpacity: o.a }];
  const AI = { "flex-start": "start", start: "start", "self-start": "start", center: "center", "flex-end": "end", end: "end", "self-end": "end", stretch: "stretch", normal: "stretch", baseline: "start" };
  const JC = { "flex-start": "start", start: "start", normal: "start", left: "start", center: "center", "flex-end": "end", end: "end", "space-between": "space-between", "space-around": "space-around", "space-evenly": "space-evenly", stretch: "start" };
  const DIR = { row: "row", "row-reverse": "row-reverse", column: "column", "column-reverse": "column-reverse" };
  const SIZE = { fix: "fix", hug: "auto", fill: "fill" };

  // ---------- icons: one component per (lucide name, px size), all living on the "Icons" page ----------
  // They must be created up front, on that page: a freshly created main instance gets pulled into whichever board is
  // being built, so building and component creation never mix.
  B.collectIcons = function (n, acc = {}) {
    if (!n) return acc;
    if (n.t === "sv" && n.icon) acc[n.icon + "@" + Math.round(n.r.w)] = { icon: n.icon, size: Math.round(n.r.w), svg: n.svg };
    (n.ch || []).forEach((c) => B.collectIcons(c, acc));
    return acc;
  };
  B.iconComponent = (name, size) => penpot.library.local.components.find((c) => c.path === "Icons / " + size && c.name === name);
  B.makeIcons = function (list) {
    if (penpot.currentPage.name !== "Icons") throw new Error("open the Icons page first");
    const made = [], have = [];
    let i = 0;
    const gx = 0; let row = {};
    for (const it of list) {
      if (B.iconComponent(it.icon, it.size)) { have.push(it.icon + "@" + it.size); continue; }
      const g = penpot.createShapeFromSvg(it.svg.replace(/currentColor/g, "#313435"));
      if (!g) throw new Error("svg import failed: " + it.icon);
      g.name = it.icon; g.resize(it.size, it.size);
      const col = (row[it.size] = (row[it.size] || 0) + 1) - 1;
      g.x = gx + col * (it.size + 12); g.y = (it.size > 20 ? 200 : it.size > 14 ? 100 : it.size > 12 ? 50 : 0);
      const comp = penpot.library.local.createComponent([g]);
      comp.name = it.icon; comp.path = "Icons / " + it.size;
      made.push(it.icon + "@" + it.size);
    }
    return { made, have };
  };
  B.icon = function (name, svg, w, h) {
    const comp = B.iconComponent(name, Math.round(w));
    if (!comp) throw new Error("icon component missing: " + name + "@" + Math.round(w));
    return comp.instance();
  };
  B.tint = function (shape, color) {
    const walk = (s) => {
      if (s.strokes && s.strokes.length) s.strokes = s.strokes.map((k) => ({ ...k, strokeColor: color.c, strokeOpacity: color.a }));
      if (s.fills && s.fills.length && s.type === "path") s.fills = s.fills.map((k) => (k.fillColor ? { ...k, fillColor: color.c, fillOpacity: color.a } : k));
      if (s.children) s.children.forEach(walk);
    };
    walk(shape);
  };

  // ---------- helpers ----------
  const isText = (n) => n.t === "tx";
  const hasPaint = (st) => st.bg || st.bd || (st.sh && st.sh.length) || st.rad || st.bgImg;
  const hasBox = (st) => hasPaint(st) || st.pad.some((p) => p) || st.bw.some((p) => p) || st.clip;

  function applyPaint(b, n) {
    const st = n.st;
    b.fills = st.bg ? fill(st.bg) : [];
    if (st.rad) { b.borderRadiusTopLeft = st.rad[0]; b.borderRadiusTopRight = st.rad[1]; b.borderRadiusBottomRight = st.rad[2]; b.borderRadiusBottomLeft = st.rad[3]; }
    if (st.bd) {
      const uniform = st.bd.every((s, i) => s && st.bw[i] === st.bw[0] && s.c === st.bd[0].c && s.a === st.bd[0].a);
      if (uniform) b.strokes = [{ strokeColor: st.bd[0].c, strokeOpacity: st.bd[0].a, strokeWidth: st.bw[0], strokeAlignment: "inner", strokeStyle: "solid" }];
      else n._sideBorders = true;
    }
    if (st.sh) b.shadows = st.sh.map((s) => ({ style: s.inset ? "inner-shadow" : "drop-shadow", offsetX: s.x, offsetY: s.y, blur: s.blur, spread: s.spread, hidden: false, color: { color: s.c, opacity: s.a } }));
    if (st.op) b.opacity = st.op;
  }

  // ---------- text ----------
  function makeText(n) {
    const f = n.f;
    const t = penpot.createText(n.breaks && n.breaks.length > 1 ? n.breaks.join(" ") : n.s);
    if (!t) throw new Error("createText failed");
    t.name = (n.s.trim().replace(/\//g, "∕").slice(0, 40)) || "text";
    const wt = f.fw === "450" ? 400 : parseInt(f.fw);
    const font = inter();
    t.fontId = font.fontId; t.fontFamily = "Inter";
    t.fontVariantId = (wt === 400 ? "regular" : String(wt)) + (f.fst === "italic" ? "italic" : "");
    t.fontWeight = String(wt); t.fontSize = String(f.fs); t.fontStyle = f.fst === "italic" ? "italic" : "normal";
    let lhPx = f.lh || f.fs * 1.21; if (lhPx - Math.floor(lhPx) > 0 && lhPx - Math.floor(lhPx) <= 0.06) lhPx = Math.floor(lhPx);
    t.lineHeight = String(+(lhPx / f.fs).toFixed(4));
    t.letterSpacing = String(f.ls || 0);
    t.fills = fill(f);
    if (f.td) t.textDecoration = f.td.includes("underline") ? "underline" : "line-through";
    // Penpot measures text asynchronously (and not for free-standing shapes), so seed the size the browser measured and
    // only then hand sizing back to Penpot (auto-width / auto-height). Layout resolves immediately with the right sizes.
    t.resize(Math.max(n.r.w, 1), Math.max(n.r.h, 1));
    t.growType = n.lines > 1 ? "auto-height" : "auto-width";
    return t;
  }

  // ---------- elements ----------
  // Penpot only re-runs auto-layout on geometry changes, not on property edits. So every board is built bottom-up
  // (children attached and all properties set before the board itself is attached) and the root is nudged once at the end.
  function layoutOf(n, kids) {
    const st = n.st;
    if (st.d === "flex") return { dir: DIR[st.dir] || "row", wrap: st.wrap, ai: AI[st.ai] || "stretch", jc: JC[st.jc] || "start", gap: st.gap };
    if (st.d === "grid") return { dir: "row", wrap: true, ai: AI[st.ai] || "stretch", jc: JC[st.jc] || "start", gap: st.gap };
    const inlineOnly = kids.every((k) => k.t === "tx" || (k.t === "el" && k.st.d === "inline"));
    if (inlineOnly) return { dir: "row", wrap: true, ai: "start", jc: "start", gap: [0, 0] };
    return { dir: "column", wrap: false, ai: "stretch", jc: "start", gap: [0, 0] };
  }
  function nameFor(n, kids) {
    if (n.comp) return n.comp;
    if (kids.length === 1 && kids[0].t === "tx") return "Label";
    if (kids.length === 1 && kids[0].t === "sv") return "Icon";
    return n.tag === "button" || n.tag === "a" ? n.tag : "Frame";
  }
  // flatten `display: contents` and bare single-text wrappers into their parent
  function expand(kids) {
    const out = [];
    for (const k of kids) {
      if (k.t === "el" && k.st.d === "contents") out.push(...expand(k.ch));
      else if (k.t === "el" && !hasBox(k.st) && !k.comp && k.ch.length === 1 && k.ch[0].t === "tx" && k.st.d !== "flex" && !k.st.abs) out.push(k.ch[0]);
      else out.push(k);
    }
    return out;
  }

  // ---------- component instances ----------
  B._vc = B._vc || {};
  /** The variant component of library set `name` whose properties match `variant` (null when absent). */
  B.variantComponent = function (name, variant, fresh) {
    if (fresh || !B._vc[name]) {
      const sets = penpot.library.local.components.filter((c) => c.name === name);
      B._vc[name] = sets.flatMap((c) => (c.variants ? c.variants.variantComponents() : [c]));
    }
    if (!variant) return null;
    return B._vc[name].find((vc) => Object.entries(variant).every(([k, v]) => vc.variantProps && vc.variantProps[k] === v)) || null;
  };
  /** The overridable pieces of a DOM node, in order: text runs, icons, nested component instances, decor dots. */
  B.domLeaves = function (n, out = [], top = true) {
    if (n.t === "tx") out.push({ k: "tx", node: n });
    else if (n.t === "sv") out.push({ k: "sv", node: n });
    else if (n.t === "ps") out.push({ k: "ps", node: n });
    else if (n.t === "el") {
      if (!top && n.comp && n.inst !== false && n.variant && B.variantComponent(n.comp, n.variant)) out.push({ k: "comp", node: n });
      else if (n.st.d !== "contents" || true) for (const c of expand(n.ch)) B.domLeaves(c, out, false);
    }
    return out;
  };
  B.shapeLeaves = function (shape, out = [], top = true) {
    if (shape.type === "text") out.push(shape);
    else if (shape.type === "rectangle" && shape.name === "decor") out.push(shape);
    else if (!top && shape.isComponentHead && shape.isComponentHead()) out.push(shape);
    else if (shape.children) for (const c of shape.children) B.shapeLeaves(c, out, false);
    return out;
  };
  /** Applies the text / icon / nested-component differences between a plain variant instance and what the page renders. */
  B.override = function (inst, n, warn) {
    let dom = B.domLeaves(n), shp = B.shapeLeaves(inst);
    if (dom.length !== shp.length) { (warn || []).push(`${n.comp}: ${dom.length} dom leaves vs ${shp.length} shapes`); return false; }
    // pass 1: swaps (these replace shapes)
    dom.forEach((d, i) => {
      const s = shp[i];
      if (d.k === "sv" && d.node.icon) {
        const want = B.iconComponent(d.node.icon, Math.round(d.node.r.w)); const cur = s.component && s.component();
        if (want && cur && cur.id !== want.id) s.swapComponent(want);
      } else if (d.k === "comp") {
        const want = B.variantComponent(d.node.comp, d.node.variant); const cur = s.component && s.component();
        if (want && cur && cur.id !== want.id) s.swapComponent(want);
      }
    });
    shp = B.shapeLeaves(inst);
    // pass 2: content
    dom.forEach((d, i) => {
      const s = shp[i]; if (!s) return;
      if (d.k === "tx") {
        const t = d.node;
        if (s.characters !== t.s) s.characters = t.s;
        s.resize(Math.max(t.r.w, 1), Math.max(t.r.h, 1)); s.growType = t.lines > 1 ? "auto-height" : "auto-width";
        const cur = s.fills && s.fills[0] && s.fills[0].fillColor; if (cur && cur.toLowerCase() !== t.f.c.toLowerCase()) s.fills = fill(t.f);
      } else if (d.k === "sv") B.tint(s, d.node.color);
      else if (d.k === "ps") s.fills = fill(d.node.bg);
      else if (d.k === "comp") B.override(s, d.node, warn);
    });
    return true;
  };

  // creates the shape for node n (detached from any parent) with its whole subtree built
  function make(n, ctx) {
    if (n.t === "tx") { const t = makeText(n); ctx.map.push({ n, id: t.id }); return t; }
    if (n.t === "sv") {
      let s;
      if (n.icon) { s = B.icon(n.icon, n.svg, n.r.w, n.r.h); B.tint(s, n.color); }
      else { s = penpot.createShapeFromSvg(n.svg.replace(/currentColor/g, n.color.c)); s.name = "svg"; s.resize(n.r.w, n.r.h); }
      ctx.map.push({ n, id: s.id }); return s;
    }
    if (n.t === "ps") {
      const r = penpot.createRectangle(); r.name = "decor"; r.resize(n.r.w, n.r.h); r.fills = fill(n.bg);
      r.borderRadiusTopLeft = n.rad[0]; r.borderRadiusTopRight = n.rad[1]; r.borderRadiusBottomRight = n.rad[2]; r.borderRadiusBottomLeft = n.rad[3];
      ctx.map.push({ n, id: r.id }); return r;
    }
    const st = n.st;
    if (ctx.depth > 0 && n.comp && n.inst !== false && n.variant) {
      const vc = B.variantComponent(n.comp, n.variant);
      if (vc) {
        const inst = vc.instance();
        const flexSz = inst.flex ? [inst.flex.horizontalSizing, inst.flex.verticalSizing] : null;
        B.override(inst, n, ctx.warn);
        inst.resize(Math.max(n.r.w, 0.01), Math.max(n.r.h, 0.01));
        if (flexSz) { inst.flex.horizontalSizing = flexSz[0]; inst.flex.verticalSizing = flexSz[1]; }
        ctx.map.push({ n, id: inst.id }); ctx.instances = (ctx.instances || 0) + 1;
        return inst;
      }
    }
    const kids = expand(n.ch);
    const b = penpot.createBoard();
    b.name = nameFor(n, kids); b.clipContent = !!st.clip;
    b.resize(Math.max(n.r.w, 0.01), Math.max(n.r.h, 0.01));
    applyPaint(b, n);
    ctx.map.push({ n, id: b.id });
    let flex = null;
    if (kids.length) {
      const L = layoutOf(n, kids);
      flex = b.addFlexLayout();
      flex.dir = L.dir; flex.wrap = L.wrap ? "wrap" : "nowrap"; flex.alignItems = L.ai; flex.justifyContent = L.jc;
      flex.rowGap = L.gap[0]; flex.columnGap = L.gap[1];
      flex.topPadding = st.pad[0] + st.bw[0]; flex.rightPadding = st.pad[1] + st.bw[1]; flex.bottomPadding = st.pad[2] + st.bw[2]; flex.leftPadding = st.pad[3] + st.bw[3];
      flex.horizontalSizing = n.sz.w === "hug" ? "auto" : "fix"; flex.verticalSizing = n.sz.h === "hug" ? "auto" : "fix";
    }
    for (const k of kids) {
      ctx.depth++; const c = make(k, ctx); ctx.depth--;
      b.appendChild(c);
      if (flex) childProps(c, k, ctx);
      if (k.t === "ps" || (k.t === "el" && k.st.abs)) ctx.abs.push({ shape: c, rel: k.r });
    }
    if (n._sideBorders) {
      st.bd.forEach((col, i) => {
        if (!col) return; const w = st.bw[i], W = n.r.w, H = n.r.h;
        const bar = penpot.createRectangle(); bar.name = "border"; bar.fills = fill(col);
        const dim = i === 0 || i === 2 ? [W, w] : [w, H]; bar.resize(dim[0], dim[1]);
        b.appendChild(bar); if (flex) bar.layoutChild.absolute = true;
        ctx.abs.push({ shape: bar, rel: { x: n.r.x + (i === 1 ? W - w : 0), y: n.r.y + (i === 2 ? H - w : 0) } });
      });
    }
    return b;
  }

  // per-child layout properties, set after the child is attached to its flex parent
  function childProps(c, k, ctx) {
    const lc = c.layoutChild; if (!lc) return;
    if (k.t === "tx") { lc.horizontalSizing = k.lines > 1 ? "fill" : "auto"; lc.verticalSizing = "auto"; return; }
    if (k.t === "sv") { lc.horizontalSizing = "fix"; lc.verticalSizing = "fix"; return; }
    if (k.t === "ps") { lc.absolute = true; return; }
    const st = k.st;
    if (st.abs) { lc.absolute = true; return; }
    if (k.sz.w === "fill") lc.horizontalSizing = "fill";
    if (k.sz.h === "fill") lc.verticalSizing = "fill";
    const m = st.mar; if (m.some((x) => x)) { lc.topMargin = m[0]; lc.rightMargin = m[1]; lc.bottomMargin = m[2]; lc.leftMargin = m[3]; }
    if (st.minW) lc.minWidth = st.minW;
    if (st.maxW) lc.maxWidth = st.maxW;
  }

  /** Builds a tree into a free-standing board at (x, y); returns { shape, map }. */
  B.buildRoot = function (tree, x, y) {
    const ctx = { map: [], abs: [], depth: 0, warn: [] };
    const root = make(tree, ctx);
    root.x = x; root.y = y;
    for (const a of ctx.abs) { a.shape.x = x + a.rel.x; a.shape.y = y + a.rel.y; }
    // nudge once so Penpot resolves the whole auto-layout tree, then restore the intended sizing
    const w = tree.r.w, h = tree.r.h;
    root.resize(w + 1, h + 1); root.resize(w, h);
    if (root.flex) { root.flex.horizontalSizing = tree.sz.w === "hug" ? "auto" : "fix"; root.flex.verticalSizing = tree.sz.h === "hug" ? "auto" : "fix"; }
    return { shape: root, map: ctx.map, tree, warn: ctx.warn, instances: ctx.instances || 0 };
  };


  // ---------- settling ----------
  B.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  B.poke = function (item) {
    const s = penpot.currentPage.getShapeById(item.shape); if (!s) return;
    const w = item.tree.r.w, h = item.tree.r.h;
    s.resize(w + 1, h + 1); s.resize(w, h);
    if (s.flex) { s.flex.horizontalSizing = item.tree.sz.w === "hug" ? "auto" : "fix"; s.flex.verticalSizing = item.tree.sz.h === "hug" ? "auto" : "fix"; }
  };
  /** Text and icon sizes arrive asynchronously, so re-run the layout a few times until it has settled. */
  B.settle = async function (items, rounds = 3, wait = 2500) {
    for (let i = 0; i < rounds; i++) { await B.sleep(wait); items.forEach(B.poke); }
    await B.sleep(wait);
  };


  /** Re-attaches every board's children bottom-up so hugging boards recompute with the final child sizes. */
  B.reflow = function (item) {
    const page = penpot.currentPage;
    for (const { id } of item.map.slice().reverse()) {
      const b = page.getShapeById(id); if (!b || b.type !== "board" || !b.children || !b.children.length || !b.flex) continue;
      b.children.slice().forEach((c, i) => b.insertChild(i, c));
    }
    B.poke(item);
  };
  B.settle = async function (items, rounds = 3, wait = 2500) {
    for (let i = 0; i < rounds; i++) { await B.sleep(wait); items.forEach(B.reflow); }
    await B.sleep(wait);
  };


  // ---------- library generation: one Penpot variant component per spec ----------
  const LIB = (globalThis.__lib = globalThis.__lib || {});
  B.libBegin = function (name, cells) {
    const maxW = Math.max(...cells.map((c) => c.tree.r.w)), maxH = Math.max(...cells.map((c) => c.tree.r.h));
    LIB[name] = { cells, items: [], idx: 0, maxW, maxH, cols: Math.max(1, Math.floor(2400 / (maxW + 32))) };
    return { variants: cells.length, maxW, maxH, cols: LIB[name].cols };
  };
  B.libStep = function (name, count, ox, oy) {
    const L = LIB[name]; const end = Math.min(L.cells.length, L.idx + count);
    while (L.idx < end) {
      const i = L.idx++; const cell = L.cells[i];
      const r = B.buildRoot(cell.tree, ox + (i % L.cols) * (L.maxW + 32), oy + Math.floor(i / L.cols) * (L.maxH + 32));
      L.items.push({ shape: r.shape.id, map: r.map, tree: r.tree, v: cell.v });
    }
    return { built: L.idx, of: L.cells.length };
  };
  B.libPoke = (name) => { LIB[name].items.forEach(B.poke); return LIB[name].items.length; };
  B.libCheck = function (name, tol = 0.75) {
    const bad = [];
    for (const it of LIB[name].items) {
      const s = penpot.currentPage.getShapeById(it.shape); const r = B.check(s, it.map, tol);
      if (r.bad) bad.push({ v: Object.values(it.v).join("/"), bad: r.bad + "/" + r.total, first: r.sample[0] && [r.sample[0].s, r.sample[0].dx, r.sample[0].dy, r.sample[0].dw, r.sample[0].dh].join(" ") });
    }
    return { variants: LIB[name].items.length, withMismatch: bad.length, sample: bad.slice(0, 10) };
  };
  /** Turns the built variant boards into main components and combines them into one variant set. */
  B.libFinish = function (name) {
    const L = LIB[name]; const page = penpot.currentPage;
    const comps = L.items.map((it) => { const c = penpot.library.local.createComponent([page.getShapeById(it.shape)]); c.name = name; return c; });
    const first = comps[0].mainInstance();
    const cont = first.combineAsVariants(comps.slice(1).map((c) => c.mainInstance().id));
    const axes = Object.keys(L.items[0].v);
    for (let i = 1; i < axes.length; i++) comps[0].variants.addProperty();
    axes.forEach((a, i) => comps[0].variants.renameProperty(i, a));
    comps.forEach((c, idx) => axes.forEach((a, i) => c.setVariantProperty(i, String(L.items[idx].v[a]))));
    cont.name = name;
    L.container = cont.id;
    return { container: cont.id, variants: comps.length, axes };
  };


  /** Resumable version of libFinish for big sets: call repeatedly until it reports done (each call does ~`budget` operations). */
  B.libFinishStep = function (name, budget = 120) {
    const L = LIB[name]; const page = penpot.currentPage; let ops = 0;
    const F = (L.fin = L.fin || { phase: "comp", i: 0, comps: [], vi: 0 });
    const axes = Object.keys(L.items[0].v);
    if (F.phase === "comp") {
      while (F.i < L.items.length && ops < budget) { const c = penpot.library.local.createComponent([page.getShapeById(L.items[F.i].shape)]); c.name = name; F.comps.push(c); F.i++; ops++; }
      if (F.i >= L.items.length) F.phase = "combine";
    } else if (F.phase === "combine") {
      const cont = F.comps[0].mainInstance().combineAsVariants(F.comps.slice(1).map((c) => c.mainInstance().id));
      L.container = cont.id; F.phase = "props";
    } else if (F.phase === "props") {
      for (let i = 1; i < axes.length; i++) F.comps[0].variants.addProperty();
      axes.forEach((a, i) => F.comps[0].variants.renameProperty(i, a));
      F.phase = "values";
    } else if (F.phase === "values") {
      while (F.vi < F.comps.length && ops < budget) { const idx = F.vi++; axes.forEach((a, i) => F.comps[idx].setVariantProperty(i, String(L.items[idx].v[a]))); ops += axes.length; }
      if (F.vi >= F.comps.length) { page.getShapeById(L.container).name = name; F.phase = "done"; }
    }
    return { phase: F.phase, comps: F.comps.length, values: F.vi, container: L.container };
  };

  // ---------- validation: compare Penpot geometry with the browser's ----------
  B.check = function (rootShape, map, tol = 0.75) {
    const ox = rootShape.x, oy = rootShape.y; const bad = [];
    for (const { n, id } of map) {
      const s = penpot.currentPage.getShapeById(id); if (!s || !n.r) continue;
      const dx = s.x - ox - n.r.x, dy = s.y - oy - n.r.y, dw = s.width - n.r.w, dh = s.height - n.r.h;
      if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dw), Math.abs(dh)) > tol) bad.push({ id, name: s.name, t: n.t, s: n.s || n.tag, dx: +dx.toFixed(2), dy: +dy.toFixed(2), dw: +dw.toFixed(2), dh: +dh.toFixed(2) });
    }
    return { total: map.length, bad: bad.length, sample: bad.slice(0, 12) };
  };
  return "builder2 loaded";
})();
