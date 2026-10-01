import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/** Root: stacks the optional label/value header over the control row. */
const sliderRootClass = "flex w-full flex-col gap-2";

/** Header: label at inline-start, live value readout at inline-end. */
const sliderHeaderClass = "flex items-center justify-between gap-3";

const sliderLabelClass = "text-body-xs-medium text-primary";

const sliderValueClass = "text-caption-md-regular text-secondary";

/** Control: the hit area around the track — its height grows with the thumb so it's never clipped. */
const sliderControlVariants = cva("flex touch-none items-center select-none data-disabled:cursor-not-allowed", {
  variants: {
    size: {
      sm: "h-4",
      md: "h-5",
      lg: "h-6",
    },
  },
  defaultVariants: { size: "md" },
});

/** Track: a fixed 4px pill regardless of `size` — only the thumb and hit area scale. */
const sliderTrackClass = "relative h-1 w-full rounded-full bg-layer-3";

/** Indicator: the filled run of the track — from the start for one thumb, between thumbs for a range. */
const sliderIndicatorClass = "absolute h-full rounded-full bg-accent-primary data-disabled:bg-(--txt-disabled)";

const sliderThumbVariants = cva(
  cn(
    "block rounded-full border-sm border-accent-strong bg-layer-1 shadow-raised-100 outline-none",
    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-strong has-[:focus-visible]:ring-offset-2",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60"
  ),
  {
    variants: {
      size: {
        sm: "size-3",
        md: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
);

type SliderValue = number | readonly number[];

export interface SliderProps<Value extends SliderValue = SliderValue>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Root<Value>>, "children" | "render">,
    VariantProps<typeof sliderThumbVariants> {
  /**
   * Visible label above the track (e.g. "Volume"). Names every thumb. Without it, pass
   * `aria-label` (one thumb) or `getAriaLabel` (a range) so the thumbs are still named.
   */
  label?: React.ReactNode;
  /** Accessible name for the thumb(s), used when there's no visible `label`. */
  "aria-label"?: string;
  /** Per-thumb accessible name for range sliders, e.g. `(i) => (i === 0 ? "Minimum" : "Maximum")`. */
  getAriaLabel?: (index: number) => string;
  /** Show the formatted value readout at the end of the header row. @default true */
  showValue?: boolean;
}

function thumbCount(value: SliderValue | undefined) {
  return Array.isArray(value) ? value.length : 1;
}

/**
 * Picks a number — or a range of numbers — along a track. Pass a single number as
 * `value`/`defaultValue` for one thumb, or an array (e.g. `[20, 80]`) for one thumb per entry; the
 * indicator fills from the start, or between the outermost thumbs for a range. Bound it with
 * `min`/`max`/`step`, and pass `format` (an `Intl.NumberFormatOptions`) to format the readout.
 *
 * Every thumb is a native `<input type="range">` underneath, so arrow keys step by `step`,
 * Shift+arrow / Page keys step by `largeStep`, and Home/End jump to the bounds. `size` scales the
 * thumb and its hit area; the track itself stays a fixed 4px.
 */
export function Slider<Value extends SliderValue>({
  label,
  size = "md",
  showValue = true,
  "aria-label": ariaLabel,
  getAriaLabel,
  className,
  value,
  defaultValue,
  ...props
}: SliderProps<Value>) {
  const count = thumbCount(value ?? defaultValue);
  const showHeader = label != null || showValue;
  return (
    <BaseSlider.Root<Value> value={value} defaultValue={defaultValue} className={cn(sliderRootClass, className)} {...props}>
      {showHeader ? (
        <div className={sliderHeaderClass}>
          {label != null ? <BaseSlider.Label className={sliderLabelClass}>{label}</BaseSlider.Label> : <span />}
          {showValue ? <BaseSlider.Value className={sliderValueClass} /> : null}
        </div>
      ) : null}
      <BaseSlider.Control className={sliderControlVariants({ size })}>
        <BaseSlider.Track className={sliderTrackClass}>
          <BaseSlider.Indicator className={sliderIndicatorClass} />
          {Array.from({ length: count }, (_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={count > 1 ? index : undefined}
              aria-label={getAriaLabel ? undefined : ariaLabel}
              getAriaLabel={getAriaLabel}
              className={sliderThumbVariants({ size })}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

/* __DOC_BLOCK
<div className="flex max-w-sm flex-col gap-6 p-4">
  <QUI.Slider label="Volume" defaultValue={40} />
  <QUI.Slider label="Price range" defaultValue={[20, 80]} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} getAriaLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")} />
  <QUI.Slider aria-label="Small" size="sm" showValue={false} defaultValue={30} />
  <QUI.Slider aria-label="Large" size="lg" showValue={false} defaultValue={70} />
  <QUI.Slider label="Disabled" defaultValue={50} disabled />
</div>
DOC__ */

/* __PROPS
{ "size": ["sm", "md", "lg"], "showValue": "boolean", "disabled": "boolean" }
PROPS__ */
