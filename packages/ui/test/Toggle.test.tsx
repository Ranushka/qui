import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Star } from "lucide-react";
import { Icon, IconToggle, Toggle } from "../src";

describe("Toggle", () => {
  it("toggles aria-pressed / data-pressed and reports changes", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle label="Assigned to me" onPressedChange={onPressedChange} />);
    const toggle = screen.getByRole("button", { name: "Assigned to me" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.hasAttribute("data-pressed")).toBe(true);
    expect(onPressedChange.mock.calls[0][0]).toBe(true);
  });

  it("keeps the full label in a title and applies size chrome", () => {
    render(<Toggle size="xs" label="A long label" defaultPressed />);
    const toggle = screen.getByRole("button", { name: "A long label" });
    expect(toggle.querySelector("span")?.getAttribute("title")).toBe("A long label");
    expect(toggle.className).toContain("h-(--control-height-xs)");
    // Typography token and text color must both survive class merging.
    expect(toggle.className).toContain("text-caption-md-regular");
    expect(toggle.className).toContain("text-placeholder");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });

  it("does not toggle while disabled", async () => {
    render(<Toggle label="Off" disabled />);
    const toggle = screen.getByRole("button", { name: "Off" });
    await userEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("IconToggle", () => {
  it("is named by aria-label and supports controlled pressed + variants", async () => {
    const onPressedChange = vi.fn();
    render(<IconToggle variant="ghost" aria-label="Star" icon={<Icon icon={Star} />} pressed onPressedChange={onPressedChange} />);
    const toggle = screen.getByRole("button", { name: "Star" });
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.className).toContain("bg-layer-transparent");
    await userEvent.click(toggle);
    expect(onPressedChange.mock.calls[0][0]).toBe(false);
    // Controlled: stays pressed until the parent updates.
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });
});
