import * as React from "react";

/**
 * A label that can turn semibold when its control is selected without nudging its neighbours: a hidden, zero-height
 * semibold copy (`::after`) sits in the same grid column, so the column is already as wide as the bold text.
 * String labels only; anything else renders as-is.
 */
export function StableLabel({ children }: { children: React.ReactNode }) {
  if (typeof children !== "string") return <span className="truncate">{children}</span>;
  return (
    <span
      data-label={children}
      className="grid min-w-0 after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] after:select-none"
    >
      <span className="truncate">{children}</span>
    </span>
  );
}
