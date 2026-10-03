import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Box, Grid, Inline, Stack } from "../src";

describe("Stack", () => {
  it("is a flex column with the gap and padding from the spacing scale", () => {
    render(<Stack gap="4" padding="6" paddingX="2" data-testid="s" />);
    const el = screen.getByTestId("s");
    expect(el.tagName).toBe("DIV");
    expect(el.className.split(" ")).toEqual(expect.arrayContaining(["flex", "flex-col", "gap-4", "p-6", "px-2"]));
  });

  it("resets list styling when rendered as a list, and lets padding win over the reset", () => {
    render(<Stack as="ul" padding="2" data-testid="s" />);
    const el = screen.getByTestId("s");
    expect(el.tagName).toBe("UL");
    const cls = el.className.split(" ");
    expect(cls).toEqual(expect.arrayContaining(["list-none", "p-2"]));
    expect(cls).not.toContain("p-0");
  });
});

describe("Inline", () => {
  it("defaults to a wrapping, centered row with gap 2", () => {
    render(<Inline data-testid="i" />);
    expect(screen.getByTestId("i").className.split(" ")).toEqual(
      expect.arrayContaining(["flex", "flex-row", "flex-wrap", "gap-2", "items-center"])
    );
  });

  it("can stay on one row and distribute children", () => {
    render(<Inline wrap={false} justify="between" rowGap="1" data-testid="i" />);
    const cls = screen.getByTestId("i").className;
    expect(cls).toContain("flex-nowrap");
    expect(cls).toContain("justify-between");
    expect(cls).toContain("gap-y-1");
  });
});

describe("Grid", () => {
  it("uses fixed columns by default", () => {
    render(<Grid columns={3} data-testid="g" />);
    expect(screen.getByTestId("g").className.split(" ")).toEqual(expect.arrayContaining(["grid", "grid-cols-3", "gap-4"]));
  });

  it("collapses to one column below a breakpoint", () => {
    render(<Grid columns={4} collapseBelow="md" data-testid="g" />);
    const cls = screen.getByTestId("g").className.split(" ");
    expect(cls).toEqual(expect.arrayContaining(["grid-cols-1", "md:grid-cols-4"]));
    expect(cls).not.toContain("grid-cols-4");
  });
});

describe("Box", () => {
  it("renders nothing visual by default", () => {
    render(<Box data-testid="b">x</Box>);
    expect(screen.getByTestId("b").className).toBe("min-w-0");
  });

  it("maps surface props to tokens", () => {
    render(<Box as="section" background="layer-1" border="subtle" borderEdge="top" dashed radius="lg" shadow="raised-100" overflow="hidden" width="md" grow data-testid="b" />);
    const el = screen.getByTestId("b");
    expect(el.tagName).toBe("SECTION");
    expect(el.className.split(" ")).toEqual(
      expect.arrayContaining(["bg-layer-1", "border-t", "border-subtle", "border-dashed", "rounded-lg", "shadow-raised-100", "overflow-hidden", "w-md", "flex-1"])
    );
  });
});

describe("responsive props", () => {
  it("hides below or above a breakpoint", () => {
    render(<Box hideBelow="md" data-testid="a" />);
    render(<Box hideAbove="lg" data-testid="b" />);
    expect(screen.getByTestId("a").className.split(" ")).toContain("max-md:hidden");
    expect(screen.getByTestId("b").className.split(" ")).toContain("lg:hidden");
  });

  it("stacks an Inline into a column below a breakpoint", () => {
    render(<Inline stackBelow="sm" data-testid="i" />);
    expect(screen.getByTestId("i").className.split(" ")).toEqual(expect.arrayContaining(["flex-row", "max-sm:flex-col", "max-sm:items-stretch"]));
  });
});

