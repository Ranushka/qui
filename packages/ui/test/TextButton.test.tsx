import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { Icon, TextButton } from "../src";

describe("TextButton", () => {
  it("renders a native button named by its label, type=button by default", () => {
    render(<TextButton label="View all" />);
    const button = screen.getByRole("button", { name: "View all" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("text-link-primary");
  });

  it("applies variant/size chrome and places the icon per iconPosition", () => {
    const { container } = render(<TextButton variant="secondary" size="lg" label="Next" icon={<Icon icon={Plus} />} iconPosition="end" />);
    const button = screen.getByRole("button", { name: "Next" });
    expect(button.className).toContain("text-tertiary");
    expect(button.className).toContain("text-body-sm-medium");
    expect(button.lastElementChild?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("fires onClick, and not when disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<TextButton label="Go" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<TextButton label="Go" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
