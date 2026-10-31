import * as React from "react";
import { Check } from "../icons";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

export interface StepperStep {
  label: string;
  /** A short line under the label, e.g. the value chosen on that step. */
  description?: React.ReactNode;
}

export interface StepperProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"ol">, "onChange">> {
  steps: readonly StepperStep[];
  /** 0-based index of the step in progress. Steps before it show as done. */
  current: number;
  /** Lets people jump back to a finished step. Steps after `current` stay unclickable. */
  onStepClick?: (index: number) => void;
  /** A row of steps joined by lines, or a column (e.g. beside a long form). @default "horizontal" */
  orientation?: "horizontal" | "vertical";
}

/**
 * Progress through a multi-step flow — issue a card, submit a claim: numbered markers that turn into checks as
 * steps finish, the current one highlighted and marked `aria-current="step"`. Finished steps become buttons
 * when `onStepClick` is set, so people can go back and change an answer.
 */
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(({ steps, current, onStepClick, orientation = "horizontal", ...props }, ref) => {
  const vertical = orientation === "vertical";
  return (
    <ol ref={ref} className={cn("flex", vertical ? "flex-col gap-0" : "w-full items-start gap-2")} {...props}>
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        const marker = (
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-sm text-caption-md-semibold tabular-nums transition-colors [--node-size:0.875rem]",
              state === "done" && "border-transparent bg-accent-primary text-on-color",
              state === "current" && "border-accent-strong bg-layer-2 text-accent-primary ring-2 ring-accent-subtle",
              state === "upcoming" && "border-subtle-1 bg-layer-2 text-tertiary"
            )}
          >
            {state === "done" ? <Check aria-hidden className="size-(--node-size)" /> : i + 1}
          </span>
        );
        const text = (
          <span className="flex min-w-0 flex-col text-start">
            <span className={cn("text-body-xs-medium", state === "upcoming" ? "text-tertiary" : "text-primary")}>{step.label}</span>
            {step.description != null ? <span className="truncate text-caption-md-regular text-tertiary">{step.description}</span> : null}
          </span>
        );
        const clickable = state === "done" && onStepClick != null;
        const head = clickable ? (
          <button
            type="button"
            onClick={() => onStepClick(i)}
            className="-m-1 flex min-w-0 cursor-pointer items-start gap-2 rounded-md p-1 outline-none transition-colors hover:bg-layer-transparent-hover focus-visible:ring-2 focus-visible:ring-accent-strong"
          >
            {marker}
            {text}
          </button>
        ) : (
          <span className="flex min-w-0 items-start gap-2">
            {marker}
            {text}
          </span>
        );
        const last = i === steps.length - 1;
        return (
          <li
            key={step.label}
            aria-current={state === "current" ? "step" : undefined}
            className={cn("flex min-w-0", vertical ? "flex-col" : "flex-1 items-start gap-2", last && !vertical && "flex-none")}
          >
            {head}
            {last ? null : vertical ? (
              <span aria-hidden className={cn("ms-3 h-5 w-px -translate-x-px", state === "done" ? "bg-accent-primary" : "bg-layer-3")} />
            ) : (
              <span aria-hidden className={cn("mt-3 h-px min-w-4 flex-1", state === "done" ? "bg-accent-primary" : "bg-layer-3")} />
            )}
          </li>
        );
      })}
    </ol>
  );
});
Stepper.displayName = "Stepper";

/* __DOC_BLOCK
<div className="flex flex-col gap-8 p-4">
  <QUI.Stepper
    current={2}
    steps={[
      { label: "Cardholder", description: "Saif Kapadia" },
      { label: "Card type", description: "Virtual" },
      { label: "Limits" },
      { label: "Review" },
    ]}
  />
  <QUI.Stepper
    orientation="vertical"
    current={1}
    steps={[{ label: "Submitted", description: "2 Oct" }, { label: "Manager approval" }, { label: "Paid" }]}
  />
</div>
DOC__ */

/* __PROPS
{ "orientation": ["horizontal", "vertical"] }
PROPS__ */
