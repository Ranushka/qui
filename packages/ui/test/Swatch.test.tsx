import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Swatch } from "../src";

describe("Swatch", () => {
  it("is decorative and exposes its fill as a CSS variable", () => {
    const { container } = render(<Swatch fill="#ff0000" data-testid="s" />);
    const swatch = container.firstElementChild as HTMLElement;
    expect(swatch.getAttribute("aria-hidden")).toBe("true");
    expect(swatch.style.getPropertyValue("--swatch-fill")).toBe("#ff0000");
  });

  it("sets the fill through its own CSS variable", () => {
    const { container } = render(<Swatch fill="red" />);
    const swatch = container.firstElementChild as HTMLElement;
    expect(swatch.style.getPropertyValue("--swatch-fill")).toBe("red");
  });
});
