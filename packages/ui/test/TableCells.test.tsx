import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateCell, DateRangeCell, MaskedCell, MoneyCell, NumberCell, TableCell, TagCell, Table, TableBody, TableRow, UsersCell } from "../src";

const text = (ui: React.ReactElement) => render(ui).container.textContent;

describe("table cells", () => {
  it("formats money with symbol, code, subdued cents and sign", () => {
    expect(text(<MoneyCell amount={1250} currency="USD" locale="en-US" />)).toBe("$1,250.00");
    expect(text(<MoneyCell amount={1250} currency="AED" display="code" locale="en-US" />)).toMatch(/^AED\s1,250\.00$/);
    expect(text(<MoneyCell amount={0} currency="AED" display="none" minor="subdued" locale="en-US" />)).toBe("0.00");
    expect(text(<MoneyCell amount={-500} currency="USD" signed locale="en-US" />)).toBe("-$500.00");
  });

  it("formats numbers as percent, compact and duration", () => {
    expect(text(<NumberCell value={52} format="percent" locale="en-US" />)).toBe("52%");
    expect(text(<NumberCell value={1250000} format="compact" locale="en-US" />)).toBe("1.3M");
    expect(text(<NumberCell value={930} format="duration" />)).toBe("15h 30m");
    expect(text(<NumberCell value={120} format="duration" />)).toBe("2h");
    expect(text(<NumberCell value={12.5} unit="pts" locale="en-US" />)).toBe("12.5 pts");
  });

  it("formats dates and ranges", () => {
    expect(text(<DateCell value="2026-05-10T12:00:00" format="short" locale="en-GB" />)).toBe("10 May");
    expect(text(<DateRangeCell start="2026-05-10T12:00:00" end="2026-05-17T12:00:00" locale="en-GB" />)).toMatch(/^10\s?–\s?17 May$/);
    expect(text(<DateCell value="2026-05-13T12:00:00" format="relative" now={new Date("2026-05-10T12:00:00")} locale="en-US" />)).toBe("in 3 days");
  });

  it("shows an em dash for missing values", () => {
    for (const ui of [<DateCell value={null} />, <MoneyCell amount={undefined} currency="USD" />, <NumberCell value={null} />, <MaskedCell last="" />, <TagCell label="" />, <UsersCell users={[]} />]) {
      expect(text(ui)).toBe("—");
    }
  });

  it("masks all but the tail and names it for screen readers", () => {
    render(<MaskedCell last="1435" />);
    expect(screen.getByText("1435").parentElement!.textContent).toBe("•••• •••• •••• ending in 1435");
  });

  it("aligns cells and draws column rules unless verticalLines is off", () => {
    const table = (lines?: boolean) => (
      <Table verticalLines={lines}>
        <TableBody><TableRow><TableCell align="end">1</TableCell></TableRow></TableBody>
      </Table>
    );
    const { container, rerender } = render(table());
    const cell = () => container.querySelector("td")!;
    expect(cell().className).toContain("text-end");
    expect(cell().className).toContain("border-e-sm");
    rerender(table(false));
    expect(cell().className).not.toContain("border-e-sm");
  });
});
