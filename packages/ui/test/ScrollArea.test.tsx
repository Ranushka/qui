import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollArea } from "../src";

describe("ScrollArea", () => {
  it("renders content inside a viewport and exposes it via viewportRef", () => {
    const viewportRef = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea orientation="vertical" viewportRef={viewportRef}>
        <p>Long content</p>
      </ScrollArea>
    );
    expect(screen.getByText("Long content")).toBeInTheDocument();
    expect(viewportRef.current).not.toBeNull();
    expect(viewportRef.current?.contains(screen.getByText("Long content"))).toBe(true);
  });
});
