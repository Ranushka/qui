import * as React from "react";
import { Bar, BarChart as RBarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
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

export interface BarChartProps extends ChartBaseProps {
  /** Rows to plot, one per category. */
  data: ReadonlyArray<ChartDatum>;
  /** Field on each row holding the category label. */
  categoryKey: string;
  /** Measures to plot; each gets the next palette slot in order. */
  series: ReadonlyArray<ChartSeries>;
  /** `vertical` bars rise from the x-axis; `horizontal` bars extend from the y-axis (good for long labels). @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Stack series into one bar per category instead of grouping them side by side. @default false */
  stacked?: boolean;
  /** Draw the value-axis gridlines. @default true */
  showGrid?: boolean;
  /** Width reserved for the value axis (or category axis when horizontal), in px. @default 40 (horizontal: 96) */
  axisWidth?: number;
}

/**
 * Grouped or stacked bars for comparing a magnitude across categories. Bars have 4px rounded data
 * ends (only the outermost segment when stacked), a 2px surface gap between neighbours, and a
 * per-category hover band with a tooltip.
 */
export function BarChart({
  data,
  categoryKey,
  series,
  orientation = "vertical",
  stacked = false,
  showGrid = true,
  showLegend,
  showTooltip = true,
  valueFormatter = defaultFormatter,
  axisWidth,
  height = 240,
  width,
  animate = true,
  
  "aria-label": ariaLabel,
}: BarChartProps) {
  const resolved = resolveSeries(series);
  const byKey = new Map(resolved.map((s) => [s.key, s]));
  const horizontal = orientation === "horizontal";
  const legendVisible = showLegend ?? resolved.length > 1;
  const end: [number, number, number, number] = horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];

  const valueAxis = {
    type: "number" as const,
    tick: axisTick,
    tickLine: false,
    axisLine: false,
    tickFormatter: (v: number) => valueFormatter(v),
  };
  const categoryAxis = {
    type: "category" as const,
    dataKey: categoryKey,
    tick: axisTick,
    tickLine: false,
    axisLine: { stroke: gridStroke },
    interval: "preserveStartEnd" as const,
  };

  return (
    <ChartFrame
      height={height}
      width={width}
      ariaLabel={ariaLabel}

      legend={legendVisible ? resolved.map((s) => ({ label: s.label, color: s.color })) : undefined}
    >
      <RBarChart
        data={data as ChartDatum[]}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        barGap={2}
        barCategoryGap="20%"
        {...(width != null ? { width, height } : {})}
      >
        {showGrid && <CartesianGrid stroke={gridStroke} vertical={horizontal} horizontal={!horizontal} />}
        {horizontal ? (
          <>
            <XAxis {...valueAxis} />
            <YAxis {...categoryAxis} width={axisWidth ?? 96} />
          </>
        ) : (
          <>
            <XAxis {...categoryAxis} />
            <YAxis {...valueAxis} width={axisWidth ?? 40} />
          </>
        )}
        {showTooltip && (
          <Tooltip
            cursor={{ fill: "var(--bg-layer-transparent-hover)" }}
            content={makeTooltipRenderer({ lookup: (e) => byKey.get(String(e.dataKey)), valueFormatter })}
          />
        )}
        {resolved.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            stackId={stacked ? "stack" : undefined}
            radius={!stacked || i === resolved.length - 1 ? end : 0}
            // Stacked segments get a surface-colored outline, which reads as a 2px gap between them.
            stroke={stacked ? "var(--qui-chart-surface)" : undefined}
            strokeWidth={stacked ? 2 : 0}
            maxBarSize={48}
            isAnimationActive={animate}
          />
        ))}
      </RBarChart>
    </ChartFrame>
  );
}
