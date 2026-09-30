import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";

/**
 * Base UI ships no dedicated drawer primitive — a side sheet is a `Dialog` with edge-anchored
 * positioning and a slide transform instead of the centered scale/fade. Same Root/Trigger/Close
 * behavior as `Dialog`, so it's built directly on `@base-ui/react/dialog`.
 */
const drawerBackdropClass =
  "fixed inset-0 z-50 bg-black/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none";

/** The popup surface: full-height panel pinned to an edge, sliding in/out along that edge. */
const drawerPopupVariants = cva(
  cn(
    "fixed inset-y-0 z-50 flex flex-col bg-surface-1 outline-none",
    "transition-transform duration-200 motion-reduce:transition-none"
  ),
  {
    variants: {
      side: {
        end: "inset-e-0 max-w-full border-s-sm border-subtle data-starting-style:translate-x-full data-ending-style:translate-x-full",
        start: "inset-s-0 max-w-full border-e-sm border-subtle data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
      },
      size: {
        sm: "w-[358px]",
        md: "w-200",
        lg: "w-256",
      },
    },
    defaultVariants: { side: "end", size: "sm" },
  }
);

/** The drawer Root — same behavior as `Dialog.Root` (modal by default, focus trap, scroll lock). */
export const Drawer = BaseDialog.Root;

/** A button that opens the drawer. Pass `render` to graft the trigger onto e.g. `QUI.Button`. */
export const DrawerTrigger = BaseDialog.Trigger;

/** A button that closes the drawer, e.g. a footer "Cancel" via `render={<QUI.Button .../>}`. */
export const DrawerClose = BaseDialog.Close;

export interface DrawerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>, "render">,
    VariantProps<typeof drawerPopupVariants> {
  /** Hides the built-in top-right close (X) button. @default false */
  hideClose?: boolean;
  /** Accessible label for the built-in close button. @default "Close" */
  closeLabel?: string;
}

/**
 * The drawer's portaled surface: backdrop + the styled edge-anchored panel, with a top-right close
 * (X) button baked in (opt out with `hideClose`). Wrap in `<Drawer>`/`<DrawerTrigger>`.
 */
export function DrawerContent({ side, size, hideClose = false, closeLabel = "Close", className, children, ...props }: DrawerContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={drawerBackdropClass} />
      <BaseDialog.Popup className={cn(drawerPopupVariants({ side, size }), className)} {...props}>
        {children}
        {hideClose ? null : (
          <BaseDialog.Close
            render={<IconButton variant="ghost" size="sm" aria-label={closeLabel} icon={<Icon icon={X} />} showTooltip={false} />}
            className="absolute inset-e-4 top-4 z-10"
          />
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

/** The drawer's accessible heading. */
export function DrawerTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn("text-h5-medium text-primary", className)} {...props} />;
}

/** Supporting copy under the title. */
export function DrawerDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn("text-body-xs-regular text-tertiary", className)} {...props} />;
}

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Drawer>
    <QUI.DrawerTrigger render={<QUI.Button label="Open drawer" />} />
    <QUI.DrawerContent>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pe-10">
        <div className="flex flex-col gap-1.5">
          <QUI.DrawerTitle>Filters</QUI.DrawerTitle>
          <QUI.DrawerDescription>Narrow down the issue list by state, priority, and assignee.</QUI.DrawerDescription>
        </div>
        <QUI.Input placeholder="Search filters" />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-subtle p-4">
        <QUI.DrawerClose render={<QUI.Button variant="secondary" label="Cancel" />} />
        <QUI.Button label="Apply" />
      </div>
    </QUI.DrawerContent>
  </QUI.Drawer>
</div>
DOC__ */

/* __PROPS
{ "side": ["start", "end"], "size": ["sm", "md", "lg"], "hideClose": "boolean" }
PROPS__ */
