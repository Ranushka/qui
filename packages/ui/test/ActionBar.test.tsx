import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionBar, ActionBarButton } from "../src";

describe("ActionBar", () => {
  it("renders nothing while closed", () => {
    render(<ActionBar open={false} summary="2 selected" />);
    expect(screen.queryByRole("toolbar")).toBeNull();
  });

  it("shows the summary and runs actions", async () => {
    const onApprove = vi.fn();
    render(
      <ActionBar open summary="2 selected">
        <ActionBarButton label="Approve" onClick={onApprove} />
        <ActionBarButton label="Edit" disabled />
      </ActionBar>
    );
    expect(screen.getByRole("toolbar").textContent).toContain("2 selected");
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect((screen.getByRole("button", { name: "Edit" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("clears the selection from the corner badge", async () => {
    const onClear = vi.fn();
    render(<ActionBar open summary="1 selected" onClear={onClear} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
