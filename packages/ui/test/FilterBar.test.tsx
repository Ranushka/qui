import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterBar, describeFilter, filterRows, filtersFromParams, filtersToParams, type FilterField } from "../src/organisms/FilterBar";

type Row = { status: string; amount: number; tags: string[]; at: string };
const rows: Row[] = [
  { status: "Active", amount: 50, tags: ["a"], at: "2026-10-17T10:00:00" },
  { status: "Frozen", amount: 500, tags: ["a", "b"], at: "2026-10-01T10:00:00" },
  { status: "Active", amount: 5000, tags: [], at: "2026-06-01T10:00:00" },
];
const fields: FilterField<Row>[] = [
  { key: "status", label: "Status", kind: "select", options: [{ value: "Active", label: "Active" }, { value: "Frozen", label: "Frozen" }], get: (r) => r.status },
  { key: "amount", label: "Amount", kind: "number", get: (r) => r.amount },
  { key: "tags", label: "Tags", kind: "select", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], get: (r) => r.tags },
  { key: "at", label: "Updated", kind: "date", get: (r) => r.at },
];
const now = new Date("2026-10-18T09:00:00");

describe("filterRows", () => {
  it("keeps rows matching every applied filter", () => {
    expect(filterRows(rows, fields, { status: ["Active"], amount: { op: "gt", min: 100 } }, { now })).toEqual([rows[2]]);
    expect(filterRows(rows, fields, { tags: ["b"] }, { now })).toEqual([rows[1]]);
    expect(filterRows(rows, fields, { at: { preset: "7d" } }, { now })).toEqual([rows[0]]);
    expect(filterRows(rows, fields, { at: { preset: "custom", from: "2026-09-30", to: "2026-10-02" } }, { now })).toEqual([rows[1]]);
  });

  it("ignores half-filled filters", () => {
    expect(filterRows(rows, fields, { status: [], amount: { op: "between" } }, { now })).toHaveLength(3);
  });
});

describe("URL round-trip and labels", () => {
  it("writes and reads back every kind", () => {
    const state = { status: ["Active", "Frozen"], amount: { op: "between" as const, min: 10, max: 20 }, at: { preset: "30d" as const } };
    const params = filtersToParams(fields, state);
    expect(params.toString()).toBe("status=Active%2CFrozen&amount=10..20&at=30d");
    expect(filtersFromParams(fields, params)).toEqual(state);
  });

  it("describes applied values", () => {
    expect(describeFilter(fields[1] as FilterField<never>, { op: "gt", min: 5000 })).toBe("> 5,000");
    expect(describeFilter(fields[3] as FilterField<never>, { preset: "7d" })).toBe("Last 7 days");
  });
});

describe("FilterBar", () => {
  it("shows pinned filters, applied chips and More filters", () => {
    render(<FilterBar fields={fields} pinned={["status"]} defaultValue={{ amount: { op: "lt", max: 9 } }} />);
    expect(screen.getByRole("button", { name: "Status" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Amount: < 9" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Amount filter" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /More filters/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy();
  });
});
