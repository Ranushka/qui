import * as React from "react";
import { CartesianGrid, Line, LineChart as RLineChart, Tooltip, XAxis, YAxis } from "recharts";
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

/** Interpolation between points. */
export type ChartCurve = "linear" | "monotone" | "step";

export interface LineChartProps extends ChartBaseProps {
  /** Rows to plot, in x order. */
  data: ReadonlyArray<ChartDatum>;
  /** Field on each row holding the x value (usually a date or period label). */
  categoryKey: string;
  /** Measures to plot; each gets the next palette slot in order. */
  series: ReadonlyArray<ChartSeries>;
  /** Interpolation between points. @default "monotone" */
  curve?: ChartCurve;
  /** Draw a marker on every point (otherwise only the hovered one). @default false */
  showDots?: boolean;
  /** Draw horizontal gridlines. @default true */
  showGrid?: boolean;
  /** Width reserved for the value axis, in px. @default 40 */
  axisWidth?: number;
}

const curveType = { linear: "linear", monotone: "monotone", step: "stepAfter" } as const;

/** Lines for change over time. 2px strokes; a crosshair + tooltip tracks the hovered x value. */
export function LineChart({
  data,
  categoryKey,
  series,
  curve = "monotone",
  showDots = false,
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
}: LineChartProps) {
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
      <RLineChart data={data as ChartDatum[]} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} {...(width != null ? { width, height } : {})}>
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
          <Line
            key={s.key}
            dataKey={s.key}
            name={s.label}
            type={curveType[curve]}
            stroke={s.color}
            strokeWidth={2}
            dot={showDots ? { r: 3, fill: s.color, stroke: "var(--qui-chart-surface)", strokeWidth: 2 } : false}
            activeDot={{ r: 5, fill: s.color, stroke: "var(--qui-chart-surface)", strokeWidth: 2 }}
            isAnimationActive={animate}
          />
        ))}
      </RLineChart>
    </ChartFrame>
  );
}
