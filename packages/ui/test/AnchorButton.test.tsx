import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnchorButton } from "../src";

describe("AnchorButton", () => {
  it("renders a link with an underlined label", () => {
    render(<AnchorButton href="/docs" label="Docs" />);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.querySelector("span")?.className).toContain("underline");
    expect(link.getAttribute("target")).toBeNull();
  });

  it("external opens a new tab with safe rel and a trailing icon; explicit target wins", () => {
    const { rerender } = render(<AnchorButton href="https://x.dev" label="X" external />);
    let link = screen.getByRole("link", { name: "X" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer noopener");
    expect(link.lastElementChild?.getAttribute("aria-hidden")).toBe("true");
    rerender(<AnchorButton href="https://x.dev" label="X" external target="_self" />);
    link = screen.getByRole("link", { name: "X" });
    expect(link.getAttribute("target")).toBe("_self");
  });

  it("disabled drops href, is unfocusable, aria-disabled, and blocks onClick", async () => {
    const onClick = vi.fn();
    render(<AnchorButton href="/docs" label="Docs" disabled onClick={onClick} />);
    const anchor = screen.getByText("Docs").closest("a")!;
    expect(anchor.hasAttribute("href")).toBe(false);
    expect(anchor.getAttribute("aria-disabled")).toBe("true");
    expect(anchor.getAttribute("tabindex")).toBe("-1");
    await userEvent.click(anchor);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("projects onto a custom element via render", () => {
    render(<AnchorButton render={<a data-router="yes" href="/r" />} label="Routed" />);
    const link = screen.getByRole("link", { name: "Routed" });
    expect(link.getAttribute("data-router")).toBe("yes");
    expect(link.getAttribute("href")).toBe("/r");
  });
});
