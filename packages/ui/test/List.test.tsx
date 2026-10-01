import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CollapsiblePanel, CollapsibleRoot, List, ListItem, ListItemButton, ListItemDisclosureTrigger, ListItemLink, ListSection } from "../src";

function Sidebar() {
  return (
    <List aria-label="Nav">
      <ListItem>
        <ListItemLink href="#home" label="Home" />
      </ListItem>
      <ListItem>
        <ListItemLink href="#inbox" aria-current="page" label="Inbox" count={3} />
      </ListItem>
      <CollapsibleRoot>
        <ListItem>
          <ListItemButton label="Projects" />
          <ListItemDisclosureTrigger aria-label="Toggle projects" />
        </ListItem>
        <CollapsiblePanel>
          <List aria-label="Projects">
            <ListItem level={2}>
              <ListItemLink href="#web" label="Web" />
            </ListItem>
          </List>
        </CollapsiblePanel>
      </CollapsibleRoot>
    </List>
  );
}

describe("List", () => {
  it("is one tab stop, starting on the current page", async () => {
    render(<Sidebar />);
    await userEvent.tab();
    expect(screen.getByRole("link", { name: /Inbox/ })).toHaveFocus();
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });

  it("roves with arrow keys and Home/End, including the disclosure trigger", async () => {
    render(<Sidebar />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Projects" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Toggle projects" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Toggle projects" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    expect(screen.getByRole("link", { name: "Home" }).tabIndex).toBe(0);
    expect(screen.getByRole("link", { name: /Inbox/ }).tabIndex).toBe(-1);
  });

  it("expands a nested list, which is its own tab stop", async () => {
    render(<Sidebar />);
    expect(screen.queryByRole("link", { name: "Web" })).toBeNull();
    screen.getByRole("button", { name: "Toggle projects" }).focus();
    await userEvent.keyboard("{Enter}");
    const web = await screen.findByRole("link", { name: "Web" });
    expect(web.tabIndex).toBe(0);
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
  });

  it("hides a zero count and shows a positive one", () => {
    render(
      <List>
        <ListItem>
          <ListItemLink href="#" label="A" count={0} />
        </ListItem>
        <ListItem>
          <ListItemLink href="#" label="B" count={7} />
        </ListItem>
      </List>
    );
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("ListSection toggles its body", async () => {
    render(
      <ListSection label="Favorites">
        <p>Fav rows</p>
      </ListSection>
    );
    const trigger = screen.getByRole("button", { name: "Favorites" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Fav rows")).toBeInTheDocument();
  });
});
