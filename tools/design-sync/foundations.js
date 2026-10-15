// Penpot-side Foundations builder: design tokens (sets + Light/Dark themes), text styles, and the Foundations page boards
// (colours, scales, shadows, typography). Data comes from foundations-export.mjs (pushed as /qui-tmp/foundations-data.js).
// Load in the plugin with:
//   (0, eval)("(()=>{" + await (await fetch("/qui-tmp/foundations.js?" + Date.now())).text() + "})()")
// then call, one per execute_code: F.load(), F.set(name) for each of F.SETS, F.themes(), F.typos(), F.colorBoard(set),
// F.scalesBoard(), F.typoBoard(). Every step skips what already exists, so a step can be re-run after a dropped connection.
(() => {
  const F = (globalThis.__F = globalThis.__F || {});
  const cat = () => penpot.library.local.tokens;
  const inter = () => penpot.fonts.all.find((f) => f.name === "Inter");
  F.SETS = ["core", "primitives-light", "semantic", "primitives-dark", "semantic-dark"];

  F.load = async function () {
    F.d = JSON.parse(await (await fetch("/qui-tmp/foundations-data.js?" + Date.now())).text());
    return { colors: Object.keys(F.d.colors), typo: F.d.typo.length, shadows: Object.keys(F.d.shadows) };
  };

  // ---------- tokens ----------
  /** [type, name, value] triples of a token set. */
  F.tokensOf = function (name) {
    const d = F.d;
    if (name !== "core") return Object.entries(d.colors[name]).map(([n, v]) => ["color", n, v]);
    const c = d.core, out = [];
    for (const [n, v] of Object.entries(c.spacing)) out.push(["spacing", n, v]);
    for (const [n, v] of Object.entries(c.radius)) out.push(["borderRadius", n, v]);
    for (const [n, v] of Object.entries(c.borderWidth)) out.push(["borderWidth", n, v]);
    for (const [n, v] of Object.entries(c.fontSizes)) out.push(["fontSizes", n, v]);
    for (const [n, v] of Object.entries(c.fontWeights)) out.push(["fontWeights", n, v]);
    for (const [n, v] of Object.entries(c.control)) {
      const t = /\.height\./.test(n) ? "sizing" : /\.glyph\./.test(n) ? "sizing" : /\.radius\./.test(n) ? "borderRadius" : "spacing";
      out.push([t, n, v]);
    }
    return out;
  };
  /** Creates (or completes) one token set; returns how many tokens were added and which were rejected. */
  F.set = function (name, ms = 50000) {
    const t0 = Date.now();
    let set = cat().sets.find((s) => s.name === name) || cat().addSet({ name });
    const have = new Set(set.tokens.map((t) => t.name)); let added = 0; const failed = [];
    for (const [type, n, value] of F.tokensOf(name)) {
      if (Date.now() - t0 > ms) break;
      if (have.has(n)) continue;
      try { set.addToken({ type, name: n, value }); added++; } catch (e) { failed.push(n + ": " + String(e.message || e).slice(0, 80)); }
    }
    set = cat().sets.find((s) => s.name === name);
    return { set: name, added, total: set.tokens.length, want: F.tokensOf(name).length, failed: failed.slice(0, 10), ms: Date.now() - t0 };
  };
  /** Mode/Light = core + light sets; Mode/Dark adds the dark overrides on top. Light is activated. */
  F.themes = function () {
    const want = { Light: ["core", "primitives-light", "semantic"], Dark: ["core", "primitives-light", "primitives-dark", "semantic", "semantic-dark"] };
    for (const [name, sets] of Object.entries(want)) {
      const th = cat().themes.find((t) => t.group === "Mode" && t.name === name) || cat().addTheme({ group: "Mode", name });
      for (const s of sets) if (!th.activeSets.some((x) => x.name === s)) th.addSet(cat().sets.find((x) => x.name === s));
    }
    const light = cat().themes.find((t) => t.group === "Mode" && t.name === "Light");
    if (!light.active) light.toggleActive();
    return { themes: cat().themes.map((t) => [t.group, t.name, t.active, t.activeSets.map((s) => s.name).join(",")]), active: cat().sets.map((s) => [s.name, s.active]) };
  };

  // ---------- text styles ----------
  const variantId = (fw) => { const w = fw === 450 ? 400 : fw === 350 ? 300 : fw; return w === 400 ? "regular" : String(w); };
  // Penpot splits "a / b" names into path + name, so the path carries group and role: "Body / body-sm" + "medium"
  F.typoPath = (t) => (t.role[0] === "h" ? "Heading" : t.role.startsWith("body") ? "Body" : "Caption") + " / " + t.role;
  F.typos = function () {
    const lib = penpot.library.local; const font = inter(); let made = 0;
    for (const t of F.d.typo) {
      const path = F.typoPath(t);
      if (lib.typographies.some((x) => x.path === path && x.name === t.weight)) continue;
      const ty = lib.createTypography();
      ty.name = t.weight; ty.path = path;
      ty.setFont(font, font.variants.find((v) => v.fontVariantId === variantId(t.fw)));
      ty.fontSize = String(t.size); ty.lineHeight = String(t.lh); ty.letterSpacing = String(+t.ls.toFixed(3));
      made++;
    }
    return { made, total: lib.typographies.length };
  };

  // ---------- page boards ----------
  // reading set.tokens builds proxies for every token, so look tokens up once
  let tokMap = null;
  const tok = (name) => { if (!tokMap) { tokMap = {}; for (const s of cat().sets) if (/^(core|primitives-light|semantic)$/.test(s.name)) for (const t of s.tokens) tokMap[t.name] = t; } return tokMap[name] || null; };
  F.queue = {};
  const bind = (shape, name, prop) => { const t = tok(name); if (!t) return false; const k = name + "|" + prop; (F.queue[k] = F.queue[k] || { t, prop, shapes: [] }).shapes.push(shape); return true; };
  F.flush = () => { let n = 0; for (const q of Object.values(F.queue)) { q.t.applyToShapes(q.shapes, [q.prop]); n++; } F.queue = {}; return n; };
  let typoMap = null;
  const typo = (role, weight) => {
    if (!typoMap) { typoMap = {}; for (const x of penpot.library.local.typographies) typoMap[x.path.split(" / ").pop() + "|" + x.name] = x; }
    return typoMap[role + "|" + weight];
  };
  F.resetTypoCache = () => (typoMap = null);
  F.text = function (s, role = "caption-sm", weight = "regular", color = "txt.secondary") {
    const t = penpot.createText(s); t.name = s.slice(0, 40);
    const ty = typo(role, weight); if (ty) { t.applyTypography(ty); t.lineHeight = ty.lineHeight; } // apply drops the line height
    t.growType = "auto-width"; bind(t, color, "fill");
    return t;
  };
  /** Board with flex layout; `dir`, gap, padding, hug sizing. */
  F.flex = function (name, dir, gap = 8, pad = 0) {
    const b = penpot.createBoard(); b.name = name; b.fills = []; b.clipContent = false;
    const fl = b.addFlexLayout(); fl.dir = dir; fl.rowGap = gap; fl.columnGap = gap; fl.alignItems = "start";
    fl.topPadding = fl.bottomPadding = fl.leftPadding = fl.rightPadding = pad;
    fl.horizontalSizing = "auto"; fl.verticalSizing = "auto";
    return b;
  };
  F.section = function (title, x, y) {
    const b = F.flex(title, "column", 32, 48); b.x = x; b.y = y;
    bind(b, "bg.canvas", "fill"); b.borderRadius = 12;
    b.appendChild(F.text(title, "h3", "semibold", "txt.primary"));
    return b;
  };
  F.bottom = () => (penpot.currentPage.root.children || []).reduce((m, s) => Math.max(m, s.y + s.height), -160);

  /** One board per colour set: a block per token group (bg.layer, txt ..., or neutral, brand ...), rows of 12 swatches,
   *  each swatch bound to its token. Built bottom-up (Penpot relayouts the whole tree on every append to an attached board). */
  F.colorBoard = function (setName, x = 0, y, from = 0, to = 1e9, assemble = true) {
    const set = cat().sets.find((s) => s.name === setName);
    const groups = {};
    for (const t of set.tokens) { const g = setName.startsWith("primitives") ? t.name.split(".")[0] : t.name.split(".")[0] + "." + t.name.split(".")[1].split("-")[0]; (groups[g] = groups[g] || []).push(t); }
    const blocks = [];
    for (const [g, list] of Object.entries(groups).slice(from, to)) {
      const block = F.flex(g, "column", 8);
      block.appendChild(F.text(g, "body-xs", "semibold", "txt.primary"));
      for (let i = 0; i < list.length; i += 12) {
        const row = F.flex("row", "row", 12);
        for (const t of list.slice(i, i + 12)) {
          const cell = F.flex(t.name, "column", 4);
          const r = penpot.createRectangle(); r.name = "swatch"; r.resize(112, 40); r.borderRadius = 6;
          r.strokes = [{ strokeColor: "#000000", strokeOpacity: 0.08, strokeWidth: 1, strokeAlignment: "inner", strokeStyle: "solid" }];
          bind(r, "border.subtle", "strokeColor"); bind(r, t.name, "fill");
          cell.appendChild(r);
          const label = F.text(t.name.split(".").slice(1).join(".") || t.name, "caption-xs", "regular", "txt.secondary");
          cell.appendChild(label); label.layoutChild.horizontalSizing = "fill"; label.growType = "auto-height";
          cell.flex.horizontalSizing = "fix"; cell.resize(112, cell.height); cell.flex.verticalSizing = "auto";
          row.appendChild(cell);
        }
        block.appendChild(row);
      }
      blocks.push(block);
    }
    // big sets are built over several calls: blocks wait on the page root until the last call assembles the section
    F.pending = (F.pending || []).concat(blocks.map((b) => b.id));
    let n = F.flush();
    if (!assemble) return { pending: F.pending.length, of: Object.keys(groups).length, bindCalls: n };
    const sec = F.section("Colours — " + setName, x, y ?? F.bottom() + 160);
    for (const id of F.pending) sec.appendChild(penpot.currentPage.getShapeById(id));
    F.pending = []; n += F.flush();
    return { board: sec.id, groups: Object.keys(groups).length, tokens: set.tokens.length, bindCalls: n };
  };

  /** Spacing, radius, border width and shadow scales, each sample bound to its token. */
  F.scalesBoard = function (x = 0, y) {
    const parts = [];
    const core = cat().sets.find((s) => s.name === "core");
    const pick = (re) => core.tokens.filter((t) => re.test(t.name));
    const group = (title, list, sample) => {
      const g = F.flex(title, "column", 12); g.appendChild(F.text(title, "body-sm", "semibold", "txt.primary"));
      const row = F.flex("samples", "row", 24); row.flex.alignItems = "end";
      for (const t of list) { const c = F.flex(t.name, "column", 6); c.flex.alignItems = "center"; c.appendChild(sample(t)); c.appendChild(F.text(t.name.split(".").slice(1).join(".") + " · " + t.resolvedValue, "caption-xs", "regular", "txt.tertiary")); row.appendChild(c); }
      g.appendChild(row); parts.push(g);
    };
    group("Spacing", pick(/^space\./), (t) => { const r = penpot.createRectangle(); r.name = "space"; r.resize(Math.max(+t.resolvedValue, 1), 24); bind(r, "bg.accent-primary", "fill"); return r; });
    group("Radius", pick(/^radius\./), (t) => { const r = penpot.createRectangle(); r.name = "radius"; r.resize(56, 56); bind(r, "bg.layer-2", "fill"); r.strokes = [{ strokeColor: "#000000", strokeOpacity: 1, strokeWidth: 1, strokeAlignment: "inner", strokeStyle: "solid" }]; bind(r, "border.strong", "strokeColor"); t.applyToShapes([r], ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"]); return r; });
    group("Border width", pick(/^border-width\./), (t) => { const r = penpot.createRectangle(); r.name = "border"; r.resize(56, 56); r.fills = []; r.borderRadius = 6; r.strokes = [{ strokeColor: "#000000", strokeOpacity: 1, strokeWidth: 1, strokeAlignment: "inner", strokeStyle: "solid" }]; bind(r, "border.strong", "strokeColor"); t.applyToShapes([r], ["strokeWidth"]); return r; });
    group("Control height", pick(/^control\.height\./), (t) => { const r = penpot.createRectangle(); r.name = "control"; r.resize(64, +t.resolvedValue); r.borderRadius = 6; bind(r, "bg.layer-2", "fill"); return r; });
    // Penpot rejects the negative spreads qui's shadows use as tokens, so the shadow scale is drawn as real effects
    group("Shadow", Object.keys(F.d.shadows).map((k) => ({ name: "shadow." + k, resolvedValue: F.d.shadows[k].length + " layers" })), (t) => {
      const r = penpot.createRectangle(); r.name = t.name; r.resize(120, 80); r.borderRadius = 8; bind(r, "bg.surface-1", "fill");
      r.shadows = F.d.shadows[t.name.slice(7)].map((l) => ({ style: "drop-shadow", offsetX: l.x, offsetY: l.y, blur: l.blur, spread: l.spread, hidden: false, color: { color: l.color, opacity: l.opacity } }));
      return r;
    });
    const sec = F.section("Scales", x, y ?? F.bottom() + 160); for (const g of parts) sec.appendChild(g);
    const n = F.flush();
    return { board: sec.id, bindCalls: n };
  };

  /** Every text style, rendered with that style. */
  F.typoBoard = function (x = 0, y) {
    const parts = [];
    const byRole = {};
    for (const t of F.d.typo) (byRole[t.role] = byRole[t.role] || []).push(t);
    for (const [role, list] of Object.entries(byRole)) {
      const row = F.flex(role, "row", 32); row.flex.alignItems = "center";
      const meta = F.flex("meta", "column", 2); meta.flex.horizontalSizing = "fix"; meta.resize(200, 10);
      meta.appendChild(F.text(role, "body-xs", "semibold", "txt.primary"));
      meta.appendChild(F.text(list[0].size + " / " + Math.round(list[0].size * list[0].lh * 100) / 100 + " px", "caption-xs", "regular", "txt.tertiary"));
      row.appendChild(meta);
      for (const t of list) row.appendChild(F.text("The quick brown fox · " + t.weight, t.role, t.weight, "txt.primary"));
      parts.push(row);
    }
    const sec = F.section("Typography", x, y ?? F.bottom() + 160); for (const g of parts) sec.appendChild(g);
    const n = F.flush();
    return { board: sec.id, roles: Object.keys(byRole).length, bindCalls: n };
  };
  return "foundations loaded";
})();
