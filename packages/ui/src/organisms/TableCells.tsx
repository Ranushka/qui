import * as React from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../atoms/Avatar";
import { AvatarGroup } from "../atoms/AvatarGroup";
import { LinearProgress } from "../atoms/LinearProgress";

/**
 * Typed cell content for `TableCell`: people, dates, money, numbers, progress, tags and masked
 * numbers. Each formats its value with `Intl` (pass `locale` to pin it), renders an em dash for a
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

export interface TextCellProps {
  /** Main line. */
  primary: React.ReactNode;
  /** Muted second line, e.g. an email or a type. */
  secondary?: React.ReactNode;
  /** `link` tints the main line as a link, for cells that open a record. @default "default" */
  tone?: "default" | "link";
}

/** One or two lines of text; both truncate to the column width. */
export function TextCell({ primary, secondary, tone = "default" }: TextCellProps) {
  if (primary == null || primary === "") return <EmptyCell />;
  return (
    <span className="flex min-w-0 flex-col">
      <span className={cn("truncate text-body-sm-medium", tone === "link" ? "text-link-primary" : "text-primary")}>{primary}</span>
      {secondary != null ? <span className="truncate text-body-xs-regular text-tertiary">{secondary}</span> : null}
    </span>
  );
}

export interface CellUser {
  name: string;
  /** Avatar image; initials are shown without one. */
  src?: string;
}

export interface UserCellProps extends CellUser {
  /** Muted second line, e.g. an email. */
  secondary?: React.ReactNode;
}

/** One person: avatar and name, with an optional second line. */
export function UserCell({ name, src, secondary }: UserCellProps) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar size={secondary != null ? "lg" : "sm"} src={src} alt={name} />
      <TextCell primary={name} secondary={secondary} />
    </span>
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
  locale?: Locale;
}

/** A currency amount with tabular digits; put it in a `TableCell align="end"`. */
export function MoneyCell({ amount, currency, display = "symbol", minor = "inline", signed = false, locale }: MoneyCellProps) {
  if (amount == null || Number.isNaN(amount)) return <EmptyCell />;
  const formatter = new Intl.NumberFormat(locale, {
    style: display === "none" ? "decimal" : "currency",
    currency,
    currencyDisplay: display === "code" ? "code" : "narrowSymbol",
    minimumFractionDigits: minor === "hidden" ? 0 : 2,
    maximumFractionDigits: minor === "hidden" ? 0 : 2,
    signDisplay: signed ? "exceptZero" : "auto",
  });
  const tone = signed && amount < 0 ? "text-danger-primary" : signed && amount > 0 ? "text-success-primary" : "text-primary";
  if (minor !== "subdued") return <span className={cn("whitespace-nowrap tabular-nums", tone)}>{formatter.format(amount)}</span>;
  const parts = formatter.formatToParts(amount);
  const split = parts.findIndex((part) => part.type === "decimal");
  const whole = parts.slice(0, split === -1 ? parts.length : split).map((part) => part.value).join("");
  const cents = split === -1 ? "" : parts.slice(split).map((part) => part.value).join("");
  return (
    <span className={cn("whitespace-nowrap tabular-nums", tone)}>
      {whole}
      <span className="text-body-xs-regular text-tertiary">{cents}</span>
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

export interface TagCellProps {
  label: React.ReactNode;
  /** One of the label palette colours. @default "grey" */
  color?: TagColor;
}

/** A coloured tag, e.g. a quarter, size or status; truncates in a narrow column. */
export function TagCell({ label, color = "grey" }: TagCellProps) {
  if (label == null || label === "") return <EmptyCell />;
  return <span className={cn("inline-block max-w-full truncate rounded-sm px-1.5 align-middle text-body-xs-medium", tagColorClass[color])}>{label}</span>;
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
        <QUI.TableCell><QUI.UserCell name="James Clarke" secondary="james@acme.com" /></QUI.TableCell>
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
        <QUI.TableCell><QUI.TextCell primary="Ranu Test 2" secondary="virtual" tone="link" /></QUI.TableCell>
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
</div>
DOC__ */

/* __PROPS
{
  "DateCell.format": ["short", "medium", "long", "datetime", "relative"],
  "DateCell.tone": ["default", "warning", "danger"],
  "MoneyCell.display": ["symbol", "code", "none"],
  "MoneyCell.minor": ["inline", "subdued", "hidden"],
  "MoneyCell.signed": "boolean",
  "NumberCell.format": ["decimal", "integer", "percent", "compact", "duration"],
  "ProgressCell.variant": ["auto", "brand", "success", "warning", "danger"],
  "TagCell.color": ["grey", "indigo", "purple", "pink", "crimson", "orange", "yellow", "emerald"],
  "TextCell.tone": ["default", "link"]
}
PROPS__ */
