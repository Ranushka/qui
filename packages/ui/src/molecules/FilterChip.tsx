import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { ChevronDown, X } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

/** The chip's frame. Empty, it reads as an outline pill; applied, as an accent-tinted chip with its own remove button. */
const chipFrameClass = cn(
  "inline-flex h-(--control-height-md) max-w-72 shrink-0 items-stretch rounded-md border-sm text-body-xs-regular [--node-size:var(--control-glyph-md)]",
  "data-empty:border-subtle-1 data-empty:bg-layer-2 data-empty:text-secondary data-empty:has-[button:hover]:border-strong data-empty:has-[button:hover]:bg-layer-2-hover",
  "not-data-empty:border-transparent not-data-empty:bg-accent-subtle not-data-empty:text-primary"
);

/** Shared by the chip's two buttons: the editor trigger and the remove ✕. */
const chipButtonClass =
  "inline-flex min-w-0 cursor-pointer items-center gap-1 rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-strong";

export interface FilterChipProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "value">> {
  /** The field the chip filters on, e.g. `"Status"`. */
  label: string;
  /** The applied value in words, e.g. `"Active, Frozen"`. Leave it out for a pinned filter that isn't set yet. */
  value?: React.ReactNode;
  /** Icon before the label. */
  icon?: React.ReactNode;
  /** Removes the filter. Shown as a trailing ✕ while the chip holds a value. */
  onRemove?: () => void;
  /** Accessible name of the ✕. @default `Remove ${label} filter` */
  removeLabel?: string;
}

/**
 * One filter in a filter bar. Empty, it is an outline pill — `Status ▾` — that opens its editor; applied, it shows the
 * field and its value — `Status: Active, Frozen ✕` — on an accent tint, and the ✕ clears it. Props and `ref` go to the
 * editor button, so the chip can be a `PopoverTrigger`'s `render`.
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(({ label, value, icon, onRemove, removeLabel, ...props }, ref) => {
  const empty = value == null || value === "";
  return (
    <span data-empty={empty || undefined} className={chipFrameClass}>
      <BaseButton ref={ref} className={cn(chipButtonClass, "px-2 data-popup-open:bg-layer-3-active", !empty && onRemove && "pe-1")} {...props}>
        {icon}
        {empty ? (
          <>
            <span className="truncate">{label}</span>
            <ChevronDown aria-hidden className="size-(--node-size) shrink-0 text-icon-tertiary" />
          </>
        ) : (
          <span className="truncate">
            <span className="text-secondary">{label}: </span>
            <span className="font-medium text-accent-primary">{value}</span>
          </span>
        )}
      </BaseButton>
      {!empty && onRemove ? (
        <BaseButton aria-label={removeLabel ?? `Remove ${label} filter`} className={cn(chipButtonClass, "shrink-0 px-1 text-icon-secondary hover:bg-accent-subtle-hover hover:text-icon-primary")} onClick={onRemove}>
          <X aria-hidden className="size-(--node-size)" />
        </BaseButton>
      ) : null}
    </span>
  );
});
FilterChip.displayName = "FilterChip";

/* __DOC_BLOCK
<div className="flex flex-wrap items-center gap-2 p-4">
  <QUI.FilterChip label="Status" />
  <QUI.FilterChip label="Status" value="Active, Frozen" onRemove={() => {}} />
  <QUI.FilterChip label="Amount" icon={<QUI.Icon icon={Icons.Coins} />} value="> 5,000" onRemove={() => {}} />
</div>
DOC__ */

/* __PROPS
{ "disabled": "boolean" }
PROPS__ */
