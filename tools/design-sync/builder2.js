// Penpot-side builder: turns an extract2 tree into real auto-layout boards (flex direction, gap, padding,
// fix/hug/fill sizing), text, and icon component instances. Load in the plugin with:
//   (0, eval)("(()=>{" + await (await fetch("/qui-tmp/builder2.js?" + Date.now())).text() + "})()")
(() => {
  const B = (globalThis.__B = globalThis.__B || {});
  /** qui components that render one styled text run: in Penpot they are a text layer with the matching text style. */
  B.TEXT_STYLE_COMPS = ["Text"];
  /** Components that keep a fixed number of slots and clip them (overflow hidden): a screen sets the width, the slots past
   *  it are cut off, and only the visible slots are matched against the DOM. */
  B.CLIP_COMPS = ["TableRow", "Table", "TabsList", "ListSection", "NavSidebar"];
  B.shapes = B.shapes || [];

  /** The Penpot font for a CSS family the page rendered with (IBM Plex Sans for qui), else the qui body font. */
  const fontFor = (ff) => penpot.fonts.findByName(ff || "IBM Plex Sans") || penpot.fonts.findByName("IBM Plex Sans");
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

  // ---------- icons: ONE "Icon" component with a Name variant per Tabler icon (item 9b3, user 2026-10-31) ----------
  // Every variant is Tabler's own outline svg exactly as drawn (icons-asis.mjs -> icons-asis.json): 24x24 grid, 2px
  // stroke, real Penpot strokes, nothing converted. The set is `Icons / Icon`; its Name property (the Tabler name) is
  // the dropdown a designer picks the icon from. Size comes from resizing the instance. Penpot keeps the stroke number
  // when a shape is resized, so B.fitIcon also overrides the instance's stroke width with what the browser draws at
  // that size (2 * size / 24: 1.167 at 14, 1.333 at 16). The set is built up front on its own "Icons" page: a freshly
  // created main instance gets pulled into whichever board is being built, so building and component creation never
  // mix. Older icon components never match: 9b2's outlined ones (`Icons (outlined) / <name>`) and Lucide's
  // (`Icons (lucide) / <size>`), both deleted in 9e.
  B.collectIcons = function (n, acc = {}) {
    if (!n) return acc;
    if (n.t === "sv" && n.icon) acc[n.icon] = acc[n.icon] || { icon: n.icon, svg: n.svg };
    (n.ch || []).forEach((c) => B.collectIcons(c, acc));
    return acc;
  };
  // the browser scales an svg's stroke with its viewBox (2px on a 24 grid draws 1.17px at 14px); Penpot keeps the
  // number as px after resizing, so bake the drawn width into a NON-icon svg before importing it
  B.scaleStroke = function (svg, w) {
    const vb = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/);
    const k = vb ? w / parseFloat(vb[1]) : 1;
    return k === 1 ? svg : svg.replace(/stroke-width="([\d.]+)"/g, (_, v) => `stroke-width="${+(parseFloat(v) * k).toFixed(3)}"`);
  };
  B._ic = null;
  B.ICON_PATH = "Icons";
  B.ICON_SET = "Icon";
  B.ICON_PAGE = "Icons";
  B.ICON_OUTLINED_PATH = "Icons (outlined)";
  /** The `Name=<name>` variant of the `Icons / Icon` set (null when missing). */
  B.iconComponent = (name) => {
    if (!B._ic) {
      B._ic = {};
      // the library lists one component per variant set: its variants come from c.variants
      for (const c of penpot.library.local.components) if (c.path === B.ICON_PATH && c.variants)
        for (const v of c.variants.variantComponents()) if (v.variantProps && v.variantProps.Name) B._ic[v.variantProps.Name] = v;
    }
    return B._ic[name] || null;
  };
  /** 9b2's outlined components (plain components, path `Icons`) move to `Icons (outlined)` so the Icon set owns `Icons`;
   *  their instances keep working (the link is by id). Delete them in 9e once nothing uses them. */
  B.retireOutlinedIcons = function () {
    let n = 0;
    for (const c of penpot.library.local.components) if (c.path === B.ICON_PATH && !c.variants) { c.path = B.ICON_OUTLINED_PATH; n++; }
    B._ic = null;
    return { moved: n };
  };
  /** Builds the `Icons / Icon` variant set from `list` (icons-asis.json: `{icon, svg}`, Tabler's 24px files) on the Icons
   *  page: one 24x24 main per icon in a grid, strokes centred, stroke colour bound to txt.icon-secondary, combined into
   *  one set with property Name. All 48 import in a few seconds, so it is one call. */
  B.makeIconSet = function (list) {
    if (penpot.currentPage.name !== B.ICON_PAGE) throw new Error('open the "' + B.ICON_PAGE + '" page first (await B.page(B.ICON_PAGE))');
    if (B.iconComponent(list[0].icon)) return { have: true };
    const cols = 12, gap = 24, top = B.topShapes().reduce((m, t) => Math.max(m, t.y + t.height), 0) + 160;
    // new shapes land inside a board anyway (the page root takes no appendChild), so the mains get one of their own
    const board = penpot.createBoard(); board.name = "Icon"; board.x = 0; board.y = top;
    board.resize(gap + cols * (24 + gap), gap + Math.ceil(list.length / cols) * (24 + gap));
    B.bindToken(board, B.token("bg-canvas"), "fill"); board.borderRadius = 12;
    // Penpot imports closed shapes with inner strokes (half the line would vanish): Tabler's strokes are centred
    const centre = (s) => { if (s.strokes && s.strokes.length) s.strokes = s.strokes.map((k) => ({ ...k, strokeAlignment: "center" })); (s.children || []).forEach(centre); };
    const comps = [];
    list.forEach((it, i) => {
      const g = penpot.createShapeFromSvg(it.svg.replace(/currentColor/g, "#313435"));
      if (!g) throw new Error("svg import failed: " + it.icon);
      if (Math.abs(g.width - 24) > 0.01 || Math.abs(g.height - 24) > 0.01) { g.remove(); throw new Error(it.icon + " imported at " + g.width + "x" + g.height + ", not 24x24"); }
      board.appendChild(g);
      g.name = it.icon; g.x = board.x + gap + (i % cols) * (24 + gap); g.y = board.y + gap + Math.floor(i / cols) * (24 + gap);
      centre(g); B.tint(g, { tk: "txt-icon-secondary", c: "#313435", a: 1 });
      const c = penpot.library.local.createComponent([g]); c.name = it.icon; comps.push(c);
    });
    const cont = comps[0].mainInstance().combineAsVariants(comps.slice(1).map((c) => c.mainInstance().id));
    comps[0].variants.renameProperty(0, "Name");
    comps.forEach((c, i) => c.setVariantProperty(0, list[i].icon));
    // name the container first: renaming it resets the variants' path (and a path set on one variant applies to all)
    cont.name = B.ICON_SET;
    comps.forEach((c, i) => { if (c.path !== B.ICON_PATH) c.path = B.ICON_PATH; B._ic[list[i].icon] = c; });
    B.flushTokens();
    return { container: cont.id, variants: comps.length };
  };
  /** Adds the icons of `list` (icons-asis.json) that the `Icons / Icon` set lacks as new Name variants, at most `max` per
   *  call, appended into the existing variant container (grid continues after the last glyph). The existing variants
   *  are not touched, so every instance keeps its link (rebuilding the set with makeIconSet would orphan them). */
  B.addIcons = function (list, max = 12) {
    if (penpot.currentPage.name !== B.ICON_PAGE) throw new Error('open the "' + B.ICON_PAGE + '" page first (await B.page(B.ICON_PAGE))');
    B._ic = null; B.iconComponent("");
    const any = Object.values(B._ic)[0]; if (!any) throw new Error("no Icons / Icon set: use B.makeIconSet");
    const ref = any.mainInstance(); const vc = ref.parent;
    if (!vc || !vc.isVariantContainer || !vc.isVariantContainer()) throw new Error("Icon variant container not found");
    const todo = list.filter((it) => !B._ic[it.icon]).slice(0, max);
    if (!todo.length) return { added: 0, total: Object.keys(B._ic).length };
    const cols = 12, step = 48, kids = vc.children;
    const x0 = Math.min(...kids.map((k) => k.x - vc.x)), y0 = Math.min(...kids.map((k) => k.y - vc.y)), n0 = kids.length;
    const rows = Math.ceil((n0 + todo.length) / cols);
    const outer = vc.parent; const grow = y0 * 2 + rows * step - (step - 24) - vc.height;
    if (grow > 0) { vc.resize(vc.width, vc.height + grow); if (outer && outer.type === "board" && !outer.isVariantContainer()) outer.resize(outer.width, outer.height + grow); }
    const centre = (s) => { if (s.strokes && s.strokes.length) s.strokes = s.strokes.map((k) => ({ ...k, strokeAlignment: "center" })); (s.children || []).forEach(centre); };
    const added = [];
    todo.forEach((it, i) => {
      const g = penpot.createShapeFromSvg(it.svg.replace(/currentColor/g, "#313435"));
      if (!g) throw new Error("svg import failed: " + it.icon);
      if (Math.abs(g.width - 24) > 0.01 || Math.abs(g.height - 24) > 0.01) { g.remove(); throw new Error(it.icon + " imported at " + g.width + "x" + g.height + ", not 24x24"); }
      outer.appendChild(g); g.name = it.icon; centre(g); B.tint(g, { tk: "txt-icon-secondary", c: "#313435", a: 1 });
      const c = penpot.library.local.createComponent([g]); c.name = it.icon;
      const m = c.mainInstance(); vc.appendChild(m);
      const k = n0 + i; m.x = vc.x + x0 + (k % cols) * step; m.y = vc.y + y0 + Math.floor(k / cols) * step;
      added.push({ it, m });
    });
    B._ic = null; B.iconComponent("");
    const out = [];
    for (const { it, m } of added) {
      const c = m.component();
      if (c && c.isVariant && c.isVariant()) { c.setVariantProperty(0, it.icon); if (c.path !== B.ICON_PATH) c.path = B.ICON_PATH; }
      out.push({ icon: it.icon, variant: !!(c && c.isVariant && c.isVariant()), props: c && c.variantProps, name: m.name, path: c && c.path });
    }
    B._ic = null; B.flushTokens();
    return { added: out.length, out };
  };
  /** Sizes an icon instance to w x h and sets its stroke width to what the browser draws there (Penpot keeps 2). */
  B.fitIcon = function (inst, w, h) {
    if (Math.abs(inst.width - w) > 0.01 || Math.abs(inst.height - h) > 0.01) inst.resize(w, h);
    const sw = +((2 * w) / 24).toFixed(3);
    const walk = (s) => { if (s.strokes && s.strokes.length && s.strokes.some((k) => k.strokeWidth !== sw)) s.strokes = s.strokes.map((k) => ({ ...k, strokeWidth: sw })); (s.children || []).forEach(walk); };
    walk(inst);
    return inst;
  };
  /** An instance of the icon, sized to the rendered w x h with the matching stroke width. */
  B.icon = function (name, svg, w, h) {
    const comp = B.iconComponent(name);
    if (!comp) throw new Error("icon missing from the Icon set: " + name + " (add it to icons-asis.json and rebuild the set)");
    return B.fitIcon(comp.instance(), w, h);
  };
  B.tint = function (shape, color) {
    const want = color && color.tk ? B.token(color.tk) : null;
    const walk = (s) => {
      if (s.strokes && s.strokes.length) {
        if (want) { if (!s.tokens || s.tokens.strokeColor !== want.name) B.bindToken(s, want, "strokeColor"); }
        else { s.strokes = s.strokes.map((k) => ({ ...k, strokeColor: color.c, strokeOpacity: color.a })); B.stat.hex++; }
      }
      if (s.fills && s.fills.length && s.type === "path" && s.fills.some((k) => k.fillColor)) {
        // applying the token a copy already carries toggles it OFF (tested 2026-10-31: a fresh settings copy keeps
        // txt.icon-secondary, re-applying it drops it), so only bind a fill whose token differs
        if (want) { if (!s.tokens || s.tokens.fill !== want.name) B.bindToken(s, want, "fill"); } else s.fills = s.fills.map((k) => (k.fillColor ? { ...k, fillColor: color.c, fillOpacity: color.a } : k));
      }
      if (s.children) s.children.forEach(walk);
    };
    walk(shape);
  };

  /** Binds the imported shapes of a non-icon svg, in document order, to the tokens recorded per part by extract2. */
  B.bindParts = function (g, parts, color) {
    // Penpot's svg import adds a hidden "base-background" rect of its own: it is no part of the drawing
    const leaves = []; const walk = (x) => { if (x.children && x.children.length) x.children.forEach(walk); else if (x.type !== "group" && x.type !== "board" && x.name !== "base-background") leaves.push(x); };
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
    if (st.sh) {
      // inset hairlines become side bars (see make); the rest stay shadows
      const side = (x) => (x.inset && !x.blur && !x.spread && (!x.x !== !x.y) ? (x.y < 0 ? 2 : x.y > 0 ? 0 : x.x < 0 ? 1 : 3) : -1);
      n._hairlines = st.sh.filter((x) => side(x) >= 0).map((x) => ({ side: side(x), w: Math.abs(x.x || x.y), col: { c: x.c, a: x.a, tk: x.tk } }));
      st.sh = st.sh.filter((x) => side(x) < 0);
      // an inset ring (0 0 0 Npx inset, a checkbox's outline) is an inner stroke of N px, unless the box already has a border
      const ring = st.sh.find((x) => x.inset && !x.x && !x.y && !x.blur && x.spread > 0);
      if (ring && !(st.bd && st.bd.some(Boolean))) {
        b.strokes = [{ strokeColor: ring.c, strokeOpacity: ring.a, strokeWidth: ring.spread, strokeAlignment: "inner", strokeStyle: "solid" }];
        B.bind(b, { c: ring.c, a: ring.a, tk: ring.tk }, "strokeColor");
        st.sh = st.sh.filter((x) => x !== ring);
      }
      if (!st.sh.length) delete st.sh;
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
  // font, size, weight, line height, letter spacing (and the matching qui text style) of browser text style `f`
  function textStyle(t, f) {
    const wt = f.fw === "450" ? 400 : parseInt(f.fw);
    const font = fontFor(f.ff);
    t.fontId = font.fontId; t.fontFamily = font.name;
    t.fontVariantId = (wt === 400 ? "regular" : String(wt)) + (f.fst === "italic" ? "italic" : "");
    t.fontWeight = String(wt); t.fontSize = String(f.fs); t.fontStyle = f.fst === "italic" ? "italic" : "normal";
    let lhPx = f.lh || f.fs * 1.21; if (lhPx - Math.floor(lhPx) > 0 && lhPx - Math.floor(lhPx) <= 0.06) lhPx = Math.floor(lhPx);
    t.lineHeight = String(+(lhPx / f.fs).toFixed(4));
    t.letterSpacing = String(f.ls || 0);
    // text that matches a qui text style uses it (Text / Heading become styles, not components)
    const ty = f.fst !== "italic" && !f.ls ? B.typoFor(+f.fs, +(lhPx / f.fs).toFixed(4), wt) : null;
    // applyTypography leaves the line height at Penpot's default, so restate the style's own value
    if (ty) { t.applyTypography(ty); t.lineHeight = ty.lineHeight; B.stat.styled = (B.stat.styled || 0) + 1; } else B.stat.unstyled = (B.stat.unstyled || 0) + 1;
  }
  B.textStyle = textStyle;
  /** True when text shape `s` does not carry browser style `f` (a bold Total row in a regular cell slot). */
  B.styleDiffers = (s, f) => String(s.fontWeight) !== String(f.fw === "450" ? 400 : parseInt(f.fw)) || +s.fontSize !== +f.fs || (s.fontStyle || "normal") !== (f.fst === "italic" ? "italic" : "normal") || (s.fontFamily && fontFor(f.ff).name !== s.fontFamily);
  function makeText(n) {
    const f = n.f;
    const t = penpot.createText(n.breaks && n.breaks.length > 1 ? n.breaks.join(" ") : n.s);
    if (!t) throw new Error("createText failed");
    t.name = (n.s.trim().replace(/\//g, "∕").slice(0, 40)) || "text";
    textStyle(t, f);
    t.fills = fill(f); B.bind(t, f, "fill");
    if (f.td) t.textDecoration = f.td.includes("underline") ? "underline" : "line-through";
    // Penpot measures text asynchronously (and not for free-standing shapes), so seed the size the browser measured and
    // only then hand sizing back to Penpot (auto-width / auto-height). Layout resolves immediately with the right sizes.
    // single-line text gets a few px of slack: Penpot's text renders a hair wider than the browser's and would wrap
    t.resize(Math.max(n.r.w + (n.lines > 1 ? 0 : 3), 1), Math.max(n.r.h, 1));
    // screens pin single-line text to the size the browser measured; library components keep Penpot hugging the text
    // Penpot's auto-width ignores trailing spaces ("•••• " shrinks to the dots), so such a run keeps the browser's width
    t.growType = n.lines > 1 ? "auto-height" : B.pinText || /\s$/.test(n.s) ? "fixed" : "auto-width";
    return t;
  }

  // ---------- elements ----------
  // Penpot only re-runs auto-layout on geometry changes, not on property edits. So every board is built bottom-up
  // (children attached and all properties set before the board itself is attached) and the root is nudged once at the end.
  /** In a column, text-align end / center moves the children across: a right-aligned table cell keeps its content flush right. */
  const TA = { end: "end", right: "end", center: "center" };
  function layoutOf(n, kids) {
    const L = layoutBase(n, kids); const st = n.st;
    if (L.dir === "column" && TA[st.ta] && (L.ai === "stretch" || L.ai === "start")) L.ai = TA[st.ta];
    // a line of inline content follows text-align along the row
    if (L.inline && TA[st.ta]) L.jc = TA[st.ta];
    // table cells centre their content vertically (vertical-align: middle, the browser default for td / th)
    if (st.va != null) { const v = st.va === "top" ? "start" : st.va === "bottom" ? "end" : "center"; if (L.dir === "column") L.jc = v; else { L.ai = v; L.wrap = false; } }
    return L;
  }
  function layoutBase(n, kids) {
    const st = n.st;
    // a flex-wrap row the browser laid out on one line stays one line: Penpot's children come out a hair wider and
    // would otherwise wrap the last one (a horizontal CheckboxGroup / RadioGroup)
    if (st.d === "flex") {
      const fl = kids.filter((k) => !(k.t === "el" && k.st.abs));
      const oneLine = !(st.dir || "row").startsWith("column") && fl.every((a) => fl.every((b) => a.r.y < b.r.y + b.r.h - 0.5));
      return { dir: DIR[st.dir] || "row", wrap: st.wrap && !oneLine, ai: AI[st.ai] || "stretch", jc: JC[st.jc] || "start", gap: st.gap };
    }
    // HTML tables: a row lays its cells out side by side; the table and its row groups stack rows
    if (st.d === "table-row") return { dir: "row", wrap: false, ai: "stretch", jc: "start", gap: [0, 0] };
    if (st.d === "grid") return { dir: "row", wrap: true, ai: AI[st.ai] || "stretch", jc: JC[st.jc] || "start", gap: st.gap };
    // absolutely placed children (an sr-only label) take no part in the flow
    const flow = kids.filter((k) => !(k.t === "el" && k.st.abs));
    const inlineOnly = flow.length > 0 && flow.every((k) => k.t === "tx" || (k.t === "el" && k.st.d === "inline"));
    // inline content wraps only when the browser broke it over lines; a one-line run (•••• 6187) never wraps
    if (inlineOnly) { const ys = flow.map((k) => k.r.y); return { dir: "row", wrap: Math.max(...ys) - Math.min(...ys) > 2, ai: "start", jc: "start", gap: [0, 0], inline: true }; }
    return { dir: "column", wrap: false, ai: "stretch", jc: "start", gap: [0, 0] };
  }
  function nameFor(n, kids) {
    if (n.comp) return n.comp;
    if (n.prim) return n.prim;
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
  /** Library components of qui set `name`, never the icon library: the `Icons / Icon` set (and the old `Icons (outlined)` /
   *  `Icons (lucide)` ones) share names with qui sets — B.dropOld("Icon") deleted the whole Icon set on 2026-10-31. */
  B.isIconLib = (c) => c.path === B.ICON_PATH || /^Icons \(/.test(c.path || "");
  B.setComps = (name) => penpot.library.local.components.filter((c) => c.name === name && !B.isIconLib(c));
  /** The variant component of library set `name` whose properties match `variant` (null when absent). */
  B.variantComponent = function (name, variant, fresh) {
    if (fresh || !B._vc[name]) {
      const sets = B.setComps(name);
      B._vc[name] = sets.flatMap((c) => (c.variants ? c.variants.variantComponents() : [c]));
    }
    if (!variant) return null;
    // a one-variant set is a plain component (Penpot cannot combine one): it stands for its only variant
    if (B._vc[name].length === 1) { const vp = B._vc[name][0].variantProps; if (!vp || !Object.keys(vp).length) return B._vc[name][0]; }
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
      else for (const c of expand(n.ch)) {
        // a value-driven bar (LinearProgress' indicator, a slider fill / thumb): an absolute, childless, painted box whose
        // size and offset follow the value, so it is a slot too (resized and moved to what the page shows)
        if (B.isBar(c)) out.push({ k: "bx", node: c, par: n });
        else if (c.t === "ps") out.push({ k: "ps", node: c, par: n }); // decor: placed like a bar (ovContent)
        else B.domLeaves(c, out, false, owner);
      }
    }
    return out;
  };
  B.isBar = (c) => c.t === "el" && !c.comp && !(c.ch || []).length && c.st && c.st.abs && !!c.st.bg;
  B.shapeLeaves = function (shape, out = [], top = true) {
    if (shape.type === "text") out.push(shape);
    else if (shape.type === "rectangle" && shape.name === "decor") out.push(shape);
    else if (!top && shape.type === "board" && !(shape.children || []).length && shape.layoutChild && shape.layoutChild.absolute && shape.fills && shape.fills.length) out.push(shape);
    else if (!top && shape.isComponentHead && shape.isComponentHead()) out.push(shape);
    // a non-icon svg (a chart's plot, a progress ring) is one leaf: its paths and svg texts are not slots
    else if (!top && shape.name === "svg" && shape.type === "group") out.push(shape);
    else if (shape.children) for (const c of shape.children) B.shapeLeaves(c, out, false);
    return out;
  };
  /** Applies the text / icon / nested-component differences between a plain variant instance and what the page renders. */
  B.override = function (inst, n, warn) {
    const dom = B.ovPlan(inst, n, warn); if (!dom) return false;
    const shp0 = B.shapeLeaves(inst);
    dom.forEach((d, i) => B.ovSwap(d, shp0[i])); // pass 1: swaps (these replace shapes)
    const shp = B.shapeLeaves(inst).slice(0, dom.length);
    dom.forEach((d, i) => B.ovContent(d, shp[i], n, warn)); // pass 2: content
    B.fitWrap(inst, n);
    return true;
  };
  /** A wrap row the browser broke over lines (a legend in a narrow card) wraps in the instance too: the set keeps a row the
   *  spec sheet laid on one line unwrapped, so the screen's copy turns wrapping back on. */
  B.fitWrap = function (inst, n) {
    if (!inst.flex || !n.st || !n.st.wrap || n.st.d !== "flex" || !String(n.st.dir || "").startsWith("row")) return;
    const ys = (n.ch || []).filter((k) => k.r && !(k.st && k.st.abs)).map((k) => k.r.y);
    if (ys.length > 1 && Math.max(...ys) - Math.min(...ys) > 2 && inst.flex.wrap !== "wrap") inst.flex.wrap = "wrap";
  };
  /** The DOM leaves an instance's slots take (null, with a warning, when they do not fit its shape leaves). */
  B.ovPlan = function (inst, n, warn) {
    let dom = B.domLeaves(n); const shp = B.shapeLeaves(inst);
    if (B.CLIP_COMPS.includes(n.comp)) {
      // what the screen clips away (rows below a scrolled table's edge) has no slot to fill
      const r = n.r; dom = dom.filter((d) => d.node.r.y < r.y + r.h - 0.5 && d.node.r.x < r.x + r.w - 0.5);
      if (dom.length > shp.length) { (warn || []).push(`${n.comp}: ${dom.length} visible items vs ${shp.length} slots`); return null; }
    }
    else if (dom.length !== shp.length) { (warn || []).push(`${n.comp}: ${dom.length} dom leaves vs ${shp.length} shapes`); return null; }
    return dom;
  };
  /** Override pass 1 for one leaf: swap an icon / nested instance to the component the DOM shows. */
  B.ovSwap = function (d, s) {
    if (!s) return;
    if (d.k === "sv" && d.node.icon) {
      // the icon the DOM shows, at its rendered size; a slot keeping its default glyph would silently show the wrong icon
      const r = d.node.r, want = B.iconComponent(d.node.icon); const cur = s.component && s.component();
      if (!want) throw new Error("icon missing from the Icon set: " + d.node.icon);
      if (cur && cur.id !== want.id) s.swapComponent(want);
      B.fitIcon(s, r.w, r.h);
    } else if (d.k === "comp") {
      const want = B.variantComponent(d.node.comp, d.node.variant); const cur = s.component && s.component();
      if (want && cur && cur.id !== want.id) s.swapComponent(want);
    }
  };
  /** Override pass 2 for one leaf: text, tint, decor, or the nested instance's own overrides. */
  B.ovContent = function (d, s, n, warn) {
    {
      if (!s) return;
      // plain text in a slot that holds a nested instance (a TableCell's TextCell): the text goes into that instance
      if (d.k === "tx" && s.type !== "text") {
        const c = s.component && s.component();
        if (!c || !B.override(s, { t: "el", comp: c.name, st: {}, ch: [d.node] }, warn)) (warn || []).push(`${n.comp}: text "${d.node.s}" has no text slot`);
        return;
      }
      if (d.k === "comp") {
        B.override(s, d.node, warn);
        // a slot instance takes the size the screen gives it: column width, row height
        const r = d.node.r;
        if (Math.abs(s.width - r.w) > 0.5 || Math.abs(s.height - r.h) > 0.5) s.resize(Math.max(r.w, 0.01), Math.max(r.h, 0.01));
        return;
      }
      if (d.k === "bx") {
        const r = d.node.r, pr = d.par.r, P = s.parent;
        if (Math.abs(s.width - r.w) > 0.3 || Math.abs(s.height - r.h) > 0.3) s.resize(Math.max(r.w, 0.01), Math.max(r.h, 0.01));
        if (P) { const x = P.x + (r.x - pr.x), y = P.y + (r.y - pr.y); if (Math.abs(s.x - x) > 0.3) s.x = x; if (Math.abs(s.y - y) > 0.3) s.y = y; }
        return;
      }
      if (d.k === "tx") {
        const t = d.node;
        if (s.characters !== t.s) s.characters = t.s;
        // a slot whose text the page styles differently (bold total row, semibold count) takes the page's style
        if (B.styleDiffers(s, t.f)) { textStyle(s, t.f); B.stat.overrides = (B.stat.overrides || 0) + 1; }
        s.resize(Math.max(t.r.w, 1), Math.max(t.r.h, 1)); s.growType = t.lines > 1 ? "auto-height" : /\s$/.test(t.s) ? "fixed" : "auto-width";
        const curTok = s.tokens && s.tokens.fill; const wantTok = t.f.tk ? B.token(t.f.tk) : null;
        if (wantTok) { if (curTok !== wantTok.name) { B.bindToken(s, wantTok, "fill"); B.stat.overrides = (B.stat.overrides || 0) + 1; } }
        else { const cur = s.fills && s.fills[0] && s.fills[0].fillColor; if (cur && cur.toLowerCase() !== t.f.c.toLowerCase()) { s.fills = fill(t.f); B.stat.hex++; } }
      } else if (d.k === "sv" && d.node.icon) { B.tint(s, d.node.color); B.turn(s, d.node.rot); }
      // a non-icon svg keeps its component's drawing: a copy cannot re-plot a chart (the set plots the app's sample data)
      else if (d.k === "ps") {
        // re-setting an identical fill on a copy drops its token, so only touch decor whose colour really differs
        const want = d.node.bg.tk ? B.token(d.node.bg.tk) : null; const cur = s.tokens && s.tokens.fill;
        if (want ? cur !== want.name : true) { s.fills = fill(d.node.bg); B.bind(s, d.node.bg, "fill"); }
        // and its size / offset in its parent (Tab's ::after underline spans the tab the page widened: 9d 2026-10-31)
        B.placePs(d, s);
      }
    }
  };

  /** Puts a decor slot (pseudo-element) at the size and offset the page gives it inside its parent. */
  B.placePs = function (d, s) {
    const r = d.node.r, pr = d.par && d.par.r, P = s && s.parent; if (!pr || !P || !r) return 0;
    if (Math.abs(s.width - r.w) > 0.05 || Math.abs(s.height - r.h) > 0.05) s.resize(Math.max(r.w, 0.01), Math.max(r.h, 0.01));
    const x = P.x + (r.x - pr.x), y = P.y + (r.y - pr.y); let n = 0;
    if (Math.abs(s.x - x) > 0.3) { s.x = x; n = 1; } if (Math.abs(s.y - y) > 0.3) { s.y = y; n = 1; }
    return n;
  };
  /** Re-places the decor slots of an instance (and the instances nested in it) once it sits in its parent: an instance
   *  overridden free-standing and then appended to a flex parent leaves its absolute decor behind (TabsList's selected
   *  Tab underline sat 2 px low, outside the clip; 9d 2026-10-31). */
  B.placeDecor = function (inst, n) {
    const dom = B.ovPlan(inst, n, []); if (!dom) return 0;
    const shp = B.shapeLeaves(inst).slice(0, dom.length); let k = 0;
    dom.forEach((d, i) => { const s = shp[i]; if (!s) return; if (d.k === "ps") k += B.placePs(d, s); else if (d.k === "comp") k += B.placeDecor(s, d.node); });
    return k;
  };
  /** Turns an icon to the rotation the browser shows (extract2 `rot`, degrees clockwise: a closed disclosure chevron is 270). */
  B.turn = function (s, rot) {
    const want = ((rot || 0) % 360 + 360) % 360, cur = ((Math.round(s.rotation || 0)) % 360 + 360) % 360;
    if (want !== cur) s.rotate(want - cur);
  };
  // creates the shape for node n (detached from any parent) with its whole subtree built
  function make(n, ctx) {
    // a subtree already built by B.screenStep: reuse its board (it sits at its final screen position)
    if (n._pre) { const s = penpot.currentPage.getShapeById(n._pre); if (s) { ctx.map.push(...n._preMap); return s; } }
    if (n.t === "tx") { const t = makeText(n); ctx.map.push({ n, id: t.id }); return t; }
    if (n.t === "sv") {
      let s;
      if (n.icon) { s = B.icon(n.icon, n.svg, n.r.w, n.r.h); B.tint(s, n.color); }
      // an invisible icon still holds its room (the hidden sort arrow of an unsorted column)
      else {
        s = penpot.createShapeFromSvg(B.scaleStroke(n.svg, n.r.w).replace(/currentColor/g, n.color.c)); s.name = "svg"; s.resize(n.r.w, n.r.h);
        if (n.parts) B.bindParts(s, n.parts, n.color);
        else B.tint(s, n.color);
      }
      if (n.op === 0) s.opacity = 0;
      B.turn(s, n.rot);
      ctx.map.push({ n, id: s.id }); return s;
    }
    if (n.t === "ps") {
      const r = penpot.createRectangle(); r.name = "decor"; r.resize(n.r.w, n.r.h); r.fills = fill(n.bg); B.bind(r, n.bg, "fill");
      r.borderRadiusTopLeft = n.rad[0]; r.borderRadiusTopRight = n.rad[1]; r.borderRadiusBottomRight = n.rad[2]; r.borderRadiusBottomLeft = n.rad[3];
      B.bindRadius(r, n.rad, n.rad.every((x) => x >= Math.min(n.r.w, n.r.h) / 2 - 0.01));
      ctx.map.push({ n, id: r.id }); return r;
    }
    const st = n.st;
    if (ctx.depth > 0 && n.comp && n.comp !== ctx.owner && n.inst !== false && !B.TEXT_STYLE_COMPS.includes(n.comp)) {
      // hard rule: a qui component is only ever an instance of its Penpot component, never redrawn as plain layers
      const vc = n.variant && B.variantComponent(n.comp, n.variant);
      if (!vc) throw new Error("no Penpot component for " + n.comp + " " + JSON.stringify(n.variant || {}) + ": build its set first");
      {
        const inst = vc.instance();
        const flexSz = inst.flex ? [inst.flex.horizontalSizing, inst.flex.verticalSizing] : null;
        if (!B.override(inst, n, ctx.warn)) { inst.remove(); throw new Error(n.comp + " " + JSON.stringify(n.variant) + " holds content its component has no slot for: give the component a slot (or a local cell component) first"); }
        else {
          inst.resize(Math.max(n.r.w, 0.01), Math.max(n.r.h, 0.01));
          // a clipping component keeps the size the screen gives it in both directions; the rest hug as their main does
          if (flexSz) { const clip = B.CLIP_COMPS.includes(n.comp); inst.flex.horizontalSizing = clip ? "fix" : flexSz[0]; inst.flex.verticalSizing = clip ? "fix" : flexSz[1]; }
          ctx.map.push({ n, id: inst.id }); ctx.instances = (ctx.instances || 0) + 1;
          return inst;
        }
      }
    }
    const kids = expand(n.ch);
    const b = penpot.createBoard();
    b.name = nameFor(n, kids); b.clipContent = !!st.clip || (ctx.depth === 0 && B.CLIP_COMPS.includes(n.comp));
    b.resize(Math.max(n.r.w, 0.01), Math.max(n.r.h, 0.01));
    applyPaint(b, n);
    ctx.map.push({ n, id: b.id });
    let flex = null, inl = false;
    if (kids.length) {
      const L = layoutOf(n, kids); inl = !!L.inline;
      flex = b.addFlexLayout();
      flex.dir = L.dir; flex.wrap = L.wrap ? "wrap" : "nowrap"; flex.alignItems = L.ai; flex.justifyContent = L.jc;
      flex.rowGap = L.gap[0]; flex.columnGap = L.gap[1];
      // Penpot strokes never take layout room, so a side with a border pads by CSS padding + border (as the browser lays
      // it out); only a borderless side keeps its space token
      const pad = st.pad.map((p, i) => p + (st.bw[i] || 0));
      flex.topPadding = pad[0]; flex.rightPadding = pad[1]; flex.bottomPadding = pad[2]; flex.leftPadding = pad[3];
      ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].forEach((p, i) => { if (!st.bw[i]) B.bindDim(b, "space", st.pad[i], [p]); });
      B.bindDim(b, "space", L.gap[0], ["rowGap"]); B.bindDim(b, "space", L.gap[1], ["columnGap"]);
      if (n.comp && n.sz.h === "fix") B.bindDim(b, "height", n.r.h, ["height"]);
      flex.horizontalSizing = n.sz.w === "hug" ? "auto" : "fix"; flex.verticalSizing = n.sz.h === "hug" ? "auto" : "fix";
    }
    let prev = null;
    for (const k of kids) {
      ctx.depth++; const c = make(k, ctx); ctx.depth--;
      b.appendChild(c);
      // inline run ("ACME-45" + " " + title): the space keeps the browser's width. (It used to give back the 3 px slack
      // of the text before it, but Penpot now re-measures that auto-width text to its own glyphs, so the slack is gone and
      // the give-back left a 0.3 px gap: "ACME-45Embed", 9d 2026-10-31.)
      if (inl && k.t === "tx" && !k.s.trim() && prev && prev.t === "tx" && prev.s.trim() && !(prev.lines > 1)) c.resize(Math.max(k.r.w, 0.3), c.height);
      prev = k;
      if (flex) childProps(c, k, ctx, n);
      // Penpot has no baseline alignment: a baseline row stays top-aligned and each child drops by the offset the browser gave it
      if (flex && st.ai === "baseline" && !flex.dir.startsWith("column") && c.layoutChild && !(k.st && k.st.abs)) {
        const dy = k.r.y - (n.r.y + st.pad[0] + st.bw[0]);
        if (dy > 0.3) c.layoutChild.topMargin = +dy.toFixed(2);
      }
      if (k.t === "ps" || (k.t === "el" && k.st.abs)) ctx.abs.push({ shape: c, rel: k.r });
    }
    // an inset hairline (0 blur, 0 spread, offset on one side) is a rule on that side: drawn as a bar, since a board's inner
    // shadow in Penpot paints over its children (a header row's bottom rule hid the header text)
    for (const h of n._hairlines || []) {
      const W = n.r.w, H = n.r.h, w = h.w;
      const bar = penpot.createRectangle(); bar.name = "rule"; bar.fills = fill(h.col); B.bind(bar, h.col, "fill");
      bar.resize(h.side === 0 || h.side === 2 ? W : w, h.side === 0 || h.side === 2 ? w : H);
      // bottom layer: an inset shadow paints under the children (ProjectHeader's rule hid the lower half of the selected
      // Tab's 2 px underline when it was appended on top; 9d 2026-10-31)
      if (b.insertChild) b.insertChild(0, bar); else b.appendChild(bar); if (flex) bar.layoutChild.absolute = true;
      if (h.side === 0 || h.side === 2) bar.constraintsHorizontal = "leftright"; else bar.constraintsVertical = "topbottom";
      if (h.side === 2) bar.constraintsVertical = "bottom"; if (h.side === 1) bar.constraintsHorizontal = "right";
      ctx.abs.push({ shape: bar, rel: { x: n.r.x + (h.side === 1 ? W - w : 0), y: n.r.y + (h.side === 2 ? H - w : 0) } });
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
  function childProps(c, k, ctx, n) {
    const lc = c.layoutChild; if (!lc) return;
    if (k.t === "tx") { lc.horizontalSizing = k.lines > 1 ? "fill" : "auto"; lc.verticalSizing = "auto"; return; }
    if (k.t === "sv") { lc.horizontalSizing = "fix"; lc.verticalSizing = "fix"; return; }
    if (k.t === "ps") { lc.absolute = true; return; }
    const st = k.st;
    if (st.abs) { lc.absolute = true; return; }
    // growing along the main axis of a parent that hugs it is circular in Penpot (the child collapses to its content,
    // a Slider's control row to its 4px track): keep the browser's size instead
    const pfl = c.parent && c.parent.flex; const pcol = pfl && pfl.dir.startsWith("column");
    const hugMain = (axis) => pfl && (axis === "h" ? pcol && pfl.verticalSizing === "auto" : !pcol && pfl.horizontalSizing === "auto");
    if (k.sz.w === "fill" && !hugMain("w")) lc.horizontalSizing = "fill";
    if (k.sz.h === "fill" && !hugMain("h")) lc.verticalSizing = "fill";
    // Penpot stretches even fixed-size children across a "stretch" parent; the browser keeps their own size
    const pf = c.parent && c.parent.flex;
    if (pf && pf.alignItems === "stretch") {
      const col = pf.dir === "column" || pf.dir === "column-reverse";
      if ((col && k.sz.w !== "fill") || (!col && k.sz.h !== "fill")) lc.alignSelf = "start";
    }
    const m = st.mar; if (m.some((x) => x)) { lc.topMargin = m[0]; lc.rightMargin = m[1]; lc.bottomMargin = m[2]; lc.leftMargin = m[3]; ["marginTop", "marginRight", "marginBottom", "marginLeft"].forEach((p, i) => B.bindDim(c, "space", m[i], [p])); }
    if (st.minW) lc.minWidth = st.minW;
    if (st.maxW) lc.maxWidth = st.maxW;
    // a relatively positioned, start-aligned child in a stack keeps the offset the browser gave it (a range Slider's
    // fill starts at its low thumb, `left: 20%`): Penpot has no relative offsets, so it becomes a left margin
    if (n && st.pos === "relative" && pf && pf.dir.startsWith("column") && (lc.alignSelf === "start" || pf.alignItems === "start")) {
      const dx = k.r.x - (n.r.x + n.st.pad[3] + (n.st.bw[3] || 0)) - (m[3] || 0);
      if (dx > 0.5) lc.leftMargin = (m[3] || 0) + dx;
    }
  }

  /** Builds a tree into a free-standing board at (x, y); returns { shape, map }. */
  B.buildRoot = function (tree, x, y) {
    // owner: the set being built; a node tagged with its own component (Input's inner <input>) is drawn as part of it
    const ctx = { map: [], abs: [], depth: 0, warn: [], owner: tree.comp };
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
  // parts of a few dozen nodes keep each save batch small; a component instance is never split (rule 1): a big instance
  // part is placed whole and only its overrides are spread over several yields / calls (B.screenStep)
  B.screenPlan = function (key, tree, X, Y, max = 60) {
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
  const isInst = (n) => n.t === "el" && n.comp && n.inst !== false && n.variant && !B.TEXT_STYLE_COMPS.includes(n.comp);
  /** Builds the next parts of screen `key` for up to `ms`, pausing `pause` ms after each part / few overrides so the tab
   *  repaints and saves; the final step builds the root board from them. Call (await) until it returns done:true / a root.
   *  An instance part over `big` nodes is staged: placed first, then its slot overrides `per` leaves at a time, resumable across calls. */
  B.screenStep = async function (key, ms = 20000, pause = 300, big = 60, per = 2) {
    const S = SCR[key]; const t0 = Date.now(); B.pinText = true; S.warn = S.warn || []; S.calls = (S.calls || 0) + 1;
    const page = penpot.currentPage; const left = () => ms - (Date.now() - t0); let last = 0;
    while (S.idx < S.parts.length && left() > last * 1.2) {
      const n = S.parts[S.idx]; const tb = Date.now();
      if (isInst(n) && n._n > big) {
        // staged instance: phases place -> swap -> content -> size, `per` slot leaves per batch
        const C = (S.cur = S.cur || { phase: "place", i: 0 });
        if (C.phase === "place") {
          const vc = B.variantComponent(n.comp, n.variant);
          if (!vc) throw new Error("no Penpot component for " + n.comp + " " + JSON.stringify(n.variant) + ": build its set first");
          const inst = vc.instance(); page.root.appendChild(inst); inst.x = S.X + n.r.x; inst.y = S.Y + n.r.y;
          C.id = inst.id; C.flexSz = inst.flex ? [inst.flex.horizontalSizing, inst.flex.verticalSizing] : null;
          C.dom = B.ovPlan(inst, n, S.warn);
          if (!C.dom) { inst.remove(); throw new Error(n.comp + " " + JSON.stringify(n.variant) + " holds content its component has no slot for: give the component a slot first"); }
          C.phase = "swap";
        } else {
          const inst = page.getShapeById(C.id); if (!inst) throw new Error("staged instance " + n.comp + " vanished");
          const shp = B.shapeLeaves(inst); const end = Math.min(C.dom.length, C.i + per);
          if (C.phase === "swap") { for (; C.i < end; C.i++) B.ovSwap(C.dom[C.i], shp[C.i]); if (C.i >= C.dom.length) { C.phase = "content"; C.i = 0; } }
          else if (C.phase === "content") { for (; C.i < end; C.i++) B.ovContent(C.dom[C.i], shp[C.i], n, S.warn); if (C.i >= C.dom.length) C.phase = "size"; }
          else if (C.phase === "size") {
            inst.resize(Math.max(n.r.w, 0.01), Math.max(n.r.h, 0.01));
            if (C.flexSz) { const clip = B.CLIP_COMPS.includes(n.comp); inst.flex.horizontalSizing = clip ? "fix" : C.flexSz[0]; inst.flex.verticalSizing = clip ? "fix" : C.flexSz[1]; }
            n._pre = inst.id; n._preMap = [{ n, id: inst.id }]; S.cur = null; S.idx++;
          }
        }
      } else {
        const ctx = { map: [], abs: [], depth: 1, warn: [] };
        const s = make(n, ctx);
        page.root.appendChild(s);
        s.x = S.X + n.r.x; s.y = S.Y + n.r.y;
        for (const a of ctx.abs) { a.shape.x = S.X + a.rel.x; a.shape.y = S.Y + a.rel.y; }
        n._pre = s.id; n._preMap = ctx.map; S.warn.push(...ctx.warn); S.idx++;
      }
      B.flushTokens(); last = Date.now() - tb;
      await B.nap(pause);
    }
    if (S.idx >= S.parts.length && !S.root && left() > 0) {
      const r = B.buildRoot(S.tree, S.X, S.Y); S.root = r.shape.id; S.map = r.map; S.warn.push(...r.warn); B.flushTokens();
    }
    const cur = S.cur ? S.cur.phase + " " + S.cur.i + "/" + (S.cur.dom ? S.cur.dom.length : "?") : null;
    return { done: !!S.root, built: S.idx, of: S.parts.length, staged: cur, root: S.root || null, call: S.calls, ms: Date.now() - t0, warn: S.warn.slice(0, 5) };
  };

  // ---------- settling ----------
  B.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  /** A short yield (≥ `ms`, ≤ 500 ms) that also works in a background tab: there setTimeout is throttled (a 300 ms sleep
   *  measured 16 s) and the plugin sandbox has no MessageChannel, so the timer races a tiny same-origin fetch, whose
   *  network callback is not throttled. Use this, not B.sleep, for every pause inside a build. */
  B.nap = async function (ms = 300) {
    const end = Date.now() + Math.min(ms, 500);
    while (Date.now() < end) {
      await Promise.race([B.sleep(end - Date.now()), fetch("/qui-tmp/nap?" + Date.now(), { method: "HEAD", cache: "no-store" }).catch(() => 0)]);
    }
  };
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
  /** Re-places absolutely positioned shapes once the layout has settled (a parent that moved afterwards leaves them behind). */
  B.fixAbs = function (name) {
    let n = 0;
    for (const it of LIB[name].items) {
      const root = penpot.currentPage.getShapeById(it.shape); if (!root) continue;
      for (const { n: node, id } of it.map) {
        if (!(node.t === "ps" || (node.t === "el" && node.st && node.st.abs)) || !node.r) continue;
        const s = penpot.currentPage.getShapeById(id); if (!s) continue;
        s.x = root.x + node.r.x; s.y = root.y + node.r.y; n++;
        // constraints from where it sits in its parent, so it follows a resized instance like the browser's inset box:
        // Tab's ::after underline spans the tab at its bottom; with left/top it kept the main's width when a TabsList /
        // ProjectHeader widened the Tab to its label (35.5 of 62 px, mostly clipped; 9d 2026-10-31)
        const p = s.parent; if (!p || p.type === "root") continue;
        const l = s.x - p.x, r = p.x + p.width - (s.x + s.width), t = s.y - p.y, b = p.y + p.height - (s.y + s.height), e = 0.75;
        const ch = Math.abs(l) < e && Math.abs(r) < e ? "leftright" : Math.abs(r) < e && l > e ? "right" : null;
        const cv = Math.abs(t) < e && Math.abs(b) < e ? "topbottom" : Math.abs(b) < e && t > e ? "bottom" : null;
        try { if (ch && s.constraintsHorizontal !== ch) s.constraintsHorizontal = ch; if (cv && s.constraintsVertical !== cv) s.constraintsVertical = cv; } catch (err) {}
      }
    }
    return n;
  };
  /** After the finish (combine moves the variant roots, and nested instances' absolute decor is dragged off by it), puts
   *  every nested instance's decor back where the page shows it (B.placeDecor). */
  B.fixDecor = function (name) {
    let n = 0;
    for (const it of LIB[name].items) for (const { n: node, id } of it.map) {
      if (!(node.comp && node.t === "el")) continue;
      const s = penpot.currentPage.getShapeById(id);
      if (s && s.isComponentInstance && s.isComponentInstance() && B.domLeaves(node).some((d) => d.k === "ps" || d.k === "comp")) n += B.placeDecor(s, node);
    }
    return n;
  };
  /** Fixes a variant root whose hug size Penpot resolved wrong (it can ignore a fixed child): pin it at the browser's size. */
  B.fixRoots = function (name) {
    let n = 0;
    for (const it of LIB[name].items) {
      const s = penpot.currentPage.getShapeById(it.shape); if (!s || !s.flex) continue;
      const w = it.tree.r.w, h = it.tree.r.h; const bw = Math.abs(s.width - w) > 1, bh = Math.abs(s.height - h) > 1;
      if (!bw && !bh) continue;
      if (bw) s.flex.horizontalSizing = "fix"; if (bh) s.flex.verticalSizing = "fix";
      s.resize(w, h); n++;
    }
    return n;
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
    if (comps.length === 1) { first.name = name; L.container = first.id; if (B.COMP_PATHS) B.applyPath(name); return { container: first.id, variants: 1, axes: [] }; }
    const cont = first.combineAsVariants(comps.slice(1).map((c) => c.mainInstance().id));
    const axes = Object.keys(L.items[0].v);
    for (let i = 1; i < axes.length; i++) comps[0].variants.addProperty();
    axes.forEach((a, i) => comps[0].variants.renameProperty(i, a));
    comps.forEach((c, idx) => axes.forEach((a, i) => c.setVariantProperty(i, String(L.items[idx].v[a]))));
    cont.name = name;
    L.container = cont.id; if (B.COMP_PATHS) B.applyPath(name);
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
    } else if (F.phase === "combine" && F.comps.length === 1) {
      // Penpot cannot combine a single component: a one-variant set stays a plain component
      const m = F.comps[0].mainInstance(); m.name = name; L.container = m.id; F.phase = "done"; if (B.COMP_PATHS) B.applyPath(name);
    } else if (F.phase === "combine") {
      const cont = F.comps[0].mainInstance().combineAsVariants(F.comps.slice(1).map((c) => c.mainInstance().id));
      L.container = cont.id; F.phase = "props";
    } else if (F.phase === "props") {
      for (let i = 1; i < axes.length; i++) F.comps[0].variants.addProperty();
      axes.forEach((a, i) => F.comps[0].variants.renameProperty(i, a));
      F.phase = "values";
    } else if (F.phase === "values") {
      while (F.vi < F.comps.length && ops < budget) { const idx = F.vi++; axes.forEach((a, i) => F.comps[idx].setVariantProperty(i, String(L.items[idx].v[a]))); ops += axes.length; }
      if (F.vi >= F.comps.length) { page.getShapeById(L.container).name = name; F.phase = "done"; if (B.COMP_PATHS) B.applyPath(name); }
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
  /** The page's top-level shapes: children of the page root (zero id). page.root.children comes back empty, so filter all shapes. */
  B.topShapes = () => penpot.currentPage.findShapes().filter((s) => s.id && s.id !== "00000000-0000-0000-0000-000000000000" && (!s.parent || !s.parent.id || s.parent.id === "00000000-0000-0000-0000-000000000000"));
  B.page = async function (name, fresh) {
    let p = penpot.currentFile.pages.find((x) => x.name === name);
    if (!p) { p = penpot.createPage(); p.name = name; }
    await penpot.openPage(p);
    for (let i = 0; i < 40 && penpot.currentPage.id !== p.id; i++) await B.nap(250);
    if (penpot.currentPage.id !== p.id) throw new Error("page switch failed: " + name);
    if (fresh) B.topShapes().forEach((s) => s.remove()); // parent.type is never "root" for page children
    return penpot.currentPage.name;
  };
  /** Removes every existing component set called `name` (removing its container on whichever page holds it removes the components). */
  B.dropOld = async function (name, ms = 90000) {
    const t0 = Date.now(); let n = 0;
    for (const c of B.setComps(name)) {
      const main = c.mainInstance(); if (!main) continue;
      // a variant's parent is its set container; a plain component sits on the page itself, whose root ("Root Frame",
      // the zero uuid) must never be removed: that deletes the whole page. Remove only the set container or the main.
      const par = main.parent;
      const isRoot = !par || par.type === "root" || par.id === "00000000-0000-0000-0000-000000000000" || par.name === "Root Frame";
      const id = isRoot || !c.variants ? main.id : par.id;
      const p = penpot.currentFile.pages.find((x) => x.getShapeById(id)); if (!p) continue;
      await B.page(p.name); const sh = penpot.currentPage.getShapeById(id);
      if (!sh || sh.id === "00000000-0000-0000-0000-000000000000" || sh.name === "Root Frame") throw new Error("dropOld refused to remove a page root for " + name);
      sh.remove(); n++;
    }
    while (B.setComps(name).length && Date.now() - t0 < ms) await B.nap(500);
    return { removed: n, left: B.setComps(name).length, ms: Date.now() - t0 };
  };
  /** Library level of every set: sets live on the Atoms / Molecules / Organisms page, never on a page of their own. */
  B.LEVEL = { Button: "Atoms", IconButton: "Atoms", Pill: "Atoms", Badge: "Atoms", Avatar: "Atoms", AvatarGroup: "Atoms", Swatch: "Atoms", Shortcut: "Atoms", Heading: "Atoms", WorkspaceAvatar: "Atoms", Input: "Atoms",
    Tab: "Molecules", ListItem: "Molecules", ListSection: "Molecules", StateGroupHeader: "Molecules", WorkItemRow: "Molecules", Property: "Molecules", ViewToolbar: "Molecules", RailItem: "Molecules",
    NavSidebar: "Organisms", ProjectHeader: "Organisms", WorkItemCard: "Organisms" };
  /** comp-paths.json (pushed as comp-paths.js, made by comp-paths.mjs): component -> { level, file } from packages/ui/src. */
  B.loadPaths = async function () { B.COMP_PATHS = JSON.parse(await B.readFile("comp-paths.js")); return B.COMP_PATHS; }; // refetched every build: B outlives reloads
  // the code folder wins; B.LEVEL and the spec sheet's cell.level are fallbacks for names comp-paths does not know
  B.levelOf = (name, cells) => (B.COMP_PATHS && B.COMP_PATHS[name] && B.COMP_PATHS[name].level) || B.LEVEL[name] || ({ atoms: "Atoms", molecules: "Molecules", organisms: "Organisms" })[cells && cells[0] && cells[0].level];
  /** Assets-panel folder of a set, mirroring packages/ui/src: "<Level>" when its file holds only it, else "<Level> / <File>"
   *  (Penpot shows "<folder> / <name>": Atoms / Button, Organisms / Table / Table, Organisms / TableCells / MoneyCell). */
  B.folderOf = function (name) {
    const P = B.COMP_PATHS, e = P && P[name]; if (!e) throw new Error("comp-paths has no " + name + " (run comp-paths.mjs, push comp-paths.js)");
    const several = Object.values(P).filter((x) => x.level === e.level && x.file === e.file).length > 1;
    return several ? e.level + " / " + e.file : e.level;
  };
  /** Page cap (rule 8): a level page stays under PAGE_CAP shapes. A file whose sets would push its level page past it gets a
   *  page of its own, "<Level> · <File>"; every other file stays on the level page. Component paths do not change. */
  B.PAGE_CAP = 3000;
  B.SPLIT_FILES = ["Organisms/Table"]; // 9d 2026-10-31: Organisms would pass the cap with the Tabler glyphs
  B.pageOf = function (name, cells) {
    const lvl = B.levelOf(name, cells), e = B.COMP_PATHS && B.COMP_PATHS[name];
    return e && B.SPLIT_FILES.includes(e.level + "/" + e.file) ? e.level + " · " + e.file : lvl;
  };
  /** Sets the folder on every component of set `name` (variant components; Penpot then renames the set container "<folder> / <name>").
   *  The page holding the main must be current. */
  B.applyPath = function (name) {
    const folder = B.folderOf(name); let n = 0;
    for (const c of B.setComps(name)) {
      for (const v of c.variants ? c.variants.variantComponents() : [c]) { if (v.path !== folder) v.path = folder; n++; }
    }
    return { name, folder, comps: n };
  };
  /** applyPath for a set already built, on whichever page holds it. */
  B.setPath = async function (name) {
    await B.loadPaths();
    const c = B.setComps(name)[0]; if (!c) throw new Error("no component " + name);
    const id = c.mainInstance().id; const p = penpot.currentFile.pages.find((x) => x.getShapeById(id)); if (!p) throw new Error("no page holds " + name);
    await B.page(p.name);
    return Object.assign(B.applyPath(name), { page: p.name });
  };
  /** Starts a set: drops any old copy, opens its page (B.pageOf) and builds below whatever is already there. Data from /qui-tmp/spec-<name>.js. */
  B.start = async function (name, dropMs = 15000) {
    B.stat = { bound: 0, hex: 0, hexSamples: {} }; B.queue = {};
    const d = JSON.parse(await B.readFile("spec-" + name + ".js"));
    await B.loadPaths();
    const lvl = B.levelOf(name, d.cells); if (!lvl) throw new Error("no level for " + name);
    const dr = await B.dropOld(name, dropMs);
    if (dr.left) throw new Error("old " + name + " still has " + dr.left + " components after " + dr.ms + " ms: pause, then call B.run again");
    await B.page(B.pageOf(name, d.cells), false);
    const roots = B.topShapes();
    const bottom = roots.reduce((m, s) => Math.max(m, s.y + s.height), 0);
    const r = B.libBegin(name, d.cells);
    LIB[name].ox = 0; LIB[name].oy = roots.length ? bottom + 160 : 0;
    return r;
  };
  /** Builds variants for up to `ms` milliseconds, `batch` at a time, binding tokens and pausing `pause` ms after each batch. */
  B.pump = async function (name, ms = 20000, batch = 3, pause = 300) {
    const L = LIB[name]; const t0 = Date.now(); let last = 0;
    while (L.idx < L.cells.length && ms - (Date.now() - t0) > last * 1.2) {
      const tb = Date.now(); B.libStep(name, batch, 0, 0); B.flushTokens(); last = Date.now() - tb; await B.nap(pause);
    }
    return { built: L.idx, of: L.cells.length, ms: Date.now() - t0, stat: B.stat };
  };
  /** Builds set `name` (drop old, build variants, settle, fix, components, combine, properties, values) in resumable
   *  steps: each call works for at most ~`budget` ms (default 20 s), pausing `pause` ms (≤ 500: setTimeout stalls in a
   *  background tab) after every batch of `batch` variants / finish step so the tab repaints and saves. Call B.run(name)
   *  again until it returns done:true; it continues where it stopped. A call after done:true (or {restart:true}) rebuilds. */
  B.run = async function (name, opt = {}) {
    if (typeof opt === "number") opt = { budget: opt };
    const budget = opt.budget || 20000, pause = Math.min(opt.pause == null ? 300 : opt.pause, 500), batch = opt.batch || 3;
    const t0 = Date.now(); const left = () => budget - (Date.now() - t0);
    B._vc = {}; B._typos = null; B._dims = null;
    let L = LIB[name], R = L && L.run, f = null;
    if (!R || R.phase === "done" || opt.restart) {
      await B.start(name); L = LIB[name];
      R = L.run = { phase: "build", page: penpot.currentPage.name, stat: B.stat, calls: 1 };
      await B.nap(pause);
    } else {
      R.calls++; B.stat = R.stat; B.queue = {};
      if (penpot.currentPage.name !== R.page) await B.page(R.page);
    }
    let last = 0;
    while (R.phase !== "done" && left() > last * 1.2) {
      const tb = Date.now();
      if (R.phase === "build") {
        if (L.idx >= L.cells.length) { R.phase = "settle"; R.builtAt = Date.now(); continue; }
        B.libStep(name, batch, 0, 0); B.flushTokens();
      } else if (R.phase === "settle") {
        // text and icon sizes arrive asynchronously: wait ~1.5 s after the last variant (short sleeps) before fixing
        const wait = 1500 - (Date.now() - R.builtAt);
        if (wait > 0) { await B.nap(Math.min(500, wait)); continue; }
        R.phase = "fix";
      } else if (R.phase === "fix") { B.fixAbs(name); B.fixRoots(name); R.phase = "finish"; }
      else if (R.phase === "finish") { f = B.libFinishStep(name, 40); if (f.phase === "done") { R.decor = B.fixDecor(name); R.phase = "done"; break; } }
      last = Date.now() - tb;
      await B.nap(pause);
    }
    const d = B.stat.dim || { bound: 0, literal: 0, samples: {} };
    return { name, done: R.phase === "done", phase: R.phase, call: R.calls, built: L.idx, of: L.cells.length, finish: (L.fin && L.fin.phase) || null,
      colours: B.stat.bound, hex: B.stat.hex, decor: R.decor, dims: d.bound, literal: d.literal, samples: d.samples, ms: Date.now() - t0 };
  };
  /** Runs the finishing phases (components, combine, properties, values) within a time budget, pausing between steps. */
  B.finish = async function (name, ms = 20000, pause = 300) {
    const t0 = Date.now(); let r;
    do { r = B.libFinishStep(name, 40); if (r.phase !== "done") await B.nap(pause); } while (r.phase !== "done" && Date.now() - t0 < ms);
    return r;
  };
  /** Token audit of a finished set: how many paints exist and how many are bound to a token. */
  B.audit = function (name) {
    const c = B.setComps(name)[0]; if (!c) return null;
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
