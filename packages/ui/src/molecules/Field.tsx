import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/** Field-level geometry: the gap between label group, control, and helper/error text. */
const fieldRootVariants = cva("flex flex-col", {
  variants: {
    size: {
      md: "gap-1.5",
      lg: "gap-1.5",
      xl: "gap-2",
      "2xl": "gap-2",
    },
  },
  defaultVariants: { size: "lg" },
});

/** Label text: sized to match the control it names, one step down from the control's own type scale. */
const fieldLabelVariants = cva("inline-flex items-center gap-0.5 text-primary", {
  variants: {
    size: {
      md: "text-body-xs-medium",
      lg: "text-body-xs-medium",
      xl: "text-body-sm-medium",
      "2xl": "text-body-sm-medium",
    },
  },
});

/** Helper/hint text under the control. */
const fieldDescriptionVariants = cva("text-tertiary", {
  variants: {
    size: {
      md: "text-body-2xs-regular",
      lg: "text-body-2xs-regular",
      xl: "text-body-xs-regular",
      "2xl": "text-body-xs-regular",
    },
  },
});

/** Error text under the control — swaps in for the description whenever `error` is set. */
const fieldErrorVariants = cva("text-danger-primary", {
  variants: {
    size: {
      md: "text-body-2xs-regular",
      lg: "text-body-2xs-regular",
      xl: "text-body-xs-regular",
      "2xl": "text-body-xs-regular",
    },
  },
});

export interface FieldProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseField.Root>, "children">,
    VariantProps<typeof fieldRootVariants> {
  /** Label naming the control. Auto-associated with it via Base UI's `Field.Label`. */
  label?: React.ReactNode;
  /** Shows a required marker after the label. Purely visual — set `required` on the control itself too. */
  required?: boolean;
  /** The control this field wraps, e.g. `<Input />`, `<TextArea />`, `<Checkbox />`. */
  children: React.ReactNode;
  /** Hint text shown under the control. Hidden while `error` is set. */
  hint?: React.ReactNode;
  /**
   * Error text shown under the control instead of `hint`. With no explicit error, Base UI's own
   * validation channel stays live — a failed `validate`/`required` still renders its message here.
   */
  error?: React.ReactNode;
  className?: string;
}

/**
 * A field wrapper: label, the control, and a hint-or-error line beneath it, laid out as a stack.
 * Wraps Base UI's `Field.Root` for label association and `data-invalid`/`data-disabled` state, so
 * any bordered qui control (Input, TextArea, Checkbox, ...) dropped in as `children` picks up that
 * state automatically. `error` wins over `hint` when both are given.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(({ size = "lg", label, required, children, hint, error, className, ...props }, ref) => {
  return (
    <BaseField.Root ref={ref} className={cn(fieldRootVariants({ size }), className)} {...props}>
      {label != null ? (
        <BaseField.Label className={fieldLabelVariants({ size })}>
          {label}
          {required ? (
            <span aria-hidden className="text-body-sm-regular text-danger-primary">
              *
            </span>
          ) : null}
        </BaseField.Label>
      ) : null}
      {children}
      {error != null ? (
        <BaseField.Error match className={fieldErrorVariants({ size })}>
          {error}
        </BaseField.Error>
      ) : (
        <>
          <BaseField.Error className={fieldErrorVariants({ size })} />
          {hint != null ? <BaseField.Description className={fieldDescriptionVariants({ size })}>{hint}</BaseField.Description> : null}
        </>
      )}
    </BaseField.Root>
  );
});
Field.displayName = "Field";

/* __DOC_BLOCK
<div className="flex max-w-xs flex-col gap-6 p-4">
  <QUI.Field label="Workspace name" hint="Shown on your team's billing page.">
    <QUI.Input placeholder="Acme Inc." />
  </QUI.Field>
  <QUI.Field label="Slug" required error="This slug is already taken.">
    <QUI.Input defaultValue="acme-inc" />
  </QUI.Field>
  <QUI.Field label="Description" size="xl" hint="Optional, up to 200 characters.">
    <QUI.TextArea placeholder="What does your team do?" size="xl" />
  </QUI.Field>
  <QUI.Field>
    <QUI.Checkbox label="Send me product updates" />
  </QUI.Field>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "required": "boolean" }
PROPS__ */
