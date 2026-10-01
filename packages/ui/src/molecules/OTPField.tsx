import * as React from "react";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { Minus } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { controlSize } from "../lib/control-group";
import { fieldControlSurfaceVariants } from "../lib/field-control-surface";
import { nodeSlotClass } from "../lib/node-slot";
import { Field } from "./Field";

const otpFieldRootClass = "flex items-center gap-2";

/**
 * One character cell: the shared field-control surface, focus keyed on the cell itself. A square
 * box per rung of the control ladder (width = that rung's height). Invalid recolors off Base UI's
 * `data-invalid` (set on every cell when the surrounding `Field` is invalid); disabled steps back to
 * the lighter `subtle` border on a `surface-1` fill.
 */
const otpFieldInputVariants = cva(
  cn(
    fieldControlSurfaceVariants({ focus: "self" }),
    "p-0 text-center text-primary caret-(--border-color-accent-strong) outline-none transition-[color,background-color,border-color,box-shadow]",
    "hover:border-strong hover:bg-layer-2-hover focus:bg-layer-2",
    "data-disabled:cursor-not-allowed data-disabled:border-subtle data-disabled:bg-surface-1 data-disabled:text-disabled",
    "data-disabled:hover:border-subtle data-disabled:hover:bg-surface-1"
  ),
  {
    variants: {
      size: {
        lg: cn(controlSize.lg, "w-(--control-height-lg) rounded-(--control-radius-lg)"),
        xl: cn(controlSize.xl, "w-(--control-height-xl) rounded-(--control-radius-xl)"),
        "2xl": cn(controlSize["2xl"], "w-(--control-height-2xl) rounded-(--control-radius-2xl)"),
      },
    },
    defaultVariants: { size: "lg" },
  }
);

/** The divider between slot groups — a fixed 16px glyph box regardless of `size`. */
const otpFieldSeparatorClass = cn(nodeSlotClass, "size-4 text-tertiary [--node-size:1rem]");

export type OTPFieldSize = "lg" | "xl" | "2xl";

export interface OTPFieldProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseOTPField.Root>, "children" | "render"> {
  /** Number of character slots. */
  length: number;
  /** Box size of every slot. @default "lg" */
  size?: OTPFieldSize;
  /** Helper text under the slots, e.g. a resend countdown. Replaced by `error` when set. */
  hint?: React.ReactNode;
  /** Error text under the slots; while set, every slot shows the danger state. */
  error?: React.ReactNode;
  /**
   * Slot counts per visual group, separated by a dash — `[3, 3]` renders `123-456`. Must sum to
   * `length`; omit for one unbroken run.
   */
  groups?: readonly number[];
  /**
   * Accessible name for each slot, by zero-based index. Localize it here.
   * @default (index) => `Character ${index + 1}`
   */
  getSlotLabel?: (index: number) => string;
}

const defaultSlotLabel = (index: number) => `Character ${index + 1}`;

/**
 * A one-time-password / verification-code field: `length` single-character slots that behave as
 * one value. Drive it with `value`/`defaultValue` + `onValueChange`, and react to a full code with
 * `onValueComplete`. Typing advances to the next slot, Backspace clears and steps back, arrow keys
 * and Home/End move between slots, and pasting a code distributes it across the slots. The first
 * slot carries `autocomplete="one-time-code"` so OS/browser SMS autofill works.
 *
 * `validationType` (default `"numeric"`) filters which characters are accepted; `mask` obscures
 * entered characters. `hint` shows helper text below and `error` swaps it for an error message
 * while turning every slot to the danger state.
 */
export function OTPField({ length, size = "lg", hint, error, groups, getSlotLabel = defaultSlotLabel, className, ...props }: OTPFieldProps) {
  if (groups != null && groups.reduce((sum, count) => sum + count, 0) !== length) {
    throw new Error(`qui OTPField: groups [${groups.join(", ")}] must sum to length ${length}.`);
  }
  const firstSlotLabelId = React.useId();
  // Indices after which a separator follows, e.g. groups [3, 3] → {3}.
  const boundaries = new Set<number>();
  if (groups != null) {
    let running = 0;
    for (const count of groups.slice(0, -1)) {
      running += count;
      boundaries.add(running);
    }
  }

  return (
    <Field size={size} invalid={error != null || undefined} hint={hint} error={error}>
      <BaseOTPField.Root length={length} className={cn(otpFieldRootClass, className)} {...props}>
        {/* Base UI names the first slot from `aria-labelledby` only (it ignores `aria-label` there). */}
        <span id={firstSlotLabelId} className="sr-only">
          {getSlotLabel(0)}
        </span>
        {Array.from({ length }, (_, index) => (
          <React.Fragment key={index}>
            {index > 0 && boundaries.has(index) ? (
              <span aria-hidden className={otpFieldSeparatorClass}>
                <Minus />
              </span>
            ) : null}
            {index === 0 ? (
              <BaseOTPField.Input aria-labelledby={firstSlotLabelId} className={otpFieldInputVariants({ size })} />
            ) : (
              <BaseOTPField.Input aria-label={getSlotLabel(index)} className={otpFieldInputVariants({ size })} />
            )}
          </React.Fragment>
        ))}
      </BaseOTPField.Root>
    </Field>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col gap-6 p-4">
  <QUI.OTPField length={6} />
  <QUI.OTPField length={6} size="xl" groups={[3, 3]} hint="Resend code in 0:42" />
  <QUI.OTPField length={4} size="2xl" defaultValue="12" error="That code has expired." />
  <QUI.OTPField length={4} mask defaultValue="1234" />
  <QUI.OTPField length={4} disabled />
</div>
DOC__ */

/* __PROPS
{ "size": ["lg", "xl", "2xl"], "mask": "boolean", "disabled": "boolean", "readOnly": "boolean", "validationType": ["numeric", "alpha", "alphanumeric", "none"] }
PROPS__ */
