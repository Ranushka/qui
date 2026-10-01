import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { textLinkBaseClass, textLinkPalette } from "../lib/text-link-chrome";

/** Text-only action chrome: the shared text-link look on a `<button>`, with a native-disabled treatment. */
const textButtonVariants = cva(
  cn(textLinkBaseClass, "gap-1.5 disabled:cursor-not-allowed disabled:text-disabled disabled:[&>[aria-hidden='true']]:text-icon-disabled"),
  {
    variants: {
      variant: textLinkPalette,
      size: {
        md: "text-body-xs-medium [--node-size:var(--control-glyph-md)]",
        lg: "text-body-sm-medium [--node-size:var(--control-glyph-lg)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface TextButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "render" | "nativeButton" | "type">,
    VariantProps<typeof textButtonVariants> {
  /** Visible action label. */
  label: string;
  /** Icon rendered beside the label (inline-start by default), e.g. `<Icon icon={Plus} />`. */
  icon?: React.ReactNode;
  /** Which side of the label the icon sits on. @default "start" */
  iconPosition?: "start" | "end";
  /** The button's form behavior. @default "button" */
  type?: "submit" | "reset" | "button";
}

/**
 * A low-emphasis action with lightweight, text-only chrome — no fill or border, just tinted text
 * (and an optional icon) on Base UI's `Button`. Always a native `<button>`: for navigation with
 * the same look use `AnchorButton`; for a heavier action use `Button`. `disabled` is the native,
 * non-focusable disabled state.
 */
export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ variant, size, label, icon, iconPosition = "start", type = "button", className, ...props }, ref) => (
    <BaseButton ref={ref} type={type} className={cn(textButtonVariants({ variant, size }), className)} {...props}>
      {iconPosition === "start" ? icon : null}
      <span>{label}</span>
      {iconPosition === "end" ? icon : null}
    </BaseButton>
  )
);
TextButton.displayName = "TextButton";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-6">
    <QUI.TextButton label="View all" />
    <QUI.TextButton variant="secondary" label="Cancel" />
    <QUI.TextButton label="Add link" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.TextButton variant="secondary" label="Next" icon={<QUI.Icon icon={Icons.ArrowRight} />} iconPosition="end" />
  </div>
  <div className="flex flex-wrap items-center gap-6">
    <QUI.TextButton size="md" label="Medium" />
    <QUI.TextButton size="lg" label="Large" />
    <QUI.TextButton label="Disabled" icon={<QUI.Icon icon={Icons.Plus} />} disabled />
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["primary", "secondary"], "size": ["md", "lg"], "iconPosition": ["start", "end"], "type": ["button", "submit", "reset"], "disabled": "boolean" }
PROPS__ */
