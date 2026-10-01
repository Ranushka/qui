import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collapsible } from "../src";

describe("Collapsible", () => {
  it("toggles its panel from the keyboard", async () => {
    render(<Collapsible trigger="Details">Hidden body</Collapsible>);
    const trigger = screen.getByRole("button", { name: "Details" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Hidden body")).toBeNull();
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Hidden body")).toBeInTheDocument();
  });

  it("renders a trailing action outside the trigger button", () => {
    render(
      <Collapsible defaultOpen trigger="Files" trailing={<button type="button">Add</button>}>
        Body
      </Collapsible>
    );
    const trigger = screen.getByRole("button", { name: "Files" });
    const add = screen.getByRole("button", { name: "Add" });
    expect(trigger.contains(add)).toBe(false);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("omits the chevron with indicator={false}", () => {
    const { container } = render(<Collapsible trigger="X" indicator={false} />);
    expect(container.querySelector("[data-slot=disclosure-indicator]")).toBeNull();
  });
});
