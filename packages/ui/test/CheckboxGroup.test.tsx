import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox, CheckboxGroup } from "../src";

// jsdom has no PointerEvent; Base UI's checkbox dispatches one when toggled.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "";
    }
  }
  (window as unknown as { PointerEvent: typeof PointerEventPolyfill }).PointerEvent = PointerEventPolyfill;
}

describe("CheckboxGroup", () => {
  it("renders a named group and tracks checked values", async () => {
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup aria-label="Notifications" defaultValue={["email"]} onValueChange={onValueChange}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="push" label="Push" />
      </CheckboxGroup>
    );
    expect(screen.getByRole("group", { name: "Notifications" })).toBeTruthy();
    const email = screen.getByRole("checkbox", { name: "Email" });
    const push = screen.getByRole("checkbox", { name: "Push" });
    expect(email.getAttribute("aria-checked")).toBe("true");
    expect(push.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(push);
    expect(onValueChange).toHaveBeenLastCalledWith(["email", "push"], expect.anything());
    expect(push.getAttribute("aria-checked")).toBe("true");
  });

  it("toggles a focused checkbox with Space", async () => {
    render(
      <CheckboxGroup aria-label="Options">
        <Checkbox value="a" label="A" />
      </CheckboxGroup>
    );
    await userEvent.tab();
    const a = screen.getByRole("checkbox", { name: "A" });
    expect(document.activeElement).toBe(a);
    await userEvent.keyboard(" ");
    expect(a.getAttribute("aria-checked")).toBe("true");
  });

  it("drives a parent select-all checkbox, including the indeterminate state", async () => {
    function Demo() {
      const [value, setValue] = React.useState<string[]>(["web"]);
      return (
        <CheckboxGroup aria-label="Platforms" allValues={["web", "ios"]} value={value} onValueChange={setValue}>
          <Checkbox parent label="All" />
          <Checkbox value="web" label="Web" />
          <Checkbox value="ios" label="iOS" />
        </CheckboxGroup>
      );
    }
    render(<Demo />);
    const all = screen.getByRole("checkbox", { name: "All" });
    expect(all.getAttribute("aria-checked")).toBe("mixed");
    await userEvent.click(all);
    expect(all.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("checkbox", { name: "iOS" }).getAttribute("aria-checked")).toBe("true");
    await userEvent.click(all);
    expect(screen.getByRole("checkbox", { name: "Web" }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("checkbox", { name: "iOS" }).getAttribute("aria-checked")).toBe("false");
  });

  it("supports an uncontrolled parent checkbox", async () => {
    render(
      <CheckboxGroup aria-label="Platforms" allValues={["web", "ios"]} defaultValue={["web"]}>
        <Checkbox parent label="All" />
        <Checkbox value="web" label="Web" />
        <Checkbox value="ios" label="iOS" />
      </CheckboxGroup>
    );
    const all = screen.getByRole("checkbox", { name: "All" });
    expect(all.getAttribute("aria-checked")).toBe("mixed");
    await userEvent.click(all);
    expect(screen.getByRole("checkbox", { name: "iOS" }).getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByRole("checkbox", { name: "iOS" }));
    expect(all.getAttribute("aria-checked")).toBe("mixed");
  });

  it("disables every checkbox when the group is disabled", () => {
    render(
      <CheckboxGroup aria-label="Options" disabled>
        <Checkbox value="a" label="A" />
      </CheckboxGroup>
    );
    expect(screen.getByRole("checkbox", { name: "A" }).getAttribute("aria-disabled")).toBe("true");
  });
});
