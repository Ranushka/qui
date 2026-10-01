import * as React from "react";
import { ResponsiveContainer, type TooltipContentProps } from "recharts";
import { cn } from "../../lib/cn";
import type { NoClass } from "../../lib/no-class";

/**
 * Categorical palette, as CSS custom properties set on every chart root.
 *
 * Eight fixed slots drawn from the `--extended-color-*` token ramps, assigned in this order and
 * never cycled. Light and dark modes each pick their own step from the same ramps (not an
 * automatic flip) so every slot sits in a mid-lightness band with ≥3:1 contrast against the
 * surface, and adjacent slots stay distinguishable under protan/deutan simulation.
 *
 * Validated (OKLab ΔE, Machado 2009 CVD sim): light worst adjacent CVD ΔE 9.7, dark 10.8;
 * all slots ≥3:1 vs `--bg-surface-1` in both modes.
 *
 * Classes are spelled out in full so Tailwind's source scan picks them up.
 */
const chartPaletteClasses = cn(
  "[--qui-chart-1:var(--extended-color-indigo-500)] dark:[--qui-chart-1:var(--extended-color-indigo-400)]",
  "[--qui-chart-2:var(--extended-color-orange-600)] dark:[--qui-chart-2:var(--extended-color-orange-600)]",
  "[--qui-chart-3:var(--extended-color-purple-400)] dark:[--qui-chart-3:var(--extended-color-purple-400)]",
  "[--qui-chart-4:var(--extended-color-emerald-700)] dark:[--qui-chart-4:var(--extended-color-emerald-600)]",
  "[--qui-chart-5:var(--extended-color-pink-500)] dark:[--qui-chart-5:var(--extended-color-pink-500)]",
  "[--qui-chart-6:var(--extended-color-yellow-800)] dark:[--qui-chart-6:var(--extended-color-yellow-800)]",
  "[--qui-chart-7:var(--extended-color-indigo-400)] dark:[--qui-chart-7:var(--extended-color-indigo-500)]",
  "[--qui-chart-8:var(--extended-color-crimson-500)] dark:[--qui-chart-8:var(--extended-color-crimson-400)]",
  // Neutral for an "Other" bucket; never a categorical slot.
  "[--qui-chart-other:var(--extended-color-grey-600)]",
  // The surface the chart sits on — used for the 2px gaps between adjacent fills and the ring on
  // active dots. Override on a chart's `className` when it sits on a different layer.
  "[--qui-chart-surface:var(--bg-surface-1)]"
);

/** Number of categorical palette slots. Past this, fold extra series into "Other" or facet. */
export const CHART_PALETTE_SIZE = 8;

/**
 * The CSS color for categorical slot `index` (0-based), e.g. `var(--qui-chart-1)`. Indexes past
 * the palette size fall back to the neutral "Other" color rather than cycling hues.
 */
export function chartColor(index: number): string {
  return index >= 0 && index < CHART_PALETTE_SIZE ? `var(--qui-chart-${index + 1})` : "var(--qui-chart-other)";
}

/** One plotted measure of a cartesian chart. */
export interface ChartSeries {
  /** Field on each data row holding this series' value. */
  key: string;
  /** Human-readable name for legend and tooltip. Defaults to `key`. */
  label?: string;
  /** Overrides the palette slot. Pass a token reference, e.g. `"var(--bg-success-primary)"`. */
  color?: string;
}

/** A data row: one category (x value) with a field per series. */
export type ChartDatum = Record<string, unknown>;

/** Formats a numeric value for the tooltip and axis. */
export type ChartValueFormatter = (value: number) => string;

export interface ResolvedSeries {
  key: string;
  label: string;
  color: string;
}

/** Fixes each series' label and color by its position in `series` — color follows the entity, never its rank. */
export function resolveSeries(series: ReadonlyArray<ChartSeries>): ResolvedSeries[] {
  return series.map((s, i) => ({ key: s.key, label: s.label ?? s.key, color: s.color ?? chartColor(i) }));
}

const defaultFormatter: ChartValueFormatter = (v) => v.toLocaleString();

/* ---------------------------------------------------------------------------------------------- */
/* Tooltip                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

export interface ChartTooltipItem {
  /** Series or slice name. */
  name: React.ReactNode;
  /** Already-formatted value. */
  value: React.ReactNode;
  /** Swatch color (CSS). */
  color: string;
}

export interface ChartTooltipContentProps extends NoClass<React.ComponentPropsWithoutRef<"div">> {
  /** Heading, usually the hovered category. */
  label?: React.ReactNode;
  /** One row per series. */
  items: ReadonlyArray<ChartTooltipItem>;
}

/**
 * The hover card every qui chart shows: a heading plus one swatch/name/value row per series.
 * Text wears text tokens; only the swatch carries the series color. Exported so custom recharts
 * compositions can match.
 */
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ label, items, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-w-32 flex-col gap-1.5 rounded-lg border-sm border-subtle-1 bg-layer-2 px-3 py-2 shadow-overlay-200"
      )}
      {...props}
    >
      {label != null && label !== "" && <p className="text-caption-md-medium text-primary">{label}</p>}
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-caption-md-regular">
            <span aria-hidden className="size-2 shrink-0 rounded-xs" style={{ background: item.color }} />
            <span className="flex-1 text-secondary">{item.name}</span>
            <span className="font-medium text-primary tabular-nums">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
);
ChartTooltipContent.displayName = "ChartTooltipContent";

/** Adapts recharts' tooltip payload to `ChartTooltipContent`, resolving names/colors from qui's own series list. */
export function makeTooltipRenderer(options: {
  lookup: (entry: { dataKey?: unknown; name?: unknown; color?: string; fill?: string; payload?: unknown }) => { label: string; color: string } | undefined;
  valueFormatter: ChartValueFormatter;
  labelFormatter?: (label: React.ReactNode) => React.ReactNode;
  hideLabel?: boolean;
}) {
  // Named so React DevTools shows something useful; recharts calls it as a render function.
  return function QuiChartTooltip(props: TooltipContentProps) {
    const { active, payload, label } = props;
    if (!active || !payload || payload.length === 0) return null;
    const items: ChartTooltipItem[] = [];
    for (const entry of payload) {
      if (entry.value == null) continue;
      const meta = options.lookup(entry);
      const raw = Array.isArray(entry.value) ? entry.value[entry.value.length - 1] : entry.value;
      const num = typeof raw === "number" ? raw : Number(raw);
      items.push({
        name: meta?.label ?? String(entry.name ?? entry.dataKey ?? ""),
        value: Number.isFinite(num) ? options.valueFormatter(num) : String(raw),
        color: meta?.color ?? entry.color ?? "var(--qui-chart-other)",
      });
    }
    const heading = options.hideLabel ? null : options.labelFormatter ? options.labelFormatter(label) : label;
    return <ChartTooltipContent label={heading} items={items} />;
  };
}

/* ---------------------------------------------------------------------------------------------- */
/* Legend                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

export interface ChartLegendItem {
  label: React.ReactNode;
  color: string;
}

export interface ChartLegendProps extends NoClass<React.ComponentPropsWithoutRef<"ul">> {
  items: ReadonlyArray<ChartLegendItem>;
}

/** A row of swatch + label pairs. Plain HTML (not SVG) so it wraps and inherits text tokens. */
export const ChartLegend = React.forwardRef<HTMLUListElement, ChartLegendProps>(({ items, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-wrap items-center gap-x-4 gap-y-1")} {...props}>
    {items.map((item, i) => (
      <li key={i} className="flex items-center gap-1.5 text-caption-md-regular text-secondary">
        <span aria-hidden className="size-2 shrink-0 rounded-xs" style={{ background: item.color }} />
        {item.label}
      </li>
    ))}
  </ul>
));
ChartLegend.displayName = "ChartLegend";

/* ---------------------------------------------------------------------------------------------- */
/* Frame                                                                                          */
/* ---------------------------------------------------------------------------------------------- */

/** Props every qui chart shares. */
export interface ChartBaseProps {
  /** Plot height in px. @default 240 */
  height?: number;
  /** Fixed plot width in px. Omit to fill the parent's width (via `ResponsiveContainer`). */
  width?: number;
  /** Shows the legend. @default true when there are 2+ series/slices */
  showLegend?: boolean;
  /** Shows the hover tooltip. @default true */
  showTooltip?: boolean;
  /** Formats values in the tooltip (and the value axis on cartesian charts). @default toLocaleString */
  valueFormatter?: ChartValueFormatter;
  /** Accessible name for the chart image. Strongly recommended. */
  "aria-label"?: string;
  /** Animate marks on mount/update. @default true */
  animate?: boolean;
}

interface ChartFrameProps {
  height: number;
  width?: number;
  legend?: ReadonlyArray<ChartLegendItem>;
  ariaLabel?: string;
  /** Overlay rendered centred over the plot (donut centre label). */
  overlay?: React.ReactNode;
  children: React.ReactElement;
}

/** Shared chrome: palette vars, legend row above the plot, and the responsive sizing wrapper. */
export function ChartFrame({ height, width, legend, ariaLabel, overlay, children }: ChartFrameProps) {
  return (
    <div
      role="figure"
      aria-label={ariaLabel}
      className={cn("flex w-full min-w-0 flex-col gap-3 text-caption-md-regular text-tertiary", chartPaletteClasses)}
    >
      {legend && legend.length > 0 && <ChartLegend items={legend} />}
      <div className="relative w-full min-w-0" style={{ height, width }}>
        {width != null ? (
          children
        ) : (
          <ResponsiveContainer width="100%" height={height} minWidth={0}>
            {children}
          </ResponsiveContainer>
        )}
        {overlay != null && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{overlay}</div>
        )}
      </div>
    </div>
  );
}

/** Recessive axis/grid styling shared by cartesian charts. */
export const axisTick = { fill: "var(--txt-tertiary)", fontSize: 11 } as const;
export const gridStroke = "var(--border-subtle)";

export { defaultFormatter };
