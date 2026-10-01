import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "../src";

const OCT_2026 = new Date(2026, 9, 1);
const day = (d: number) => screen.getByRole("button", { name: new RegExp(`October ${d}(st|nd|rd|th), 2026`) });

describe("Calendar", () => {
  it("renders an accessible grid for the month", () => {
    render(<Calendar mode="single" defaultMonth={OCT_2026} />);
    expect(screen.getByRole("grid")).toBeTruthy();
    expect(screen.getByText("October 2026")).toBeTruthy();
    expect(screen.getAllByRole("gridcell").length).toBeGreaterThanOrEqual(31);
  });

  it("starts weeks on Monday by default", () => {
    const { container } = render(<Calendar mode="single" defaultMonth={OCT_2026} />);
    const headers = container.querySelectorAll("th");
    expect(headers[0].getAttribute("aria-label")).toBe("Monday");
  });

  it("selects a single day", async () => {
    const onSelect = vi.fn();
    render(<Calendar mode="single" defaultMonth={OCT_2026} onSelect={onSelect} />);
    await userEvent.click(day(14));
    expect(onSelect).toHaveBeenCalledOnce();
    expect((onSelect.mock.calls[0][0] as Date).getDate()).toBe(14);
  });

  it("manages selection itself when uncontrolled, and supports multiple", async () => {
    render(<Calendar mode="multiple" defaultMonth={OCT_2026} />);
    await userEvent.click(day(3));
    await userEvent.click(day(9));
    const selected = screen.getAllByRole("gridcell").filter((c) => c.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(2);
  });

  it("marks a range's start, middle, and end as selected", () => {
    render(<Calendar mode="range" defaultMonth={OCT_2026} selected={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 15) }} />);
    const selected = screen.getAllByRole("gridcell").filter((c) => c.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(4);
  });

  it("disables matching dates", async () => {
    const onSelect = vi.fn();
    render(<Calendar mode="single" defaultMonth={OCT_2026} disabled={{ before: new Date(2026, 9, 10) }} onSelect={onSelect} />);
    expect(day(5)).toBeDisabled();
    expect(day(12)).not.toBeDisabled();
  });

  it("navigates between months", async () => {
    render(<Calendar mode="single" defaultMonth={OCT_2026} />);
    await userEvent.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByText("November 2026")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /previous month/i }));
    await userEvent.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByText("September 2026")).toBeTruthy();
  });

  it("disables navigation past endMonth", () => {
    render(<Calendar mode="single" defaultMonth={OCT_2026} endMonth={OCT_2026} />);
    expect(screen.getByRole("button", { name: /next month/i })).toBeDisabled();
  });

  it("moves focus with the arrow keys", async () => {
    render(<Calendar mode="single" defaultMonth={OCT_2026} />);
    day(14).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(day(15)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(day(22)).toHaveFocus();
  });
});
