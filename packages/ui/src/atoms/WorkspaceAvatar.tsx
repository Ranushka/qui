import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { Building2 } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import {
  avatarFallbackVariantClass,
  avatarInitialsTextClass,
  getAvatarInitials,
  getAvatarVariant,
  getAvatarVariantSeed,
  getFirstAvatarInitial,
  type AvatarSize,
} from "../lib/avatar-shared";

/**
 * Same size ladder, border and initials ramp as the person `Avatar`, but a rounded square whose
 * radius steps up with the size — the shape is what tells a workspace apart from a person.
 */
const workspaceAvatarVariants = cva("relative inline-flex shrink-0 items-center justify-center overflow-clip border-subtle bg-layer-1", {
  variants: {
    size: {
      "2xs": `size-4 rounded-sm border-sm ${avatarInitialsTextClass["2xs"]} [--node-size:0.875rem]`,
      xs: `size-5 rounded-sm border-sm ${avatarInitialsTextClass.xs} [--node-size:0.875rem]`,
      sm: `size-6 rounded-sm border-sm ${avatarInitialsTextClass.sm} [--node-size:1rem]`,
      md: `size-7 rounded-md border-sm ${avatarInitialsTextClass.md} [--node-size:1.25rem]`,
      lg: `size-8 rounded-md border-sm ${avatarInitialsTextClass.lg} [--node-size:1.5rem]`,
      xl: `size-10 rounded-md border-lg ${avatarInitialsTextClass.xl} [--node-size:1.5rem]`,
      "2xl": `size-14 rounded-lg border-lg ${avatarInitialsTextClass["2xl"]} [--node-size:2rem]`,
      "3xl": `size-16 rounded-lg border-lg ${avatarInitialsTextClass["3xl"]} [--node-size:2rem]`,
    },
  },
  defaultVariants: { size: "md" },
});

export interface WorkspaceAvatarProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "children"> {
  /** @default "md" */
  size?: AvatarSize;
  /** Workspace logo URL. Falls back to initials while absent, loading, or failed. */
  src?: string;
  /** The workspace's name — doubles as the accessible name and the initials source. */
  alt?: string;
  /** Explicit initials/fallback content, overriding what's derived from `alt`. Without either, an anonymous building icon shows. */
  fallback?: React.ReactNode;
  /** Delay before showing the fallback while the logo loads, in ms. */
  delay?: number;
  /** Shows `alt` (`true`) or a custom string as a hover tooltip. */
  tooltip?: boolean | string;
}

/**
 * A workspace's logo in a rounded-square frame, falling back to initials (or an anonymous building
 * icon) — Base UI's `Avatar.Root` + `Image` + `Fallback`, sharing the person `Avatar`'s size ladder,
 * initials derivation and deterministic color. Pass `src` for the logo and `alt` for the name.
 */
export function WorkspaceAvatar({ size = "md", src, alt, fallback, delay, tooltip, tabIndex, className, ...props }: WorkspaceAvatarProps) {
  const derivedInitials = React.useMemo(() => getAvatarInitials(alt), [alt]);
  const resolvedFallback = fallback ?? derivedInitials;
  const displayFallback = size === "2xs" && typeof resolvedFallback === "string" ? getFirstAvatarInitial(resolvedFallback) : resolvedFallback;
  const hasInitials = resolvedFallback != null;
  const resolvedVariant = getAvatarVariant(getAvatarVariantSeed(alt, resolvedFallback));
  const tooltipLabel = tooltip === true ? alt : typeof tooltip === "string" ? tooltip || undefined : undefined;
  const accessibleName = alt ?? tooltipLabel;
  const a11y = accessibleName != null ? { role: "img" as const, "aria-label": accessibleName } : { "aria-hidden": true as const };

  const avatar = (
    <BaseAvatar.Root className={cn(workspaceAvatarVariants({ size }), className)} tabIndex={tabIndex} {...a11y} {...props}>
      {src ? <BaseAvatar.Image className="size-full object-cover" src={src} alt="" /> : null}
      {hasInitials ? (
        <BaseAvatar.Fallback
          delay={delay}
          className={cn("flex size-full items-center justify-center leading-none", avatarFallbackVariantClass[resolvedVariant])}
        >
          {displayFallback}
        </BaseAvatar.Fallback>
      ) : (
        <BaseAvatar.Fallback delay={delay} className="flex size-full items-center justify-center leading-none">
          <Icon icon={Building2} tint="muted" />
        </BaseAvatar.Fallback>
      )}
    </BaseAvatar.Root>
  );

  return tooltipLabel ? <Tooltip label={tooltipLabel}>{avatar}</Tooltip> : avatar;
}

/* __DOC_BLOCK
<div className="flex flex-wrap items-center gap-4 p-4">
  <QUI.WorkspaceAvatar size="2xs" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="xs" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="sm" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="md" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="lg" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="xl" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="2xl" alt="Acme Robotics" />
  <QUI.WorkspaceAvatar size="xl" alt="Northwind" />
  <QUI.WorkspaceAvatar size="xl" alt="Globex" fallback="GX" />
  <QUI.WorkspaceAvatar size="xl" />
  <QUI.WorkspaceAvatar size="xl" alt="Initech" tooltip />
</div>
DOC__ */

/* __PROPS
{ "size": ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"], "tooltip": "boolean" }
PROPS__ */
