// Penpot-side builder: turns an extract2 tree into real auto-layout boards (flex direction, gap, padding,
// fix/hug/fill sizing), text, and icon component instances. Load in the plugin with:
//   (0, eval)("(()=>{" + await (await fetch("/qui-tmp/builder2.js?" + Date.now())).text() + "})()")
(() => {
  const B = (globalThis.__B = globalThis.__B || {});
  B.shapes = B.shapes || [];

  const inter = () => penpot.fonts.all.find((f) => f.name === "Inter");
  const fill = (o) => [{ fillColor: o.c, fillOpacity: o.a }];

  // ---------- design tokens ----------
  // Every paint that the code draws from a token variable (bg-layer-2, txt-secondary ...) is bound to the matching Penpot
  // token instead of a hex value. B.stat counts what was bound and what had to stay a literal colour.
  B.stat = B.stat || { bound: 0, hex: 0, hexSamples: {} };
  B._tokens = null;
  B.token = function (cssName) {
    if (!B._tokens) { B._tokens = {}; for (const set of penpot.library.local.tokens.sets) if (/^(semantic|primitives-light)$/.test(set.name)) for (const t of set.tokens) B._tokens[t.name] = t; }
    return B._tokens[cssName.replace("-", ".")] || B._tokens[cssName.replace(/-(\d+)$/, ".$1")] || null;
  };
  /** Queues colour object `o` ({ c, a, tk }) to be bound to `shape`'s fill or stroke; counts a literal when it has no token. */
  B.queue = B.queue || {};
  B.bind = function (shape, o, prop) {
    const t = o && o.tk ? B.token(o.tk) : null;
    if (!t) { B.stat.hex++; const k = o ? o.c + "/" + o.a : "none"; B.stat.hexSamples[k] = (B.stat.hexSamples[k] || 0) + 1; return false; }
    B.bindToken(shape, t, prop); return true;
  };
  B.bindToken = function (shape, token, prop) {
    const k = token.name + "|" + prop; (B.queue[k] = B.queue[k] || { token, prop, ids: [] }).ids.push(shape.id);
    if (token.type === "color") B.stat.bound++;
  };
  /** Dimension tokens of the core set by kind and value: space (padding / gap / margin), radius, border width, control height. */
  B._dims = null;
  B.dims = function () {
    if (B._dims) return B._dims;
    const D = { space: {}, padx: {}, radius: {}, bw: {}, height: {} };
    const core = penpot.library.local.tokens.sets.find((s) => s.name === "core");
    const kind = (n) => (/^space\./.test(n) ? "space" : /^control\.padding-x\./.test(n) ? "padx" : /^radius\./.test(n) ? "radius" : /^border-width\./.test(n) ? "bw" : /^control\.height\./.test(n) ? "height" : null);
    for (const t of core.tokens) { const k = kind(t.name); const v = +t.value; if (k && !(v in D[k])) D[k][v] = t; }
    return (B._dims = D);
  };
  /** Binds dimension `v` of `shape` to the core token of that kind and value; literal values are counted like hex colours. */
  B.bindDim = function (shape, kind, v, props) {
    if (v == null || v === 0) return;
    const D = B.dims(); const key = +(+v).toFixed(2);
    const t = D[kind][key] || (kind === "space" && D.padx[key]) || null;
    const s = (B.stat.dim = B.stat.dim || { bound: 0, literal: 0, samples: {} });
    // only control heights are tokens; any other fixed height (a 12px swatch) is the component's own size, not a miss
    if (!t && kind === "height") return;
    if (!t) { s.literal += props.length; s.samples[kind + ":" + key] = (s.samples[kind + ":" + key] || 0) + props.length; return; }
    for (const p of props) B.bindToken(shape, t, p);
    s.bound += props.length;
  };
  /** Corner radii: radius.full for pills / circles, else each corner by value. */
  B.bindRadius = function (shape, rad, full) {
    const P = ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"];
    if (full) { const t = B.dims().radius[9999]; if (t) { P.forEach((p) => B.bindToken(shape, t, p)); (B.stat.dim = B.stat.dim || { bound: 0, literal: 0, samples: {} }).bound += 4; return; } }
    rad.forEach((r, i) => B.bindDim(shape, "radius", r, [P[i]]));
  };
  /** Applies every queued binding, one call per (token, property): applying shape by shape costs ~200 ms each, in bulk it is almost free. */
  B.flushTokens = function () {
    const page = penpot.currentPage; let calls = 0, shapes = 0;
    for (const q of Object.values(B.queue)) {
      const list = q.ids.map((id) => page.getShapeById(id)).filter(Boolean);
      if (list.length) { q.token.applyToShapes(list, [q.prop]); calls++; shapes += list.length; }
    }
    B.queue = {};
    return { calls, shapes };
  };

  const AI = { "flex-start": "start", start: "start", "self-start": "start", center: "center", "flex-end": "end", end: "end", "self-end": "end", stretch: "stretch", normal: "stretch", baseline: "start" };
  const JC = { "flex-start": "start", start: "start", normal: "start", left: "start", center: "center", "flex-end": "end", end: "end", "space-between": "space-between", "space-around": "space-around", "space-evenly": "space-evenly", stretch: "start" };
  const DIR = { row: "row", "row-reverse": "row-reverse", column: "column", "column-reverse": "column-reverse" };
  const SIZE = { fix: "fix", hug: "auto", fill: "fill" };

  // ---------- icons: one component per (lucide name, px size), all living on the Foundations page ----------
  // They must be created up front, on that page: a freshly created main instance gets pulled into whichever board is
  // being built, so building and component creation never mix.
  B.collectIcons = function (n, acc = {}) {
    if (!n) return acc;
    if (n.t === "sv" && n.icon) acc[n.icon + "@" + Math.round(n.r.w)] = { icon: n.icon, size: Math.round(n.r.w), svg: n.svg };
    (n.ch || []).forEach((c) => B.collectIcons(c, acc));
    return acc;
  };
  B._ic = null;
  B.iconComponent = (name, size) => {
    if (!B._ic) { B._ic = {}; for (const c of penpot.library.local.components) if (c.path.startsWith("Icons / ")) B._ic[c.name + "@" + c.path.slice(8)] = c; }
    return B._ic[name + "@" + size] || null;
  };
  B.makeIcons = function (list) {
    if (penpot.currentPage.name !== "Foundations") throw new Error("open the Foundations page first");
    const made = [], have = [];
    // one row per icon size, laid out on a free canvas area below everything else on Foundations
    const top = (penpot.currentPage.root.children || []).filter((s) => s.name !== "Icons").reduce((m, s) => Math.max(m, s.y + s.height), 0) + 160;
    const row = {}; const sizes = [...new Set(list.map((i) => i.size))].sort((a, b) => a - b);
    for (const it of list) {
      if (B.iconComponent(it.icon, it.size)) { have.push(it.icon + "@" + it.size); continue; }
      const g = penpot.createShapeFromSvg(it.svg.replace(/currentColor/g, "#313435"));
      if (!g) throw new Error("svg import failed: " + it.icon);
      g.name = it.icon; g.resize(it.size, it.size);
      penpot.currentPage.root.appendChild(g); // new shapes land in whatever board sits under the viewport centre
      const col = (row[it.size] = (row[it.size] || 0) + 1) - 1;
      g.x = 48 + col * 48; g.y = top + 96 + sizes.indexOf(it.size) * 64;
      // lucide strokes are centred; Penpot imports closed shapes with inner strokes (a 1px ellipsis dot then vanishes)
      const centre = (s) => { if (s.strokes && s.strokes.length) s.strokes = s.strokes.map((k) => ({ ...k, strokeAlignment: "center" })); (s.children || []).forEach(centre); };
      centre(g);
      B.tint(g, { tk: "txt-icon-secondary", c: "#313435", a: 1 });
      const comp = penpot.library.local.createComponent([g]);
      comp.name = it.icon; comp.path = "Icons / " + it.size; (B._ic = B._ic || {})[it.icon + "@" + it.size] = comp;
      made.push(it.icon + "@" + it.size);
    }
    B.flushTokens();
    return { made: made.length, have: have.length, top };
  };
  B.icon = function (name, svg, w, h) {
    const comp = B.iconComponent(name, Math.round(w));
    if (!comp) throw new Error("icon component missing: " + name + "@" + Math.round(w));
    return comp.instance();
  };
  B.tint = function (shape, color) {
    const want = color && color.tk ? B.token(color.tk) : null;
    const walk = (s) => {
      if (s.strokes && s.strokes.length) {
        if (want) { if (!s.tokens || s.tokens.strokeColor !== want.name) B.bindToken(s, want, "strokeColor"); }
        else { s.strokes = s.strokes.map((k) => ({ ...k, strokeColor: color.c, strokeOpacity: color.a })); B.stat.hex++; }
      }
      if (s.fills && s.fills.length && s.type === "path" && s.fills.some((k) => k.fillColor)) {
        if (want) B.bindToken(s, want, "fill"); else s.fills = s.fills.map((k) => (k.fillColor ? { ...k, fillColor: color.c, fillOpacity: color.a } : k));
      }
      if (s.children) s.children.forEach(walk);
    };
    walk(shape);
  };

  /** Binds the imported shapes of a non-icon svg, in document order, to the tokens recorded per part by extract2. */
  B.bindParts = function (g, parts, color) {
    const leaves = []; const walk = (x) => { if (x.children && x.children.length) x.children.forEach(walk); else if (x.type !== "group" && x.type !== "board") leaves.push(x); };
    walk(g);
    leaves.forEach((sh, i) => {
      const p = parts[i] || {};
      if (sh.strokes && sh.strokes.length) { if (p.stroke) { if (!B.bind(sh, p.stroke, "strokeColor")) sh.strokes = sh.strokes.map((k) => ({ ...k, strokeColor: p.stroke.c, strokeOpacity: p.stroke.a })); } else B.bind(sh, color, "strokeColor"); }
      if (sh.fills && sh.fills.length && p.fill) B.bind(sh, p.fill, "fill");
    });
  };

  // ---------- helpers ----------
  const isText = (n) => n.t === "tx";
  const hasPaint = (st) => st.bg || st.bd || (st.sh && st.sh.length) || st.rad || st.bgImg;
  const hasBox = (st) => hasPaint(st) || st.pad.some((p) => p) || st.bw.some((p) => p) || st.clip;

  function applyPaint(b, n) {
    const st = n.st;
    b.fills = st.bg ? fill(st.bg) : [];
    if (st.bg) B.bind(b, st.bg, "fill");
    if (st.rad) { b.borderRadiusTopLeft = st.rad[0]; b.borderRadiusTopRight = st.rad[1]; b.borderRadiusBottomRight = st.rad[2]; b.borderRadiusBottomLeft = st.rad[3]; B.bindRadius(b, st.rad, st.radFull); }
    if (st.bd) {
      const uniform = st.bd.every((s, i) => s && st.bw[i] === st.bw[0] && s.c === st.bd[0].c && s.a === st.bd[0].a && s.tk === st.bd[0].tk);
      if (uniform) { b.strokes = [{ strokeColor: st.bd[0].c, strokeOpacity: st.bd[0].a, strokeWidth: st.bw[0], strokeAlignment: "inner", strokeStyle: "solid" }]; B.bind(b, st.bd[0], "strokeColor"); B.bindDim(b, "bw", st.bw[0], ["strokeWidth"]); }
      else n._sideBorders = true;
    }
    if (st.sh) b.shadows = st.sh.map((s) => ({ style: s.inset ? "inner-shadow" : "drop-shadow", offsetX: s.x, offsetY: s.y, blur: s.blur, spread: s.spread, hidden: false, color: { color: s.c, opacity: s.a } }));
    if (st.op) b.opacity = st.op;
  }

  // ---------- text ----------
  /** The library text style (Foundations typographies) with this size / line height / weight, or null. */
  B._typos = null;
  B.typoFor = function (fs, lh, wt) {
    if (!B._typos) B._typos = penpot.library.local.typographies.map((t) => ({ t, fs: +t.fontSize, lh: +t.lineHeight, w: +t.fontWeight }));
    const hit = B._typos.find((x) => x.fs === fs && Math.abs(x.lh - lh) < 0.01 && x.w === wt);
    return hit ? hit.t : null;
  };
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
    // text that matches a qui text style uses it (Text / Heading become styles, not components)
    const ty = f.fst !== "italic" && !f.ls ? B.typoFor(+f.fs, +(lhPx / f.fs).toFixed(4), wt) : null;
    // applyTypography leaves the line height at Penpot's default, so restate the style's own value
    if (ty) { t.applyTypography(ty); t.lineHeight = ty.lineHeight; B.stat.styled = (B.stat.styled || 0) + 1; } else B.stat.unstyled = (B.stat.unstyled || 0) + 1;
    t.fills = fill(f); B.bind(t, f, "fill");
    if (f.td) t.textDecoration = f.td.includes("underline") ? "underline" : "line-through";
    // Penpot measures text asynchronously (and not for free-standing shapes), so seed the size the browser measured and
    // only then hand sizing back to Penpot (auto-width / auto-height). Layout resolves immediately with the right sizes.
    t.resize(Math.max(n.r.w, 1), Math.max(n.r.h, 1));
    // screens pin single-line text to the size the browser measured; library components keep Penpot hugging the text
    t.growType = n.lines > 1 ? "auto-height" : B.pinText ? "fixed" : "auto-width";
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
  // a node tagged with its own owner's component (Input's inner <input> element) is part of that component, not a nested one
  B.domLeaves = function (n, out = [], top = true, owner = n.comp) {
    if (n.t === "tx") out.push({ k: "tx", node: n });
    else if (n.t === "sv") out.push({ k: "sv", node: n });
    else if (n.t === "ps") out.push({ k: "ps", node: n });
    else if (n.t === "el") {
      if (!top && n.comp && n.comp !== owner && n.inst !== false && n.variant && B.variantComponent(n.comp, n.variant)) out.push({ k: "comp", node: n });
      else for (const c of expand(n.ch)) B.domLeaves(c, out, false, owner);
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
        const curTok = s.tokens && s.tokens.fill; const wantTok = t.f.tk ? B.token(t.f.tk) : null;
        if (wantTok) { if (curTok !== wantTok.name) { B.bindToken(s, wantTok, "fill"); B.stat.overrides = (B.stat.overrides || 0) + 1; } }
        else { const cur = s.fills && s.fills[0] && s.fills[0].fillColor; if (cur && cur.toLowerCase() !== t.f.c.toLowerCase()) { s.fills = fill(t.f); B.stat.hex++; } }
      } else if (d.k === "sv") B.tint(s, d.node.color);
      else if (d.k === "ps") {
        // re-setting an identical fill on a copy drops its token, so only touch decor whose colour really differs
        const want = d.node.bg.tk ? B.token(d.node.bg.tk) : null; const cur = s.tokens && s.tokens.fill;
        if (want ? cur !== want.name : true) { s.fills = fill(d.node.bg); B.bind(s, d.node.bg, "fill"); }
      }
      else if (d.k === "comp") B.override(s, d.node, warn);
    });
    return true;
  };

  // creates the shape for node n (detached from any parent) with its whole subtree built
  function make(n, ctx) {
    // a subtree already built by B.screenStep: reuse its board (it sits at its final screen position)
    if (n._pre) { const s = penpot.currentPage.getShapeById(n._pre); if (s) { ctx.map.push(...n._preMap); return s; } }
    if (n.t === "tx") { const t = makeText(n); ctx.map.push({ n, id: t.id }); return t; }
    if (n.t === "sv") {
      let s;
      if (n.icon) { s = B.icon(n.icon, n.svg, n.r.w, n.r.h); B.tint(s, n.color); }
      else {
        s = penpot.createShapeFromSvg(n.svg.replace(/currentColor/g, n.color.c)); s.name = "svg"; s.resize(n.r.w, n.r.h);
        if (n.parts) B.bindParts(s, n.parts, n.color);
        else B.tint(s, n.color);
      }
      ctx.map.push({ n, id: s.id }); return s;
    }
    if (n.t === "ps") {
      const r = penpot.createRectangle(); r.name = "decor"; r.resize(n.r.w, n.r.h); r.fills = fill(n.bg); B.bind(r, n.bg, "fill");
      r.borderRadiusTopLeft = n.rad[0]; r.borderRadiusTopRight = n.rad[1]; r.borderRadiusBottomRight = n.rad[2]; r.borderRadiusBottomLeft = n.rad[3];
      B.bindRadius(r, n.rad, n.rad.every((x) => x >= Math.min(n.r.w, n.r.h) / 2 - 0.01));
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
      // padding is the CSS padding (a space token); Penpot strokes never take layout room, so the border is not added in
      // and a hugging bordered box comes out 2 x border narrower than the browser's
      flex.topPadding = st.pad[0]; flex.rightPadding = st.pad[1]; flex.bottomPadding = st.pad[2]; flex.leftPadding = st.pad[3];
      ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].forEach((p, i) => B.bindDim(b, "space", st.pad[i], [p]));
      B.bindDim(b, "space", L.gap[0], ["rowGap"]); B.bindDim(b, "space", L.gap[1], ["columnGap"]);
      if (n.comp && n.sz.h === "fix") B.bindDim(b, "height", n.r.h, ["height"]);
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
        const bar = penpot.createRectangle(); bar.name = "border"; bar.fills = fill(col); B.bind(bar, col, "fill");
        const dim = i === 0 || i === 2 ? [W, w] : [w, H]; bar.resize(dim[0], dim[1]);
        b.appendChild(bar); if (flex) bar.layoutChild.absolute = true;
        // stretch with the board when an instance is resized (top / bottom bars span the width, side bars the height)
        if (i === 0 || i === 2) bar.constraintsHorizontal = "leftright"; else bar.constraintsVertical = "topbottom";
        if (i === 2) bar.constraintsVertical = "bottom"; if (i === 1) bar.constraintsHorizontal = "right";
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
    const m = st.mar; if (m.some((x) => x)) { lc.topMargin = m[0]; lc.rightMargin = m[1]; lc.bottomMargin = m[2]; lc.leftMargin = m[3]; ["marginTop", "marginRight", "marginBottom", "marginLeft"].forEach((p, i) => B.bindDim(c, "space", m[i], [p])); }
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


  // ---------- screens: too big for one call, so subtrees are built first (one call each) and the skeleton last ----------
  /** Plans screen `key`: post-order list of the largest subtrees of at most `max` nodes (whole screen = last part). */
  B.screenPlan = function (key, tree, X, Y, max = 120) {
    const count = (n) => (n._n = 1 + (n.ch || []).reduce((a, c) => a + count(c), 0));
    count(tree);
    const parts = [];
    const walk = (n, top) => {
      if (n.t !== "el") return;
      if (!top && n._n <= max) { if (n._n > 8) parts.push(n); return; }
      if (!(n.comp && n.inst !== false && n.variant)) (n.ch || []).forEach((c) => walk(c, false));
      if (n._n > max && !top) parts.push(n);
    };
    walk(tree, true);
    SCR[key] = { tree, X, Y, parts, idx: 0 };
    return { parts: parts.length, sizes: parts.map((p) => p._n) };
  };
  const SCR = (globalThis.__scr = globalThis.__scr || {});
  /** Builds the next parts of screen `key` for up to `ms`; the final step builds the root board from them. */
  B.screenStep = function (key, ms = 40000) {
    const S = SCR[key]; const t0 = Date.now(); B.pinText = true;
    while (S.idx < S.parts.length && Date.now() - t0 < ms) {
      const n = S.parts[S.idx++];
      const ctx = { map: [], abs: [], depth: 1, warn: [] };
      const s = make(n, ctx);
      penpot.currentPage.root.appendChild(s);
      s.x = S.X + n.r.x; s.y = S.Y + n.r.y;
      for (const a of ctx.abs) { a.shape.x = S.X + a.rel.x; a.shape.y = S.Y + a.rel.y; }
      n._pre = s.id; n._preMap = ctx.map; (S.warn = S.warn || []).push(...ctx.warn);
      B.flushTokens();
    }
    let root = null;
    if (S.idx >= S.parts.length && !S.root) {
      const r = B.buildRoot(S.tree, S.X, S.Y); S.root = r.shape.id; S.map = r.map; S.warn.push(...r.warn); B.flushTokens(); root = r.shape.id;
    }
    return { built: S.idx, of: S.parts.length, root: S.root || null, ms: Date.now() - t0, warn: (S.warn || []).slice(0, 5) };
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
      ox = L.ox || ox; oy = L.oy || oy;
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


  // ---------- driver helpers (each call stays under the MCP 120 s limit) ----------
  /** A pushed file: from globalThis.__files when it was handed over inline (see pack.mjs), else /qui-tmp/<name>. */
  B.readFile = async function (name) {
    const inline = globalThis.__files && globalThis.__files[name];
    if (inline) return inline;
    const r = await fetch("/qui-tmp/" + name + "?" + Date.now());
    if (!r.ok) throw new Error("fetch " + name + ": " + r.status + " (Cloudflare? hand it over with pack.mjs)");
    return r.text();
  };
  /** Opens (creating when needed) the page `name` and waits until Penpot really switched. */
  B.page = async function (name, fresh) {
    let p = penpot.currentFile.pages.find((x) => x.name === name);
    if (!p) { p = penpot.createPage(); p.name = name; }
    await penpot.openPage(p);
    for (let i = 0; i < 40 && penpot.currentPage.id !== p.id; i++) await B.sleep(250);
    if (penpot.currentPage.id !== p.id) throw new Error("page switch failed: " + name);
    if (fresh) penpot.currentPage.findShapes().filter((s) => s.parent && s.parent.type === "root").forEach((s) => s.remove());
    return penpot.currentPage.name;
  };
  /** Removes every existing component set called `name` (removing its container on whichever page holds it removes the components). */
  B.dropOld = async function (name, ms = 90000) {
    const t0 = Date.now(); let n = 0;
    for (const c of penpot.library.local.components.filter((x) => x.name === name)) {
      const id = c.mainInstance().parent.id;
      const p = penpot.currentFile.pages.find((x) => x.getShapeById(id)); if (!p) continue;
      await B.page(p.name); const sh = penpot.currentPage.getShapeById(id); if (sh) { sh.remove(); n++; }
    }
    while (penpot.library.local.components.some((x) => x.name === name) && Date.now() - t0 < ms) await B.sleep(500);
    return { removed: n, left: penpot.library.local.components.filter((x) => x.name === name).length, ms: Date.now() - t0 };
  };
  /** Library level of every set: sets live on the Atoms / Molecules / Organisms page, never on a page of their own. */
  B.LEVEL = { Button: "Atoms", IconButton: "Atoms", Pill: "Atoms", Badge: "Atoms", Avatar: "Atoms", AvatarGroup: "Atoms", Swatch: "Atoms", Shortcut: "Atoms", Heading: "Atoms", WorkspaceAvatar: "Atoms", Input: "Atoms",
    Tab: "Molecules", ListItem: "Molecules", ListSection: "Molecules", StateGroupHeader: "Molecules", WorkItemRow: "Molecules", Property: "Molecules", ViewToolbar: "Molecules", RailItem: "Molecules",
    NavSidebar: "Organisms", ProjectHeader: "Organisms", WorkItemCard: "Organisms" };
  // sets added after the first 22 take their level from the spec sheet (cell.level), see B.start
  B.levelOf = (name, cells) => B.LEVEL[name] || ({ atoms: "Atoms", molecules: "Molecules", organisms: "Organisms" })[cells && cells[0] && cells[0].level];
  /** Starts a set: drops any old copy, opens its level page and builds below whatever is already there. Data from /qui-tmp/spec-<name>.js. */
  B.start = async function (name) {
    B.stat = { bound: 0, hex: 0, hexSamples: {} }; B.queue = {};
    const d = JSON.parse(await B.readFile("spec-" + name + ".js"));
    const lvl = B.levelOf(name, d.cells); if (!lvl) throw new Error("no level for " + name);
    await B.dropOld(name);
    await B.page(lvl, false);
    const roots = (penpot.currentPage.root.children || []).flatMap((s) => (s.type === "board" && s.name === "Root Frame" ? s.children || [] : [s]));
    const bottom = roots.reduce((m, s) => Math.max(m, s.y + s.height), 0);
    const r = B.libBegin(name, d.cells);
    LIB[name].ox = 0; LIB[name].oy = roots.length ? bottom + 160 : 0;
    return r;
  };
  /** Builds variants for up to `ms` milliseconds, binding tokens after every small batch. */
  B.pump = function (name, ms = 80000, batch = 6) {
    const L = LIB[name]; const t0 = Date.now();
    while (L.idx < L.cells.length && Date.now() - t0 < ms) { B.libStep(name, batch, 0, 0); B.flushTokens(); }
    return { built: L.idx, of: L.cells.length, ms: Date.now() - t0, stat: B.stat };
  };
  /** One whole set in one MCP call (start, build, finish) within `budget` ms; call again if it reports an unfinished phase. */
  B.run = async function (name, budget = 50000) {
    const t0 = Date.now(); B._vc = {}; B._typos = null; B._dims = null;
    const s = await B.start(name); const p = B.pump(name, budget * 0.6, 6); let f = null;
    if (p.built >= p.of) { await B.sleep(1500); do { f = B.libFinishStep(name, 40); } while (f.phase !== "done" && Date.now() - t0 < budget); }
    const d = B.stat.dim || { bound: 0, literal: 0, samples: {} };
    return { name, variants: s.variants, built: p.built, finish: f && f.phase, colours: B.stat.bound, hex: B.stat.hex, dims: d.bound, literal: d.literal, samples: d.samples, ms: Date.now() - t0 };
  };
  /** Runs the finishing phases (components, combine, properties, values) within a time budget. */
  B.finish = function (name, ms = 80000) {
    const t0 = Date.now(); let r;
    do { r = B.libFinishStep(name, 40); } while (r.phase !== "done" && Date.now() - t0 < ms);
    return r;
  };
  /** Token audit of a finished set: how many paints exist and how many are bound to a token. */
  B.audit = function (name) {
    const c = penpot.library.local.components.find((x) => x.name === name); if (!c) return null;
    const vcs = c.variants ? c.variants.variantComponents() : [c]; let paints = 0, bound = 0; const hex = {};
    const walk = (s) => { for (const k of ["fills", "strokes"]) (s[k] || []).forEach((f) => { if (f.fillColor || f.strokeColor) { paints++; const prop = k === "fills" ? "fill" : "strokeColor"; if (s.tokens && s.tokens[prop]) bound++; else { const h = f.fillColor || f.strokeColor; hex[h] = (hex[h] || 0) + 1; } } }); (s.children || []).forEach(walk); };
    vcs.forEach((v) => walk(v.mainInstance()));
    return { variants: vcs.length, paints, bound, unbound: paints - bound, hex };
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
