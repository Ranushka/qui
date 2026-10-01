import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bold, Italic } from "lucide-react";
import {
  Icon,
  Menu,
  MenuContent,
  MenuItem,
  ToolbarMenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "../src";

describe("Toolbar", () => {
  it("renders toolbar, group and separator semantics", () => {
    render(
      <Toolbar aria-label="Formatting">
        <ToolbarGroup aria-label="Actions">
          <ToolbarButton label="Comment" />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarLink href="/docs" label="Docs" />
      </Toolbar>
    );
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Actions" })).toBeTruthy();
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe("vertical");
    expect(screen.getByRole("link", { name: "Docs" }).getAttribute("href")).toBe("/docs");
  });

  it("moves focus between items with arrow keys (roving tabindex)", async () => {
    render(
      <Toolbar aria-label="Edit">
        <ToolbarButton label="Cut" />
        <ToolbarButton label="Copy" />
        <ToolbarButton label="Paste" />
      </Toolbar>
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cut" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Copy" }));
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cut" }));
    // Only one item is in the tab sequence.
    await userEvent.tab();
    expect(screen.getByRole("toolbar").contains(document.activeElement)).toBe(false);
  });

  it("fires onClick and keeps disabled buttons focusable but inert", async () => {
    const onClick = vi.fn();
    const onDisabledClick = vi.fn();
    render(
      <Toolbar aria-label="Edit">
        <ToolbarButton label="Save" onClick={onClick} />
        <ToolbarButton aria-label="Delete" icon={<Icon icon={Bold} />} showTooltip={false} disabled onClick={onDisabledClick} />
      </Toolbar>
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
    const del = screen.getByRole("button", { name: "Delete" });
    expect(del.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(del);
    expect(onDisabledClick).not.toHaveBeenCalled();
  });

  it("toggles pressed state", async () => {
    const onPressedChange = vi.fn();
    render(
      <Toolbar aria-label="Format">
        <ToolbarToggle aria-label="Bold" icon={<Icon icon={Bold} />} showTooltip={false} onPressedChange={onPressedChange} />
      </Toolbar>
    );
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("keeps a single selection in a toggle group", async () => {
    render(
      <Toolbar aria-label="Format">
        <ToolbarToggleGroup aria-label="Style" defaultValue={["bold"]}>
          <ToolbarToggle value="bold" aria-label="Bold" icon={<Icon icon={Bold} />} showTooltip={false} />
          <ToolbarToggle value="italic" aria-label="Italic" icon={<Icon icon={Italic} />} showTooltip={false} />
        </ToolbarToggleGroup>
      </Toolbar>
    );
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(italic);
    expect(italic.getAttribute("aria-pressed")).toBe("true");
    expect(bold.getAttribute("aria-pressed")).toBe("false");
  });

  it("opens a Menu from ToolbarMenuTrigger", async () => {
    render(
      <Toolbar aria-label="Format">
        <Menu>
          <ToolbarMenuTrigger label="Paragraph" />
          <MenuContent>
            <MenuItem>Heading 1</MenuItem>
          </MenuContent>
        </Menu>
        <ToolbarButton aria-label="Bold" icon={<Icon icon={Bold} />} />
      </Toolbar>
    );
    const trigger = screen.getByRole("button", { name: "Paragraph" });
    // jsdom + user-event's pointer sequence doesn't open Base UI menus (true of a plain MenuTrigger
    // too), so drive it from the keyboard: focus enters the toolbar on the trigger, Enter opens.
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(await screen.findByRole("menuitem", { name: "Heading 1" })).toBeTruthy();
  });

  it("renders an inline input in the toolbar", async () => {
    render(
      <Toolbar aria-label="Filters">
        <ToolbarInput aria-label="Filter" placeholder="Filter…" />
      </Toolbar>
    );
    const input = screen.getByRole("textbox", { name: "Filter" });
    await userEvent.type(input, "bug");
    expect((input as HTMLInputElement).value).toBe("bug");
  });
});
