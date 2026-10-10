import * as React from "react";
import { combinations, specs, type Spec, type Variant } from "./specs";
import { applyForcedState, installForcedStates, type ForcedState } from "./forceStates";

/**
 * The component spec sheet: every component rendered in every variant and state, each in its own cell
 * tagged with `data-spec` / `data-v`. The design-sync tooling reads these cells to build the matching
 * Penpot components, so the design library is generated from what the code actually renders.
 * `#/spec/Pill` shows a single component.
 */
(window as unknown as { __quiSpecs: Record<string, Spec> }).__quiSpecs = Object.fromEntries(specs.map((s) => [s.name, s]));

function Cell({ spec, v }: { spec: Spec; v: Variant }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    installForcedStates();
    applyForcedState(ref.current, (v.State as ForcedState) ?? "default");
  }, [v.State]);
  return (
    <div ref={ref} data-spec={spec.name} data-v={JSON.stringify(v)} data-root-sel={spec.rootSelector} style={{ display: "inline-block", margin: 12, verticalAlign: "top", ...(typeof spec.cell === "function" ? spec.cell(v) : spec.cell) }}>
      {spec.render(v)}
    </div>
  );
}

export function SpecPage() {
  const only = decodeURIComponent(window.location.hash.split("/")[2] ?? "");
  const shown = only ? specs.filter((s) => s.name === only) : specs;
  return (
    <div>
      {shown.map((spec) => (
        <section key={spec.name} aria-label={spec.name}>
          <h2>{spec.name}</h2>
          <div>
            {combinations(spec).map((v) => (
              <Cell key={JSON.stringify(v)} spec={spec} v={v} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
