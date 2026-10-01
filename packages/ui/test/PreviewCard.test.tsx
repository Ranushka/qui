import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreviewCard, PreviewCardBody, PreviewCardContent, PreviewCardDescription, PreviewCardTitle, PreviewCardTrigger } from "../src";

describe("PreviewCard", () => {
  it("renders the trigger link and, when open, the styled card", async () => {
    render(
      <PreviewCard defaultOpen>
        <PreviewCardTrigger href="/issues/1">WEB-1</PreviewCardTrigger>
        <PreviewCardContent>
          <PreviewCardBody>
            <PreviewCardTitle>A long issue title</PreviewCardTitle>
            <PreviewCardDescription>Details</PreviewCardDescription>
          </PreviewCardBody>
        </PreviewCardContent>
      </PreviewCard>
    );
    expect(screen.getByRole("link", { name: "WEB-1" })).toHaveAttribute("href", "/issues/1");
    const title = await screen.findByRole("heading", { name: "A long issue title" });
    expect(title).toHaveAttribute("title", "A long issue title");
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("stays closed by default", () => {
    render(
      <PreviewCard>
        <PreviewCardTrigger href="#">Link</PreviewCardTrigger>
        <PreviewCardContent>
          <PreviewCardTitle>Card</PreviewCardTitle>
        </PreviewCardContent>
      </PreviewCard>
    );
    expect(screen.queryByRole("heading", { name: "Card" })).toBeNull();
  });
});
