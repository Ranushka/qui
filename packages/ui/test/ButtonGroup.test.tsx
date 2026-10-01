import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ButtonGroup, ButtonGroupButton } from "../src";

describe("ButtonGroup", () => {
  it("renders a named group of independent buttons", async () => {
    const onArchive = vi.fn();
    render(
      <ButtonGroup aria-label="Actions">
        <ButtonGroupButton label="Copy" />
        <ButtonGroupButton label="Archive" onClick={onArchive} />
      </ButtonGroup>
    );
    const group = screen.getByRole("group", { name: "Actions" });
    expect(group.querySelectorAll("button")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copy" }).getAttribute("type")).toBe("button");
  });

  it("shares size via context, with a per-item override", () => {
    render(
      <ButtonGroup size="md" aria-label="Sizes">
        <ButtonGroupButton label="Inherit" />
        <ButtonGroupButton label="Override" size="sm" />
      </ButtonGroup>
    );
    const inherit = screen.getByRole("button", { name: "Inherit" });
    expect(inherit.className).toContain("h-(--control-height-md)");
    expect(inherit.className).toContain("text-body-xs-medium");
    expect(inherit.className).toContain("text-secondary");
    expect(screen.getByRole("button", { name: "Override" }).className).toContain("h-(--control-height-sm)");
  });

  it("defaults to sm standalone", () => {
    render(<ButtonGroupButton label="Solo" />);
    expect(screen.getByRole("button", { name: "Solo" }).className).toContain("h-(--control-height-sm)");
  });
});
