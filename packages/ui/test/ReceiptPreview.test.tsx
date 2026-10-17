import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptPreview } from "../src";

describe("ReceiptPreview", () => {
  it("shows the attached file and its actions", async () => {
    const onView = vi.fn();
    render(<ReceiptPreview file={{ name: "emirates.pdf", detail: "212 KB" }} onView={onView} />);
    expect(screen.getByText("emirates.pdf")).toBeTruthy();
    expect(screen.getByText("212 KB")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Replace" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "View" }));
    expect(onView).toHaveBeenCalledOnce();
  });

  it("shows the empty state with upload and request", async () => {
    const onRequest = vi.fn();
    render(<ReceiptPreview emptyLabel="Required over AED 75" onUpload={() => {}} onRequest={onRequest} />);
    expect(screen.getByText("Required over AED 75")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Upload receipt" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Request" }));
    expect(onRequest).toHaveBeenCalledOnce();
  });
});
