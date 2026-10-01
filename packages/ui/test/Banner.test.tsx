import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Banner } from "../src";

describe("Banner", () => {
  it("announces info as a status and danger as an alert", () => {
    const { rerender } = render(<Banner title="Saved">Done.</Banner>);
    expect(screen.getByRole("status").textContent).toContain("Saved");
    rerender(<Banner variant="danger">Broken.</Banner>);
    expect(screen.getByRole("alert").textContent).toContain("Broken.");
  });

  it("calls onDismiss from the close button", async () => {
    const onDismiss = vi.fn();
    render(<Banner onDismiss={onDismiss}>Hi</Banner>);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("omits the dismiss button without onDismiss", () => {
    render(<Banner>Hi</Banner>);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
