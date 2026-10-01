import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu, MenuContent, MenuItem, SplitButton, type SplitButtonProps } from "../src";

function renderSplit(props: Partial<SplitButtonProps> = {}) {
  return render(
    <Menu>
      <SplitButton label="Save" {...props} />
      <MenuContent>
        <MenuItem>Save as draft</MenuItem>
      </MenuContent>
    </Menu>
  );
}

describe("SplitButton", () => {
  it("fires the main action without opening the menu", async () => {
    const onClick = vi.fn();
    renderSplit({ onClick });
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens the menu from the chevron segment", async () => {
    renderSplit({ menuLabel: "Save options" });
    const trigger = screen.getByRole("button", { name: "Save options" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    act(() => trigger.focus());
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Save as draft" })).toBeTruthy();
  });

  it("disables both segments", () => {
    renderSplit({ disabled: true });
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "More options" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("loading keeps the main segment busy and disables the trigger", () => {
    renderSplit({ loading: true });
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("aria-busy")).toBe("true");
    expect((screen.getByRole("button", { name: "More options" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("applies the variant to the frame and both segments", () => {
    renderSplit({ variant: "secondary", "data-testid": "frame" } as Partial<SplitButtonProps>);
    expect(screen.getByTestId("frame").className).toContain("[&>*+*]:border-s-0");
    expect(screen.getByRole("button", { name: "Save" }).className).toContain("border-strong");
    expect(screen.getByRole("button", { name: "More options" }).className).toContain("border-strong");
  });
});
