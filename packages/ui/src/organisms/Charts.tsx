/**
 * Charts — `BarChart`, `LineChart`, `AreaChart`, `PieChart`/`DonutChart`, built on recharts and
 * styled entirely from qui tokens: an eight-slot categorical palette from the `--extended-color-*`
 * ramps (separate, validated steps for light and dark), recessive grid/axes in border/text tokens,
 * and a shared `ChartTooltipContent` / `ChartLegend` in overlay chrome.
 *
 * Every chart fills its parent's width unless given a fixed `width`, and sizes its plot by
 * `height`. Series colors follow their position in the `series` prop, never their rank, so a
 * filter that removes a series doesn't repaint the rest. Use one value axis per chart — plot two
 * measures of different scale as two charts.
 */
export { BarChart, type BarChartProps } from "./charts/BarChart";
export { LineChart, type LineChartProps, type ChartCurve } from "./charts/LineChart";
export { AreaChart, type AreaChartProps } from "./charts/AreaChart";
export { PieChart, DonutChart, type PieChartProps, type DonutChartProps } from "./charts/PieChart";
export {
  ChartTooltipContent,
  ChartLegend,
  chartColor,
  CHART_PALETTE_SIZE,
  type ChartTooltipContentProps,
  type ChartTooltipItem,
  type ChartLegendProps,
  type ChartLegendItem,
  type ChartSeries,
  type ChartDatum,
  type ChartValueFormatter,
  type ChartBaseProps,
} from "./charts/shared";

/* __DOC_BLOCK
<div className="grid w-full grid-cols-1 gap-8 p-4 md:grid-cols-2">
  <div className="flex min-w-0 flex-col gap-2">
    <p className="text-body-sm-medium text-primary">Work items by state</p>
    <QUI.BarChart
      aria-label="Work items completed and in progress per cycle"
      categoryKey="cycle"
      series={[{ key: "completed", label: "Completed" }, { key: "started", label: "In progress" }]}
      data={[
        { cycle: "C1", completed: 18, started: 6 },
        { cycle: "C2", completed: 24, started: 9 },
        { cycle: "C3", completed: 21, started: 12 },
        { cycle: "C4", completed: 30, started: 7 },
        { cycle: "C5", completed: 27, started: 10 },
      ]}
    />
  </div>
  <div className="flex min-w-0 flex-col gap-2">
    <p className="text-body-sm-medium text-primary">Stacked by priority</p>
    <QUI.BarChart
      aria-label="Open work items per project, stacked by priority"
      stacked
      orientation="horizontal"
      categoryKey="project"
      series={[{ key: "urgent", label: "Urgent" }, { key: "high", label: "High" }, { key: "low", label: "Low" }]}
      data={[
        { project: "Web", urgent: 3, high: 8, low: 12 },
        { project: "Mobile", urgent: 1, high: 5, low: 9 },
        { project: "API", urgent: 4, high: 6, low: 4 },
        { project: "Docs", urgent: 0, high: 2, low: 7 },
      ]}
    />
  </div>
  <div className="flex min-w-0 flex-col gap-2">
    <p className="text-body-sm-medium text-primary">Burn-up</p>
    <QUI.LineChart
      aria-label="Scope and completed points per week"
      categoryKey="week"
      series={[{ key: "scope", label: "Scope" }, { key: "done", label: "Completed" }]}
      data={[
        { week: "W1", scope: 40, done: 4 },
        { week: "W2", scope: 42, done: 11 },
        { week: "W3", scope: 48, done: 19 },
        { week: "W4", scope: 48, done: 27 },
        { week: "W5", scope: 52, done: 36 },
        { week: "W6", scope: 52, done: 45 },
      ]}
    />
  </div>
  <div className="flex min-w-0 flex-col gap-2">
    <p className="text-body-sm-medium text-primary">Issues created</p>
    <QUI.AreaChart
      aria-label="Issues created per month by source"
      stacked
      categoryKey="month"
      series={[{ key: "intake", label: "Intake" }, { key: "team", label: "Team" }]}
      data={[
        { month: "Jan", intake: 12, team: 30 },
        { month: "Feb", intake: 18, team: 28 },
        { month: "Mar", intake: 15, team: 36 },
        { month: "Apr", intake: 22, team: 34 },
        { month: "May", intake: 26, team: 41 },
        { month: "Jun", intake: 21, team: 45 },
      ]}
    />
  </div>
  <div className="flex min-w-0 flex-col gap-2">
    <p className="text-body-sm-medium text-primary">Estimate split</p>
    <QUI.PieChart
      aria-label="Share of points by estimate size"
      nameKey="size"
      valueKey="points"
      data={[
        { size: "Small", points: 34 },
        { size: "Medium", points: 52 },
        { size: "Large", points: 21 },
      ]}
    />
  </div>
  <div className="flex min-w-0 flex-col gap-2">
    <p className="text-body-sm-medium text-primary">Work items by assignee</p>
    <QUI.DonutChart
      aria-label="Work items by assignee"
      nameKey="assignee"
      valueKey="count"
      centerContent={<><span className="text-h4-semibold text-primary">96</span><span className="text-caption-md-regular text-tertiary">work items</span></>}
      data={[
        { assignee: "Ava", count: 31 },
        { assignee: "Ben", count: 24 },
        { assignee: "Chen", count: 19 },
        { assignee: "Dara", count: 14 },
        { assignee: "Other", count: 8 },
      ]}
      colors={{ Other: "var(--qui-chart-other)" }}
    />
  </div>
</div>
DOC__ */

/* __PROPS
{
  "BarChart.orientation": ["vertical", "horizontal"],
  "BarChart.stacked": "boolean",
  "LineChart.curve": ["linear", "monotone", "step"],
  "LineChart.showDots": "boolean",
  "AreaChart.stacked": "boolean",
  "PieChart.innerRadius": ["0", "0.65"],
  "showLegend": "boolean",
  "showTooltip": "boolean",
  "showGrid": "boolean",
  "animate": "boolean"
}
PROPS__ */
