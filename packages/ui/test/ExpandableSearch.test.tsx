import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandableSearch } from "../src";

describe("ExpandableSearch", () => {
  it("starts collapsed and expands into a focused searchbox on click", async () => {
    const onExpandedChange = vi.fn();
    render(<ExpandableSearch aria-label="Search issues" onExpandedChange={onExpandedChange} />);
    const trigger = screen.getByRole("button", { name: "Search issues" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const input = screen.getByRole("searchbox", { name: "Search issues" });
    expect(document.activeElement).toBe(input);
    expect(input.hasAttribute("aria-expanded")).toBe(false);
  });

  it("collapses on Escape while empty and returns focus to the trigger", async () => {
    render(<ExpandableSearch aria-label="Search" />);
    const trigger = screen.getByRole("button", { name: "Search" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("stays expanded on blur once it has text, and offers a clear button", async () => {
    render(
      <>
        <ExpandableSearch aria-label="Search" clearLabel="Clear" />
        <button type="button">Elsewhere</button>
      </>
    );
    const trigger = screen.getByRole("button", { name: "Search" });
    await userEvent.click(trigger);
    await userEvent.keyboard("bug");
    const clear = screen.getByRole("button", { name: "Clear" });
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(clear);
    expect((screen.getByRole("searchbox", { name: "Search" }) as HTMLInputElement).value).toBe("");
  });

  it("collapses on blur while empty", async () => {
    render(
      <>
        <ExpandableSearch aria-label="Search" />
        <button type="button">Elsewhere</button>
      </>
    );
    const trigger = screen.getByRole("button", { name: "Search" });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("starts expanded with a default value and honours controlled expansion", () => {
    const { rerender } = render(<ExpandableSearch aria-label="Search" defaultValue="roadmap" />);
    expect(screen.getByRole("button", { name: "Search" }).getAttribute("aria-expanded")).toBe("true");
    rerender(<ExpandableSearch key="controlled" aria-label="Search" expanded={false} />);
    expect(screen.getByRole("button", { name: "Search" }).getAttribute("aria-expanded")).toBe("false");
  });
});
