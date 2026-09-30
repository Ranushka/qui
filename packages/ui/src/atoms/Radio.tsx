import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { cn } from "../lib/cn";

/**
 * The radio CIRCLE look: a 16px ring stroked with `currentColor` so the ring and inner dot recolor
 * together. Unlike a checkbox, the ring is drawn whether or not the option is selected, which is
 * what makes a set of them scannable as one group.
 */
const radioClass = cn(
  "flex size-4 shrink-0 items-center justify-center rounded-full border-sm border-transparent bg-clip-padding bg-layer-1",
  "shadow-[inset_0_0_0_1px_currentColor]",
  "text-icon-tertiary transition-[color,background-color,box-shadow] duration-100 outline-none",
  "data-checked:text-icon-accent-primary",
  "data-invalid:not-data-checked:text-icon-danger-primary",
  "focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2",
  "data-disabled:cursor-not-allowed data-disabled:text-icon-disabled data-disabled:opacity-60",
  "data-disabled:data-checked:text-icon-disabled"
);

export interface RadioProps extends React.ComponentPropsWithoutRef<typeof BaseRadio.Root> {
  className?: string;
}

/**
 * A single radio option: an empty ring that fills with a dot when selected. Must be rendered
 * inside a `RadioGroup`. Use `disabled` for a non-editable (read-only) option.
 */
export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(({ className, ...props }, ref) => (
  <BaseRadio.Root ref={ref} className={cn(radioClass, className)} {...props}>
    <BaseRadio.Indicator className="size-2 rounded-full bg-current" />
  </BaseRadio.Root>
));
Radio.displayName = "Radio";

/* __DOC
<QUI.RadioGroup defaultValue="a" className="flex-row gap-4">
  <QUI.Radio value="a" aria-label="Option A" />
  <QUI.Radio value="b" aria-label="Option B" />
  <QUI.Radio value="c" aria-label="Option C (disabled)" disabled />
</QUI.RadioGroup>
DOC__ */

/* __PROPS
{ "disabled": "boolean" }
PROPS__ */
