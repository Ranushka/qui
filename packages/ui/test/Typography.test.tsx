import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading, Text } from "../src";

describe("Text", () => {
  it("defaults to body sm regular span inheriting color", () => {
    render(<Text>hi</Text>);
    const el = screen.getByText("hi");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toBe("text-body-sm-regular");
  });

  it("maps size/weight/color to tokens and keeps size + color together", () => {
    render(<Text as="p" size="xs" weight="semibold" color="tertiary">meta</Text>);
    const el = screen.getByText("meta");
    expect(el.tagName).toBe("P");
    expect(el.className).toContain("text-caption-md-semibold");
    expect(el.className).toContain("text-tertiary");
  });

  it("clamps lines", () => {
    render(<Text maxLines={1}>one</Text>);
    expect(screen.getByText("one").className).toContain("truncate");
  });
});

describe("Heading", () => {
  it("renders the semantic level with the matching scale by default", () => {
    render(<Heading level={2}>Title</Heading>);
    const el = screen.getByRole("heading", { level: 2 });
    expect(el.className).toContain("text-h2-semibold");
    expect(el.className).toContain("text-primary");
  });

  it("lets visual size differ from level", () => {
    render(<Heading level={2} size={5} weight="medium">Small</Heading>);
    expect(screen.getByRole("heading", { level: 2 }).className).toContain("text-h5-medium");
  });
});
