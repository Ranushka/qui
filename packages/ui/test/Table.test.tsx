import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../src";

describe("Table", () => {
  it("renders semantic table markup", () => {
    render(
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>Billing</TableCell></TableRow></TableBody>
      </Table>
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Billing" })).toBeTruthy();
  });

  it("makes sortable headers operable and reports aria-sort", async () => {
    const onSort = vi.fn();
    render(
      <Table>
        <TableHeader><TableRow><TableHead sortDirection="ascending" onSort={onSort}>Points</TableHead></TableRow></TableHeader>
      </Table>
    );
    expect(screen.getByRole("columnheader").getAttribute("aria-sort")).toBe("ascending");
    await userEvent.click(screen.getByRole("button", { name: "Points" }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it("marks selected rows", () => {
    render(<Table><TableBody><TableRow selected><TableCell>x</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole("row").getAttribute("aria-selected")).toBe("true");
  });
});
