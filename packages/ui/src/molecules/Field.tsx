import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { FieldHelperText, FieldRequiredMarker, fieldDescriptionVariants, fieldLabelVariants, type FieldSize } from "../lib/field-parts";

export type { FieldSize } from "../lib/field-parts";

/**
 * Field-level geometry. Vertical stacks the label group above the control column, with a gap that
 * grows a step at `xl`; horizontal puts the label group beside the control column.
 */
const fieldRootVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-start gap-2",
    },
    size: { md: "", lg: "", xl: "", "2xl": "" },
  },
  compoundVariants: [
    { orientation: "vertical", size: ["md", "lg"], class: "gap-1.5" },
    { orientation: "vertical", size: ["xl", "2xl"], class: "gap-2" },
  ],
  defaultVariants: { orientation: "vertical", size: "lg" },
});

/** The label + description column. */
const fieldLabelGroupVariants = cva("flex flex-col gap-0.5", {
  variants: {
    orientation: {
      vertical: "w-full",
      horizontal: "min-w-0 flex-1",
    },
  },
});

/** The control + hint/error column. */
const fieldControlContentVariants = cva("flex flex-col", {
  variants: {
    orientation: {
      vertical: "w-full",
      horizontal: "min-w-0 flex-1 gap-2",
    },
    size: { md: "", lg: "", xl: "", "2xl": "" },
  },
  compoundVariants: [
    { orientation: "vertical", size: ["md", "lg"], class: "gap-1.5" },
    { orientation: "vertical", size: ["xl", "2xl"], class: "gap-2" },
  ],
});

export interface FieldProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseField.Root>, "children">>, VariantProps<typeof fieldRootVariants> {
  /** Label naming the control. Auto-associated with it via Base UI's `Field.Label`. */
  label?: React.ReactNode;
  /** Shows a required marker after the label. Purely visual — set `required` on the control itself too. */
  required?: boolean;
  /** Supporting text shown directly below the label. Always shown, alongside `hint`/`error`. */
  description?: React.ReactNode;
  /** The control this field wraps, e.g. `<Input />`, `<TextArea />`, `<Checkbox />`. */
  children: React.ReactNode;
  /** Hint text shown under the control. Hidden while `error` is set. */
  hint?: React.ReactNode;
  /**
   * Error text shown under the control instead of `hint`; also marks the field invalid (danger
   * chrome on the control) unless `invalid` is passed explicitly. With no explicit error, Base UI's
   * own validation channel stays live — a failed `validate`/`required` still renders its message.
   */
  error?: React.ReactNode;
}

/**
 * A field wrapper: a label group (label + optional description), the control, and a hint-or-error
 * line beneath it. Wraps Base UI's `Field.Root` for label/description association and
 * `data-invalid`/`data-disabled` state, so any bordered qui control (Input, Checkbox, ...) dropped
 * in as `children` picks up that state automatically. `error` wins over `hint` when both are given.
 * `orientation="horizontal"` puts the label group beside the control instead of above it.
 *
 * The ready-made wrappers (`InputField`, `SelectField`, `CheckboxField`, ...) compose this with
 * their control and are the usual entry point.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ size, orientation, label, required, description, children, hint, error, invalid, ...props }, ref) => {
    const fieldSize: FieldSize = size ?? "lg";
    const layout = orientation ?? "vertical";
    return (
      <BaseField.Root
        ref={ref}
        invalid={invalid ?? (error != null ? true : undefined)}
        className={cn(fieldRootVariants({ size: fieldSize, orientation: layout }))}
        {...props}
      >
        {label != null || description != null ? (
          <div className={fieldLabelGroupVariants({ orientation: layout })}>
            {label != null ? (
              <BaseField.Label className={fieldLabelVariants({ size: fieldSize, inset: layout === "horizontal" && description == null })}>
                {label}
                {required ? <FieldRequiredMarker /> : null}
              </BaseField.Label>
            ) : null}
            {description != null ? <BaseField.Description className={fieldDescriptionVariants({ size: fieldSize })}>{description}</BaseField.Description> : null}
          </div>
        ) : null}
        <div className={fieldControlContentVariants({ orientation: layout, size: fieldSize })}>
          {children}
          <FieldHelperText size={fieldSize} hint={hint} error={error} />
        </div>
      </BaseField.Root>
    );
  }
);
Field.displayName = "Field";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.Field label="Workspace name" hint="Shown on your team's billing page.">
    <QUI.Input placeholder="Acme Inc." size="lg" />
  </QUI.Field>
  <QUI.Field label="Slug" required error="This slug is already taken.">
    <QUI.Input defaultValue="acme-inc" size="lg" />
  </QUI.Field>
  <QUI.Field label="Timezone" description="Used for due dates." orientation="horizontal">
    <QUI.Input defaultValue="UTC+04:00" size="lg" />
  </QUI.Field>
  <QUI.Field>
    <QUI.Checkbox label="Send me product updates" />
  </QUI.Field>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "orientation": ["vertical", "horizontal"], "required": "boolean", "disabled": "boolean" }
PROPS__ */
