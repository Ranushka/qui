import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { User } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import {
  AvatarGroupContext,
  avatarFallbackVariantClass,
  avatarInitialsTextClass,
  getAvatarInitials,
  getAvatarVariant,
  getAvatarVariantSeed,
  getFirstAvatarInitial,
  type AvatarSize,
} from "../lib/avatar-shared";

const initialsTextClass = avatarInitialsTextClass;

const avatarVariants = cva("relative inline-flex shrink-0 items-center justify-center overflow-clip rounded-full border-subtle bg-layer-1", {
  variants: {
    size: {
      "2xs": `size-4 border-sm ${initialsTextClass["2xs"]} [--node-size:0.875rem]`,
      xs: `size-5 border-sm ${initialsTextClass.xs} [--node-size:0.875rem]`,
      sm: `size-6 border-sm ${initialsTextClass.sm} [--node-size:1rem]`,
      md: `size-7 border-sm ${initialsTextClass.md} [--node-size:1.25rem]`,
      lg: `size-8 border-sm ${initialsTextClass.lg} [--node-size:1.5rem]`,
      xl: `size-10 border-lg ${initialsTextClass.xl} [--node-size:1.5rem]`,
      "2xl": `size-14 border-lg ${initialsTextClass["2xl"]} [--node-size:2rem]`,
      "3xl": `size-16 border-lg ${initialsTextClass["3xl"]} [--node-size:2rem]`,
    },
  },
  defaultVariants: { size: "md" },
});

const fallbackVariantClass = avatarFallbackVariantClass;

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "children"> {
  size?: AvatarSize;
  /** Photo URL. Falls back to initials (derived from `alt`), then an anonymous person icon. */
  src?: string;
  /** The person's name — doubles as the accessible name and the initials source. */
  alt?: string;
  /** Explicit initials/fallback content, overriding what's derived from `alt`. */
  fallback?: React.ReactNode;
  /** Delay before showing the fallback while the image loads, in ms. */
  delay?: number;
  /** Shows `alt` (or a custom string) as a hover tooltip. */
  tooltip?: boolean | string;
}

/**
 * A person's photo, falling back to initials (or an anonymous icon) — composed from Base UI's
 * `Avatar.Root` + `Image` + `Fallback`. Pass `src` for the photo and `alt` for the name; the
 * initials color is chosen deterministically from the name and isn't a consumer prop.
 */
export function Avatar({ size, src, alt, fallback, delay, tooltip, tabIndex, className, ...props }: AvatarProps) {
  const groupSize = React.useContext(AvatarGroupContext);
  const effectiveSize = size ?? groupSize ?? "md";
  const derivedInitials = React.useMemo(() => getAvatarInitials(alt), [alt]);
  const resolvedFallback = fallback ?? derivedInitials;
  const displayFallback = effectiveSize === "2xs" && typeof resolvedFallback === "string" ? getFirstAvatarInitial(resolvedFallback) : resolvedFallback;
  const hasInitials = resolvedFallback != null;
  const resolvedVariant = getAvatarVariant(getAvatarVariantSeed(alt, resolvedFallback));
  const tooltipLabel = tooltip === true ? alt : typeof tooltip === "string" ? tooltip || undefined : undefined;
  const accessibleName = alt ?? tooltipLabel;
  const a11y = accessibleName != null ? { role: "img" as const, "aria-label": accessibleName } : { "aria-hidden": true as const };

  const avatar = (
    <BaseAvatar.Root className={cn(avatarVariants({ size: effectiveSize }), className)} tabIndex={tabIndex} {...a11y} {...props}>
      {src ? <BaseAvatar.Image className="size-full object-cover" src={src} alt="" /> : null}
      {hasInitials ? (
        <BaseAvatar.Fallback
          delay={delay}
          className={cn("flex size-full items-center justify-center leading-none", fallbackVariantClass[resolvedVariant])}
        >
          {displayFallback}
        </BaseAvatar.Fallback>
      ) : (
        <BaseAvatar.Fallback delay={delay} className="flex size-full items-center justify-center leading-none">
          <Icon icon={User} tint="muted" />
        </BaseAvatar.Fallback>
      )}
    </BaseAvatar.Root>
  );

  return tooltipLabel ? <Tooltip label={tooltipLabel}>{avatar}</Tooltip> : avatar;
}

/* __DOC_BLOCK
<div className="flex flex-wrap items-center gap-4 p-4">
  <QUI.Avatar size="2xs" alt="Ada Lovelace" />
  <QUI.Avatar size="xs" alt="Ada Lovelace" />
  <QUI.Avatar size="sm" alt="Ada Lovelace" />
  <QUI.Avatar size="md" alt="Ada Lovelace" />
  <QUI.Avatar size="lg" alt="Ada Lovelace" />
  <QUI.Avatar size="xl" alt="Ada Lovelace" />
  <QUI.Avatar size="2xl" alt="Ada Lovelace" />
  <QUI.Avatar size="md" alt="Grace Hopper" />
  <QUI.Avatar size="md" alt="Barbara Liskov" />
  <QUI.Avatar size="md" />
  <QUI.Avatar size="md" alt="Katherine Johnson" tooltip />
</div>
DOC__ */

/* __PROPS
{ "size": ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"], "tooltip": "boolean" }
PROPS__ */
