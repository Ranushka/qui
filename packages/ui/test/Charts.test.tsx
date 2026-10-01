import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AreaChart,
  BarChart,
  ChartLegend,
  ChartTooltipContent,
  DonutChart,
  LineChart,
  PieChart,
  chartColor,
} from "../src";

const data = [
  { month: "Jan", open: 4, closed: 2 },
  { month: "Feb", open: 6, closed: 5 },
  { month: "Mar", open: 3, closed: 7 },
];
const series = [{ key: "open", label: "Open" }, { key: "closed", label: "Closed" }];

// jsdom has no layout, so every chart gets a fixed width/height (bypassing ResponsiveContainer).
const size = { width: 400, height: 200, animate: false };

describe("chartColor", () => {
  it("maps slots to palette vars and falls back to the neutral past the palette", () => {
    expect(chartColor(0)).toBe("var(--qui-chart-1)");
    expect(chartColor(7)).toBe("var(--qui-chart-8)");
    expect(chartColor(8)).toBe("var(--qui-chart-other)");
  });
});

describe("cartesian charts", () => {
  it("BarChart renders one bar per datum per series, and a legend for 2+ series", () => {
    const { container } = render(<BarChart aria-label="Issues" data={data} categoryKey="month" series={series} {...size} />);
    expect(screen.getByRole("figure", { name: "Issues" })).toBeTruthy();
    expect(container.querySelectorAll(".recharts-bar-rectangle").length).toBe(6);
    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.getByText("Closed")).toBeTruthy();
    const fills = Array.from(container.querySelectorAll(".recharts-bar-rectangle path")).map((p) => p.getAttribute("fill"));
    expect(fills).toContain("var(--qui-chart-1)");
    expect(fills).toContain("var(--qui-chart-2)");
  });

  it("omits the legend for a single series unless asked", () => {
    const { container, rerender } = render(<LineChart data={data} categoryKey="month" series={[series[0]]} {...size} />);
    expect(container.querySelector("ul")).toBeNull();
    rerender(<LineChart data={data} categoryKey="month" series={[series[0]]} showLegend {...size} />);
    expect(container.querySelector("ul")).not.toBeNull();
  });

  it("LineChart draws a 2px stroke per series in its palette color", () => {
    const { container } = render(<LineChart data={data} categoryKey="month" series={series} {...size} />);
    const curves = container.querySelectorAll("path.recharts-line-curve");
    expect(curves.length).toBe(2);
    expect(curves[0].getAttribute("stroke")).toBe("var(--qui-chart-1)");
    expect(curves[0].getAttribute("stroke-width")).toBe("2");
  });

  it("AreaChart honors a series color override", () => {
    const { container } = render(
      <AreaChart data={data} categoryKey="month" series={[{ key: "open", color: "var(--bg-success-primary)" }, series[1]]} stacked {...size} />
    );
    expect(container.querySelectorAll(".recharts-area").length).toBe(2);
    expect(container.querySelector("path.recharts-area-curve")?.getAttribute("stroke")).toBe("var(--bg-success-primary)");
  });
});

describe("pie charts", () => {
  const slices = [
    { name: "A", value: 3 },
    { name: "B", value: 2 },
    { name: "C", value: 1 },
  ];

  it("PieChart renders a sector and legend entry per slice", () => {
    const { container } = render(<PieChart data={slices} nameKey="name" valueKey="value" {...size} />);
    expect(container.querySelectorAll(".recharts-pie-sector").length).toBe(3);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["A", "B", "C"]);
  });

  it("DonutChart shows its centre content", () => {
    render(<DonutChart data={slices} nameKey="name" valueKey="value" centerContent={<span>6 total</span>} {...size} />);
    expect(screen.getByText("6 total")).toBeTruthy();
  });
});

describe("shared pieces", () => {
  it("ChartTooltipContent lists label and rows", () => {
    render(<ChartTooltipContent label="Feb" items={[{ name: "Open", value: "6", color: "var(--qui-chart-1)" }]} />);
    expect(screen.getByText("Feb")).toBeTruthy();
    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.getByText("6")).toBeTruthy();
  });

  it("ChartLegend renders a list item per entry", () => {
    render(<ChartLegend items={[{ label: "X", color: "red" }, { label: "Y", color: "blue" }]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
