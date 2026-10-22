import * as React from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../atoms/Avatar";
import { AvatarGroup } from "../atoms/AvatarGroup";
import { LinearProgress } from "../atoms/LinearProgress";
import { Tooltip } from "../atoms/Tooltip";
import { ArrowDownRight, ArrowUpRight, Check, CircleDashed, CircleDot, CircleX, Minus } from "lucide-react";

/**
 * Typed cell content for `TableCell`: people, dates, money, numbers, changes, trends, statuses,
 * progress, tags and masked numbers. Each formats its value with `Intl` (pass `locale` to pin it), renders an em dash for a
 * missing value, and sets its own type scale so a column reads the same everywhere. Put numeric
 * cells in a `TableCell align="end"` so their digits line up.
 */

type Locale = string | undefined;

/** Placeholder for a missing value. */
export function EmptyCell() {
  return (
    <span aria-label="Empty" className="text-tertiary">
      —
    </span>
  );
}

/** Makes a cell clickable: a link with `href`, a button with `onClick`. */
export interface CellActionProps {
  /** Opens this URL; the cell renders as a link. */
  href?: string;
  /** Runs on click; the cell renders as a button. Ignored when `href` is set. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

/** Hover/pressed fill and focus ring for a clickable cell, pulled out slightly so the fill doesn't hug the text. */
/**
 * A clickable cell's chrome. The `<a>`/`<button>` wraps only the content, but its `::before` stretches over the whole
 * `<td>` (which is `relative`), so the entire cell is the hit area and takes the hover, pressed and focus states.
 */
const cellActionClass =
  "group/cell inline-flex max-w-full cursor-pointer text-start outline-none before:absolute before:inset-0 before:transition-colors hover:before:bg-layer-transparent-hover active:before:bg-layer-transparent-active focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-accent-strong";

/** Wraps `children` in an `<a>` or `<button>` when the cell has an action; otherwise renders them as they are. */
function CellAction({ href, onClick, children }: CellActionProps & { children: React.ReactNode }) {
  if (href != null) {
    return (
      <a href={href} onClick={onClick} className={cellActionClass}>
        {children}
      </a>
    );
  }
  if (onClick != null) {
    return (
      <button type="button" onClick={onClick} className={cellActionClass}>
        {children}
      </button>
    );
  }
  return <>{children}</>;
}

export interface TextCellProps extends CellActionProps {
  /** Main line. */
  primary: React.ReactNode;
  /** Muted second line, e.g. an email or a type. */
  secondary?: React.ReactNode;
  /** `link` tints the main line as a link (underlined on hover when the cell has an action). @default "default" */
  tone?: "default" | "link";
}

/**
 * Two lines sit tight as one unit at line-height 1, instead of each line carrying its own leading. The padding
 * cancelled by a negative margin gives descenders room inside `truncate`'s clip without adding height.
 */
const stackedLineClass = "py-[0.15em] -my-[0.15em] leading-none";

function TextLines({ primary, secondary, tone }: Pick<TextCellProps, "primary" | "secondary" | "tone">) {
  const stacked = secondary != null;
  return (
    <span className="flex min-w-0 flex-col">
      <span
        className={cn(
          "truncate text-body-sm-regular",
          stacked && stackedLineClass,
          tone === "link" ? "text-link-primary group-hover/cell:text-link-primary-hover group-hover/cell:underline" : "text-primary"
        )}
      >
        {primary}
      </span>
      {secondary != null ? <span className={cn("truncate text-caption-md-regular text-tertiary", stackedLineClass)}>{secondary}</span> : null}
    </span>
  );
}

/** One or two lines of text; both truncate to the column width. With `href` or `onClick` it's a link or button. */
export function TextCell({ primary, secondary, tone = "default", href, onClick }: TextCellProps) {
  if (primary == null || primary === "") return <EmptyCell />;
  return (
    <CellAction href={href} onClick={onClick}>
      <TextLines primary={primary} secondary={secondary} tone={tone} />
    </CellAction>
  );
}

export interface CellUser {
  name: string;
  /** Avatar image; initials are shown without one. */
  src?: string;
}

export interface UserCellProps extends CellUser, CellActionProps {
  /** Muted second line, e.g. an email. */
  secondary?: React.ReactNode;
}

/** One person: avatar and name, with an optional second line. With `href` or `onClick` the whole cell is clickable. */
export function UserCell({ name, src, secondary, href, onClick }: UserCellProps) {
  const content = (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar size={secondary != null ? "lg" : "sm"} src={src} alt={name} />
      <TextLines primary={name} secondary={secondary} />
    </span>
  );
  return (
    <CellAction href={href} onClick={onClick}>
      {content}
    </CellAction>
  );
}

export interface UsersCellProps {
  users: ReadonlyArray<CellUser>;
  /** Faces shown before a "+N" counter. @default 3 */
  max?: number;
}

/** Several people as an overlapping avatar stack; a single person also shows their name. */
export function UsersCell({ users, max = 3 }: UsersCellProps) {
  if (users.length === 0) return <EmptyCell />;
  if (users.length === 1) return <UserCell {...users[0]!} />;
  return (
    <AvatarGroup size="sm" max={max} label={users.map((user) => user.name).join(", ")} overflowTooltip={users.slice(max).map((user) => user.name).join(", ")}>
      {users.map((user) => (
        <Avatar key={user.name} src={user.src} alt={user.name} tooltip />
      ))}
    </AvatarGroup>
  );
}

type DateInput = Date | string | number;

const dateFormats = {
  short: { day: "numeric", month: "short" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  long: { weekday: "short", day: "numeric", month: "long", year: "numeric" },
  datetime: { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateCellFormat = keyof typeof dateFormats | "relative";

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

function relative(date: Date, now: Date, locale: Locale) {
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  if (Math.abs(days) < 30) return rtf.format(Math.round(days / 7), "week");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

export interface DateCellProps {
  value: DateInput | null | undefined;
  /** `short` "10 May", `medium` "10 May 2026", `long` "Sun, 10 May 2026", `datetime` adds the time, `relative` "in 3 days". @default "medium" */
  format?: DateCellFormat;
  /** Tints the date, e.g. `warning` for a due date that has passed. @default "default" */
  tone?: "default" | "warning" | "danger";
  locale?: Locale;
  /** Reference time for `relative`. @default the current time */
  now?: Date;
}

/** A date, formatted for the column; the full date is in a `title` and a `<time>` for machines. */
export function DateCell({ value, format = "medium", tone = "default", locale, now }: DateCellProps) {
  if (value == null || value === "") return <EmptyCell />;
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return <EmptyCell />;
  const text = format === "relative" ? relative(date, now ?? new Date(), locale) : new Intl.DateTimeFormat(locale, dateFormats[format]).format(date);
  return (
    <time
      dateTime={date.toISOString()}
      title={new Intl.DateTimeFormat(locale, dateFormats.datetime).format(date)}
      className={cn("whitespace-nowrap tabular-nums", tone === "warning" ? "text-warning-primary" : tone === "danger" ? "text-danger-primary" : "text-primary")}
    >
      {text}
    </time>
  );
}

export interface DateRangeCellProps {
  start: DateInput | null | undefined;
  end: DateInput | null | undefined;
  /** `short` "10–17 May", `medium` "10–17 May 2026". @default "short" */
  format?: "short" | "medium";
  locale?: Locale;
}

/** A start–end range, collapsing the shared month or year ("10–17 May"). A missing end reads "From …". */
export function DateRangeCell({ start, end, format = "short", locale }: DateRangeCellProps) {
  if (start == null || start === "") return <EmptyCell />;
  const formatter = new Intl.DateTimeFormat(locale, dateFormats[format]);
  const text = end == null || end === "" ? `From ${formatter.format(toDate(start))}` : formatter.formatRange(toDate(start), toDate(end));
  return <span className="whitespace-nowrap tabular-nums text-primary">{text}</span>;
}

export interface MoneyCellProps {
  amount: number | null | undefined;
  /** ISO 4217 code, e.g. "AED", "USD". */
  currency: string;
  /** `symbol` "$1,250.00", `code` "AED 1,250.00", `none` "1,250.00" (when the column header names the currency). @default "symbol" */
  display?: "symbol" | "code" | "none";
  /** `inline` keeps cents at full size, `subdued` shrinks and mutes them, `hidden` rounds to whole units. @default "inline" */
  minor?: "inline" | "subdued" | "hidden";
  /** Tints negative amounts red and positive ones green, with an explicit sign. @default false */
  signed?: boolean;
  /** `compact` shortens large amounts: "AED 1.2M". Cents are dropped. @default "standard" */
  notation?: "standard" | "compact";
  /** `parentheses` shows a negative amount the accounting way, "(500.00)", in red. @default "minus" */
  negative?: "minus" | "parentheses";
  locale?: Locale;
}

/** A currency amount with tabular digits; put it in a `TableCell align="end"`. */
export function MoneyCell({ amount, currency, display = "symbol", minor = "inline", signed = false, notation = "standard", negative = "minus", locale }: MoneyCellProps) {
  if (amount == null || Number.isNaN(amount)) return <EmptyCell />;
  const compact = notation === "compact";
  const accounting = negative === "parentheses" && amount < 0;
  const formatter = new Intl.NumberFormat(locale, {
    style: display === "none" ? "decimal" : "currency",
    currency,
    currencyDisplay: display === "code" ? "code" : "narrowSymbol",
    notation,
    minimumFractionDigits: compact || minor === "hidden" ? 0 : 2,
    maximumFractionDigits: compact ? 1 : minor === "hidden" ? 0 : 2,
    signDisplay: accounting ? "never" : signed ? "exceptZero" : "auto",
  });
  const tone = (signed || accounting) && amount < 0 ? "text-danger-primary" : signed && amount > 0 ? "text-success-primary" : "text-primary";
  const wrap = (text: React.ReactNode) => (accounting ? <>({text})</> : text);
  if (minor !== "subdued" || compact) return <span className={cn("whitespace-nowrap tabular-nums", tone)}>{wrap(formatter.format(amount))}</span>;
  const parts = formatter.formatToParts(amount);
  const split = parts.findIndex((part) => part.type === "decimal");
  const whole = parts.slice(0, split === -1 ? parts.length : split).map((part) => part.value).join("");
  const cents = split === -1 ? "" : parts.slice(split).map((part) => part.value).join("");
  return (
    <span className={cn("whitespace-nowrap tabular-nums", tone)}>
      {wrap(
        <>
          {whole}
          <span className="text-body-xs-regular text-tertiary">{cents}</span>
        </>
      )}
    </span>
  );
}

export type NumberCellFormat = "decimal" | "integer" | "percent" | "compact" | "duration";

/** "15h 30m" from minutes. */
function duration(minutes: number) {
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.round(Math.abs(minutes) % 60);
  const text = h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
  return minutes < 0 ? `−${text}` : text;
}

export interface NumberCellProps {
  value: number | null | undefined;
  /**
   * `decimal` "1,234.5", `integer` "1,235", `percent` "24%" (from 24, not 0.24), `compact` "1.2K",
   * `duration` "15h 30m" (from minutes). @default "decimal"
   */
  format?: NumberCellFormat;
  /** Fraction digits for `decimal` and `percent`. @default 0 for percent, up to 2 for decimal */
  decimals?: number;
  /** Muted unit after the number, e.g. "pts" or "kg". */
  unit?: string;
  locale?: Locale;
}

/** A number in the column's format, with tabular digits; put it in a `TableCell align="end"`. */
export function NumberCell({ value, format = "decimal", decimals, unit, locale }: NumberCellProps) {
  if (value == null || Number.isNaN(value)) return <EmptyCell />;
  const text =
    format === "duration"
      ? duration(value)
      : format === "percent"
        ? new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: decimals ?? 0, minimumFractionDigits: decimals ?? 0 }).format(value / 100)
        : format === "compact"
          ? new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
          : format === "integer"
            ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
            : new Intl.NumberFormat(locale, { maximumFractionDigits: decimals ?? 2, minimumFractionDigits: decimals ?? 0 }).format(value);
  return (
    <span className="whitespace-nowrap tabular-nums text-primary">
      {text}
      {unit ? <span className="text-body-xs-regular text-tertiary"> {unit}</span> : null}
    </span>
  );
}

export interface ProgressCellProps {
  /** 0–100. */
  value: number | null | undefined;
  /** Bar colour; `auto` is success at 100%, brand below. @default "auto" */
  variant?: "auto" | "brand" | "success" | "warning" | "danger";
  /** Accessible name, e.g. "Budget used". */
  "aria-label"?: string;
}

/** A thin progress bar with its percentage. */
export function ProgressCell({ value, variant = "auto", "aria-label": ariaLabel }: ProgressCellProps) {
  if (value == null || Number.isNaN(value)) return <EmptyCell />;
  return (
    <span className="flex min-w-24">
      <LinearProgress aria-label={ariaLabel} size="sm" value={value} variant={variant === "auto" ? (value >= 100 ? "success" : "brand") : variant} />
    </span>
  );
}

/** Which way is good: `up` for revenue or balances, `down` for costs or arrears. */
export type GoodDirection = "up" | "down";

function changeTone(delta: number, good: GoodDirection) {
  if (delta === 0) return "text-tertiary";
  return (delta > 0) === (good === "up") ? "text-success-primary" : "text-danger-primary";
}

export interface ChangeCellProps {
  /** The change: a percentage (12.5 = 12.5%), a plain number, or an amount in `currency`. */
  value: number | null | undefined;
  /** @default "percent" */
  format?: "percent" | "number" | "money";
  /** Currency code when `format` is `money`. */
  currency?: string;
  /** Which direction is green. @default "up" */
  good?: GoodDirection;
  /** Fraction digits. @default 1 for percent, 0 for number, 2 for money */
  decimals?: number;
  locale?: Locale;
}

/** A change with a direction arrow, coloured by whether that direction is good: "↗ 12.5%". */
export function ChangeCell({ value, format = "percent", currency = "USD", good = "up", decimals, locale }: ChangeCellProps) {
  if (value == null || Number.isNaN(value)) return <EmptyCell />;
  const digits = decimals ?? (format === "percent" ? 1 : format === "money" ? 2 : 0);
  const text = new Intl.NumberFormat(locale, {
    style: format === "percent" ? "percent" : format === "money" ? "currency" : "decimal",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: "never",
  }).format(format === "percent" ? Math.abs(value) / 100 : Math.abs(value));
  const Arrow = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const direction = value > 0 ? "Up" : value < 0 ? "Down" : "No change";
  return (
    <span className={cn("inline-flex items-center gap-0.5 whitespace-nowrap tabular-nums text-body-sm-medium", changeTone(value, good))}>
      <Arrow aria-hidden className="size-3.5 shrink-0" />
      <span className="sr-only">{direction} </span>
      {text}
    </span>
  );
}

export interface TrendCellProps {
  /** Values oldest first, e.g. month-end balances. */
  values: ReadonlyArray<number>;
  /** Which direction is green. @default "up" */
  good?: GoodDirection;
  /** Also show the change from first to last as a percentage. @default false */
  showChange?: boolean;
  /** What the line shows, for screen readers, e.g. "Balance, last 3 months". @default "Trend" */
  label?: string;
  locale?: Locale;
}

const SPARK_W = 64;
const SPARK_H = 20;

/** A sparkline coloured by whether the overall direction (first → last) is good, with an optional % change. */
export function TrendCell({ values, good = "up", showChange = false, label = "Trend", locale }: TrendCellProps) {
  const points = values.filter((v) => Number.isFinite(v));
  if (points.length < 2) return <EmptyCell />;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const path = points
    .map((v, i) => `${((i / (points.length - 1)) * (SPARK_W - 2) + 1).toFixed(1)},${(SPARK_H - 1 - ((v - min) / range) * (SPARK_H - 2)).toFixed(1)}`)
    .join(" ");
  const change = first === 0 ? null : ((last - first) / Math.abs(first)) * 100;
  const tone = changeTone(last - first, good);
  const direction = last > first ? "up" : last < first ? "down" : "flat";
  const summary = `${label}: ${direction}${change != null ? ` ${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.abs(change))}%` : ""}`;
  return (
    <span className={cn("inline-flex items-center gap-2", tone)}>
      <svg role="img" aria-label={summary} width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="shrink-0 overflow-visible">
        <polyline points={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showChange && change != null ? (
        <span aria-hidden className="whitespace-nowrap tabular-nums text-body-xs-medium">
          {new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(change / 100)}
        </span>
      ) : null}
    </span>
  );
}

export type StatusStep = "done" | "current" | "pending" | "failed";

export interface StatusIconsCellItem {
  /** What the step is, e.g. "Approved", "Invoice", "Reviewed". Shown in the tooltip. */
  label: string;
  status: StatusStep;
  /** The step's icon. Without one, a step shows its status: a filled check, a dot, a dashed circle or an ✕. */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface StatusIconsCellProps {
  items: ReadonlyArray<StatusIconsCellItem>;
}

const stepTone: Record<StatusStep, string> = {
  done: "text-success-primary",
  current: "text-accent-primary",
  pending: "text-icon-placeholder",
  failed: "text-danger-primary",
};
/** Status-only icons for steps without their own (`done` draws a filled check instead). */
const stepIcon = { current: CircleDot, pending: CircleDashed, failed: CircleX } as const;
const stepWord: Record<StatusStep, string> = { done: "done", current: "in progress", pending: "pending", failed: "failed" };

/** A row of step icons — approved, invoiced, reviewed, stamped… — each tinted by its status, named in a tooltip. */
export function StatusIconsCell({ items }: StatusIconsCellProps) {
  if (items.length === 0) return <EmptyCell />;
  return (
    <span role="list" className="inline-flex items-center gap-3">
      {items.map((item) => {
        const Icon = item.icon ?? (item.status === "done" ? undefined : stepIcon[item.status]);
        const name = `${item.label}: ${stepWord[item.status]}`;
        return (
          <Tooltip key={item.label} label={name}>
            <span role="listitem" tabIndex={0} aria-label={name} className={cn("inline-flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-strong", stepTone[item.status])}>
              {item.status === "done" && !Icon ? (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-success-primary text-icon-on-color">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
              ) : (
                Icon && <Icon aria-hidden className="size-5" />
              )}
            </span>
          </Tooltip>
        );
      })}
    </span>
  );
}

const tagColorClass = {
  grey: "bg-label-grey-bg text-label-grey-text",
  indigo: "bg-label-indigo-bg text-label-indigo-text",
  purple: "bg-label-purple-bg text-label-purple-text",
  pink: "bg-label-pink-bg text-label-pink-text",
  crimson: "bg-label-crimson-bg text-label-crimson-text",
  orange: "bg-label-orange-bg text-label-orange-text",
  yellow: "bg-label-yellow-bg text-label-yellow-text",
  emerald: "bg-label-emerald-bg text-label-emerald-text",
} as const;

export type TagColor = keyof typeof tagColorClass;

const tagHoverClass: Record<TagColor, string> = {
  grey: "hover:bg-label-grey-hover",
  indigo: "hover:bg-label-indigo-hover",
  purple: "hover:bg-label-purple-hover",
  pink: "hover:bg-label-pink-hover",
  crimson: "hover:bg-label-crimson-hover",
  orange: "hover:bg-label-orange-hover",
  yellow: "hover:bg-label-yellow-hover",
  emerald: "hover:bg-label-emerald-hover",
};

export interface TagCellProps extends CellActionProps {
  label: React.ReactNode;
  /** One of the label palette colours. @default "grey" */
  color?: TagColor;
}

/** A coloured tag, e.g. a quarter, size or status; truncates in a narrow column. With `href` or `onClick` it's clickable. */
export function TagCell({ label, color = "grey", href, onClick }: TagCellProps) {
  if (label == null || label === "") return <EmptyCell />;
  const tagClass = cn("inline-block max-w-full truncate rounded-sm px-1.5 align-middle text-body-xs-medium", tagColorClass[color]);
  if (href == null && onClick == null) return <span className={tagClass}>{label}</span>;
  // Like `CellAction`, the tag's `::before` covers the whole cell, so clicking anywhere in it hits the tag.
  const actionClass = cn(tagClass, "cursor-pointer outline-none transition-colors before:absolute before:inset-0 before:transition-colors hover:before:bg-layer-transparent-hover active:before:bg-layer-transparent-active focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-accent-strong", tagHoverClass[color]);
  return href != null ? (
    <a href={href} onClick={onClick} className={actionClass}>
      {label}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={actionClass}>
      {label}
    </button>
  );
}

export interface MaskedCellProps {
  /** The visible tail, e.g. the last four card digits. */
  last: string | null | undefined;
  /** Masked groups before it. @default 3 */
  groups?: number;
}

/** A masked identifier like a card number: "•••• •••• •••• 1435". */
export function MaskedCell({ last, groups = 3 }: MaskedCellProps) {
  if (last == null || last === "") return <EmptyCell />;
  return (
    <span className="whitespace-nowrap tabular-nums text-primary">
      <span aria-hidden className="text-tertiary">
        {"•••• ".repeat(groups)}
      </span>
      <span className="sr-only">ending in </span>
      {last}
    </span>
  );
}

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-4 p-4">
  <QUI.Table aria-label="Projects" stickyHeader={false}>
    <QUI.TableHeader>
      <QUI.TableRow>
        <QUI.TableHead>Owner</QUI.TableHead>
        <QUI.TableHead>Team</QUI.TableHead>
        <QUI.TableHead>Card</QUI.TableHead>
        <QUI.TableHead>Due</QUI.TableHead>
        <QUI.TableHead>Sprint</QUI.TableHead>
        <QUI.TableHead align="end">Budget</QUI.TableHead>
        <QUI.TableHead align="end">Estimate</QUI.TableHead>
        <QUI.TableHead align="end">Logged</QUI.TableHead>
        <QUI.TableHead>Progress</QUI.TableHead>
        <QUI.TableHead>Size</QUI.TableHead>
      </QUI.TableRow>
    </QUI.TableHeader>
    <QUI.TableBody>
      <QUI.TableRow>
        <QUI.TableCell><QUI.UserCell name="James Clarke" secondary="james@acme.com" onClick={() => {}} /></QUI.TableCell>
        <QUI.TableCell><QUI.UsersCell users={[{ name: "Raul Patel" }, { name: "Candice Smith" }, { name: "Nuwan Epa" }, { name: "Saif Kapadia" }]} /></QUI.TableCell>
        <QUI.TableCell><QUI.MaskedCell last="1435" /></QUI.TableCell>
        <QUI.TableCell><QUI.DateCell value="2026-05-10" format="short" locale="en-GB" /></QUI.TableCell>
        <QUI.TableCell><QUI.DateRangeCell start="2026-05-10" end="2026-05-17" locale="en-GB" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={1250} currency="USD" minor="subdued" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.NumberCell value={1200} format="duration" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.NumberCell value={930} format="duration" /></QUI.TableCell>
        <QUI.TableCell><QUI.ProgressCell value={24} aria-label="Budget used" /></QUI.TableCell>
        <QUI.TableCell><QUI.TagCell label="Medium" color="yellow" /></QUI.TableCell>
      </QUI.TableRow>
      <QUI.TableRow>
        <QUI.TableCell><QUI.UserCell name="Candice Smith" /></QUI.TableCell>
        <QUI.TableCell><QUI.UsersCell users={[{ name: "Mohamed Ali" }]} /></QUI.TableCell>
        <QUI.TableCell><QUI.MaskedCell last="8993" /></QUI.TableCell>
        <QUI.TableCell><QUI.DateCell value="2026-02-28" tone="warning" locale="en-GB" /></QUI.TableCell>
        <QUI.TableCell><QUI.DateRangeCell start="2026-05-28" end="2026-06-04" locale="en-GB" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={-500} currency="AED" display="code" signed /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.NumberCell value={52} format="percent" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.NumberCell value={1234.5} unit="pts" /></QUI.TableCell>
        <QUI.TableCell><QUI.ProgressCell value={100} aria-label="Budget used" /></QUI.TableCell>
        <QUI.TableCell><QUI.TagCell label="XL" color="crimson" /></QUI.TableCell>
      </QUI.TableRow>
      <QUI.TableRow>
        <QUI.TableCell><QUI.TextCell primary="Ranu Test 2" secondary="virtual" tone="link" href="#/examples/balance-logs" /></QUI.TableCell>
        <QUI.TableCell><QUI.UsersCell users={[]} /></QUI.TableCell>
        <QUI.TableCell><QUI.MaskedCell last={null} /></QUI.TableCell>
        <QUI.TableCell><QUI.DateCell value={null} /></QUI.TableCell>
        <QUI.TableCell><QUI.DateRangeCell start="2026-11-30" end={null} locale="en-GB" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={0} currency="AED" display="none" minor="subdued" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.NumberCell value={1250000} format="compact" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.NumberCell value={null} /></QUI.TableCell>
        <QUI.TableCell><QUI.ProgressCell value={9} aria-label="Budget used" /></QUI.TableCell>
        <QUI.TableCell><QUI.TagCell label="Small" color="emerald" /></QUI.TableCell>
      </QUI.TableRow>
    </QUI.TableBody>
  </QUI.Table>
  <QUI.Table aria-label="Accounts" stickyHeader={false}>
    <QUI.TableHeader>
      <QUI.TableRow>
        <QUI.TableHead>Account</QUI.TableHead>
        <QUI.TableHead align="end">Balance</QUI.TableHead>
        <QUI.TableHead align="end">Net flow</QUI.TableHead>
        <QUI.TableHead align="end">MoM</QUI.TableHead>
        <QUI.TableHead>Trend (3M)</QUI.TableHead>
        <QUI.TableHead>Status</QUI.TableHead>
      </QUI.TableRow>
    </QUI.TableHeader>
    <QUI.TableBody>
      <QUI.TableRow>
        <QUI.TableCell><QUI.TextCell primary="Operating" secondary="AE07 0331 •••• 1435" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={4620000} currency="AED" display="code" notation="compact" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={-18250.5} currency="AED" display="none" negative="parentheses" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.ChangeCell value={7.2} /></QUI.TableCell>
        <QUI.TableCell><QUI.TrendCell values={[3.1, 3.9, 4.6]} label="Balance, last 3 months" /></QUI.TableCell>
        <QUI.TableCell><QUI.StatusIconsCell items={[{ label: "Approved", status: "done" }, { label: "Invoice", icon: Icons.ReceiptText, status: "done" }, { label: "Reviewed", icon: Icons.SquarePen, status: "current" }, { label: "Stamped", icon: Icons.Stamp, status: "pending" }]} /></QUI.TableCell>
      </QUI.TableRow>
      <QUI.TableRow>
        <QUI.TableCell><QUI.TextCell primary="Payroll" secondary="AE07 0331 •••• 8993" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={812400} currency="AED" display="code" notation="compact" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={42000} currency="AED" display="none" negative="parentheses" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.ChangeCell value={-3.4} /></QUI.TableCell>
        <QUI.TableCell><QUI.TrendCell values={[1.2, 1.5, 0.8]} label="Balance, last 3 months" /></QUI.TableCell>
        <QUI.TableCell><QUI.StatusIconsCell items={[{ label: "Approved", status: "done" }, { label: "Invoice", icon: Icons.ReceiptText, status: "failed" }, { label: "Reviewed", icon: Icons.SquarePen, status: "pending" }, { label: "Stamped", icon: Icons.Stamp, status: "pending" }]} /></QUI.TableCell>
      </QUI.TableRow>
      <QUI.TableRow>
        <QUI.TableCell><QUI.TextCell primary="Card spend" secondary="Costs" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={96300} currency="AED" display="code" notation="compact" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.MoneyCell amount={-96300} currency="AED" display="none" negative="parentheses" /></QUI.TableCell>
        <QUI.TableCell align="end"><QUI.ChangeCell value={-12.5} good="down" /></QUI.TableCell>
        <QUI.TableCell><QUI.TrendCell values={[110, 104, 96]} good="down" label="Spend, last 3 months" /></QUI.TableCell>
        <QUI.TableCell><QUI.StatusIconsCell items={[{ label: "Approved", status: "done" }, { label: "Invoice", icon: Icons.ReceiptText, status: "done" }, { label: "Reviewed", icon: Icons.SquarePen, status: "done" }, { label: "Stamped", icon: Icons.Stamp, status: "done" }]} /></QUI.TableCell>
      </QUI.TableRow>
    </QUI.TableBody>
  </QUI.Table>
</div>
DOC__ */

/* __PROPS
{
  "DateCell.format": ["short", "medium", "long", "datetime", "relative"],
  "DateCell.tone": ["default", "warning", "danger"],
  "MoneyCell.display": ["symbol", "code", "none"],
  "MoneyCell.minor": ["inline", "subdued", "hidden"],
  "MoneyCell.signed": "boolean",
  "MoneyCell.notation": ["standard", "compact"],
  "MoneyCell.negative": ["minus", "parentheses"],
  "ChangeCell.format": ["percent", "number", "money"],
  "ChangeCell.good": ["up", "down"],
  "TrendCell.good": ["up", "down"],
  "TrendCell.showChange": "boolean",
  "NumberCell.format": ["decimal", "integer", "percent", "compact", "duration"],
  "ProgressCell.variant": ["auto", "brand", "success", "warning", "danger"],
  "TagCell.color": ["grey", "indigo", "purple", "pink", "crimson", "orange", "yellow", "emerald"],
  "TextCell.tone": ["default", "link"]
}
PROPS__ */
