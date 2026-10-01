import * as React from "react";
import { DayPicker, useDayPicker, type ChevronProps, type ClassNames, type DayPickerProps, type NavProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../atoms/IconButton";
import { Icon } from "../atoms/Icon";

/** `Omit` that keeps `DayPickerProps`' mode union intact, so `mode`/`selected`/`onSelect` stay correlated. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * qui's class map for react-day-picker's parts. The day cell (`<td>`) carries the range band; its
 * button carries the selected disc, focus ring, and hover. Range-middle overrides the selected
 * disc with `!` so it wins regardless of stylesheet order.
 */
const calendarClassNames: Partial<ClassNames> = {
  root: "relative w-fit",
  months: "flex flex-col gap-3",
  month: "flex flex-col gap-3",
  month_caption: "flex h-7 items-center",
  caption_label: "text-h5-semibold text-secondary",
  nav: "absolute end-0 top-0 z-10 flex items-center gap-1",
  month_grid: "border-collapse",
  weekdays: "flex",
  weekday: "flex size-10 items-center justify-center text-body-sm-regular text-tertiary",
  week: "flex w-full",
  day: "relative size-10 p-0 text-center",
  day_button:
    "relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-body-sm-regular text-primary outline-none transition-colors hover:bg-layer-transparent-hover focus-visible:ring-2 focus-visible:ring-accent-strong disabled:cursor-not-allowed disabled:hover:bg-transparent",
  selected: "[&>button]:bg-accent-primary [&>button]:text-inverse [&>button:hover]:bg-accent-primary",
  range_start: "rounded-s-full bg-accent-subtle-hover",
  range_end: "rounded-e-full bg-accent-subtle-hover",
  range_middle: "bg-accent-subtle-hover [&>button]:bg-transparent! [&>button]:text-primary! [&>button:hover]:bg-transparent!",
  today:
    "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-(--txt-icon-accent-subtle)",
  disabled: "[&>button]:text-disabled",
  outside: "[&>button]:text-tertiary",
  hidden: "invisible",
};

function CalendarChevron({ orientation }: ChevronProps) {
  return <Icon icon={orientation === "left" ? ChevronLeft : ChevronRight} className="rtl:-scale-x-100" />;
}

/** Previous/next month buttons on qui's ghost `IconButton`. Disabled at `startMonth`/`endMonth` or with `disableNavigation`. */
function CalendarNav({ onPreviousClick, onNextClick, previousMonth, nextMonth, className, ...props }: NavProps) {
  const { labels } = useDayPicker();
  return (
    <nav className={className} {...props}>
      <IconButton
        variant="ghost"
        size="sm"
        showTooltip={false}
        aria-label={labels.labelPrevious(previousMonth)}
        disabled={!previousMonth}
        onClick={onPreviousClick}
        icon={<CalendarChevron orientation="left" />}
      />
      <IconButton
        variant="ghost"
        size="sm"
        showTooltip={false}
        aria-label={labels.labelNext(nextMonth)}
        disabled={!nextMonth}
        onClick={onNextClick}
        icon={<CalendarChevron orientation="right" />}
      />
    </nav>
  );
}

export type CalendarProps = DistributiveOmit<
  DayPickerProps,
  "classNames" | "numberOfMonths" | "captionLayout" | "navLayout" | "showWeekNumber"
>;

/**
 * A bare month calendar built on react-day-picker, styled with qui tokens. Pass `mode` of
 * `"single"`, `"multiple"`, or `"range"` with `selected`/`onSelect` (omit `onSelect` to let it
 * manage selection itself, seeded from `selected`). `disabled` takes react-day-picker matchers
 * (dates, `{ before }`, `{ after }`, `{ dayOfWeek }`, ranges, or a predicate). The day grid is an
 * ARIA `grid`: arrow keys move by day/week, PageUp/PageDown by month, Home/End to week bounds.
 * Weeks start on Monday by default; pass `weekStartsOn` to override. A popover, dialog, or card
 * supplies the surrounding surface and padding.
 */
export function Calendar({ className, components, weekStartsOn = 1, ...props }: CalendarProps) {
  return (
    <DayPicker
      {...(props as DayPickerProps)}
      weekStartsOn={weekStartsOn}
      className={className}
      classNames={calendarClassNames}
      components={{ Nav: CalendarNav, Chevron: CalendarChevron, ...components }}
    />
  );
}
Calendar.displayName = "Calendar";

/* __DOC_BLOCK
<div className="flex flex-wrap gap-10 p-4">
  <QUI.Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} selected={new Date(2026, 9, 14)} today={new Date(2026, 9, 1)} disabled={{ before: new Date(2026, 9, 5) }} />
  <QUI.Calendar mode="range" defaultMonth={new Date(2026, 9, 1)} selected={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 18) }} today={new Date(2026, 9, 1)} />
</div>
DOC__ */

/* __PROPS
{ "mode": ["single", "multiple", "range"], "weekStartsOn": [0, 1, 2, 3, 4, 5, 6], "showOutsideDays": "boolean", "fixedWeeks": "boolean", "required": "boolean", "disableNavigation": "boolean" }
PROPS__ */
