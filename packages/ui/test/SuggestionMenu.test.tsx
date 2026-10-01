import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { SuggestionMenu, SuggestionMenuGroup, SuggestionMenuItem, type SuggestionMenuActions } from "../src";

function setup() {
  const onChoose = vi.fn();
  const onHighlightChange = vi.fn();
  const actionsRef = React.createRef<SuggestionMenuActions>();
  render(
    <SuggestionMenu actionsRef={actionsRef} onHighlightChange={onHighlightChange} aria-label="Commands">
      <SuggestionMenuGroup label="Blocks">
        <SuggestionMenuItem id="text" label="Text" onClick={() => onChoose("text")} />
        <SuggestionMenuItem id="heading" label="Heading" onClick={() => onChoose("heading")} />
      </SuggestionMenuGroup>
      <SuggestionMenuGroup>
        <SuggestionMenuItem id="image" label="Image" onClick={() => onChoose("image")} />
      </SuggestionMenuGroup>
    </SuggestionMenu>
  );
  const press = (key: string) => {
    let used = false;
    act(() => {
      used = actionsRef.current!.handleKeyDown({ key });
    });
    return used;
  };
  return { press, onChoose, onHighlightChange };
}

const option = (name: string) => screen.getByRole("option", { name });

describe("SuggestionMenu", () => {
  it("highlights the first row and labels groups", () => {
    const { onHighlightChange } = setup();
    expect(screen.getByRole("listbox", { name: "Commands" })).toBeInTheDocument();
    expect(option("Text")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("group", { name: "Blocks" })).toBeInTheDocument();
    expect(onHighlightChange).toHaveBeenLastCalledWith("text");
  });

  it("moves the highlight with forwarded arrow keys, wrapping at the ends", () => {
    const { press } = setup();
    expect(press("ArrowDown")).toBe(true);
    expect(option("Heading")).toHaveAttribute("data-highlighted");
    press("End");
    expect(option("Image")).toHaveAttribute("aria-selected", "true");
    press("ArrowDown");
    expect(option("Text")).toHaveAttribute("aria-selected", "true");
    press("ArrowUp");
    expect(option("Image")).toHaveAttribute("aria-selected", "true");
  });

  it("chooses the highlighted row on Enter and ignores other keys", () => {
    const { press, onChoose } = setup();
    press("ArrowDown");
    expect(press("Enter")).toBe(true);
    expect(onChoose).toHaveBeenCalledWith("heading");
    expect(press("a")).toBe(false);
  });
});
