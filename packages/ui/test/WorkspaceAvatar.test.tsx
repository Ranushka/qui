import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspaceAvatar } from "../src";

describe("WorkspaceAvatar", () => {
  it("derives initials from the workspace name in a rounded square", () => {
    render(<WorkspaceAvatar alt="Acme Robotics" />);
    const avatar = screen.getByRole("img", { name: "Acme Robotics" });
    expect(avatar.textContent).toBe("AR");
    expect(avatar.className).toContain("rounded-md");
    expect(avatar.className).not.toContain("rounded-full");
  });

  it("uses one initial at 2xs and honors an explicit fallback", () => {
    const { rerender } = render(<WorkspaceAvatar size="2xs" alt="Acme Robotics" />);
    expect(screen.getByRole("img").textContent).toBe("A");
    rerender(<WorkspaceAvatar alt="Globex" fallback="GX" />);
    expect(screen.getByRole("img").textContent).toBe("GX");
  });

  it("is hidden from assistive tech without a name", () => {
    const { container } = render(<WorkspaceAvatar />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
