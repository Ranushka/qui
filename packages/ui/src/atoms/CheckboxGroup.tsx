import * as React from "react";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { cn } from "../lib/cn";
import { optionGroupVariants } from "../lib/option-group";

export interface CheckboxGroupProps extends React.ComponentPropsWithoutRef<typeof BaseCheckboxGroup> {
  /** Row spacing: `comfortable` gaps the rows, `compact` stacks them flush. */
  density?: "comfortable" | "compact";
}

/**
 * Groups a set of `Checkbox`es around one shared `string[]` of checked values. Give each child
 * `Checkbox` a `value`, then drive the group with `value`/`defaultValue` + `onValueChange`.
 *
 * For a "select all" row, pass every child value as `allValues` and render one `Checkbox` with
 * `parent`: it checks/unchecks every child, and shows `indeterminate` while only some are checked.
 * Name the group with `aria-label`/`aria-labelledby` — it renders `role="group"`.
 */
export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(({ density = "comfortable", className, ...props }, ref) => (
  <BaseCheckboxGroup ref={ref} className={cn(optionGroupVariants({ density }), className)} {...props} />
));
CheckboxGroup.displayName = "CheckboxGroup";

/* __DOC_BLOCK
<div className="flex flex-wrap gap-8 p-4">
  <QUI.CheckboxGroup aria-label="Notifications" defaultValue={["email"]}>
    <QUI.Checkbox value="email" label="Email" />
    <QUI.Checkbox value="push" label="Push" />
    <QUI.Checkbox value="sms" label="SMS (disabled)" disabled />
  </QUI.CheckboxGroup>
  <QUI.CheckboxGroup aria-label="Platforms" density="compact" allValues={["web", "ios", "android"]} defaultValue={["web"]}>
    <QUI.Checkbox parent label="All platforms" />
    <div className="flex flex-col pl-4">
      <QUI.Checkbox value="web" label="Web" />
      <QUI.Checkbox value="ios" label="iOS" />
      <QUI.Checkbox value="android" label="Android" />
    </div>
  </QUI.CheckboxGroup>
</div>
DOC__ */

/* __PROPS
{ "density": ["comfortable", "compact"], "disabled": "boolean" }
PROPS__ */
