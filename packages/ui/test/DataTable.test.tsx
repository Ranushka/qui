import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "../src/organisms/DataTable";

// jsdom has no PointerEvent; Base UI's Checkbox re-dispatches clicks as one.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {}
  (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = PointerEventPolyfill;
}

type Row = { id: string; name: string; points: number };
const data: Row[] = [
  { id: "a", name: "Billing", points: 8 },
  { id: "b", name: "Account", points: 3 },
  { id: "c", name: "Checkout", points: 5 },
];
const columns: DataTableColumn<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "points", header: "Points", meta: { align: "end" } },
];

const column = (index: number) => screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[index]!.textContent);

describe("DataTable", () => {
  it("sorts text A→Z and numbers largest first on the first click, then reverses", async () => {
    render(<DataTable aria-label="Items" data={data} columns={columns} />);
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(column(0)).toEqual(["Account", "Billing", "Checkout"]);
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("button", { name: "Points" }));
    expect(column(1)).toEqual(["8", "5", "3"]);
    await userEvent.click(screen.getByRole("button", { name: "Points" }));
    expect(column(1)).toEqual(["3", "5", "8"]);
  });

  it("pages rows and selects them", async () => {
    render(<DataTable aria-label="Items" data={data} columns={columns} getRowId={(row) => row.id} pageSize={2} selectable />);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(screen.getByRole("checkbox", { name: "Select row a" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select row b" })).toBeChecked();
  });

  it("shows the empty state when there are no rows", () => {
    render(<DataTable aria-label="Items" data={[]} columns={columns} emptyState="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
