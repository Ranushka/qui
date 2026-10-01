import * as React from "react";
import { Area, AreaChart as RAreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartCurve } from "./LineChart";
import {
  ChartFrame,
  axisTick,
  defaultFormatter,
  gridStroke,
  makeTooltipRenderer,
  resolveSeries,
  type ChartBaseProps,
  type ChartDatum,
  type ChartSeries,
} from "./shared";

export interface AreaChartProps extends ChartBaseProps {
  /** Rows to plot, in x order. */
  data: ReadonlyArray<ChartDatum>;
  /** Field on each row holding the x value. */
  categoryKey: string;
  /** Measures to plot; each gets the next palette slot in order. */
  series: ReadonlyArray<ChartSeries>;
  /** Stack areas to show a part-to-whole total over time. @default false */
  stacked?: boolean;
  /** Interpolation between points. @default "monotone" */
  curve?: ChartCurve;
  /** Draw horizontal gridlines. @default true */
  showGrid?: boolean;
  /** Width reserved for the value axis, in px. @default 40 */
  axisWidth?: number;
}

const curveType = { linear: "linear", monotone: "monotone", step: "stepAfter" } as const;

/**
 * Filled lines for volume over time. Each area is a 2px line over a translucent fill of the same
 * slot (more opaque when stacked, so bands read as solid parts of the whole).
 */
export function AreaChart({
  data,
  categoryKey,
  series,
  stacked = false,
  curve = "monotone",
  showGrid = true,
  showLegend,
  showTooltip = true,
  valueFormatter = defaultFormatter,
  axisWidth = 40,
  height = 240,
  width,
  animate = true,
  className,
  "aria-label": ariaLabel,
}: AreaChartProps) {
  const resolved = resolveSeries(series);
  const byKey = new Map(resolved.map((s) => [s.key, s]));
  const legendVisible = showLegend ?? resolved.length > 1;

  return (
    <ChartFrame
      height={height}
      width={width}
      ariaLabel={ariaLabel}
      className={className}
      legend={legendVisible ? resolved.map((s) => ({ label: s.label, color: s.color })) : undefined}
    >
      <RAreaChart data={data as ChartDatum[]} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} {...(width != null ? { width, height } : {})}>
        {showGrid && <CartesianGrid stroke={gridStroke} vertical={false} />}
        <XAxis dataKey={categoryKey} tick={axisTick} tickLine={false} axisLine={{ stroke: gridStroke }} interval="preserveStartEnd" />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={axisWidth} tickFormatter={(v: number) => valueFormatter(v)} />
        {showTooltip && (
          <Tooltip
            cursor={{ stroke: "var(--border-strong-1)", strokeWidth: 1 }}
            content={makeTooltipRenderer({ lookup: (e) => byKey.get(String(e.dataKey)), valueFormatter })}
          />
        )}
        {resolved.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            name={s.label}
            type={curveType[curve]}
            stackId={stacked ? "stack" : undefined}
            stroke={s.color}
            strokeWidth={2}
            fill={s.color}
            fillOpacity={stacked ? 0.35 : 0.12}
            activeDot={{ r: 5, fill: s.color, stroke: "var(--qui-chart-surface)", strokeWidth: 2 }}
            isAnimationActive={animate}
          />
        ))}
      </RAreaChart>
    </ChartFrame>
  );
}
