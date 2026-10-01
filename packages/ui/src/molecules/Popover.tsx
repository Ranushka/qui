import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass, NoStyle } from "../lib/no-class";

const popoverPopupVariants = cva(
  cn(
    "flex max-h-(--available-height) flex-col border-sm border-subtle-1 bg-layer-2 shadow-overlay-200 outline-none",
    "origin-(--transform-origin) transition-[opacity,transform] duration-150 motion-reduce:transition-none",
    "data-starting-style:scale-95 data-starting-style:opacity-0",
    "data-ending-style:scale-95 data-ending-style:opacity-0"
  ),
  {
    variants: {
      variant: {
        rich: "w-max max-w-[calc(100vw-2rem)] min-w-80 gap-2 rounded-xl p-4",
        text: "w-74 gap-1 rounded-lg px-3 py-2 break-words",
      },
    },
    defaultVariants: { variant: "rich" },
  }
);

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger as React.ForwardRefExoticComponent<
  NoStyle<React.ComponentPropsWithoutRef<typeof BasePopover.Trigger>> & React.RefAttributes<HTMLButtonElement>
>;
export const PopoverPortal = BasePopover.Portal as React.ForwardRefExoticComponent<
  NoClass<React.ComponentPropsWithoutRef<typeof BasePopover.Portal>> & React.RefAttributes<HTMLDivElement>
>;
export const PopoverClose = BasePopover.Close as React.ForwardRefExoticComponent<
  NoStyle<React.ComponentPropsWithoutRef<typeof BasePopover.Close>> & React.RefAttributes<HTMLButtonElement>
>;

export interface PopoverContentProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>, "render">>, VariantProps<typeof popoverPopupVariants> {
}

/**
 * The anchored panel: `Portal` → `Positioner` (side/align/offset live here) → the styled popup
 * surface. `variant="rich"` is the padded content panel (forms, menus of custom content);
 * `variant="text"` is a compact title+description card. Wrap in `<Popover>`/`<PopoverTrigger>`.
 */
export function PopoverContent({ side = "bottom", sideOffset = 8, align, alignOffset, variant, children, ...props }: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} className="z-50 outline-none" {...props}>
        <BasePopover.Popup className={cn(popoverPopupVariants({ variant }))}>{children}</BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

/** The panel's accessible heading. */
export function PopoverTitle({ ...props }: NoClass<React.ComponentPropsWithoutRef<typeof BasePopover.Title>>) {
  return <BasePopover.Title className={cn("w-full text-body-sm-medium text-primary break-words")} {...props} />;
}

/** The scrollable slot inside `PopoverContent` — grows to fill leftover space, scrolls past it. */
export function PopoverBody({ ...props }: NoClass<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("-m-0.5 min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain p-0.5")} {...props} />;
}

/* __DOC
<QUI.Popover>
  <QUI.PopoverTrigger render={<QUI.Button label="Open popover" variant="secondary" />} />
  <QUI.PopoverContent>
    <QUI.PopoverTitle>Notification settings</QUI.PopoverTitle>
    <QUI.PopoverBody>
      <p className="text-body-xs-regular text-secondary">Choose how you want to be notified about activity.</p>
    </QUI.PopoverBody>
  </QUI.PopoverContent>
</QUI.Popover>
DOC__ */

/* __PROPS
{ "variant": ["rich", "text"], "side": ["top", "bottom", "left", "right"], "align": ["start", "center", "end"] }
PROPS__ */
