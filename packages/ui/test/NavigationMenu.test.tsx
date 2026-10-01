import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuContentList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuLinkTitle,
  NavigationMenuList,
  NavigationMenuPanel,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "../src";

function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger label="Product" />
          <NavigationMenuContent>
            <NavigationMenuContentList>
              <NavigationMenuLink appearance="card" href="/cycles">
                <NavigationMenuLinkTitle>Cycles</NavigationMenuLinkTitle>
                <NavigationMenuLinkDescription>Plan sprints.</NavigationMenuLinkDescription>
              </NavigationMenuLink>
            </NavigationMenuContentList>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuPanel>
        <NavigationMenuViewport />
      </NavigationMenuPanel>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("renders a nav landmark with a list of triggers and links", () => {
    render(<Example />);
    expect(screen.getByRole("navigation")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Pricing" }).getAttribute("href")).toBe("/pricing");
    const trigger = screen.getByRole("button", { name: "Product" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the item's content in the panel when the trigger is clicked", async () => {
    render(<Example />);
    expect(screen.queryByRole("link", { name: /Cycles/ })).toBeNull();
    const trigger = screen.getByRole("button", { name: "Product" });
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const card = await screen.findByRole("link", { name: /Cycles/ });
    expect(card.getAttribute("href")).toBe("/cycles");
    expect(screen.getByText("Plan sprints.")).toBeTruthy();
  });

  it("accepts a custom trigger icon in place of the chevron", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger label="More" icon={<span data-testid="custom-icon" />} />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });
});
