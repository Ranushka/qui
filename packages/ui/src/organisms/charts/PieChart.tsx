import * as React from "react";
import { Cell, Pie, PieChart as RPieChart, Tooltip } from "recharts";
import { ChartFrame, chartColor, defaultFormatter, makeTooltipRenderer, type ChartBaseProps, type ChartDatum } from "./shared";

export interface PieChartProps extends ChartBaseProps {
  /** One row per slice. Keep it to a handful; fold the long tail into an "Other" row. */
  data: ReadonlyArray<ChartDatum>;
  /** Field holding each slice's name. */
  nameKey: string;
  /** Field holding each slice's (non-negative) value. */
  valueKey: string;
  /** Per-slice color overrides, by slice name. Unlisted slices take palette slots in row order. */
  colors?: Readonly<Record<string, string>>;
  /** Inner radius as a fraction of the outer radius; `0` is a solid pie. @default 0 */
  innerRadius?: number;
  /** Content centred in the hole (donuts only), e.g. a total. */
  centerContent?: React.ReactNode;
}

/**
 * Part-to-whole for a few slices. Slices take palette slots in row order, separated by a 2px
 * surface-colored gap; the legend lists every slice.
 */
export function PieChart({
  data,
  nameKey,
  valueKey,
  colors,
  innerRadius = 0,
  centerContent,
  showLegend,
  showTooltip = true,
  valueFormatter = defaultFormatter,
  height = 240,
  width,
  animate = true,
  className,
  "aria-label": ariaLabel,
}: PieChartProps) {
  const slices = data.map((row, i) => {
    const name = String(row[nameKey] ?? "");
    return { name, color: colors?.[name] ?? chartColor(i) };
  });
  const byName = new Map(slices.map((s) => [s.name, { label: s.name, color: s.color }]));
  const legendVisible = showLegend ?? slices.length > 1;
  const inner = Math.min(Math.max(innerRadius, 0), 0.95);

  return (
    <ChartFrame
      height={height}
      width={width}
      ariaLabel={ariaLabel}
      className={className}
      legend={legendVisible ? slices.map((s) => ({ label: s.name, color: s.color })) : undefined}
      overlay={inner > 0 ? centerContent : undefined}
    >
      <RPieChart {...(width != null ? { width, height } : {})}>
        {showTooltip && (
          <Tooltip content={makeTooltipRenderer({ lookup: (e) => byName.get(String(e.name)), valueFormatter, hideLabel: true })} />
        )}
        <Pie
          data={data as ChartDatum[]}
          dataKey={valueKey}
          nameKey={nameKey}
          outerRadius="90%"
          innerRadius={`${Math.round(inner * 90)}%`}
          stroke="var(--qui-chart-surface)"
          strokeWidth={2}
          isAnimationActive={animate}
        >
          {slices.map((s) => (
            <Cell key={s.name} fill={s.color} />
          ))}
        </Pie>
      </RPieChart>
    </ChartFrame>
  );
}

export interface DonutChartProps extends Omit<PieChartProps, "innerRadius"> {
  /** Inner radius as a fraction of the outer radius. @default 0.65 */
  innerRadius?: number;
}

/** A `PieChart` with a hole — easier to compare arcs, and room for a total via `centerContent`. */
export function DonutChart({ innerRadius = 0.65, ...props }: DonutChartProps) {
  return <PieChart innerRadius={innerRadius} {...props} />;
}
