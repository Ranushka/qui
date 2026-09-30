import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { nodeSlotClass } from "../lib/node-slot";

/**
 * Full-bleed scrim behind the popup. Always modal (unlike `Dialog`, `AlertDialog` never allows
 * outside-press dismissal) — a confirmation is answered, not brushed aside.
 */
const alertDialogBackdropClass =
  "fixed inset-0 z-50 bg-black/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none";

/** Bottom-sheet on narrow viewports, centered card from `sm` up. */
const alertDialogViewportClass = "fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center";

/** The popup surface: a single fixed-width card (no size variants — a confirm dialog stays short). */
const alertDialogPopupClass = cn(
  "relative flex max-h-[min(740px,calc(100dvh-2rem))] w-150 max-w-[calc(100vw-2rem)] flex-col overflow-clip",
  "rounded-lg border-sm border-subtle bg-surface-1 shadow-raised-300 outline-none",
  "origin-(--transform-origin) transition-[opacity,transform] duration-200 motion-reduce:transition-none",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0"
);

/** The tinted intent badge above the title — soft fill + tinted glyph, one of four semantic intents. */
const alertDialogIconVariants = cva(cn(nodeSlotClass, "inline-flex items-center justify-center self-start rounded-lg p-2 [--node-size:var(--control-glyph-2xl)] max-sm:size-12 max-sm:self-center"), {
  variants: {
    variant: {
      danger: "bg-danger-subtle-hover text-icon-danger-secondary",
      warning: "bg-warning-secondary text-icon-warning-secondary",
      info: "bg-info-subtle-1 text-icon-info-secondary",
      success: "bg-success-subtle-1 text-icon-success-secondary",
    },
  },
});

const alertDialogActionsVariants = cva("flex shrink-0 flex-wrap items-center gap-3 border-t border-subtle p-4 max-sm:flex-col-reverse max-sm:items-stretch", {
  variants: {
    layout: {
      inline: "justify-end",
      split: "justify-between",
    },
  },
  defaultVariants: { layout: "inline" },
});

/** The alert dialog Root — always modal, with no outside-press or Escape dismissal by default. */
export const AlertDialog = BaseAlertDialog.Root;

/** A button that opens the alert dialog. Pass `render` to graft the trigger onto e.g. `QUI.Button`. */
export const AlertDialogTrigger = BaseAlertDialog.Trigger;

/** A button that answers the confirmation, e.g. `render={<QUI.Button variant="secondary" label="Cancel" />}`. */
export const AlertDialogClose = BaseAlertDialog.Close;

export interface AlertDialogContentProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAlertDialog.Popup>, "render"> {}

/** The alert dialog's portaled surface: backdrop + centering viewport + the styled popup card. */
export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className={alertDialogBackdropClass} />
      <BaseAlertDialog.Viewport className={alertDialogViewportClass}>
        <BaseAlertDialog.Popup className={cn(alertDialogPopupClass, className)} {...props}>
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  );
}

/** The alert dialog's accessible heading. */
export function AlertDialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseAlertDialog.Title>) {
  return <BaseAlertDialog.Title className={cn("text-h6-semibold text-primary", className)} {...props} />;
}

/** Supporting copy under the title. */
export function AlertDialogDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseAlertDialog.Description>) {
  return <BaseAlertDialog.Description className={cn("text-body-sm-regular text-secondary", className)} {...props} />;
}

export interface AlertDialogIconProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof alertDialogIconVariants> {}

/** The leading intent badge above the title. Decorative — the title carries the accessible name. */
export function AlertDialogIcon({ variant, className, ...props }: AlertDialogIconProps) {
  return <span aria-hidden className={cn(alertDialogIconVariants({ variant }), className)} {...props} />;
}

export interface AlertDialogActionsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertDialogActionsVariants> {}

/** The footer button row. `layout="split"` pushes the first and last children apart; `"inline"` (default) trails them right. */
export function AlertDialogActions({ layout, className, ...props }: AlertDialogActionsProps) {
  return <div className={cn(alertDialogActionsVariants({ layout }), className)} {...props} />;
}

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.AlertDialog>
    <QUI.AlertDialogTrigger render={<QUI.Button variant="danger" label="Delete project" />} />
    <QUI.AlertDialogContent>
      <div className="flex flex-col gap-4 p-5 pb-3 max-sm:text-center">
        <QUI.AlertDialogIcon variant="danger">
          <QUI.Icon icon={Icons.Trash2} />
        </QUI.AlertDialogIcon>
        <div className="flex flex-col gap-1.5">
          <QUI.AlertDialogTitle>Delete this project?</QUI.AlertDialogTitle>
          <QUI.AlertDialogDescription>This can't be undone. All issues, cycles, and pages in this project will be permanently deleted.</QUI.AlertDialogDescription>
        </div>
      </div>
      <QUI.AlertDialogActions>
        <QUI.AlertDialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
        <QUI.Button variant="danger" label="Delete" />
      </QUI.AlertDialogActions>
    </QUI.AlertDialogContent>
  </QUI.AlertDialog>
</div>
DOC__ */

/* __PROPS
{ "variant": ["danger", "warning", "info", "success"], "layout": ["inline", "split"] }
PROPS__ */
