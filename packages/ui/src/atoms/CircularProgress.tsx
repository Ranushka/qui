import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

const RING_GEOMETRY = {
  sm: { box: 16, radius: 6 },
  md: { box: 20, radius: 8 },
} as const;
const RING_STROKE = 2;

const ringVariants = cva("group/ring shrink-0", {
  variants: { size: { sm: "size-4", md: "size-5" } },
  defaultVariants: { size: "md" },
});

const indicatorVariants = cva("origin-center -rotate-90 transition-[stroke-dashoffset] duration-300 ease-out", {
  variants: {
    variant: {
      brand: "[stroke:var(--bg-accent-primary)]",
      success: "[stroke:var(--bg-success-primary)]",
      warning: "[stroke:var(--bg-warning-primary)]",
      danger: "[stroke:var(--bg-danger-primary)]",
    },
  },
  defaultVariants: { variant: "brand" },
});

export interface CircularProgressProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof Progress.Root>, "render" | "children" | "value">>, VariantProps<typeof ringVariants>, VariantProps<typeof indicatorVariants> {
  /** Current value (0–`max`). Omit (or pass `indeterminate`) for an unknown-duration ring. */
  value?: number | null;
  /** Spins a fixed quarter arc and ignores `value`. @default false */
  indeterminate?: boolean;
}

/**
 * A small progress ring (no label — too small for one). Drive it with `value` (0–`max`); the arc
 * and `aria-valuenow` follow. Pass `indeterminate` to spin a fixed quarter arc instead. For a bar
 * with an optional label, use `LinearProgress`.
 */
export function CircularProgress({ value, size = "md", variant = "brand", indeterminate = false, ...props }: CircularProgressProps) {
  const { box, radius } = RING_GEOMETRY[size ?? "md"];
  const circumference = 2 * Math.PI * radius;
  const max = props.max ?? 100;
  const min = props.min ?? 0;
  const span = max - min;
  const clampedValue = indeterminate ? null : value != null ? Math.min(Math.max(value, min), max) : null;
  const dashOffset = circumference * (1 - (clampedValue == null ? 0.25 : span > 0 ? (clampedValue - min) / span : 0));
  const center = box / 2;

  return (
    <Progress.Root value={clampedValue} {...props} className={cn(ringVariants({ size }))}>
      <svg aria-hidden="true" fill="none" viewBox={`0 0 ${box} ${box}`} className="block size-full group-data-indeterminate/ring:animate-spin">
        <circle cx={center} cy={center} r={radius} strokeWidth={RING_STROKE} className="[stroke:var(--bg-layer-3-selected)]" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={indicatorVariants({ variant })}
        />
      </svg>
    </Progress.Root>
  );
}

/* __DOC
<div className="flex items-center gap-4 p-4">
  <QUI.CircularProgress size="sm" value={40} />
  <QUI.CircularProgress size="md" value={70} />
  <QUI.CircularProgress size="md" value={70} variant="success" />
  <QUI.CircularProgress size="md" value={70} variant="warning" />
  <QUI.CircularProgress size="md" value={70} variant="danger" />
  <QUI.CircularProgress size="md" indeterminate />
</div>
DOC__ */

/* __PROPS
{ "size": ["sm", "md"], "variant": ["brand", "success", "warning", "danger"], "indeterminate": "boolean" }
PROPS__ */
