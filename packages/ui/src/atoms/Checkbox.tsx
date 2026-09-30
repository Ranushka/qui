import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";
import { nodeSlotClass } from "../lib/node-slot";

/**
 * The checkbox BOX look: a 16px hit-target whose visible chrome is the 14px inset the design
 * reserves inside the frame. A transparent `border-sm` reserves that 1px gutter; resting/invalid/
 * disabled strokes are an inset `box-shadow` on the padding edge, and checked/indeterminate fills
 * clip to the padding box. Reacts to Base UI's `data-checked`/`data-indeterminate`/`data-disabled`.
 */
const checkboxBoxClass = cn(
  "inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-sm border-transparent bg-clip-padding align-top [--node-size:0.75rem]",
  "shadow-[inset_0_0_0_1px_var(--border-color-icon-tertiary)]",
  "transition-[color,background-color,box-shadow] duration-100 outline-none",
  "focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-1",
  "data-invalid:not-data-checked:not-data-indeterminate:shadow-[inset_0_0_0_1px_var(--border-color-danger-strong)]",
  "not-data-disabled:hover:bg-layer-transparent-hover",
  "data-checked:bg-accent-primary data-checked:text-icon-on-color data-checked:shadow-none",
  "data-checked:not-data-disabled:hover:bg-accent-primary-hover",
  "data-indeterminate:bg-accent-primary data-indeterminate:text-icon-on-color data-indeterminate:shadow-none",
  "data-indeterminate:not-data-disabled:hover:bg-accent-primary-hover",
  "data-disabled:cursor-not-allowed data-disabled:bg-transparent data-disabled:shadow-[inset_0_0_0_1px_var(--txt-disabled)]",
  "data-disabled:data-checked:bg-(--txt-disabled) data-disabled:data-checked:text-icon-on-color data-disabled:data-checked:shadow-none",
  "data-disabled:data-indeterminate:bg-(--txt-disabled) data-disabled:data-indeterminate:text-icon-on-color data-disabled:data-indeterminate:shadow-none"
);

const checkboxLabelClass = cn(
  "inline-flex items-center gap-2 rounded-sm px-2 py-1 align-top",
  "text-body-xs-regular text-secondary transition-colors",
  "cursor-pointer not-has-[[data-disabled]]:hover:bg-layer-transparent-hover",
  "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:text-disabled has-[[data-disabled]]:[&>span[aria-hidden]]:text-disabled"
);

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root> {
  /** Row label. With none, this renders as the bare box. */
  label?: React.ReactNode;
  /** Icon shown between the box and the label. */
  icon?: React.ReactNode;
  stretch?: "auto" | "full";
}

/**
 * A tri-state checkbox (`checked` / `unchecked` / `indeterminate`), optionally wrapped in a
 * clickable labeled row.
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(({ label, stretch = "auto", icon, id, className, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

  const box = (
    <BaseCheckbox.Root ref={ref} id={label != null ? checkboxId : id} className={cn(checkboxBoxClass, className)} {...props}>
      <BaseCheckbox.Indicator className={cn(nodeSlotClass, "text-current data-indeterminate:hidden")}>
        <Check aria-hidden />
      </BaseCheckbox.Indicator>
      <BaseCheckbox.Indicator className="hidden items-center justify-center text-current data-indeterminate:inline-flex [&>img]:size-(--node-size) [&>svg]:size-(--node-size)">
        <Minus aria-hidden />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );

  if (label == null) return box;
  return (
    <label htmlFor={checkboxId} className={cn(checkboxLabelClass, stretch === "full" ? "w-full" : "w-fit")}>
      {box}
      {icon}
      {label}
    </label>
  );
});
Checkbox.displayName = "Checkbox";

/* __DOC_BLOCK
<div className="flex flex-col gap-1 p-4">
  <QUI.Checkbox label="Unchecked" />
  <QUI.Checkbox label="Checked" defaultChecked />
  <QUI.Checkbox label="Indeterminate" indeterminate />
  <QUI.Checkbox label="Disabled" disabled />
  <QUI.Checkbox label="Disabled checked" disabled defaultChecked />
</div>
DOC__ */

/* __PROPS
{ "stretch": ["auto", "full"], "indeterminate": "boolean", "disabled": "boolean", "defaultChecked": "boolean" }
PROPS__ */
