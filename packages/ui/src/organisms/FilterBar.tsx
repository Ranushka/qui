import * as React from "react";
import { ListFilter } from "lucide-react";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Icon } from "../atoms/Icon";
import { Input } from "../atoms/Input";
import { Pill } from "../atoms/Pill";
import { RadioGroup, RadioOption } from "../atoms/RadioGroup";
import { FilterChip } from "../molecules/FilterChip";
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuTrigger } from "../molecules/Menu";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../molecules/Popover";
import { Calendar } from "./Calendar";

/* ── Fields and values ─────────────────────────────────────────────────────────────────────────── */

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterFieldBase {
  /** Stable id, also the URL parameter name. */
  key: string;
  label: string;
  icon?: React.ReactNode;
}

/** Pick any of a list of values. `get` may return several values for a row (e.g. its approvers); any match counts. */
export interface FilterSelectField<Row> extends FilterFieldBase {
  kind: "select";
  options: readonly FilterOption[];
  get: (row: Row) => string | readonly string[] | null | undefined;
}

/** Compare a number: more than, less than, or between. */
export interface FilterNumberField<Row> extends FilterFieldBase {
  kind: "number";
  get: (row: Row) => number | null | undefined;
  /** Formats a bound in the chip, e.g. as money. @default en-US grouping */
  format?: (value: number) => string;
  /** Unit shown inside the inputs, e.g. `"AED"` or `"%"`. */
  unit?: string;
}

/** A date preset (today, last N days) or a custom range. */
export interface FilterDateField<Row> extends FilterFieldBase {
  kind: "date";
  get: (row: Row) => string | Date | null | undefined;
}

export type FilterField<Row> = FilterSelectField<Row> | FilterNumberField<Row> | FilterDateField<Row>;

export type FilterNumberValue = { op: "gt" | "lt" | "between"; min?: number; max?: number };
export type FilterDatePreset = "today" | "7d" | "30d" | "90d" | "custom";
/** `from`/`to` are `yyyy-mm-dd` days, used by the `custom` preset. */
export type FilterDateValue = { preset: FilterDatePreset; from?: string; to?: string };
export type FilterValue = readonly string[] | FilterNumberValue | FilterDateValue;
/** Applied filters by field `key`. Only applied filters are kept; key order is the order they were added in. */
export type FilterState = Readonly<Record<string, FilterValue>>;

const datePresets: { value: FilterDatePreset; label: string; days?: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "custom", label: "Custom range" },
];

const numberOps: { value: FilterNumberValue["op"]; label: string }[] = [
  { value: "gt", label: "More than" },
  { value: "lt", label: "Less than" },
  { value: "between", label: "Between" },
];

const grouping = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const shortDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

const toDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y!, m! - 1, d);
};

/** Whether a stored value actually filters anything — an editor can hold a half-filled one. */
export function isFilterApplied(field: FilterField<never>, value: FilterValue | undefined): boolean {
  if (!value) return false;
  if (field.kind === "select") return (value as readonly string[]).length > 0;
  if (field.kind === "number") {
    const v = value as FilterNumberValue;
    return v.op === "gt" ? v.min != null : v.op === "lt" ? v.max != null : v.min != null || v.max != null;
  }
  const v = value as FilterDateValue;
  return v.preset !== "custom" || v.from != null;
}

/** The `[start, end)` window a date filter keeps, in local time. */
function dateWindow(value: FilterDateValue, now: Date): [Date, Date] {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (value.preset === "custom") {
    const start = fromDay(value.from!);
    const last = fromDay(value.to ?? value.from!);
    return [start, new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)];
  }
  const days = datePresets.find((p) => p.value === value.preset)!.days!;
  return [new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() - days), tomorrow];
}

function matches<Row>(field: FilterField<Row>, value: FilterValue, row: Row, now: Date) {
  if (field.kind === "select") {
    const got = field.get(row);
    const values = got == null ? [] : typeof got === "string" ? [got] : got;
    return values.some((v) => (value as readonly string[]).includes(v));
  }
  if (field.kind === "number") {
    const n = field.get(row);
    const { op, min, max } = value as FilterNumberValue;
    if (n == null) return false;
    if (op === "gt") return n > min!;
    if (op === "lt") return n < max!;
    return (min == null || n >= min) && (max == null || n <= max);
  }
  const got = field.get(row);
  if (got == null) return false;
  const time = new Date(got).getTime();
  const [start, end] = dateWindow(value as FilterDateValue, now);
  return time >= start.getTime() && time < end.getTime();
}

/**
 * The rows every applied filter keeps. `except` skips one field — how a field's own option counts are worked out
 * (faceting), so ticking "Active" doesn't zero out the other statuses.
 */
export function filterRows<Row>(
  rows: readonly Row[],
  fields: readonly FilterField<Row>[],
  state: FilterState,
  options: { now?: Date; except?: string } = {}
): Row[] {
  const now = options.now ?? new Date();
  const active = fields.filter((f) => f.key !== options.except && isFilterApplied(f as FilterField<never>, state[f.key]));
  if (active.length === 0) return [...rows];
  return rows.filter((row) => active.every((f) => matches(f, state[f.key]!, row, now)));
}

/** The applied value in words, as its chip shows it: `Active, Frozen +2`, `> 5,000`, `Last 7 days`. */
export function describeFilter(field: FilterField<never>, value: FilterValue): string {
  if (field.kind === "select") {
    const labels = (value as readonly string[]).map((v) => field.options.find((o) => o.value === v)?.label ?? v);
    return labels.length > 2 ? `${labels.slice(0, 2).join(", ")} +${labels.length - 2}` : labels.join(", ");
  }
  if (field.kind === "number") {
    const format = field.format ?? ((n: number) => grouping.format(n));
    const { op, min, max } = value as FilterNumberValue;
    if (op === "gt") return `> ${format(min!)}`;
    if (op === "lt") return `< ${format(max!)}`;
    if (min != null && max != null) return `${format(min)} – ${format(max)}`;
    return min != null ? `≥ ${format(min)}` : `≤ ${format(max!)}`;
  }
  const v = value as FilterDateValue;
  if (v.preset !== "custom") return datePresets.find((p) => p.value === v.preset)!.label;
  const from = shortDay.format(fromDay(v.from!));
  return v.to && v.to !== v.from ? `${from} – ${shortDay.format(fromDay(v.to))}` : from;
}

/* ── URL round-trip ────────────────────────────────────────────────────────────────────────────── */

/**
 * Writes applied filters as URL parameters, one per field: `status=Active,Frozen`, `amount=gt:5000`,
 * `updated=7d` or `updated=2026-10-01..2026-10-15`. Pair with `filtersFromParams` so a filtered view can be shared.
 */
export function filtersToParams<Row>(fields: readonly FilterField<Row>[], state: FilterState, params = new URLSearchParams()): URLSearchParams {
  for (const field of fields) {
    params.delete(field.key);
    const value = state[field.key];
    if (!isFilterApplied(field as FilterField<never>, value)) continue;
    if (field.kind === "select") params.set(field.key, (value as readonly string[]).join(","));
    else if (field.kind === "number") {
      const { op, min, max } = value as FilterNumberValue;
      params.set(field.key, op === "between" ? `${min ?? ""}..${max ?? ""}` : `${op}:${op === "gt" ? min : max}`);
    } else {
      const { preset, from, to } = value as FilterDateValue;
      params.set(field.key, preset === "custom" ? `${from}..${to ?? from}` : preset);
    }
  }
  return params;
}

/** Reads what `filtersToParams` wrote, ignoring anything it can't parse. */
export function filtersFromParams<Row>(fields: readonly FilterField<Row>[], params: URLSearchParams): FilterState {
  const state: Record<string, FilterValue> = {};
  const num = (s: string | undefined) => (s == null || s === "" || Number.isNaN(Number(s)) ? undefined : Number(s));
  for (const field of fields) {
    const raw = params.get(field.key);
    if (raw == null || raw === "") continue;
    let value: FilterValue;
    if (field.kind === "select") value = raw.split(",").filter((v) => field.options.some((o) => o.value === v));
    else if (field.kind === "number") {
      if (raw.includes("..")) {
        const [min, max] = raw.split("..");
        value = { op: "between", min: num(min), max: num(max) };
      } else {
        const [op, n] = raw.split(":");
        value = op === "lt" ? { op: "lt", max: num(n) } : { op: "gt", min: num(n) };
      }
    } else if (raw.includes("..")) {
      const [from, to] = raw.split("..");
      value = { preset: "custom", from, to };
    } else if (datePresets.some((p) => p.value === raw && p.value !== "custom")) value = { preset: raw as FilterDatePreset };
    else continue;
    if (isFilterApplied(field as FilterField<never>, value)) state[field.key] = value;
  }
  return state;
}

/* ── Editors ───────────────────────────────────────────────────────────────────────────────────── */

const editorRowClass =
  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-body-xs-regular text-primary transition-colors hover:bg-layer-transparent-hover [--node-size:var(--control-glyph-md)]";

function SelectEditor({
  field,
  value,
  onChange,
  counts,
}: {
  field: FilterSelectField<unknown>;
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
  counts?: Map<string, number>;
}) {
  const [query, setQuery] = React.useState("");
  const id = React.useId();
  const q = query.trim().toLowerCase();
  const options = q ? field.options.filter((o) => o.label.toLowerCase().includes(q)) : field.options;
  return (
    <>
      {field.options.length > 6 ? (
        <Input aria-label={`Search ${field.label}`} placeholder="Search…" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} />
      ) : null}
      <div role="group" aria-label={field.label} className="-mx-2 flex max-h-64 flex-col overflow-y-auto overscroll-contain">
        {options.map((option, i) => (
          <label key={option.value} htmlFor={`${id}-${i}`} className={editorRowClass}>
            <Checkbox
              id={`${id}-${i}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => onChange(checked ? [...value, option.value] : value.filter((v) => v !== option.value))}
            />
            {option.icon}
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            {counts ? <span className="text-caption-md-regular tabular-nums text-tertiary">{grouping.format(counts.get(option.value) ?? 0)}</span> : null}
          </label>
        ))}
        {options.length === 0 ? <p className="px-2 py-1.5 text-body-xs-regular text-tertiary">No matches</p> : null}
      </div>
    </>
  );
}

function NumberEditor({
  field,
  value,
  onChange,
}: {
  field: FilterNumberField<unknown>;
  value: FilterNumberValue | undefined;
  onChange: (next: FilterNumberValue) => void;
}) {
  const current = value ?? { op: "gt" as const };
  const parse = (s: string) => {
    const n = Number(s.replace(/,/g, ""));
    return s.trim() === "" || Number.isNaN(n) ? undefined : n;
  };
  const unit = field.unit ? <span className="text-caption-md-regular text-tertiary">{field.unit}</span> : null;
  const bound = (which: "min" | "max", label: string, autoFocus?: boolean) => (
    <Input
      aria-label={label}
      inputMode="decimal"
      placeholder={which === "min" ? "Min" : "Max"}
      autoFocus={autoFocus}
      value={current[which] ?? ""}
      onChange={(e) => onChange({ ...current, [which]: parse(e.target.value) })}
      endSlot={unit}
    />
  );
  return (
    <>
      <RadioGroup
        orientation="horizontal"
        density="compact"
        aria-label="Comparison"
        value={current.op}
        onValueChange={(op) => onChange({ ...current, op: op as FilterNumberValue["op"] })}
      >
        {numberOps.map((op) => (
          <RadioOption key={op.value} value={op.value} label={op.label} />
        ))}
      </RadioGroup>
      <div className="flex items-center gap-2">
        {current.op !== "lt" ? bound("min", current.op === "between" ? `${field.label} from` : `${field.label} more than`, true) : null}
        {current.op === "between" ? <span className="text-tertiary">–</span> : null}
        {current.op !== "gt" ? bound("max", current.op === "between" ? `${field.label} to` : `${field.label} less than`, current.op === "lt") : null}
      </div>
    </>
  );
}

function DateEditor({
  field,
  value,
  onChange,
  now,
}: {
  field: FilterDateField<unknown>;
  value: FilterDateValue | undefined;
  onChange: (next: FilterDateValue) => void;
  now: Date;
}) {
  const range = value?.preset === "custom" && value.from ? { from: fromDay(value.from), to: value.to ? fromDay(value.to) : undefined } : undefined;
  return (
    <>
      <RadioGroup
        density="compact"
        aria-label={field.label}
        value={value?.preset ?? null}
        onValueChange={(preset) =>
          onChange(preset === "custom" ? { preset: "custom", from: value?.from, to: value?.to } : { preset: preset as FilterDatePreset })
        }
      >
        {datePresets.map((preset) => (
          <RadioOption key={preset.value} value={preset.value} label={preset.label} />
        ))}
      </RadioGroup>
      {value?.preset === "custom" ? (
        <Calendar
          mode="range"
          defaultMonth={range?.from ?? now}
          disabled={{ after: now }}
          selected={range}
          onSelect={(next) => onChange({ preset: "custom", from: next?.from ? toDay(next.from) : undefined, to: next?.to ? toDay(next.to) : undefined })}
        />
      ) : null}
    </>
  );
}

/* ── Bar ───────────────────────────────────────────────────────────────────────────────────────── */

export interface FilterBarProps<Row> {
  /** Every filterable field. */
  fields: readonly FilterField<Row>[];
  /** Applied filters, by field key. Leave out to let the bar keep them itself, seeded from `defaultValue`. */
  value?: FilterState;
  defaultValue?: FilterState;
  onValueChange?: (next: FilterState) => void;
  /** Keys of the fields always on show — the two or three most used. The rest wait in "More filters". @default the first three */
  pinned?: readonly string[];
  /** The unfiltered rows. When given, each option in a list shows how many rows it would match. */
  rows?: readonly Row[];
  /** "Today" for date presets. @default the current time */
  now?: Date;
  /** Content before the filters, typically the search input. It stretches to fill the row on phones. */
  search?: React.ReactNode;
  /** Controls at the end of the row — saved views, columns, refresh. */
  actions?: React.ReactNode;
  /** @default "More filters" */
  moreLabel?: string;
}

/**
 * A table's filters in one row: the search box, the two or three filters people reach for most — always on show, as
 * outline pills — a "More filters" menu with the rest, and "Clear all". Setting a filter turns its pill into a chip
 * that says what it keeps (`Status: Active, Frozen ✕`); a field picked from "More filters" joins the row as a chip and
 * opens its editor at once. Lists get checkboxes with counts, numbers more than / less than / between, and dates
 * presets or a custom range. Controlled: pair with `filterRows` for the rows and `filtersToParams` for the URL.
 */
export function FilterBar<Row>({
  fields,
  value: controlled,
  defaultValue,
  onValueChange: notify,
  pinned,
  rows,
  now,
  search,
  actions,
  moreLabel = "More filters",
}: FilterBarProps<Row>) {
  const [uncontrolled, setUncontrolled] = React.useState<FilterState>(defaultValue ?? {});
  const value = controlled ?? uncontrolled;
  const onValueChange = (next: FilterState) => {
    if (controlled === undefined) setUncontrolled(next);
    notify?.(next);
  };
  const pinnedKeys = pinned ?? fields.slice(0, 3).map((f) => f.key);
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  /** A field picked from "More filters" that has no value yet — on show while its editor is open. */
  const [draftKey, setDraftKey] = React.useState<string | null>(null);
  const pendingOpen = React.useRef<string | null>(null);
  const today = now ?? new Date();
  const scroller = React.useRef<HTMLDivElement>(null);

  // Fade whichever edge has chips scrolled past it, so a clipped chip reads as "more this way".
  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      el.toggleAttribute("data-fade-start", el.scrollLeft > 1);
      el.toggleAttribute("data-fade-end", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(el);
    for (const child of el.children) observer?.observe(child);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer?.disconnect();
      el.removeEventListener("scroll", update);
    };
  });

  // Bring the chip whose editor opens into view, e.g. one just added at the scrolled-off end of the row.
  React.useEffect(() => {
    if (openKey) scroller.current?.querySelector(`[data-filter-key="${CSS.escape(openKey)}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [openKey]);

  const applied = (field: FilterField<Row>) => isFilterApplied(field as FilterField<never>, value[field.key]);
  const byKey = new Map(fields.map((f) => [f.key, f]));
  const shownKeys = [...pinnedKeys, ...Object.keys(value).filter((k) => !pinnedKeys.includes(k) && byKey.has(k))];
  if (draftKey && !shownKeys.includes(draftKey)) shownKeys.push(draftKey);
  const shown = shownKeys.map((k) => byKey.get(k)).filter((f): f is FilterField<Row> => f != null);
  const hidden = fields.filter((f) => !shownKeys.includes(f.key));
  const anyApplied = fields.some(applied);

  const set = (key: string, next: FilterValue | undefined) => {
    const field = byKey.get(key)!;
    const rest = { ...value };
    if (next !== undefined && (isFilterApplied(field as FilterField<never>, next) || openKey === key)) rest[key] = next;
    else delete rest[key];
    onValueChange(rest);
  };

  /** Closing an editor drops what it left half-filled, and the draft chip with it. */
  const close = (key: string) => {
    setOpenKey((k) => (k === key ? null : k));
    if (draftKey === key) setDraftKey(null);
    const field = byKey.get(key);
    if (field && value[key] !== undefined && !applied(field)) {
      const rest = { ...value };
      delete rest[key];
      onValueChange(rest);
    }
  };

  const counts = (field: FilterSelectField<Row>) => {
    if (!rows) return undefined;
    const tally = new Map<string, number>();
    for (const row of filterRows(rows, fields, value, { now: today, except: field.key })) {
      const got = field.get(row);
      for (const v of got == null ? [] : typeof got === "string" ? [got] : got) tally.set(v, (tally.get(v) ?? 0) + 1);
    }
    return tally;
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 max-sm:flex-wrap">
      {search ? <div className="min-w-0 shrink-0 max-sm:flex-1 max-sm:*:w-full">{search}</div> : null}
      {/* Always one line: chips that don't fit scroll sideways while "More filters" and "Clear all" stay in view. On
          phones the filters take a row of their own under the search. */}
      <div role="group" aria-label="Filters" className="flex min-w-0 flex-1 items-center gap-2 max-sm:order-last max-sm:basis-full">
        <div ref={scroller} className="-my-1 flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain py-1 [scrollbar-width:none] [--fade-end:black] [--fade-start:black] data-fade-end:[--fade-end:transparent] data-fade-start:[--fade-start:transparent] [mask-image:linear-gradient(to_right,var(--fade-start),black_2rem,black_calc(100%-2rem),var(--fade-end))]">
          {shown.map((field) => {
            const current = value[field.key];
            const isApplied = applied(field);
            return (
              <Popover key={field.key} open={openKey === field.key} onOpenChange={(open) => (open ? setOpenKey(field.key) : close(field.key))}>
                <PopoverTrigger
                  render={
                    <FilterChip
                      data-filter-key={field.key}
                      label={field.label}
                      icon={field.icon}
                      value={isApplied ? describeFilter(field as FilterField<never>, current!) : undefined}
                      onRemove={() => {
                        if (draftKey === field.key) setDraftKey(null);
                        set(field.key, undefined);
                      }}
                    />
                  }
                />
                <PopoverContent align="start">
                  <div className="flex items-center justify-between gap-4">
                    <PopoverTitle>{field.label}</PopoverTitle>
                    {current !== undefined ? <Button variant="ghost" size="xs" label="Clear" onClick={() => set(field.key, undefined)} /> : null}
                  </div>
                  {field.kind === "select" ? (
                    <SelectEditor
                      field={field as FilterSelectField<unknown>}
                      value={(current as readonly string[] | undefined) ?? []}
                      onChange={(next) => set(field.key, next)}
                      counts={counts(field)}
                    />
                  ) : field.kind === "number" ? (
                    <NumberEditor
                      field={field as FilterNumberField<unknown>}
                      value={current as FilterNumberValue | undefined}
                      onChange={(next) => set(field.key, next)}
                    />
                  ) : (
                    <DateEditor
                      field={field as FilterDateField<unknown>}
                      value={current as FilterDateValue | undefined}
                      onChange={(next) => set(field.key, next)}
                      now={today}
                    />
                  )}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
        {hidden.length > 0 ? (
          <Menu
            onOpenChangeComplete={(open) => {
              // Open the picked field's editor only once the menu has finished closing and handed focus back.
              if (!open && pendingOpen.current) {
                setOpenKey(pendingOpen.current);
                pendingOpen.current = null;
              }
            }}
          >
            <MenuTrigger render={<Pill variant="ghost" label={moreLabel} startIcon={<Icon icon={ListFilter} />} />} />
            <MenuContent align="start">
              <MenuGroup>
                <MenuGroupLabel>Add a filter</MenuGroupLabel>
                {hidden.map((field) => (
                  <MenuItem
                    key={field.key}
                    icon={field.icon}
                    onClick={() => {
                      setDraftKey(field.key);
                      pendingOpen.current = field.key;
                    }}
                  >
                    {field.label}
                  </MenuItem>
                ))}
              </MenuGroup>
            </MenuContent>
          </Menu>
        ) : null}
        {anyApplied ? (
          <Button
            variant="ghost"
            label="Clear all"
            onClick={() => {
              setDraftKey(null);
              onValueChange({});
            }}
          />
        ) : null}
      </div>
      {actions ? <div className="ms-auto flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}

/* __DOC_BLOCK
<div className="p-4">
  <QUI.FilterBar
    rows={[
      { status: "Active", owner: "Aisha", amount: 1200, created: "2026-10-12" },
      { status: "Frozen", owner: "Raul", amount: 8400, created: "2026-09-28" },
      { status: "Active", owner: "Raul", amount: 310, created: "2026-08-03" },
    ]}
    fields={[
      { key: "status", label: "Status", kind: "select" as const, options: ["Active", "Frozen", "Closed"].map((s) => ({ value: s, label: s })), get: (r) => r.status },
      { key: "owner", label: "Owner", kind: "select" as const, options: ["Aisha", "Raul"].map((s) => ({ value: s, label: s })), get: (r) => r.owner },
      { key: "amount", label: "Amount", kind: "number" as const, unit: "AED", get: (r) => r.amount },
      { key: "created", label: "Created", kind: "date" as const, get: (r) => r.created },
    ]}
    pinned={["status", "owner"]}
    defaultValue={{ status: ["Active"] }}
    search={<QUI.Box width="2xs"><QUI.Input aria-label="Search" placeholder="Search…" startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} /></QUI.Box>}
  />
</div>
DOC__ */

/* __PROPS
{ "moreLabel": ["More filters", "Filters"] }
PROPS__ */
