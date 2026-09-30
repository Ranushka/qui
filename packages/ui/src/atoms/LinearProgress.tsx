import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const trackVariants = cva("relative min-w-0 flex-1 overflow-hidden rounded-full bg-layer-3-selected", {
  variants: { size: { sm: "h-[5px]", md: "h-2" } },
  defaultVariants: { size: "md" },
});

const indicatorVariants = cva(
  "absolute inset-y-0 rounded-full transition-[width] duration-300 ease-out data-indeterminate:w-1/3 data-indeterminate:animate-progress-indeterminate data-indeterminate:transition-none",
  {
    variants: {
      variant: {
        brand: "bg-accent-primary",
        success: "bg-success-primary",
        warning: "bg-warning-primary",
        danger: "bg-danger-primary",
      },
    },
    defaultVariants: { variant: "brand" },
  }
);

export interface LinearProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Progress.Root>, "render" | "children" | "value">,
    VariantProps<typeof trackVariants>,
    VariantProps<typeof indicatorVariants> {
  /** Current value (0–`max`). Omit (or pass `indeterminate`) for an unknown-duration fill. */
  value?: number | null;
  /** Shows an animated fill and ignores `value`. @default false */
  indeterminate?: boolean;
  /** Leading label, e.g. "Uploading". */
  label?: React.ReactNode;
  /** Trailing "N%" text. Defaults to shown unless `indeterminate`. */
  showValue?: boolean;
}

/**
 * A horizontal progress bar with an optional leading label and trailing `%` value. Drive it with
 * `value` (0–`max`); the fill and `aria-valuenow` follow. Pass `indeterminate` for an animated fill
 * with an unknown duration (the trailing `%` hides by default in that mode). For a small ring, use
 * `CircularProgress`.
 */
export function LinearProgress({ value, size = "md", variant = "brand", showValue, indeterminate = false, label, className, ...props }: LinearProgressProps) {
  const max = props.max ?? 100;
  const min = props.min ?? 0;
  const clampedValue = indeterminate ? null : value != null ? Math.min(Math.max(value, min), max) : null;
  const showTrailingValue = showValue ?? !indeterminate;

  return (
    <Progress.Root value={clampedValue} {...props} className={cn("flex w-full items-center gap-2", className)}>
      {label != null ? <Progress.Label className="text-body-xs-medium text-secondary">{label}</Progress.Label> : null}
      <Progress.Track className={trackVariants({ size })}>
        <Progress.Indicator className={indicatorVariants({ variant })} />
      </Progress.Track>
      {showTrailingValue ? (
        <Progress.Value className="text-caption-md-medium tabular-nums text-secondary">
          {(_: string | null, currentValue: number | null) => (currentValue == null ? "" : `${Math.round(currentValue)}%`)}
        </Progress.Value>
      ) : null}
    </Progress.Root>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.LinearProgress label="Uploading" value={62} />
  <QUI.LinearProgress size="sm" variant="success" value={100} />
  <QUI.LinearProgress variant="warning" value={40} />
  <QUI.LinearProgress variant="danger" value={15} />
  <QUI.LinearProgress indeterminate />
</div>
DOC__ */

/* __PROPS
{ "size": ["sm", "md"], "variant": ["brand", "success", "warning", "danger"], "indeterminate": "boolean", "showValue": "boolean" }
PROPS__ */
