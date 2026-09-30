import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";

/** Full-bleed scrim behind the popup. Fades with the popup via Base UI's open/close data attrs. */
const dialogBackdropClass =
  "fixed inset-0 z-50 bg-black/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none";

/** Centers the popup in the viewport and lets it scroll as a unit when content overflows the page. */
const dialogViewportClass = "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-20";

/** The popup surface: card chrome + scale/fade transition keyed off Base UI's starting/ending-style data attrs. */
const dialogPopupVariants = cva(
  cn(
    "relative flex max-h-[calc(100dvh-10rem)] max-w-[calc(100vw-2rem)] flex-col overflow-clip rounded-xl border-sm border-subtle bg-surface-1 shadow-raised-300 outline-none",
    "origin-(--transform-origin) transition-[opacity,transform] duration-200 motion-reduce:transition-none",
    "data-starting-style:scale-95 data-starting-style:opacity-0",
    "data-ending-style:scale-95 data-ending-style:opacity-0"
  ),
  {
    variants: {
      size: {
        xs: "w-120",
        sm: "w-144",
        md: "w-168",
        lg: "w-200",
        xl: "w-250",
        full: "h-[calc(100dvh-10rem)] w-[calc(100vw-10rem)]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

/** The dialog Root — Base UI's context/state provider (renders no element of its own). Modal by default. */
export const Dialog = BaseDialog.Root;

/** A button that opens the dialog. Pass `render` to graft the trigger behavior onto e.g. `QUI.Button`. */
export const DialogTrigger = BaseDialog.Trigger;

/** A button that closes the dialog, e.g. a footer "Cancel" via `render={<QUI.Button .../>}`. */
export const DialogClose = BaseDialog.Close;

export interface DialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>, "render">,
    VariantProps<typeof dialogPopupVariants> {
  /** Hides the built-in top-right close (X) button. @default false */
  hideClose?: boolean;
  /** Accessible label for the built-in close button. @default "Close" */
  closeLabel?: string;
}

/**
 * The dialog's portaled surface: backdrop + centering viewport + the styled popup card, with a
 * top-right close (X) button baked in (opt out with `hideClose`). Wrap in `<Dialog>`/`<DialogTrigger>`.
 */
export function DialogContent({ size, hideClose = false, closeLabel = "Close", className, children, ...props }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={dialogBackdropClass} />
      <BaseDialog.Viewport className={dialogViewportClass}>
        <BaseDialog.Popup className={cn(dialogPopupVariants({ size }), className)} {...props}>
          {children}
          {hideClose ? null : (
            <BaseDialog.Close
              render={<IconButton variant="ghost" size="sm" aria-label={closeLabel} icon={<Icon icon={X} />} showTooltip={false} />}
              className="absolute inset-e-4 top-4 z-10"
            />
          )}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

/** The dialog's accessible heading. */
export function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn("text-h5-medium text-primary", className)} {...props} />;
}

/** Supporting copy under the title. */
export function DialogDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn("text-body-xs-regular text-tertiary", className)} {...props} />;
}

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Dialog>
    <QUI.DialogTrigger render={<QUI.Button label="Open dialog" />} />
    <QUI.DialogContent>
      <div className="flex flex-col gap-4 p-4 pe-10">
        <div className="flex flex-col gap-1.5">
          <QUI.DialogTitle>Invite teammates</QUI.DialogTitle>
          <QUI.DialogDescription>Send an invite link to anyone you want to collaborate with.</QUI.DialogDescription>
        </div>
        <QUI.Input placeholder="name@company.com" />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-subtle p-4">
        <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
        <QUI.Button label="Send invite" />
      </div>
    </QUI.DialogContent>
  </QUI.Dialog>
</div>
DOC__ */

/* __PROPS
{ "size": ["xs", "sm", "md", "lg", "xl", "full"], "hideClose": "boolean" }
PROPS__ */
