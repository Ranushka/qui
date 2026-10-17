import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Timeline, UploadArea, formatFileSize } from "../src";

const file = (name: string, type: string, size: number) => new File([new Uint8Array(size)], name, { type });

describe("UploadArea", () => {
  it("passes accepted files on and explains rejected ones", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();
    const { container } = render(<UploadArea accept="application/pdf,image/*" maxSize={1000} multiple onFiles={onFiles} onReject={onReject} />);
    const input = container.querySelector("input[type=file]")!;
    fireEvent.change(input, { target: { files: [file("a.pdf", "application/pdf", 10), file("b.exe", "application/x-msdownload", 10), file("c.png", "image/png", 5000)] } });
    expect(onFiles.mock.calls[0]![0].map((f: File) => f.name)).toEqual(["a.pdf"]);
    expect(onReject.mock.calls[0]![0].map((r: { reason: string }) => r.reason)).toEqual(["type", "size"]);
    expect(screen.getByRole("alert").textContent).toContain("b.exe");
  });

  it("accepts dropped files and lists added ones", () => {
    const onFiles = vi.fn();
    render(<UploadArea onFiles={onFiles} files={[{ id: "1", name: "receipt.pdf", size: 2048 }]} onRemove={() => {}} />);
    fireEvent.drop(screen.getByRole("button", { name: /Drop a file/ }), { dataTransfer: { files: [file("x.pdf", "application/pdf", 1)] } });
    expect(onFiles).toHaveBeenCalledOnce();
    expect(screen.getByText("2 KB")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove receipt.pdf" })).toBeTruthy();
  });

  it("formats sizes", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3 MB");
  });
});

describe("Timeline", () => {
  it("marks the current step", () => {
    render(<Timeline items={[{ title: "Submitted" }, { title: "Review", tone: "current" }, { title: "Paid", tone: "pending" }]} />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]!.getAttribute("aria-current")).toBe("step");
    expect(items[2]!.getAttribute("aria-current")).toBeNull();
  });
});
