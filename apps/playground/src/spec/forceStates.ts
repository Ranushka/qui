/**
 * Makes hover / focus / pressed styles previewable without a real pointer. Every stylesheet rule that
 * targets `:hover`, `:active`, `:focus-visible` or `:focus` is cloned with the pseudo-class swapped for
 * a plain class (`.__hover`, `.__active`, `.__focus`); putting that class on a component's root element
 * then renders the state. Used by the spec sheet so every component state can be captured for the design.
 */
const PSEUDO: Array<[RegExp, string]> = [
  [/:hover/g, ".__hover"],
  [/:active/g, ".__active"],
  [/:focus-visible/g, ".__focus"],
  [/:focus-within/g, ".__focus"],
  [/:focus/g, ".__focus"],
];
const HAS_PSEUDO = /:(hover|active|focus-visible|focus-within|focus)\b/;

function collect(rules: CSSRuleList, out: string[]) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (HAS_PSEUDO.test(rule.selectorText)) {
        let sel = rule.selectorText;
        for (const [re, to] of PSEUDO) sel = sel.replace(re, to);
        out.push(`${sel}{${rule.style.cssText}}`);
      }
    } else if ("cssRules" in rule) {
      collect((rule as CSSGroupingRule).cssRules, out);
    }
  }
}

export function installForcedStates() {
  if (document.getElementById("__forced-states")) return;
  // computed styles must be final when read, not mid-transition (transitions also stall in background tabs)
  const css: string[] = ["*,*::before,*::after{transition:none !important;animation:none !important}"];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collect(sheet.cssRules, css);
    } catch {
      // cross-origin stylesheet (fonts) — nothing to clone
    }
  }
  const style = document.createElement("style");
  style.id = "__forced-states";
  style.textContent = css.join("\n");
  document.head.appendChild(style);
}

export type ForcedState = "default" | "hover" | "focus" | "pressed";

export function applyForcedState(root: Element | null, state: ForcedState) {
  if (!root) return;
  const classes = state === "hover" ? ["__hover"] : state === "focus" ? ["__focus"] : state === "pressed" ? ["__active", "__hover"] : [];
  for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
    el.classList.remove("__hover", "__focus", "__active");
    el.classList.add(...classes);
  }
}
