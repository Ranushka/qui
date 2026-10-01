import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

/**
 * The connected frame: one raised surface, one outer border, hairline dividers between segments,
 * clipped corners. The border is an `::after` overlay above the segments so a segment's hover fill
 * never paints over it.
 */
const buttonGroupClass = cn(
  "relative isolate inline-flex items-center overflow-hidden rounded-md bg-layer-2 shadow-raised-100",
  "after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-strong after:content-['']",
  "divide-x divide-strong"
);

/** A borderless, transparent segment — the frame owns surface, border and radius. The focus ring is inset so the clip doesn't cut it. */
const buttonGroupButtonVariants = cva(
  cn(
    "group inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap bg-layer-transparent text-secondary outline-none transition-colors duration-200 ease-out",
    "hover:bg-layer-transparent-hover active:bg-layer-transparent-active",
    "focus-visible:relative focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-strong",
    "disabled:cursor-not-allowed disabled:text-disabled"
  ),
  {
    variants: {
      size: {
        sm: "h-(--control-height-sm) px-1.5 text-body-xs-medium [--node-size:var(--control-glyph-sm)]",
        md: "h-(--control-height-md) px-2 text-body-xs-medium [--node-size:var(--control-glyph-md)]",
      },
    },
    defaultVariants: { size: "sm" },
  }
);

type ButtonGroupSize = NonNullable<VariantProps<typeof buttonGroupButtonVariants>["size"]>;

/** Shares the group's `size` with every segment inside, so they pack to match without repeating it. */
const ButtonGroupSizeContext = React.createContext<ButtonGroupSize | undefined>(undefined);

export interface ButtonGroupProps extends NoClass<React.HTMLAttributes<HTMLDivElement>> {
  /** Size of every `ButtonGroupButton` inside (each can still override it). @default "sm" */
  size?: ButtonGroupSize;
}

/**
 * A row of related actions joined into one connected control (e.g. a view switcher's sibling
 * actions). It's a plain `role="group"` frame — there's no roving focus or selection; each segment
 * is an independent button. Name the set for assistive tech via `aria-label`.
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(({ size = "sm", ...props }, ref) => (
  <ButtonGroupSizeContext.Provider value={size}>
    <div ref={ref} role="group" className={cn(buttonGroupClass)} {...props} />
  </ButtonGroupSizeContext.Provider>
));
ButtonGroup.displayName = "ButtonGroup";

export interface ButtonGroupButtonProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "type">> {
  /** Visible segment label. */
  label: string;
  /** Icon beside the label (inline-start by default), e.g. `<Icon icon={Plus} />`. */
  icon?: React.ReactNode;
  /** Which side of the label the icon sits on. @default "start" */
  iconPosition?: "start" | "end";
  /** Size override; defaults to the enclosing `ButtonGroup`'s `size` (`sm` standalone). */
  size?: ButtonGroupSize;
  /** The button's form behavior. @default "button" */
  type?: "submit" | "reset" | "button";
}

/** One segment of a `ButtonGroup`: Base UI's `Button` with an optional icon beside its label. */
export const ButtonGroupButton = React.forwardRef<HTMLButtonElement, ButtonGroupButtonProps>(
  ({ label, icon, iconPosition = "start", size, type = "button", ...props }, ref) => {
    const groupSize = React.useContext(ButtonGroupSizeContext);
    return (
      <BaseButton ref={ref} type={type} className={cn(buttonGroupButtonVariants({ size: size ?? groupSize }))} {...props}>
        {iconPosition === "start" ? icon : null}
        {label}
        {iconPosition === "end" ? icon : null}
      </BaseButton>
    );
  }
);
ButtonGroupButton.displayName = "ButtonGroupButton";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.ButtonGroup aria-label="Issue actions">
    <QUI.ButtonGroupButton label="Copy link" icon={<QUI.Icon icon={Icons.Link} />} />
    <QUI.ButtonGroupButton label="Archive" icon={<QUI.Icon icon={Icons.Archive} />} />
    <QUI.ButtonGroupButton label="Delete" icon={<QUI.Icon icon={Icons.Trash2} />} disabled />
  </QUI.ButtonGroup>
  <QUI.ButtonGroup size="md" aria-label="Pagination">
    <QUI.ButtonGroupButton label="Previous" icon={<QUI.Icon icon={Icons.ChevronLeft} />} />
    <QUI.ButtonGroupButton label="Next" icon={<QUI.Icon icon={Icons.ChevronRight} />} iconPosition="end" />
  </QUI.ButtonGroup>
</div>
DOC__ */

/* __PROPS
{ "ButtonGroup.size": ["sm", "md"], "ButtonGroupButton.size": ["sm", "md"], "ButtonGroupButton.iconPosition": ["start", "end"], "ButtonGroupButton.disabled": "boolean" }
PROPS__ */
