import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { Icon, IconSplitButton, Menu, MenuContent, MenuItem } from "../src";

describe("IconSplitButton", () => {
  it("names both icon-only segments and runs the main action", async () => {
    const onClick = vi.fn();
    render(
      <Menu>
        <IconSplitButton aria-label="Create" icon={<Icon icon={Plus} />} onClick={onClick} />
        <MenuContent>
          <MenuItem>From template</MenuItem>
        </MenuContent>
      </Menu>
    );
    await userEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    const trigger = screen.getByRole("button", { name: "More options" });
    act(() => trigger.focus());
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "From template" })).toBeTruthy();
  });

  it("disables both segments", () => {
    render(
      <Menu>
        <IconSplitButton aria-label="Create" icon={<Icon icon={Plus} />} disabled />
      </Menu>
    );
    expect((screen.getByRole("button", { name: "Create" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "More options" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
