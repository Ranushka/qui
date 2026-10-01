import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "../src";

describe("Slider", () => {
  it("renders a single named range input with value bounds", () => {
    render(<Slider label="Volume" defaultValue={40} min={0} max={100} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("40");
    expect(thumb.getAttribute("aria-valuemin") ?? thumb.getAttribute("min")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax") ?? thumb.getAttribute("max")).toBe("100");
    expect(screen.getByText("40")).toBeTruthy();
  });

  it("names the thumb from aria-label when there's no visible label", () => {
    render(<Slider aria-label="Opacity" defaultValue={10} showValue={false} />);
    expect(screen.getByRole("slider", { name: "Opacity" })).toBeTruthy();
  });

  it("steps with arrow keys and jumps with Home/End", () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={40} step={5} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("45");
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("35");
    fireEvent.keyDown(thumb, { key: "End" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.keyDown(thumb, { key: "Home" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("0");
    expect(onValueChange).toHaveBeenLastCalledWith(0, expect.anything());
  });

  it("renders one thumb per value for a range, each individually named", () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[20, 80]}
        getAriaLabel={(i) => (i === 0 ? "Minimum" : "Maximum")}
        onValueChange={onValueChange}
      />
    );
    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(2);
    const min = screen.getByRole("slider", { name: "Minimum" });
    const max = screen.getByRole("slider", { name: "Maximum" });
    expect(min.getAttribute("aria-valuenow")).toBe("20");
    expect(max.getAttribute("aria-valuenow")).toBe("80");
    fireEvent.keyDown(max, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith([20, 79], expect.anything());
  });

  it("disables every thumb", () => {
    render(<Slider aria-label="Volume" defaultValue={50} disabled />);
    expect((screen.getByRole("slider", { name: "Volume" }) as HTMLInputElement).disabled).toBe(true);
  });
});
