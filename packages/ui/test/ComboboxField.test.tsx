import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboboxField } from "../src/molecules/ComboboxField";

// jsdom has no PointerEvent; Base UI re-dispatches clicks as one.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {}
  (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = PointerEventPolyfill;
}

function Invite() {
  const [team, setTeam] = React.useState(["Ava", "Ben"]);
  const [picked, setPicked] = React.useState<string[]>(["Ava"]);
  return (
    <ComboboxField
      label="People"
      multiple
      items={team}
      value={picked}
      onValueChange={(next) => setPicked(next as string[])}
      create={{
        label: (query) => `Invite "${query}"`,
        title: "Invite",
        form: ({ query, done }) => (
          <button
            type="button"
            onClick={() => {
              setTeam((list) => [...list, query]);
              done(query);
            }}
          >
            Send invite to {query}
          </button>
        ),
      }}
    />
  );
}

describe("ComboboxField", () => {
  it("shows picked values as chips that can be removed", async () => {
    render(<ComboboxField label="People" multiple items={["Ava", "Ben"]} defaultValue={["Ava", "Ben"]} />);
    expect(screen.getByRole("button", { name: "Remove Ava" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove Ava" }));
    expect(screen.queryByRole("button", { name: "Remove Ava" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Ben" })).toBeInTheDocument();
  });

  it("offers to add what isn't listed, opens the form with the typed text and picks the result", async () => {
    render(<Invite />);
    await userEvent.type(screen.getByRole("combobox", { name: "People" }), "Nadia");
    await userEvent.click(await screen.findByRole("option", { name: 'Invite "Nadia"' }));
    await userEvent.click(await screen.findByRole("button", { name: "Send invite to Nadia" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Remove Nadia" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Remove Ava" })).toBeInTheDocument();
  });
});
