import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { Tooltip } from "./Tooltip";
import { AvatarGroupContext, type AvatarSize } from "../lib/avatar-shared";

const counterSizeClass: Record<"2xs" | "xs" | "sm", string> = {
  "2xs": "size-4 border-sm text-caption-2xs-regular",
  xs: "size-5 border-sm text-caption-2xs-regular",
  sm: "size-6 border-sm text-caption-sm-regular",
};

function flattenAvatarChildren(children: React.ReactNode, parentKey = ""): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child, index): React.ReactNode[] => {
    if (!React.isValidElement(child)) return [child];
    const key = JSON.stringify([parentKey, child.key ?? index]);
    if (child.type === React.Fragment) {
      return flattenAvatarChildren((child.props as { children?: React.ReactNode }).children, key);
    }
    return [React.cloneElement(child, { key } as React.Attributes)];
  });
}

function getMemberCounts(childCount: number, max: number | undefined, total: number | undefined) {
  const memberCount = total != null && Number.isFinite(total) ? Math.max(0, Math.floor(total)) : childCount;
  const cap = max != null && Number.isFinite(max) ? Math.max(0, Math.floor(max)) : undefined;
  const visibleCount = Math.min(childCount, memberCount, cap == null || memberCount <= cap + 1 ? memberCount : cap);
  return { visibleCount, hiddenCount: memberCount - visibleCount };
}

export interface AvatarGroupProps extends NoClass<React.HTMLAttributes<HTMLSpanElement>> {
  /** Shared size for every member `Avatar` (an avatar's own `size` still wins). Also sizes the "+N" counter. */
  size?: AvatarSize;
  /** How many faces to show before collapsing the rest into a "+N" counter. @default 2 */
  max?: number;
  /** Real member count, if different from the number of `Avatar` children (e.g. a paginated list). */
  total?: number;
  /** Accessible name summarizing the whole group, e.g. "5 members". */
  label?: string;
  overflowLabel?: string;
  /** Tooltip text for the "+N" counter, e.g. listing the hidden members' names. */
  overflowTooltip?: string;
  children: React.ReactNode;
}

/**
 * An overlapping avatar stack. Members beyond `max` collapse into a "+N" counter; wrap it with an
 * `overflowTooltip` to name who's hidden. Shares `size` down to member `Avatar`s via context and
 * wraps the stack in a `Tooltip.Provider` so per-member tooltips share open/close timing while
 * sweeping across faces.
 */
export function AvatarGroup({
  size,
  max = 2,
  total,
  label,
  "aria-label": ariaLabel,
  overflowLabel,
  overflowTooltip,
  
  children,
  ...props
}: AvatarGroupProps & { "aria-label"?: string }) {
  const summaryLabel = label ?? ariaLabel;
  const items = flattenAvatarChildren(children);
  const { visibleCount, hiddenCount } = getMemberCounts(items.length, max, total);
  const hasOverflowTooltip = hiddenCount > 0 && !!overflowTooltip?.trim();
  const counterLabel = overflowLabel ?? `${hiddenCount} more`;
  const faces = items.slice(0, visibleCount);
  const counterSize = (size === "2xs" || size === "xs" || size === "sm" ? size : "xs") as "2xs" | "xs" | "sm";

  const counter = hiddenCount > 0 ? (
    <span
      role={hasOverflowTooltip || summaryLabel ? undefined : "img"}
      aria-label={hasOverflowTooltip || summaryLabel ? undefined : counterLabel}
      aria-hidden={hasOverflowTooltip || !!summaryLabel || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-clip rounded-full border-subtle bg-label-orange-bg-strong text-on-color",
        counterSizeClass[counterSize]
      )}
    >
      +{Math.min(hiddenCount, 9)}
    </span>
  ) : null;

  return (
    <AvatarGroupContext.Provider value={size}>
      <BaseTooltip.Provider>
        <span
          role={summaryLabel ? (hasOverflowTooltip ? "group" : "img") : undefined}
          aria-label={summaryLabel}
          className={cn("inline-flex items-center -space-x-1.5")}
          {...props}
        >
          {faces}
          {hasOverflowTooltip ? (
            <Tooltip label={overflowTooltip ?? ""}>
              <span
                role="img"
                tabIndex={0}
                aria-label={counterLabel}
                className="relative inline-flex shrink-0 items-center justify-center rounded-full outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-1"
              >
                {counter}
              </span>
            </Tooltip>
          ) : (
            counter
          )}
        </span>
      </BaseTooltip.Provider>
    </AvatarGroupContext.Provider>
  );
}

/* __DOC
<QUI.AvatarGroup size="md" max={3} overflowTooltip="Dana, Erin">
  <QUI.Avatar alt="Ada Lovelace" />
  <QUI.Avatar alt="Grace Hopper" />
  <QUI.Avatar alt="Barbara Liskov" />
  <QUI.Avatar alt="Dana Scott" />
  <QUI.Avatar alt="Erin Meyer" />
</QUI.AvatarGroup>
DOC__ */

/* __PROPS
{ "size": ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"], "max": ["number"] }
PROPS__ */
