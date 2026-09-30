import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { nodeSlotClass } from "../lib/node-slot";

const iconVariants = cva(nodeSlotClass, {
  variants: {
    tint: {
      inherit: "",
      danger: "text-danger-primary",
      placeholder: "text-icon-placeholder transition-colors group-focus-within/control:text-icon-secondary group-has-[:disabled]/control:text-icon-disabled group-data-disabled/control:text-icon-disabled",
      muted: "text-icon-placeholder",
      secondary: "text-icon-secondary group-has-[:disabled]/control:text-icon-disabled group-data-disabled/control:text-icon-disabled",
      tertiary: "text-icon-tertiary",
    },
    size: {
      inherit: "",
      xs: "[--node-size:var(--control-glyph-xs)]",
      sm: "[--node-size:var(--control-glyph-sm)]",
      md: "[--node-size:var(--control-glyph-md)]",
      lg: "[--node-size:var(--control-glyph-lg)]",
      xl: "[--node-size:var(--control-glyph-xl)]",
      "2xl": "[--node-size:var(--control-glyph-2xl)]",
    },
  },
  defaultVariants: { tint: "inherit", size: "inherit" },
});

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof iconVariants> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/** Sizes and tints a glyph to match the control it sits in via the shared `--node-size` slot. */
export function Icon({ icon: IconComponent, tint, size, className, ...props }: IconProps) {
  return (
    <span aria-hidden="true" className={cn(iconVariants({ tint, size }), className)} {...props}>
      <IconComponent />
    </span>
  );
}

/* __DOC
<div className="flex items-center gap-3 [--node-size:20px]">
  <QUI.Icon icon={Icons.Settings} tint="secondary" />
  <QUI.Icon icon={Icons.Settings} tint="muted" />
  <QUI.Icon icon={Icons.Settings} tint="danger" />
  <QUI.Icon icon={Icons.Settings} tint="placeholder" />
</div>
DOC__ */
