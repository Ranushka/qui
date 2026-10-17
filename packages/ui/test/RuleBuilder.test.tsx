import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RuleBuilder, describeCondition, matchesRule, type RuleCondition, type RuleField } from "../src";

const fields: RuleField[] = [
  { value: "amount", label: "Amount", type: "number", unit: "AED" },
  { value: "category", label: "Category", type: "select", options: [{ value: "Travel", label: "Travel" }, { value: "Meals", label: "Meals" }] },
  { value: "merchant", label: "Merchant", type: "text" },
];
const over5k: RuleCondition = { id: "a", field: "amount", operator: "gt", value: "5000" };
const travel: RuleCondition = { id: "b", field: "category", operator: "eq", value: "Travel" };

describe("matchesRule", () => {
  it("combines conditions with all or any", () => {
    const flight = { amount: 6200, category: "Travel" };
    const lunch = { amount: 6200, category: "Meals" };
    expect(matchesRule(flight, [over5k, travel], "all", fields)).toBe(true);
    expect(matchesRule(lunch, [over5k, travel], "all", fields)).toBe(false);
    expect(matchesRule(lunch, [over5k, travel], "any", fields)).toBe(true);
  });

  it("ignores conditions with no value and matches nothing when none are left", () => {
    expect(matchesRule({ amount: 1 }, [{ ...over5k, value: "" }], "all", fields)).toBe(false);
    expect(matchesRule({ amount: 9000, category: "Meals" }, [over5k, { ...travel, value: "" }], "all", fields)).toBe(true);
  });

  it("compares text case-insensitively", () => {
    expect(matchesRule({ merchant: "Zuma Dubai" }, [{ id: "c", field: "merchant", operator: "contains", value: "zuma" }], "all", fields)).toBe(true);
  });
});

describe("RuleBuilder", () => {
  it("edits, adds and removes conditions", () => {
    const onChange = vi.fn();
    render(<RuleBuilder fields={fields} conditions={[over5k, travel]} onConditionsChange={onChange} />);
    expect(screen.getByText("When")).toBeTruthy();
    expect(screen.getByText("and")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Condition 1 value" }), { target: { value: "8000" } });
    expect(onChange.mock.calls[0]![0][0].value).toBe("8000");
    fireEvent.click(screen.getByRole("button", { name: "Remove condition 2" }));
    expect(onChange.mock.calls[1]![0]).toEqual([over5k]);
    fireEvent.click(screen.getByRole("button", { name: "Add condition" }));
    expect(onChange.mock.calls[2]![0]).toHaveLength(3);
  });

  it("keeps the last condition and manages its own rows when uncontrolled", () => {
    render(<RuleBuilder fields={fields} then="Require finance approval" />);
    expect((screen.getByRole("button", { name: "Remove condition 1" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Add condition" }));
    expect(screen.getByRole("textbox", { name: "Condition 2 value" })).toBeTruthy();
    expect(screen.getByText("Then")).toBeTruthy();
  });

  it("describes conditions as sentences", () => {
    expect(describeCondition(over5k, fields)).toBe("Amount is more than AED 5,000");
    expect(describeCondition(travel, fields)).toBe("Category is Travel");
  });
});
