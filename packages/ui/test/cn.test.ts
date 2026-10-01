import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/cn";

describe("cn", () => {
  it("keeps a typography token alongside a text color", () => {
    expect(cn("text-body-xs-regular text-primary")).toBe("text-body-xs-regular text-primary");
    expect(cn("text-caption-md-medium", "text-tertiary")).toBe("text-caption-md-medium text-tertiary");
    expect(cn("text-h1-bold text-secondary")).toBe("text-h1-bold text-secondary");
    expect(cn("text-13 text-primary")).toBe("text-13 text-primary");
  });

  it("still lets a later token or color override an earlier one of the same kind", () => {
    expect(cn("text-body-xs-regular", "text-body-sm-medium")).toBe("text-body-sm-medium");
    expect(cn("text-h3-semibold", "text-body-md-regular")).toBe("text-body-md-regular");
    expect(cn("text-secondary", "text-primary")).toBe("text-primary");
    expect(cn("text-sm text-body-xs-medium")).toBe("text-body-xs-medium");
  });
});
