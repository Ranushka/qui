import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AutocompleteField,
  CheckboxField,
  CheckboxGroupField,
  CheckboxGroupFieldOption,
  ComboboxField,
  Field,
  Fieldset,
  Form,
  FormActions,
  FormBody,
  InputField,
  RadioGroupField,
  RadioGroupFieldOption,
  SelectField,
  SwitchField,
  TextAreaField,
} from "../src";

// jsdom has no PointerEvent; Base UI's Checkbox re-dispatches clicks as one.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {}
  (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = PointerEventPolyfill;
}

/** The ids an element's `aria-describedby` points at, resolved to their text. */
function describedByText(element: HTMLElement) {
  const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "");
}

describe("Field", () => {
  it("marks the control invalid when an error is given", () => {
    render(
      <Field label="Slug" error="Taken.">
        <input />
      </Field>
    );
    expect(screen.getByText("Taken.")).toBeTruthy();
    expect(screen.getByText("Slug").closest("[data-invalid]")).not.toBeNull();
  });
});

describe("InputField", () => {
  it("labels the input and wires description + hint as its description", () => {
    render(<InputField label="Email" description="Work address." hint="We never share it." />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(describedByText(input)).toEqual(expect.arrayContaining(["Work address.", "We never share it."]));
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("shows the error instead of the hint and marks the input invalid", () => {
    render(<InputField label="Email" hint="Hint text" error="Invalid email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(screen.queryByText("Hint text")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(describedByText(input)).toContain("Invalid email");
  });

  it("sets aria-required without the native attribute, and forwards the ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<InputField ref={ref} label="Name" required />);
    const input = screen.getByRole("textbox", { name: /Name/ });
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(input.hasAttribute("required")).toBe(false);
    expect(ref.current).toBe(input);
  });

  it("disables the input", () => {
    render(<InputField label="Key" disabled />);
    expect((screen.getByRole("textbox", { name: "Key" }) as HTMLInputElement).disabled).toBe(true);
  });
});

describe("TextAreaField", () => {
  it("labels the textarea, describes it, and reports edits", async () => {
    const onValueChange = vi.fn();
    render(<TextAreaField label="Notes" hint="Markdown ok." onValueChange={onValueChange} />);
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(describedByText(textarea)).toContain("Markdown ok.");
    await userEvent.type(textarea, "hi");
    expect(onValueChange).toHaveBeenLastCalledWith("hi");
  });

  it("marks the textarea invalid on error", () => {
    render(<TextAreaField label="Notes" error="Required" />);
    expect(screen.getByRole("textbox", { name: "Notes" }).getAttribute("aria-invalid")).toBe("true");
  });
});

describe("SelectField", () => {
  const options = [{ value: "a", label: "Alpha" }, "separator" as const, { key: "g", label: "More", options: [{ value: "b", label: "Beta" }] }, "separator" as const];

  it("names the trigger with its label and shows the selected option's label", () => {
    render(<SelectField label="Status" options={options} defaultValue="b" />);
    const trigger = screen.getByRole("combobox", { name: "Status" });
    expect(trigger.textContent).toContain("Beta");
  });

  it("selects an option from the popup", async () => {
    const onValueChange = vi.fn();
    render(<SelectField label="Status" placeholder="Pick" options={options} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const alpha = await screen.findByRole("option", { name: "Alpha" });
    // Trailing separator is dropped.
    expect(screen.getByRole("listbox").querySelectorAll("[data-orientation='horizontal']").length).toBe(1);
    await userEvent.click(alpha);
    expect(onValueChange).toHaveBeenCalledWith("a", expect.anything());
  });

  it("shows the error", () => {
    render(<SelectField label="Status" options={options} error="Pick one" />);
    expect(screen.getByText("Pick one")).toBeTruthy();
  });
});

describe("ComboboxField", () => {
  it("labels the filter input and filters the options", async () => {
    render(<ComboboxField label="Fruit" items={["Apple", "Banana", "Cherry"]} hint="Type to filter" />);
    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(describedByText(input)).toContain("Type to filter");
    await userEvent.type(input, "ban");
    await waitFor(() => expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Banana"]));
  });
});

describe("AutocompleteField", () => {
  it("labels the input and suggests matches", async () => {
    render(<AutocompleteField label="Country" items={["Albania", "Algeria", "Angola"]} />);
    const input = screen.getByRole("combobox", { name: "Country" });
    await userEvent.type(input, "alg");
    await waitFor(() => expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Algeria"]));
  });
});

describe("CheckboxField", () => {
  it("labels and describes the checkbox and toggles from a row click", async () => {
    const onCheckedChange = vi.fn();
    render(<CheckboxField label="Subscribe" description="Weekly email." onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "Subscribe" });
    expect(describedByText(checkbox)).toContain("Weekly email.");
    await userEvent.click(screen.getByText("Weekly email."));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    await userEvent.click(screen.getByText("Subscribe"));
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("marks the checkbox invalid on error", () => {
    render(<CheckboxField label="Terms" error="Accept the terms" />);
    expect(screen.getByRole("checkbox", { name: "Terms" }).hasAttribute("data-invalid")).toBe(true);
    expect(screen.getByText("Accept the terms")).toBeTruthy();
  });
});

describe("SwitchField", () => {
  it("labels and describes the switch and toggles it", async () => {
    render(<SwitchField label="Dark mode" description="Easier at night." />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(describedByText(toggle)).toContain("Easier at night.");
    await userEvent.click(screen.getByText("Dark mode"));
    expect(toggle.getAttribute("aria-checked")).toBe("true");
  });

  it("disables the switch", () => {
    render(<SwitchField label="SSO" disabled />);
    expect(screen.getByRole("switch", { name: "SSO" }).hasAttribute("data-disabled")).toBe(true);
  });
});

describe("CheckboxGroupField", () => {
  it("names the group by its legend and tracks checked values", async () => {
    const onValueChange = vi.fn();
    render(
      <CheckboxGroupField label="Notify" defaultValue={["a"]} onValueChange={onValueChange} error="Pick one">
        <CheckboxGroupFieldOption value="a" label="Mentions" description="When mentioned." />
        <CheckboxGroupFieldOption value="b" label="Comments" />
      </CheckboxGroupField>
    );
    expect(screen.getByRole("group", { name: "Notify" })).toBeTruthy();
    const mentions = screen.getByRole("checkbox", { name: "Mentions" });
    expect(mentions.getAttribute("aria-checked")).toBe("true");
    expect(describedByText(mentions)).toContain("When mentioned.");
    expect(screen.getByText("Pick one")).toBeTruthy();
    await userEvent.click(screen.getByRole("checkbox", { name: "Comments" }));
    expect(onValueChange).toHaveBeenCalledWith(["a", "b"], expect.anything());
  });
});

describe("RadioGroupField", () => {
  it("names the radiogroup by its legend and selects options", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroupField label="Visibility" defaultValue="public" onValueChange={onValueChange} hint="Admins always see.">
        <RadioGroupFieldOption value="public" label="Public" description="Everyone." />
        <RadioGroupFieldOption value="private" label="Private" />
      </RadioGroupField>
    );
    expect(screen.getByRole("radiogroup", { name: "Visibility" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Public" }).getAttribute("aria-checked")).toBe("true");
    expect(describedByText(screen.getByRole("radio", { name: "Public" }))).toContain("Everyone.");
    expect(screen.getByText("Admins always see.")).toBeTruthy();
    await userEvent.click(screen.getByText("Private"));
    expect(onValueChange).toHaveBeenCalledWith("private", expect.anything());
  });
});

describe("Fieldset", () => {
  it("names the group by its legend and disables the fields inside", () => {
    render(
      <Fieldset legend="Address" description="On invoices." disabled>
        <InputField label="City" />
      </Fieldset>
    );
    expect(screen.getByRole("group", { name: "Address" })).toBeTruthy();
    expect(screen.getByText("On invoices.")).toBeTruthy();
    expect((screen.getByRole("textbox", { name: "City" }) as HTMLInputElement).disabled).toBe(true);
  });
});

describe("Form", () => {
  it("shows external errors on matching fields and submits values", async () => {
    const onFormSubmit = vi.fn();
    render(
      <Form errors={{ email: "Already taken" }} onFormSubmit={onFormSubmit}>
        <FormBody>
          <InputField name="email" label="Email" defaultValue="a@b.co" />
        </FormBody>
        <FormActions>
          <button type="submit">Save</button>
        </FormActions>
      </Form>
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(screen.getByText("Already taken")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    await userEvent.clear(input);
    await userEvent.type(input, "c@d.co");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onFormSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: "c@d.co" }), expect.anything());
  });
});
