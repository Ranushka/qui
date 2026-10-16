import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { ChangeCell, DateCell, DateRangeCell, MaskedCell, MoneyCell, NumberCell, StatusIconsCell, TableCell, TagCell, Table, TableBody, TableRow, TextCell, TrendCell, UserCell, UsersCell } from "../src";

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

describe("banking cells", () => {
  it("formats compact and accounting money", () => {
    expect(text(<MoneyCell amount={4620000} currency="AED" display="code" notation="compact" locale="en-US" />)).toMatch(/^AED\s4\.6M$/);
    expect(text(<MoneyCell amount={-18250.5} currency="AED" display="none" negative="parentheses" locale="en-US" />)).toBe("(18,250.50)");
    expect(text(<MoneyCell amount={42000} currency="AED" display="none" negative="parentheses" locale="en-US" />)).toBe("42,000.00");
  });

  it("colours a change by whether its direction is good", () => {
    const { container: up } = render(<ChangeCell value={7.2} locale="en-US" />);
    expect(up.textContent).toBe("Up 7.2%");
    expect(up.firstElementChild!.className).toContain("text-success-primary");
    const { container: cost } = render(<ChangeCell value={-12.5} good="down" locale="en-US" />);
    expect(cost.firstElementChild!.className).toContain("text-success-primary");
    const { container: down } = render(<ChangeCell value={-3.4} locale="en-US" />);
    expect(down.firstElementChild!.className).toContain("text-danger-primary");
  });

  it("summarises a trend for screen readers and needs two points", () => {
    render(<TrendCell values={[100, 90, 80]} label="Balance" locale="en-US" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Balance: down 20%");
    expect(text(<TrendCell values={[5]} />)).toBe("—");
  });

  it("names each status step", () => {
    render(<StatusIconsCell items={[{ label: "Approved", status: "done" }, { label: "Stamped", status: "pending" }]} />);
    expect(screen.getAllByRole("listitem").map((el) => el.getAttribute("aria-label"))).toEqual(["Approved: done", "Stamped: pending"]);
  });

  it("stripes body rows instead of row rules, unless striped is off", () => {
    const table = (striped?: boolean) => (
      <Table striped={striped}>
        <TableBody><TableRow><TableCell>1</TableCell></TableRow></TableBody>
      </Table>
    );
    const { container, rerender } = render(table());
    expect(container.querySelector("tr")!.className).toContain("even:");
    expect(container.querySelector("tr")!.className).not.toContain("border-b-sm");
    rerender(table(false));
    expect(container.querySelector("tr")!.className).not.toContain("even:");
    expect(container.querySelector("tr")!.className).toContain("border-b-sm");
  });
});

describe("clickable cells", () => {
  it("renders a link with href and a button with onClick", async () => {
    const onClick = vi.fn();
    render(
      <>
        <TextCell primary="Blue Harbor LLC" secondary="virtual" tone="link" href="#/accounts/1" />
        <UserCell name="Sohrab Khan" secondary="sohrab@acme.com" onClick={onClick} />
        <TagCell label="Active" color="emerald" onClick={onClick} />
      </>
    );
    expect(screen.getByRole("link", { name: /Blue Harbor LLC/ }).getAttribute("href")).toBe("#/accounts/1");
    await userEvent.click(screen.getByRole("button", { name: /Sohrab Khan/ }));
    await userEvent.click(screen.getByRole("button", { name: "Active" }));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("stays plain text without an action", () => {
    render(<TextCell primary="Blue Harbor LLC" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
