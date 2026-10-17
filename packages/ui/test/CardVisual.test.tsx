import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardVisual, Stepper } from "../src";

describe("CardVisual", () => {
  it("is one labelled image with the masked number", () => {
    render(<CardVisual holder="Saif Kapadia" last4="4821" expiry="09/29" />);
    const card = screen.getByRole("img");
    expect(card.getAttribute("aria-label")).toBe("Visa virtual card ending 4821, Saif Kapadia, expires 09/29");
    expect(card.textContent).toContain("•••• 4821");
  });

  it("says when it is frozen", () => {
    render(<CardVisual holder="A" last4="1111" frozen />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("frozen");
    expect(screen.getByText("Frozen")).toBeTruthy();
  });
});

describe("Stepper", () => {
  const steps = [{ label: "Holder" }, { label: "Type" }, { label: "Review" }];

  it("marks the current step", () => {
    render(<Stepper steps={steps} current={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]!.getAttribute("aria-current")).toBe("step");
    expect(items[0]!.getAttribute("aria-current")).toBeNull();
  });

  it("lets people go back to finished steps only", async () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} current={1} onStepClick={onStepClick} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: /Holder/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
