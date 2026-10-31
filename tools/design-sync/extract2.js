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
      return { inset, x: n[0] || 0, y: n[1] || 0, blur: n[2] || 0, spread: n[3] || 0, ...hex(rgba(tok), k), src: tok };
    });
  };

  // ---- token resolution: which design-token variable paints an element ----
  // Rules that declare a colour through var(--token); a match only counts when the variable really resolves to the
  // element's computed colour, so a stale or overridden rule can never bind the wrong token.
  const COLOR_PROPS = ["background-color", "color", "border-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "fill", "stroke"];
  const tokRules = [];
  const collect = (rules) => { for (const r of rules) { if (r.cssRules && !r.selectorText) { collect(r.cssRules); continue; } if (!r.selectorText) continue; const hits = []; for (const p of COLOR_PROPS) { const v = r.style.getPropertyValue(p); const m = v && v.match(/^var\((--[a-z0-9-]+)\)$/); if (m) hits.push([p, m[1]]); else if (/^currentcolor$/i.test(v) && p !== "color" && p !== "border-color") hits.push([p, "@current"]); } if (hits.length) tokRules.push({ sel: r.selectorText, hits }); } };
  for (const ss of document.styleSheets) { try { collect(ss.cssRules); } catch (e) {} }
  const probe = document.createElement("div"); probe.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px"; document.body.appendChild(probe);
  const varCol = new Map();
  const varRgba = (name) => { if (!varCol.has(name)) { probe.style.color = ""; probe.style.color = "var(" + name + ")"; varCol.set(name, rgba(getComputedStyle(probe).color)); } return varCol.get(name); };
  const same = (a, b) => Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1 && Math.abs(a[2] - b[2]) <= 1 && Math.abs(a[3] - b[3]) <= 0.01;
  const matchSel = (el, sel, which) => { try { if (which && sel.includes(which)) return el.matches(sel.split(which).join("")); if (/::/.test(sel)) return false; return el.matches(sel); } catch (e) { return false; } };
  const famNames = {};
  const allVars = [...new Set([...document.styleSheets].flatMap((ss) => { try { return [...ss.cssRules]; } catch (e) { return []; } }).flatMap((r) => (r.cssText.match(/--(?:txt|bg|border|label)-[a-z0-9-]+(?=\s*:)/g) || [])))];
  // theme aliases (--border-color-subtle: var(--border-subtle)) resolve to the token they name, the one Penpot knows
  const alias = new Map();
  const collectAlias = (rules) => { for (const r of rules) { if (r.cssRules && !r.selectorText) { collectAlias(r.cssRules); continue; } if (!r.style) continue; for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (!p.startsWith("--")) continue; const m = r.style.getPropertyValue(p).trim().match(/^var\((--[a-z0-9-]+)\)$/); if (m && !alias.has(p)) alias.set(p, m[1]); } } };
  for (const ss of document.styleSheets) { try { collectAlias(ss.cssRules); } catch (e) {} }
  // stop at a semantic token (its own value names a primitive, which screens must not bind to)
  const semantic = (n) => /^--(bg|txt|border|label|illustration|scrollbar)-/.test(n) && !/^--(border|bg|text)-color-/.test(n);
  const unalias = (name) => { for (let i = 0; i < 8 && alias.has(name) && !semantic(name); i++) name = alias.get(name); return name; };
  const tokFor = (el, props, value, which) => { const t = tokFor0(el, props, value, which); return t ? unalias("--" + t).slice(2) : t; };
  const tokFor0 = (el, props, value, which) => {
    const want = rgba(value); if (want[3] === 0) return null;
    const own = inlineVar(el, props, want); if (own) return own;
    for (let e = el, depth = 0; e && depth < (props[0] === "color" ? 40 : 1); e = e.parentElement, depth++) {
      let found = null;
      for (const r of tokRules) {
        const h = r.hits.find((x) => props.includes(x[0])); if (!h) continue;
        if (!matchSel(e, r.sel, depth === 0 ? which : null)) continue;
        if (h[1] === "@current") { const t = tokFor(e, ["color"], getComputedStyle(e).color, null); if (t && same(rgba(getComputedStyle(e).color), want)) found = "--" + t; }
        else if (same(varRgba(h[1]), want)) found = h[1];
      }
      if (found) return found.slice(2);
    }
    // fallback: the semantic token of the right family whose resolved colour equals this exact colour
    const fam = props[0] === "background-color" ? "--bg-" : props[0].startsWith("border") ? "--border-" : "--txt-";
    if (!famNames[fam]) famNames[fam] = [...new Set(tokRules.flatMap((r) => r.hits.map((h) => h[1])).concat(allVars).filter((n) => n.startsWith(fam) && !/^--border-(width|radius|style)\b/.test(n)))];
    // data colours (a label's swatch) come from the label palette: any token whose colour is exactly this one
    const hit = famNames[fam].find((n) => same(varRgba(n), want)) || allVars.filter((n) => n.startsWith("--label-") && same(varRgba(n), want)).sort((a, b) => b.endsWith("-icon") - a.endsWith("-icon"))[0];
    return hit ? hit.slice(2) : null;
  };
  /** A var(--x) the element sets itself (inline style or a presentation attribute) for one of `props`, when it resolves to
   *  `want`; data colours (chart palette, status tones) arrive this way. Returned without the leading "--". */
  const inlineVar = (el, props, want) => {
    for (const p of props) {
      const short = p === "background-color" ? "background" : null;
      for (const v of [el.style && el.style.getPropertyValue(p), short && el.style && el.style.getPropertyValue(short), el.getAttribute && el.getAttribute(p)]) {
        const m = v && v.trim().match(/^var\((--[a-z0-9-]+)\)$/); if (m && same(varRgba(m[1]), want)) return m[1].slice(2);
      }
    }
    return null;
  };
  /** Token of an svg part's paint: a var the part sets itself, else a var named in its classes when it resolves to the
   *  colour, else the family it hints at (aliases resolved to the token they name). */
  const svgTok = (el, value, prop) => { const t = svgTok0(el, value, prop); return t ? unalias("--" + t).slice(2) : t; };
  const svgTok0 = (el, value, prop) => {
    const own = prop && inlineVar(el, [prop], rgba(value)); if (own) return own;
    const want = rgba(value); const cls = el.getAttribute("class") || "";
    const named = (cls.match(/--[a-z0-9-]+/g) || []).map((n) => n.replace(/^--(bg|border|text)-color-/, "--$1-").replace(/^--text-/, "--txt-"));
    const pool = allVars.filter((n) => same(varRgba(n), want));
    const hit = pool.find((n) => named.includes(n)) || pool.find((n) => named.some((x) => x.startsWith(n.split("-").slice(0, 3).join("-")))) || pool.find((n) => named.some((x) => n.startsWith(x.split("-").slice(0, 3).join("-")))) || pool[0];
    return hit ? hit.slice(2) : null;
  };
  const H = (el, props, value, k = 1, which) => { const o = hex(rgba(value), k); const t = tokFor(el, props, value, which); if (t) o.tk = t; return o; };
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
  const dispKind = (cs) => (isFlex(cs) ? "flex" : cs.display === "grid" || cs.display === "inline-grid" ? "grid" : cs.display === "contents" ? "contents" : cs.display === "table-row" ? "table-row" : /inline/.test(cs.display) ? "inline" : "block");

  function sizing(el, cs, rect, parent, pcs, prect) {
    const out = { w: "fix", h: "fix" };
    // the table algorithm sizes rows and cells, not their content: groups and rows span the table, a row keeps its
    // height and a cell keeps its column width and fills the row's height
    if (/^table-(row-group|header-group|footer-group)$/.test(cs.display)) return { w: "fill", h: "hug" };
    if (cs.display === "table-row") return { w: "fill", h: "fix" };
    if (cs.display === "table-cell") return { w: "fix", h: "fill" };
    const pk = parent ? dispKind(pcs) : "none";
    const prow = pk === "flex" && (pcs.flexDirection === "row" || pcs.flexDirection === "row-reverse");
    const pcol = pk === "flex" && !prow;
    const innerW = prect ? prect.width - px(pcs.paddingLeft) - px(pcs.paddingRight) - px(pcs.borderLeftWidth) - px(pcs.borderRightWidth) : 0;
    const innerH = prect ? prect.height - px(pcs.paddingTop) - px(pcs.paddingBottom) - px(pcs.borderTopWidth) - px(pcs.borderBottomWidth) : 0;
    const grow = px(cs.flexGrow) > 0;
    const stretch = (cs.alignSelf === "auto" || cs.alignSelf === "normal" ? pcs && (pcs.alignItems === "normal" || pcs.alignItems === "stretch") : cs.alignSelf === "stretch");
    const minW = cs.minWidth === "auto" ? 0 : px(cs.minWidth), minH = cs.minHeight === "auto" ? 0 : px(cs.minHeight);
    // form controls are replaced elements with their own size: never "hug" the placeholder text drawn inside them
    const replaced = /^(TEXTAREA|INPUT|SELECT)$/.test(el.tagName);
    const hw = !replaced && hugW(el, rect.width) && !(minW > 0 && Math.abs(rect.width - minW) < 0.6);
    const hh = !replaced && hugH(el, rect.height) && !(minH > 0 && Math.abs(rect.height - minH) < 0.6);
    // width
    if (prow && grow) out.w = "fill";
    // stretched only when it really spans the parent (an explicit width, e.g. a skeleton bar, wins over stretch)
    else if (pcol && stretch && !hw && Math.abs(rect.width - innerW) < 0.6) out.w = "fill";
    else if (hw) out.w = "hug";
    else if (pk !== "flex" && pk !== "none" && Math.abs(rect.width - innerW) < 0.6) out.w = "fill";
    else if (prow && Math.abs(rect.width - innerW) < 0.6 && !(parent && hugW(parent, prect.width))) out.w = "fill";
    // height
    if (pcol && grow) out.h = "fill";
    else if (prow && stretch && !hh && !replaced) out.h = "fill";
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
  // layout primitives / look-less containers: never instanced, but the builder names their frame after them
  const PRIMS = new Set(["Box", "Stack", "Inline", "Grid", "List", "Tabs", "TableHeader", "TableBody"]);
  function primOf(el) {
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber$"));
    if (!k) return null;
    let found = null;
    for (let f = el[k]; f; f = f.return) { const n = nm(f.type); if (n && PRIMS.has(n) && hostOf(f) === el) found = n; }
    return found;
  }

  // qui's icon set is drawn by Tabler, whose svgs carry `tabler-icon tabler-icon-<name>`
  const lucideName = (svg) => { const m = (svg.getAttribute("class") || "").match(/tabler-icon-([a-z0-9-]+)/g); return m ? m[m.length - 1].replace("tabler-icon-", "") : null; };

  function walk(el, origin, parent, pcs, prect) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || el.tagName === "SCRIPT" || el.tagName === "STYLE") return null;
    const rect = el.getBoundingClientRect();
    const rel = { x: R(rect.x - origin.x), y: R(rect.y - origin.y), w: R(rect.width), h: R(rect.height) };
    const tag = el.tagName.toLowerCase();

    if (tag === "svg") {
      const clone = el.cloneNode(true); clone.removeAttribute("class"); clone.removeAttribute("style");
      clone.setAttribute("width", R(rect.width)); clone.setAttribute("height", R(rect.height));
      // non-lucide svgs (progress rings, spinners) colour their parts through classes the svg import cannot see:
      // inline each part's computed paint and rotation, and record its token so the builder can bind it
      let parts;
      if (!lucideName(el)) {
        const SHAPES = "path,circle,ellipse,rect,line,polyline,polygon";
        // shapes inside <defs> / <clipPath> / <mask> (a chart's clip rect) are not drawn, and the svg import drops them
        const drawn = (root) => [...root.querySelectorAll(SHAPES)].filter((x) => !x.closest("defs, clipPath, mask"));
        const src = drawn(el), dst = drawn(clone);
        const vb = el.viewBox && el.viewBox.baseVal; const cx = vb ? vb.x + vb.width / 2 : 0, cy = vb ? vb.y + vb.height / 2 : 0;
        parts = src.map((p, i) => {
          const pcs = getComputedStyle(p); const d = dst[i]; d.removeAttribute("class");
          const paint = (prop) => { const v = pcs[prop]; if (!v || v === "none" || /url\(/.test(v)) return null; const o = hex(rgba(v)); if (!o.a) return null; const t = svgTok(p, v, prop); if (t) o.tk = t; d.setAttribute(prop, o.c); if (o.a < 1) d.setAttribute(prop + "-opacity", o.a); return o; };
          const out = { stroke: paint("stroke"), fill: paint("fill") };
          const m = pcs.transform && pcs.transform.match(/^matrix\(([^)]+)\)$/);
          let ang = 0;
          if (m) { const [a, b] = m[1].split(",").map(Number); ang = Math.round((Math.atan2(b, a) * 180) / Math.PI); }
          if (pcs.rotate && pcs.rotate !== "none") ang += parseFloat(pcs.rotate) || 0; // Tailwind v4 rotate-* uses the rotate property
          if (ang) d.setAttribute("transform", `rotate(${ang} ${cx} ${cy})`);
          return out;
        });
        const tsrc = [...el.querySelectorAll("text, tspan")], tdst = [...clone.querySelectorAll("text, tspan")];
        tsrc.forEach((t, i) => { const tcs = getComputedStyle(t); if (t.tagName === "text") { tdst[i].setAttribute("font-family", tcs.fontFamily); tdst[i].setAttribute("font-weight", tcs.fontWeight); } const c = tcs.fill; if (c && c !== "none" && !/url\(/.test(c)) { const o = hex(rgba(c)); tdst[i].setAttribute("fill", o.c); if (o.a < 1) tdst[i].setAttribute("fill-opacity", o.a); } });
      }
      // a rotated glyph (DisclosureIndicator's chevron-down turned -90° while closed): the rotation of the svg and of a
      // wrapper that holds only it (rotate property or a transform matrix), so the builder can turn the icon instance
      const angOf = (e) => { const c = getComputedStyle(e); let a = 0; const mm = c.transform && c.transform.match(/^matrix\(([^)]+)\)$/); if (mm) { const [p, q] = mm[1].split(",").map(Number); a = Math.round((Math.atan2(q, p) * 180) / Math.PI); } if (c.rotate && c.rotate !== "none") a += parseFloat(c.rotate) || 0; return a; };
      let rot = angOf(el); if (el.parentElement && el.parentElement.children.length === 1) rot += angOf(el.parentElement);
      rot = ((Math.round(rot) % 360) + 360) % 360;
      const sv = { t: "sv", icon: lucideName(el), svg: new XMLSerializer().serializeToString(clone), r: rel, color: H(el, ["color"], cs.color), parts, sw: cs.strokeWidth, op: +cs.opacity };
      if (rot) sv.rot = rot;
      return sv;
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
    } else { const pm = primOf(el); if (pm) node.prim = pm; }
    const st = (node.st = {});
    st.d = kind;
    if (kind === "flex") {
      st.dir = cs.flexDirection; st.wrap = cs.flexWrap !== "nowrap"; st.ai = cs.alignItems; st.jc = cs.justifyContent;
      st.gap = [px(cs.rowGap), px(cs.columnGap)];
    }
    if (kind === "grid") { st.cols = cs.gridTemplateColumns; st.gap = [px(cs.rowGap), px(cs.columnGap)]; st.ai = cs.alignItems; st.jc = cs.justifyContent; }
    st.pad = quad(cs, "padding"); st.bw = ["Top", "Right", "Bottom", "Left"].map((s) => (cs["border" + s + "Style"] === "none" ? 0 : px(cs["border" + s + "Width"])));
    st.mar = quad(cs, "margin");
    st.ta = cs.textAlign; if (cs.display === "table-cell") st.va = cs.verticalAlign;
    st.pos = cs.position;
    if (cs.position === "absolute" || cs.position === "fixed") st.abs = true;
    // a translate (a switch thumb, a slider handle) moves the box off its layout slot: place it where it is drawn
    else if ((/^matrix\(1, 0, 0, 1, /.test(cs.transform) && cs.transform !== "matrix(1, 0, 0, 1, 0, 0)") || (cs.translate && cs.translate !== "none" && !/^0px( 0px)?$/.test(cs.translate))) st.abs = true;
    st.clip = cs.overflowX !== "visible" || cs.overflowY !== "visible";
    st.grow = px(cs.flexGrow); st.shrink = px(cs.flexShrink); st.as = cs.alignSelf;
    st.minW = cs.minWidth === "auto" || cs.minWidth === "0px" ? null : px(cs.minWidth);
    st.maxW = cs.maxWidth === "none" ? null : px(cs.maxWidth);
    const bg = rgba(cs.backgroundColor); if (bg[3] > 0) st.bg = H(el, ["background-color"], cs.backgroundColor, op);
    const bds = ["Top", "Right", "Bottom", "Left"].map((s, i) => (st.bw[i] > 0 && rgba(cs["border" + s + "Color"])[3] > 0 ? H(el, ["border-" + s.toLowerCase() + "-color", "border-color"], cs["border" + s + "Color"], op) : null)); if (st.bw.some((w) => w > 0)) st.bd = bds;
    const rad = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => { const v = cs["border" + c + "Radius"]; const n = v.endsWith("%") ? (parseFloat(v) / 100) * Math.min(rect.width, rect.height) : px(v); return R(Math.min(n, Math.min(rect.width, rect.height) / 2)); });
    if (rad.some((x) => x > 0)) st.rad = rad;
    // rounded-full computes to an effectively infinite radius: keep that intent (radius.full) rather than half the height
    if (["TopLeft", "TopRight", "BottomRight", "BottomLeft"].every((c) => { const v = cs["border" + c + "Radius"]; return v.endsWith("%") ? parseFloat(v) >= 50 : px(v) >= 999; })) st.radFull = true;
    // transparent layers (Tailwind's empty ring / shadow slots) draw nothing; a hairline's colour gets its border token
    // a shadow with no offset, blur or spread draws nothing either
    const sh = shadows(cs.boxShadow, op).filter((x) => x.a > 0 && (x.inset || x.x || x.y || x.blur || x.spread));
    // no border token: a currentColor ring (Radio) takes the text colour's token, a var(--txt-…) ring (disabled Checkbox) its own
    sh.forEach((x) => { const t = tokFor(el, ["border-color"], x.src) || tokFor(el, ["color"], x.src); if (t) x.tk = t; delete x.src; });
    if (sh.length) st.sh = sh;
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
      const pn = { t: "ps", which, r: { x: R(x - origin.x), y: R(y - origin.y), w: R(pw), h: R(ph) }, rad: pr, bg: H(el, ["background-color"], ps.backgroundColor, op, which) };
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
        // keep a leading / trailing space only when the browser renders it (width > 0): "•••• " before the digits
        // is real, a space collapsed at a line or block edge (or after another space) is not
        const edgeWs = (atEnd) => {
          const all = c.textContent; const m = (atEnd ? all.match(/\s+$/) : all.match(/^\s+/)); if (!m) return 0;
          const from = atEnd ? all.length - m[0].length : 0, to = atEnd ? all.length : m[0].length;
          const at = (k) => { let n = 0; for (const nd of c.nodes) { if (k <= n + nd.length) return [nd, k - n]; n += nd.length; } const z = c.nodes[c.nodes.length - 1]; return [z, z.length]; };
          const wr = document.createRange(); wr.setStart(...at(from)); wr.setEnd(...at(to));
          return [...wr.getClientRects()].reduce((s2, q) => s2 + q.width, 0);
        };
        if (trimAll || edgeWs(false) < 0.5) txt = txt.replace(/^ /, "");
        if (trimAll || edgeWs(true) < 0.5) txt = txt.replace(/ $/, "");
        if (!txt.trim()) {
          // a space between two inline siblings occupies real width
          if (!trimAll && i > 0 && i < kids.length - 1 && txt.length) {
            const wr = document.createRange(); wr.setStartBefore(c.nodes[0]); wr.setEndAfter(c.nodes[c.nodes.length - 1]);
            const wrects = [...wr.getClientRects()].filter((r) => r.width > 0);
            if (wrects.length) {
              const fs0 = px(cs.fontSize); const lh0 = cs.lineHeight === "normal" ? fs0 * 1.21 : px(cs.lineHeight);
              const q = wrects[0];
              ch.push({ t: "tx", s: "\u00A0", lines: 1, r: { x: R(q.left - origin.x), y: R(q.top + q.height / 2 - lh0 / 2 - origin.y), w: R(q.width), h: R(lh0) }, f: { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs: fs0, fw: cs.fontWeight, fst: cs.fontStyle, lh: lh0, ls: px(cs.letterSpacing), al: cs.textAlign, ...H(el, ["color"], cs.color, op) }, space: true });
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
        const tn = { t: "tx", s, r: { x: R(l - origin.x), y: R(lineTop - origin.y), w: R(r2 - l), h: R(lhPx * lines) }, lines, f: { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs, fw: cs.fontWeight, fst: cs.fontStyle, lh: cs.lineHeight === "normal" ? null : px(cs.lineHeight), ls: px(cs.letterSpacing), td: cs.textDecorationLine !== "none" ? cs.textDecorationLine : undefined, al: cs.textAlign, ...H(el, ["color"], cs.color, op) } };
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
        // a truncated run ("Categories & segme…"): Penpot has no text-overflow, so record the string the browser shows
        if (cs.textOverflow === "ellipsis" && lines === 1 && el.scrollWidth > el.clientWidth + 0.5) {
          cx.font = cs.fontStyle + " " + cs.fontWeight + " " + fs + "px " + cs.fontFamily;
          const avail = el.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
          let k = s.length; while (k > 0 && cx.measureText(s.slice(0, k).trimEnd() + "\u2026").width > avail) k--;
          tn.full = s; tn.s = s.slice(0, k).trimEnd() + "\u2026"; tn.r.w = R(Math.min(avail, cx.measureText(tn.s).width));
        }
        ch.push(tn);
      } else if (c.nodeType === 1) {
        const sub = walk(c, origin, el, cs, rect); if (sub) ch.push(sub);
      }
    });
    // input placeholder
    // input placeholder, or the typed value of a text control (a filled Input / NumberField's number)
    const textual = tag === "textarea" || (tag === "input" && /^(text|search|email|number|tel|url|password)$/.test(el.type));
    if (textual && (el.value || el.placeholder)) {
      const isPh = !el.value; const s = isPh ? el.placeholder : el.type === "password" ? "•".repeat(el.value.length) : el.value;
      const ps = isPh ? getComputedStyle(el, "::placeholder") : cs; const fs = px(cs.fontSize); const lh = px(cs.lineHeight) || fs * 1.2;
      cx.font = cs.fontWeight + " " + fs + "px " + cs.fontFamily;
      const w = cx.measureText(s).width; const padL = px(cs.paddingLeft) + px(cs.borderLeftWidth);
      // a right- or centre-aligned value (a number field) sits where the browser draws it
      const inner = rect.width - padL - px(cs.paddingRight) - px(cs.borderRightWidth);
      const dx = !isPh && /right|end/.test(cs.textAlign) ? inner - w : !isPh && cs.textAlign === "center" ? (inner - w) / 2 : 0;
      ch.push({ t: "tx", s, placeholder: isPh || undefined, lines: 1, r: { x: R(rect.x - origin.x + padL + dx), y: R(rect.y - origin.y + (tag === "textarea" ? px(cs.paddingTop) + px(cs.borderTopWidth) : (rect.height - lh) / 2)), w: R(w), h: R(lh) }, f: { ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fs, fw: cs.fontWeight, fst: "normal", lh, ls: px(cs.letterSpacing), al: "left", ...H(el, ["color"], ps.color, op, isPh ? "::placeholder" : undefined) } });
    }
    return node;
  }

  // browser zoom snaps borders to device pixels (1px reads back as 0.8 at 125%), so only measure at 100%
  if (Math.abs(devicePixelRatio - Math.round(devicePixelRatio)) > 0.01) throw new Error("page zoom is not 100% (devicePixelRatio " + devicePixelRatio + "); reset it with cmd+0");
  const t0 = performance.now();
  const out = { dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight };
  if (cfg.cells) {
    out.cells = [...document.querySelectorAll(cfg.cells)].map((cell) => {
      const sel = cell.getAttribute("data-root-sel"); const root = (sel && (sel.startsWith("doc:") ? document.querySelector(sel.slice(4)) : cell.querySelector(sel))) || cell.firstElementChild; const o = root.getBoundingClientRect();
      return { spec: cell.getAttribute("data-spec"), level: cell.getAttribute("data-level"), v: JSON.parse(cell.getAttribute("data-v") || "{}"), tree: walk(root, { x: o.x, y: o.y }, null, null, null) };
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
