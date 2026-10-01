import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LogoSpinner } from "../src";

describe("LogoSpinner", () => {
  it("is a single named image", () => {
    render(<LogoSpinner size="md" alt="Loading workspace" />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Loading workspace" })).toBeInTheDocument();
  });

  it("renders a custom logo node", () => {
    render(<LogoSpinner size="sm" alt="Loading" logo={<svg data-testid="brand" />} />);
    expect(screen.getByTestId("brand")).toBeInTheDocument();
  });
});
