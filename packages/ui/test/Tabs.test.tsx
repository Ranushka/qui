import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, Tabs, TabsList } from "../src";

describe("Tabs", () => {
  it("shows a count on card tabs and selects on click", async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs variant="card" defaultValue="all" onValueChange={onValueChange}>
        <TabsList aria-label="Request types">
          <Tab value="all" label="All requests" count="13,924" />
          <Tab value="rewards" label="Reward requests" count="0" />
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "All requests 13,924" }).getAttribute("aria-selected")).toBe("true");
    await userEvent.click(screen.getByRole("tab", { name: "Reward requests 0" }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0]![0]).toBe("rewards");
  });
});
