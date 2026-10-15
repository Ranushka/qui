import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../src";

describe("Button", () => {
  it("renders the icon before the label and endIcon after it", () => {
    render(<Button label="Wiki" icon={<svg data-testid="start" />} endIcon={<svg data-testid="end" />} />);
    const button = screen.getByRole("button", { name: "Wiki" });
    const order = [...button.children].map((el) => el.getAttribute("data-testid") ?? el.textContent);
    expect(order).toEqual(["start", "Wiki", "end"]);
  });

  it("renders no end icon by default", () => {
    render(<Button label="Save" />);
    expect(screen.getByRole("button", { name: "Save" }).querySelector("[data-testid=end]")).toBeNull();
  });
});
