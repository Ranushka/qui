import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OTPField } from "../src";

const slots = () => screen.getAllByRole("textbox") as HTMLInputElement[];

describe("OTPField", () => {
  it("renders one labeled slot per character, with one-time-code autofill on the first", () => {
    render(<OTPField length={4} />);
    const inputs = slots();
    expect(inputs).toHaveLength(4);
    expect(screen.getByRole("textbox", { name: "Character 1" })).toBe(inputs[0]);
    expect(screen.getByRole("textbox", { name: "Character 4" })).toBe(inputs[3]);
    expect(inputs[0].getAttribute("autocomplete")).toBe("one-time-code");
    expect(inputs[0].getAttribute("inputmode")).toBe("numeric");
  });

  it("advances focus while typing and reports completion", async () => {
    const onValueChange = vi.fn();
    const onValueComplete = vi.fn();
    render(<OTPField length={4} onValueChange={onValueChange} onValueComplete={onValueComplete} />);
    const inputs = slots();
    await userEvent.click(inputs[0]);
    await userEvent.keyboard("12");
    expect(document.activeElement).toBe(inputs[2]);
    await userEvent.keyboard("34");
    expect(onValueChange).toHaveBeenLastCalledWith("1234", expect.anything());
    expect(onValueComplete).toHaveBeenCalledWith("1234", expect.anything());
    expect(inputs.map((i) => i.value)).toEqual(["1", "2", "3", "4"]);
  });

  it("rejects characters outside the validation type", async () => {
    const onValueChange = vi.fn();
    render(<OTPField length={4} onValueChange={onValueChange} />);
    await userEvent.click(slots()[0]);
    await userEvent.keyboard("a");
    expect(slots()[0].value).toBe("");
  });

  it("distributes a pasted code across the slots", async () => {
    const onValueComplete = vi.fn();
    render(<OTPField length={6} onValueComplete={onValueComplete} />);
    await userEvent.click(slots()[0]);
    await userEvent.paste("123456");
    expect(slots().map((i) => i.value).join("")).toBe("123456");
    expect(onValueComplete).toHaveBeenCalledWith("123456", expect.anything());
  });

  it("moves back with Backspace from an empty slot", async () => {
    render(<OTPField length={4} defaultValue="12" />);
    const inputs = slots();
    await userEvent.click(inputs[2]);
    expect(document.activeElement).toBe(inputs[2]);
    await userEvent.keyboard("{Backspace}");
    expect(document.activeElement).toBe(inputs[1]);
    expect(inputs[1].value).toBe("");
  });

  it("navigates slots with arrow keys", async () => {
    render(<OTPField length={4} defaultValue="1234" />);
    const inputs = slots();
    await userEvent.click(inputs[1]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(inputs[2]);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(document.activeElement).toBe(inputs[0]);
  });

  it("renders separators between groups and validates the group sum", () => {
    const { container } = render(<OTPField length={6} groups={[3, 3]} />);
    expect(container.querySelectorAll("span[aria-hidden] svg")).toHaveLength(1);
    expect(() => render(<OTPField length={6} groups={[3, 2]} />)).toThrow(/must sum to length 6/);
  });

  it("shows an error and marks every slot invalid", () => {
    render(<OTPField length={4} error="Code expired" hint="Ignored" />);
    expect(screen.getByText("Code expired")).toBeTruthy();
    expect(screen.queryByText("Ignored")).toBeNull();
    for (const input of slots()) expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("masks entered characters", () => {
    const { container } = render(<OTPField length={4} mask defaultValue="12" />);
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(4);
  });
});
