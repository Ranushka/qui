import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VirtualList } from "../src";

// jsdom has no layout: give every element a 320px-tall box so the virtualizer sees a real viewport.
const VIEWPORT = 320;
const ROW = 32;
const originals = {
  offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight"),
  offsetWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth"),
  clientHeight: Object.getOwnPropertyDescriptor(Element.prototype, "clientHeight"),
};

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => VIEWPORT });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 400 });
  Object.defineProperty(Element.prototype, "clientHeight", { configurable: true, get: () => VIEWPORT });
  Element.prototype.scrollTo = function () {};
});

afterAll(() => {
  for (const [key, desc] of Object.entries(originals)) {
    if (desc) Object.defineProperty(key === "clientHeight" ? Element.prototype : HTMLElement.prototype, key, desc);
  }
});

const items = Array.from({ length: 10_000 }, (_, i) => `Item ${i}`);

describe("VirtualList", () => {
  it("renders only a window of rows, not all 10,000", () => {
    render(<VirtualList aria-label="Items" items={items} itemSize={ROW} overscan={5} height={VIEWPORT} renderItem={(item) => item} />);
    const options = screen.getAllByRole("option");
    // 10 visible rows + 5 overscan below (none above at scrollTop 0).
    expect(options.length).toBe(VIEWPORT / ROW + 5);
    expect(screen.getByText("Item 0")).toBeTruthy();
    expect(screen.queryByText("Item 500")).toBeNull();
    expect(options[0]!.getAttribute("aria-setsize")).toBe("10000");
    expect(options[0]!.getAttribute("aria-posinset")).toBe("1");
    // The spacer reserves the full scroll height.
    expect((screen.getByRole("listbox").firstElementChild as HTMLElement).style.height).toBe(`${items.length * ROW}px`);
  });

  it("renders a different window after scrolling", () => {
    render(<VirtualList aria-label="Items" items={items} itemSize={ROW} overscan={0} height={VIEWPORT} renderItem={(item) => item} />);
    const listbox = screen.getByRole("listbox");
    listbox.scrollTop = 5000 * ROW;
    fireEvent.scroll(listbox);
    expect(screen.getByText("Item 5000")).toBeTruthy();
    expect(screen.queryByText("Item 0")).toBeNull();
    expect(screen.getAllByRole("option").length).toBeLessThanOrEqual(VIEWPORT / ROW + 1);
  });

  it("navigates with the keyboard via aria-activedescendant and selects with Enter", () => {
    const onItemSelect = vi.fn();
    render(<VirtualList aria-label="Items" items={items} itemSize={ROW} height={VIEWPORT} renderItem={(item) => item} onItemSelect={onItemSelect} />);
    const listbox = screen.getByRole("listbox");
    const activeText = () => document.getElementById(listbox.getAttribute("aria-activedescendant")!)?.textContent;

    fireEvent.focus(listbox);
    expect(activeText()).toBe("Item 0");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(activeText()).toBe("Item 2");
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(activeText()).toBe("Item 1");

    // End jumps to the last row, which is mounted even though the window hasn't scrolled there.
    fireEvent.keyDown(listbox, { key: "End" });
    expect(activeText()).toBe("Item 9999");
    fireEvent.keyDown(listbox, { key: "Home" });
    expect(activeText()).toBe("Item 0");

    fireEvent.keyDown(listbox, { key: "Enter" });
    expect(onItemSelect).toHaveBeenCalledWith("Item 0", 0);
  });

  it("marks selected rows and supports a static list role", () => {
    const { unmount } = render(
      <VirtualList aria-label="Items" items={items} itemSize={ROW} height={VIEWPORT} isItemSelected={(_, i) => i === 1} renderItem={(item) => item} />
    );
    expect(screen.getAllByRole("option")[1]!.getAttribute("aria-selected")).toBe("true");
    unmount();

    render(<VirtualList aria-label="Log" role="list" items={items} itemSize={ROW} height={VIEWPORT} renderItem={(item) => item} />);
    expect(screen.getByRole("list").hasAttribute("aria-activedescendant")).toBe(false);
    expect(screen.getAllByRole("listitem").length).toBeLessThan(100);
  });

  it("shows the empty state when there are no items", () => {
    render(<VirtualList aria-label="Items" items={[]} renderItem={() => null} emptyState="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });
});
