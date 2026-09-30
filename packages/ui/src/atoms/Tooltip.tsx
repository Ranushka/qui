import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

const tooltipPopupVariants = cva(
  "z-50 flex max-w-[min(500px,var(--available-width,100vw))] items-center gap-3 rounded-md border border-subtle bg-layer-2 px-2 py-1.5 text-caption-md-regular text-primary shadow-overlay-200 outline-none"
);

export interface TooltipProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseTooltip.Root>, "children"> {
  /** Trigger element — must accept a ref and forward extra props (a single element, not text). */
  children: React.ReactElement;
  /** Tooltip copy. The tooltip renders nothing (and stays disabled) when this is empty. */
  label?: React.ReactNode;
  side?: React.ComponentProps<typeof BaseTooltip.Positioner>["side"];
  sideOffset?: React.ComponentProps<typeof BaseTooltip.Positioner>["sideOffset"];
  className?: string;
}

/**
 * A small popup that describes the element it's attached to. Appears on hover or keyboard focus of
 * the trigger, dismissed on blur, pointer-leave, or `Esc`. Built on Base UI's tooltip, so it's
 * `role="tooltip"` and wired to the trigger automatically — just pass the trigger as `children` and
 * the copy as `label`. Needs a `QuiProvider` ancestor (it supplies `Tooltip.Provider`).
 */
export function Tooltip({ label, disabled, side = "top", sideOffset = 8, className, children, ...props }: TooltipProps) {
  const mounted = !disabled && label != null && label !== "";

  return (
    <BaseTooltip.Root disabled={!mounted} {...props}>
      <BaseTooltip.Trigger render={children} />
      {mounted ? (
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={sideOffset} className="z-50 outline-none">
            <BaseTooltip.Popup className={cn(tooltipPopupVariants(), className)}>{label}</BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      ) : null}
    </BaseTooltip.Root>
  );
}

/* __DOC
<QUI.Tooltip label="Save changes">
  <QUI.Button label="Hover me" />
</QUI.Tooltip>
DOC__ */

/* __PROPS
{ "side": ["top", "bottom", "left", "right"], "sideOffset": ["number"], "disabled": "boolean" }
PROPS__ */
