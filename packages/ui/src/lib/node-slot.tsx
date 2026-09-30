import * as React from "react";
import { cn } from "./cn";

/**
 * Shared sizing contract for anything that sits inside a control's `--node-size` slot (icons,
 * spinners, images): fills that CSS var via `size-(--node-size)` so a control's `size` variant
 * governs every glyph inside it uniformly.
 */
export const nodeSlotClass = cn("inline-flex shrink-0 items-center justify-center", "[&>img]:size-(--node-size) [&>svg]:size-(--node-size)");

export function NodeSlot(props: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={nodeSlotClass} {...props} />;
}
