import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cva } from "class-variance-authority";
import { cn } from "./cn";

/**
 * Internal building blocks shared by `Field` and the labeled-field wrappers (`InputField`,
 * `CheckboxField`, `RadioGroupField`, ...). Not exported from the package root — the public surface
 * is the composed components.
 */

/** The field size scale shared by every labeled-field wrapper. */
export type FieldSize = "md" | "lg" | "xl" | "2xl";

/**
 * Label text: sized to match the control it names, one step down from the control's own type scale.
 * `inset` drops a horizontal label (with no description beneath it) onto the control's text baseline.
 */
export const fieldLabelVariants = cva("inline-flex items-center gap-0.5 text-primary", {
  variants: {
    size: {
      md: "text-body-xs-medium",
      lg: "text-body-xs-medium",
      xl: "text-body-sm-medium",
      "2xl": "text-body-sm-medium",
    },
    inset: { true: "", false: "" },
  },
  compoundVariants: [
    { size: "md", inset: true, class: "pt-1" },
    { size: "lg", inset: true, class: "pt-[7px]" },
    { size: "xl", inset: true, class: "pt-[9px]" },
    { size: "2xl", inset: true, class: "pt-[13px]" },
  ],
});

/** Supporting text (below a label/legend) and hint text (below the control) share one style. */
export const fieldDescriptionVariants = cva("text-tertiary", {
  variants: {
    size: {
      md: "text-body-2xs-regular",
      lg: "text-body-2xs-regular",
      xl: "text-body-xs-regular",
      "2xl": "text-body-xs-regular",
    },
  },
});

/** Error text under the control — swaps in for the hint whenever `error` is set. */
export const fieldErrorVariants = cva("text-danger-primary", {
  variants: {
    size: {
      md: "text-body-2xs-regular",
      lg: "text-body-2xs-regular",
      xl: "text-body-xs-regular",
      "2xl": "text-body-xs-regular",
    },
  },
});

/** A fieldset's legend: the label type scale, without the inline-flex label row. */
export const fieldsetLegendVariants = cva("text-primary", {
  variants: {
    size: {
      md: "text-body-xs-medium",
      lg: "text-body-xs-medium",
      xl: "text-body-sm-medium",
      "2xl": "text-body-sm-medium",
    },
  },
});

/** The decorative required marker shown after a label or legend (the control carries the semantics). */
export function FieldRequiredMarker() {
  return (
    <span aria-hidden className="text-body-sm-regular text-danger-primary">
      *
    </span>
  );
}

/**
 * The error-or-hint line under a control. With an explicit `error` it always shows; otherwise an
 * unmatched `Field.Error` stays mounted so Base UI's validity messages (and `Form` `errors`) appear
 * and clear on their own, with the hint beneath it.
 */
export function FieldHelperText({ size, hint, error }: { size: FieldSize; hint?: React.ReactNode; error?: React.ReactNode }) {
  if (error != null) {
    return (
      <BaseField.Error match className={fieldErrorVariants({ size })}>
        {error}
      </BaseField.Error>
    );
  }
  return (
    <>
      <BaseField.Error className={fieldErrorVariants({ size })} />
      {hint != null ? <BaseField.Description className={fieldDescriptionVariants({ size })}>{hint}</BaseField.Description> : null}
    </>
  );
}

/** One option row (checkbox / radio / switch + its label column): hover fill, disabled dimming. */
const fieldItemClass = cn(
  "flex min-w-0 items-start gap-2 rounded-sm px-2 py-1 text-primary transition-colors",
  "data-disabled:cursor-not-allowed data-disabled:opacity-60",
  "not-data-disabled:hover:bg-layer-transparent-hover"
);

/** Elements that already handle their own click — a row click on one of these is left alone. */
const INTERACTIVE_SELECTOR = "a[href], label, button, input, select, textarea, [role], [tabindex]";

/** Clicking empty row space toggles the row's control, like clicking its label would. */
function handleRowClick(event: React.MouseEvent<HTMLDivElement>) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const handler = target.closest(INTERACTIVE_SELECTOR);
  if (handler != null && handler !== event.currentTarget && event.currentTarget.contains(handler)) return;
  // Don't hijack a drag-to-select of the description text.
  const selection = globalThis.getSelection?.();
  if (selection != null && !selection.isCollapsed && selection.rangeCount > 0 && event.currentTarget.contains(selection.getRangeAt(0).commonAncestorContainer)) return;
  event.currentTarget.querySelector<HTMLElement>("button, input")?.click();
}

export interface FieldItemRowProps {
  /**
   * The bare control: a `Checkbox`, `Radio` or `Switch` without its own label. Checkbox and radio
   * pick up the row's description through Base UI; a control that doesn't (Switch) can take the
   * render-function form and set `aria-describedby` from the id it is handed.
   */
  control: React.ReactNode | ((descriptionId: string | undefined) => React.ReactNode);
  /** Row label, associated with the control through Base UI's `Field.Item`. */
  label: React.ReactNode;
  /** Supporting text under the label, announced as the control's description. */
  description?: React.ReactNode;
  size: FieldSize;
  disabled?: boolean;
}

/**
 * A choice row: Base UI's `Field.Item` scopes a `Field.Label`/`Field.Description` pair to the one
 * control inside it, so a checkbox, radio or switch is named and described by its own row text. The
 * control sits in a 20px box matching the label's first line, so it stays aligned when the label
 * wraps or a description follows.
 */
export function FieldItemRow({ control, label, description, size, disabled }: FieldItemRowProps) {
  const descriptionId = React.useId();
  const hasDescription = description != null;
  return (
    <BaseField.Item disabled={disabled} className={fieldItemClass} onClick={handleRowClick}>
      <div className="flex h-5 shrink-0 items-center">{typeof control === "function" ? control(hasDescription ? descriptionId : undefined) : control}</div>
      <div className="flex min-w-0 flex-col gap-1 leading-5">
        <BaseField.Label className={fieldLabelVariants({ size, inset: false })}>{label}</BaseField.Label>
        {hasDescription ? (
          <BaseField.Description id={descriptionId} className={fieldDescriptionVariants({ size })}>
            {description}
          </BaseField.Description>
        ) : null}
      </div>
    </BaseField.Item>
  );
}

/** Lets a group field (`CheckboxGroupField`, `RadioGroupField`) hand its `size` to the option rows inside it. */
export const FieldOptionSizeContext = React.createContext<FieldSize | undefined>(undefined);

/** An option row's size: its own `size` prop, else the enclosing group field's, else `lg`. */
export function useFieldOptionSize(size: FieldSize | undefined): FieldSize {
  const groupSize = React.useContext(FieldOptionSizeContext);
  return size ?? groupSize ?? "lg";
}
