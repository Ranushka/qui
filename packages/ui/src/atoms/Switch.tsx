import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const switchVariants = cva(
  cn(
    "relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-px transition-colors duration-100",
    "before:absolute before:content-['']",
    "bg-icon-placeholder data-checked:bg-accent-primary",
    "data-disabled:cursor-not-allowed data-disabled:not-data-checked:bg-(--txt-disabled) data-disabled:data-checked:opacity-40 data-readonly:cursor-default data-readonly:opacity-40",
    "outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2 focus-visible:outline-2 focus-visible:outline-transparent",
    "data-invalid:not-data-checked:shadow-[inset_0_0_0_1px_var(--border-color-danger-strong)]"
  ),
  {
    variants: {
      size: {
        sm: "h-[14px] w-[23px] [--switch-thumb-size:0.75rem] [--switch-thumb-travel:9px] before:-inset-x-px before:-inset-y-[5px]",
        md: "h-4 w-[27px] [--switch-thumb-size:0.875rem] [--switch-thumb-travel:11px] before:inset-x-0 before:-inset-y-1",
        lg: "h-[18px] w-[30px] [--switch-thumb-size:1rem] [--switch-thumb-travel:12px] before:inset-x-0 before:-inset-y-[3px]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const switchThumbClass = cn(
  "size-(--switch-thumb-size) rounded-full bg-on-color shadow-raised-100 transition-transform duration-100",
  "data-checked:translate-x-(--switch-thumb-travel)",
  "rtl:data-checked:-translate-x-(--switch-thumb-travel)"
);

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>, VariantProps<typeof switchVariants> {}

/**
 * On/off toggle. Base UI supplies `role="switch"` and full keyboard/form support; `checked`/
 * `defaultChecked`, `disabled`, and `readOnly` are control state, not variants — only `size` is
 * visual.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ size = "md", className, ...props }, ref) => (
  <BaseSwitch.Root ref={ref} className={cn(switchVariants({ size }), className)} {...props}>
    <BaseSwitch.Thumb className={switchThumbClass} />
  </BaseSwitch.Root>
));
Switch.displayName = "Switch";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex items-center gap-3">
    <QUI.Switch size="sm" />
    <QUI.Switch size="md" />
    <QUI.Switch size="lg" />
  </div>
  <div className="flex items-center gap-3">
    <QUI.Switch defaultChecked />
    <QUI.Switch disabled />
    <QUI.Switch disabled defaultChecked />
  </div>
</div>
DOC__ */

/* __PROPS
{ "size": ["sm", "md", "lg"], "disabled": "boolean", "readOnly": "boolean", "defaultChecked": "boolean" }
PROPS__ */
