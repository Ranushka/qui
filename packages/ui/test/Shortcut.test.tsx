import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Shortcut } from "../src";

describe("Shortcut", () => {
  it("renders the keys as an aria-hidden hint by default", () => {
    render(<Shortcut keys="⌘ K" />);
    expect(screen.getByText("⌘ K")).toHaveAttribute("aria-hidden", "true");
  });

  it("can be exposed to assistive tech", () => {
    render(<Shortcut keys="Ctrl P" size="sm" aria-hidden={false} />);
    expect(screen.getByText("Ctrl P")).toHaveAttribute("aria-hidden", "false");
  });
});
