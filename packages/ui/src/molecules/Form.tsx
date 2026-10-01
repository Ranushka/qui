import * as React from "react";
import { Form as BaseForm } from "@base-ui/react/form";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

/** The form frame: a column of regions (`FormBody`, `FormActions`) on one vertical rhythm. */
const formVariants = cva("flex flex-col gap-6");

/** The fields region: stacked, or flowing side by side and wrapping. */
const formBodyVariants = cva("flex gap-4", {
  variants: {
    layout: {
      single: "flex-col",
      multi: "flex-row flex-wrap",
    },
  },
  defaultVariants: { layout: "single" },
});

/** The actions bar: right-aligned inline buttons, or full-width stacked ones. */
const formActionsVariants = cva("flex gap-3", {
  variants: {
    layout: {
      inline: "flex-row justify-end",
      stretch: "flex-col [&>*]:w-full",
    },
  },
  defaultVariants: { layout: "inline" },
});

export type FormProps<FormValues extends Record<string, unknown> = Record<string, unknown>> = NoClass<
  React.ComponentPropsWithoutRef<typeof BaseForm<FormValues>>
> & {
  ref?: React.Ref<HTMLFormElement>;
};

/**
 * A native `<form>` with Base UI's consolidated validation: fields inside it (`InputField`,
 * `SelectField`, ...) validate per `validationMode`, `errors` maps server-side messages onto fields
 * by `name`, and `onFormSubmit` receives the collected values. Lay it out with `FormBody` and
 * `FormActions`.
 */
export function Form<FormValues extends Record<string, unknown> = Record<string, unknown>>({ ...props }: FormProps<FormValues>) {
  return <BaseForm<FormValues> className={cn(formVariants())} {...props} />;
}

export interface FormBodyProps extends NoClass<React.HTMLAttributes<HTMLDivElement>>, VariantProps<typeof formBodyVariants> {}

/** The fields region of a `Form`: `single` stacks fields, `multi` flows them side by side. */
export const FormBody = React.forwardRef<HTMLDivElement, FormBodyProps>(({ layout, ...props }, ref) => (
  <div ref={ref} className={cn(formBodyVariants({ layout }))} {...props} />
));
FormBody.displayName = "FormBody";

export interface FormActionsProps extends NoClass<React.HTMLAttributes<HTMLDivElement>>, VariantProps<typeof formActionsVariants> {}

/** The actions bar at the bottom of a `Form`: `inline` right-aligns the buttons, `stretch` makes them full-width. */
export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(({ layout, ...props }, ref) => (
  <div ref={ref} className={cn(formActionsVariants({ layout }))} {...props} />
));
FormActions.displayName = "FormActions";

/* __DOC_BLOCK
<div className="max-w-md p-4">
<QUI.Form errors={{ email: "This email is already registered." }}>
  <QUI.FormBody>
    <QUI.InputField name="name" label="Full name" placeholder="Jane Doe" />
    <QUI.InputField name="email" label="Email" placeholder="you@company.com" />
    <QUI.SelectField name="role" label="Role" placeholder="Pick a role" options={[{ value: "admin", label: "Admin" }, { value: "member", label: "Member" }]} />
  </QUI.FormBody>
  <QUI.FormActions>
    <QUI.Button variant="secondary" type="reset" label="Cancel" />
    <QUI.Button type="submit" label="Invite" />
  </QUI.FormActions>
</QUI.Form>
</div>
DOC__ */

/* __PROPS
{ "validationMode": ["onSubmit", "onBlur", "onChange"], "FormBody.layout": ["single", "multi"], "FormActions.layout": ["inline", "stretch"] }
PROPS__ */
